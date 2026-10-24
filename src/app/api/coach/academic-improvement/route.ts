import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import {
  executeLangGraphAcademicCoach,
  executeLangGraphCoachChat,
} from '@/lib/langgraph/academicCoachGraph';

export const runtime = 'nodejs';

/**
 * GET /api/coach/academic-improvement
 * Retrieves the authorized student's authentic academic performance,
 * weak subjects, curated YouTube resources, in-app destinations, and unified roadmap.
 * Orchestrated end-to-end via LangGraph Academic Coach Workflow.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientStudentId = searchParams.get('studentId') || undefined;
    const hoursParam = searchParams.get('hours');
    const availableHours = hoursParam ? Math.max(5, Math.min(60, parseInt(hoursParam, 10))) : 15;

    // 1. Authenticate session & enforce anti-spoofing
    const authResult = await validateStudentSession(request, clientStudentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: authResult.status });
    }

    const studentId = authResult.studentId;

    // 2. Execute LangGraph Academic Coach Workflow
    const graphState = await executeLangGraphAcademicCoach({
      studentId,
      availableHoursPerWeek: availableHours,
    });

    if (!graphState.authenticAcademicProfile) {
      return NextResponse.json(
        { error: 'Student academic record not found in Contineo ERP database.' },
        { status: 404 }
      );
    }

    // 3. Return full response preserving all existing keys + LangGraph additions
    return NextResponse.json({
      academicProfile: graphState.authenticAcademicProfile,
      recommendations: graphState.recommendations,
      companyGoal: graphState.companyGoal,
      roadmapTasks: graphState.unifiedRoadmapTasks,
      curatedResources: graphState.allCuratedResources,
      // LangGraph Provenance & Study Plan Additions:
      provenanceTaggedProblems: graphState.provenanceTaggedProblems,
      studyPlan: graphState.studyPlan,
      auditSummary: graphState.auditSummary,
      workflow: {
        orchestrator: 'LangGraph (TypeScript)',
        stateNodes: [
          'erpIngestionNode',
          'academicAndCompetencyAuditNode',
          'resourceAndDestinationMatcherNode',
          'dsaProvenanceMatcherNode',
          'studyPlanGeneratorNode',
        ],
      },
    });
  } catch (error: any) {
    console.error('GET /api/coach/academic-improvement error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/coach/academic-improvement
 * AI Coach Interactive Chat & Guidance powered by Google Gemini and LangGraph.
 * Uses authentic authorized academic records as context; strictly separates
 * database facts from AI conclusions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, studentId, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message string is required' }, { status: 400 });
    }

    // 1. Authenticate session
    const authResult = await validateStudentSession(request, studentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: authResult.status });
    }

    const resolvedId = authResult.studentId;

    // 2. Execute LangGraph Conversational Coach Workflow
    const chatResult = await executeLangGraphCoachChat({
      studentId: resolvedId,
      message,
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
    });

    return NextResponse.json({
      reply: chatResult.reply,
      source: chatResult.source,
      audit: chatResult.state.auditSummary,
      provenanceQuestions: chatResult.state.provenanceTaggedProblems.slice(0, 3),
      workflow: {
        orchestrator: 'LangGraph (TypeScript)',
        stateNodes: [
          'erpIngestionNode',
          'academicAndCompetencyAuditNode',
          'coachSynthesizerNode',
        ],
      },
    });
  } catch (error: any) {
    console.error('POST /api/coach/academic-improvement error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
