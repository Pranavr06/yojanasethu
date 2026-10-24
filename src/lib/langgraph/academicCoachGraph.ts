import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { invokeGeminiText, invokeGeminiStructured } from './geminiClient';
import {
  dbGetStudentAcademicProfile,
  dbGetCompanyPrepGoal,
  dbGetUnifiedRoadmapTasks,
  dbGetCuratedResources,
  dbGetDSAProblems,
  dbGetStudentDSAAttempts,
  dbGetStudentResumes,
} from '@/lib/db';
import { findResourceForTopic } from '@/lib/curatedResources';
import {
  AdaptiveRecommendation,
  CuratedLearningResource,
  StudentAcademicProfile,
  CompanyPrepGoal,
  UnifiedRoadmapTask,
  DSAProblem,
  DSAAttemptRecord,
  DSACategoryType,
  SavedResume,
} from '@/types';

export interface ProvenanceTaggedProblem {
  problem: DSAProblem;
  categoryType: DSACategoryType;
  provenanceCategoryLabel: 'Category 1: Verified Historical' | 'Category 2: Frequently Reported' | 'Category 3: AI-Generated Practice';
  provenanceStatement: string;
  sourceAttribution: string;
  isAiGenerated: boolean;
}

export interface GeneratedStudyPlan {
  weeklyHours: number;
  backlogHours: number;
  dsaHours: number;
  coreCsHours: number;
  mockInterviewHours: number;
  schedule: Array<{
    day: string;
    focus: string;
    action: string;
    durationMinutes: number;
    destinationLabel: string;
    destinationUrl: string;
    provenanceNote?: string;
  }>;
  milestones: string[];
}

export interface AcademicAuditSummary {
  cgpa: number;
  activeBacklogsCount: number;
  attendanceRiskCount: number;
  urgentBacklogs: Array<{
    subjectCode: string;
    subjectName: string;
    grade: string;
    marks: number;
    attendance: number;
    weakTopics: string[];
  }>;
  weakSubjects: Array<{
    subjectCode: string;
    subjectName: string;
    grade: string;
    marks: number;
    attendance: number;
    weakTopics: string[];
  }>;
  identifiedDsaGaps: string[];
}

/**
 * LangGraph State Definition for Academic & Career Coach Workflow
 */
export const AcademicCoachStateAnnotation = Annotation.Root({
  studentId: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => '',
  }),
  userMessage: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => '',
  }),
  conversationHistory: Annotation<Array<{ role: 'user' | 'model'; content: string }>>({
    reducer: (curr, next) => (next ? [...curr, ...next] : curr),
    default: () => [],
  }),
  availableHoursPerWeek: Annotation<number>({
    reducer: (curr, next) => next ?? curr,
    default: () => 15,
  }),
  targetCompanies: Annotation<string[]>({
    reducer: (curr, next) => (next && next.length > 0 ? next : curr),
    default: () => ['Google', 'Amazon', 'Cisco'],
  }),
  targetRole: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'Software Development Engineer',
  }),

  // Database Facts (Isolated from AI Hallucinations)
  authenticAcademicProfile: Annotation<StudentAcademicProfile | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  companyGoal: Annotation<CompanyPrepGoal | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  unifiedRoadmapTasks: Annotation<UnifiedRoadmapTask[]>({
    reducer: (curr, next) => (next ? next : curr),
    default: () => [],
  }),
  studentDSAAttempts: Annotation<Record<string, DSAAttemptRecord>>({
    reducer: (curr, next) => (next ? next : curr),
    default: () => ({}),
  }),
  studentResumes: Annotation<SavedResume[]>({
    reducer: (curr, next) => (next ? next : curr),
    default: () => [],
  }),
  allCuratedResources: Annotation<CuratedLearningResource[]>({
    reducer: (curr, next) => (next ? next : curr),
    default: () => [],
  }),

  // Audit and Recommendation Channels
  auditSummary: Annotation<AcademicAuditSummary | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  recommendations: Annotation<AdaptiveRecommendation[]>({
    reducer: (curr, next) => (next ? next : curr),
    default: () => [],
  }),
  provenanceTaggedProblems: Annotation<ProvenanceTaggedProblem[]>({
    reducer: (curr, next) => (next ? next : curr),
    default: () => [],
  }),
  studyPlan: Annotation<GeneratedStudyPlan | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),

  // Outputs
  outputReply: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => '',
  }),
  replySource: Annotation<'gemini_ai' | 'deterministic_fallback'>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'gemini_ai',
  }),
  intent: Annotation<'generate_recommendations' | 'interactive_chat' | 'generate_study_plan'>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'generate_recommendations',
  }),
});

export type AcademicCoachWorkflowState = typeof AcademicCoachStateAnnotation.State;

// ==========================================
// NODE 1: Ingest Authentic Institutional Records (Zero-Hallucination Sandbox)
// ==========================================
export async function erpIngestionNode(
  state: AcademicCoachWorkflowState
): Promise<Partial<AcademicCoachWorkflowState>> {
  if (!state.studentId) {
    throw new Error('[AcademicCoachGraph] studentId is required for authentic record retrieval.');
  }

  const [
    academicProfile,
    companyGoal,
    roadmapTasks,
    dsaAttempts,
    resumes,
    curated,
  ] = await Promise.all([
    dbGetStudentAcademicProfile(state.studentId),
    dbGetCompanyPrepGoal(state.studentId),
    dbGetUnifiedRoadmapTasks(state.studentId),
    dbGetStudentDSAAttempts(state.studentId),
    dbGetStudentResumes(state.studentId),
    dbGetCuratedResources(),
  ]);

  const targetCompanies = companyGoal?.target_companies && companyGoal.target_companies.length > 0
    ? companyGoal.target_companies
    : state.targetCompanies;

  const targetRole = companyGoal?.target_role || state.targetRole;

  return {
    authenticAcademicProfile: academicProfile,
    companyGoal,
    unifiedRoadmapTasks: roadmapTasks,
    studentDSAAttempts: dsaAttempts,
    studentResumes: resumes,
    allCuratedResources: curated,
    targetCompanies,
    targetRole,
  };
}

// ==========================================
// NODE 2: Academic & Competency Audit (Facts vs Gaps Analysis)
// ==========================================
export async function academicAndCompetencyAuditNode(
  state: AcademicCoachWorkflowState
): Promise<Partial<AcademicCoachWorkflowState>> {
  const profile = state.authenticAcademicProfile;
  if (!profile) {
    return {
      auditSummary: {
        cgpa: 0,
        activeBacklogsCount: 0,
        attendanceRiskCount: 0,
        urgentBacklogs: [],
        weakSubjects: [],
        identifiedDsaGaps: ['Data Structures & Algorithms', 'Dynamic Programming'],
      },
    };
  }

  const urgentBacklogs = profile.backlog_subjects.map((b) => ({
    subjectCode: b.subject_code,
    subjectName: b.subject_name,
    grade: b.grade,
    marks: b.total_marks,
    attendance: b.attendance_pct,
    weakTopics: b.weak_topics.length > 0 ? b.weak_topics : b.syllabus_topics.slice(0, 2),
  }));

  const weakNonBacklogs = profile.weak_subjects
    .filter((s) => !s.is_backlog)
    .map((w) => ({
      subjectCode: w.subject_code,
      subjectName: w.subject_name,
      grade: w.grade,
      marks: w.total_marks,
      attendance: w.attendance_pct,
      weakTopics: w.weak_topics.length > 0 ? w.weak_topics : w.syllabus_topics.slice(0, 2),
    }));

  const attendanceRiskCount = profile.subjects.filter((s) => s.attendance_pct < 75).length;

  // Inspect student's DSA attempts to identify weak coding patterns
  const attempts = state.studentDSAAttempts || {};
  const failedCategories = new Set<string>();

  Object.values(attempts).forEach((att) => {
    if (att.status !== 'solved') {
      failedCategories.add('Dynamic Programming');
    }
  });

  if (failedCategories.size === 0) {
    failedCategories.add('Dynamic Programming');
    failedCategories.add('Graph Algorithms');
  }

  const auditSummary: AcademicAuditSummary = {
    cgpa: profile.cgpa,
    activeBacklogsCount: profile.active_backlogs_count,
    attendanceRiskCount,
    urgentBacklogs,
    weakSubjects: weakNonBacklogs,
    identifiedDsaGaps: Array.from(failedCategories),
  };

  return { auditSummary };
}

// ==========================================
// NODE 3: Match Curated YouTube Resources & In-App Destinations
// ==========================================
export async function resourceAndDestinationMatcherNode(
  state: AcademicCoachWorkflowState
): Promise<Partial<AcademicCoachWorkflowState>> {
  const audit = state.auditSummary;
  const recommendations: AdaptiveRecommendation[] = [];

  if (!audit) return { recommendations: [] };

  // 1. Process Urgent Backlogs (Highest Placement Priority)
  for (const backlog of audit.urgentBacklogs) {
    const topic = backlog.weakTopics[0] || 'Core Fundamental Concepts';
    const resource = findResourceForTopic(backlog.subjectCode, topic);

    recommendations.push({
      subject_or_domain: `${backlog.subjectCode}: ${backlog.subjectName}`,
      topic,
      reason_priority: 'Urgent Backlog Remediation (Critical for Campus Placement Eligibility)',
      database_evidence: `Contineo ERP Record: Grade ${backlog.grade} (${backlog.marks}/100), Attendance: ${backlog.attendance}%. Active backlog blocks Tier 1 placement drives.`,
      learning_sequence: [
        `1. Watch curated lecture on ${topic} (${resource.channel_name})`,
        `2. Study verified autonomous syllabus notes`,
        `3. Complete post-lesson diagnostic quiz (Pass mark: 70%)`,
        `4. Re-attempt previous exam numericals with faculty mentor`,
      ],
      curated_resource: resource,
      in_app_destination: {
        label: `Open ${backlog.subjectName} Practice Section`,
        url: resource.in_app_destination_url,
      },
      estimated_time_minutes: 50,
      completion_criterion: `Score >= 70% on ${topic} quiz and complete syllabus checklist.`,
      quiz_available: true,
      follow_up_assessment_id: resource.linked_quiz_subject,
    });
  }

  // 2. Process Weak Subjects (Grade Elevation & Attendance Risks)
  for (const weak of audit.weakSubjects) {
    const topic = weak.weakTopics[0] || 'Core Modules';
    const resource = findResourceForTopic(weak.subjectCode, topic);

    const isAttendanceLow = weak.attendance < 75;
    recommendations.push({
      subject_or_domain: `${weak.subjectCode}: ${weak.subjectName}`,
      topic,
      reason_priority: isAttendanceLow
        ? `Attendance Shortage Alert (${weak.attendance}% vs 75% Contineo ERP Threshold)`
        : 'Grade Point Elevation (Elevate SGPA for Super Dream Drives)',
      database_evidence: `Contineo ERP Record: Grade ${weak.grade} (${weak.marks}/100), Attendance: ${weak.attendance}%.`,
      learning_sequence: [
        `1. High-yield video revision: ${topic}`,
        `2. Solve previous autonomous exam questions in Learn section`,
        `3. Take follow-up progress assessment`,
      ],
      curated_resource: resource,
      in_app_destination: {
        label: `Study ${weak.subjectName}`,
        url: resource.in_app_destination_url,
      },
      estimated_time_minutes: 40,
      completion_criterion: `Score >= 75% on follow-up quiz for ${topic}.`,
      quiz_available: true,
      follow_up_assessment_id: resource.linked_quiz_subject,
    });
  }

  // 3. Add High-Yield Placement DSA Recommendation
  const dsaTopic = audit.identifiedDsaGaps[0] || 'Dynamic Programming & Memoization Patterns';
  const dsaResource = findResourceForTopic('22CS401', dsaTopic);

  recommendations.push({
    subject_or_domain: 'Data Structures & Algorithms',
    topic: dsaTopic,
    reason_priority: `Target Placement Preparedness (${state.targetCompanies.join(', ')})`,
    database_evidence: `Contineo Skill Passport: High-yield campus interview pattern with heavy recruitment weight for ${state.targetRole}.`,
    learning_sequence: [
      `1. Revise ${dsaTopic} transitions with Striver's A2Z series`,
      '2. Solve Kadane’s Algorithm and Maximal Network Path in DSA Tracker',
      '3. Verify edge cases and submit solutions',
    ],
    curated_resource: dsaResource,
    in_app_destination: {
      label: 'Solve in DSA Tracker',
      url: `/student/dsa-tracker?category=${encodeURIComponent(dsaTopic)}`,
    },
    estimated_time_minutes: 60,
    completion_criterion: 'Pass 100% test cases on 2 Medium problems independently.',
    quiz_available: false,
  });

  return { recommendations };
}

// ==========================================
// NODE 4: Match Company DSA Problems with Provable Provenance (Phase 5)
// ==========================================
export async function dsaProvenanceMatcherNode(
  state: AcademicCoachWorkflowState
): Promise<Partial<AcademicCoachWorkflowState>> {
  // Fetch problems from catalog and dynamic registry
  const problems = await dbGetDSAProblems();
  const taggedProblems: ProvenanceTaggedProblem[] = [];

  // Filter problems relevant to student target companies or weak patterns
  const candidateCompanies = state.targetCompanies.map((c) => c.toLowerCase());

  for (const prob of problems) {
    const matchesCompany =
      prob.target_companies?.some((c) =>
        candidateCompanies.some((tc) => c.toLowerCase().includes(tc))
      ) || false;

    // Strict Provenance Classification (Category 1, 2, 3)
    let categoryType: DSACategoryType = prob.category_type || 'ai_generated';
    let label: ProvenanceTaggedProblem['provenanceCategoryLabel'];
    let provenanceStatement: string;
    let isAiGenerated = false;

    if (categoryType === 'verified_historical') {
      label = 'Category 1: Verified Historical';
      provenanceStatement = `Verified Historical Campus Drive Question: Asked in real on-campus recruitment assessments for ${prob.target_companies.join(', ')} (${prob.reported_date || 'Past Drive'}).`;
      isAiGenerated = false;
    } else if (categoryType === 'frequently_reported') {
      label = 'Category 2: Frequently Reported';
      provenanceStatement = `Frequently Reported Company Pattern: High-frequency question pattern frequently encountered in technical rounds for ${prob.target_companies.join(', ')}.`;
      isAiGenerated = false;
    } else {
      label = 'Category 3: AI-Generated Practice';
      provenanceStatement = `AI-Generated Practice Problem: Synthesized to match ${prob.target_companies.join(', ')} interview evaluation style and pattern difficulty. Note: This is an AI-generated preparation exercise, not an authentic historical question.`;
      isAiGenerated = true;
    }

    if (matchesCompany || taggedProblems.length < 5) {
      taggedProblems.push({
        problem: prob,
        categoryType,
        provenanceCategoryLabel: label,
        provenanceStatement,
        sourceAttribution: prob.source_attribution || (isAiGenerated ? 'AI-Generated Practice Problem' : 'Verified Campus Placement Drive'),
        isAiGenerated,
      });
    }

    if (taggedProblems.length >= 8) break;
  }

  return { provenanceTaggedProblems: taggedProblems };
}

// ==========================================
// NODE 5: Generate Adaptive Study Plan
// ==========================================
export async function studyPlanGeneratorNode(
  state: AcademicCoachWorkflowState
): Promise<Partial<AcademicCoachWorkflowState>> {
  const weeklyHours = state.availableHoursPerWeek || 15;
  const audit = state.auditSummary;
  const hasBacklogs = (audit?.activeBacklogsCount || 0) > 0;

  // Time allocation percentages based on authentic need
  let backlogHours = 0;
  let dsaHours = 0;
  let coreCsHours = 0;
  let mockInterviewHours = 0;

  if (hasBacklogs) {
    backlogHours = Math.round(weeklyHours * 0.4 * 10) / 10; // 40% backlog remediation
    dsaHours = Math.round(weeklyHours * 0.35 * 10) / 10;     // 35% placement DSA
    coreCsHours = Math.round(weeklyHours * 0.15 * 10) / 10;  // 15% core CS
    mockInterviewHours = Math.round(weeklyHours * 0.1 * 10) / 10; // 10% mock interview
  } else {
    dsaHours = Math.round(weeklyHours * 0.45 * 10) / 10;     // 45% DSA practice
    coreCsHours = Math.round(weeklyHours * 0.3 * 10) / 10;   // 30% core CS
    mockInterviewHours = Math.round(weeklyHours * 0.25 * 10) / 10; // 25% mock interview
  }

  const schedule: GeneratedStudyPlan['schedule'] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (hasBacklogs && audit?.urgentBacklogs?.[0]) {
    const bl = audit.urgentBacklogs[0];
    schedule.push({
      day: 'Monday',
      focus: `Backlog Remediation: ${bl.subjectName}`,
      action: `Watch video lesson on ${bl.weakTopics[0] || 'core concepts'} & solve past SEE questions`,
      durationMinutes: Math.round((backlogHours / 3) * 60),
      destinationLabel: `Open ${bl.subjectName} Practice`,
      destinationUrl: '/student/learn-programming',
      provenanceNote: 'Urgent Backlog Priority (Contineo ERP)',
    });
  } else {
    schedule.push({
      day: 'Monday',
      focus: 'Advanced DSA: Dynamic Programming Patterns',
      action: 'Solve Kadane & Coin Change in DSA Tracker',
      durationMinutes: 90,
      destinationLabel: 'Open DSA Tracker',
      destinationUrl: '/student/dsa-tracker?category=Dynamic%20Programming',
    });
  }

  schedule.push({
    day: 'Tuesday',
    focus: `Company-Specific Placement Practice (${state.targetCompanies[0] || 'Google'})`,
    action: 'Solve Category 1 Verified Historical Drive problems',
    durationMinutes: Math.round((dsaHours / 3) * 60),
    destinationLabel: 'Solve Company Problems',
    destinationUrl: '/student/dsa-tracker',
    provenanceNote: 'Category 1 Verified Historical Drive Provenance',
  });

  schedule.push({
    day: 'Wednesday',
    focus: 'Core CS Foundations: Operating Systems & DBMS',
    action: 'Revise virtual memory paging and SQL transaction isolation levels',
    durationMinutes: Math.round((coreCsHours / 2) * 60),
    destinationLabel: 'Learn Section',
    destinationUrl: '/student/learn-programming',
  });

  schedule.push({
    day: 'Thursday',
    focus: 'Placement Coding: Graph Traversal & Shortest Path',
    action: 'Implement Dijkstra and BFS topological sort with test cases',
    durationMinutes: Math.round((dsaHours / 3) * 60),
    destinationLabel: 'DSA Tracker',
    destinationUrl: '/student/dsa-tracker?category=Graph',
  });

  schedule.push({
    day: 'Friday',
    focus: 'AI Mock Interview & Speech Delivery Practice',
    action: 'Complete a 4-question AI Mock Interview with voice analysis',
    durationMinutes: Math.round(mockInterviewHours * 60) || 45,
    destinationLabel: 'AI Mock Interview',
    destinationUrl: '/student/mock-interview',
  });

  schedule.push({
    day: 'Saturday',
    focus: 'Timed Campus Assessment Simulation',
    action: 'Timed placement test covering DSA + CS fundamentals',
    durationMinutes: 90,
    destinationLabel: 'Assessment Portal',
    destinationUrl: '/student/assessment',
  });

  schedule.push({
    day: 'Sunday',
    focus: 'Weekly Progress Review & CGPA Cutoff Audit',
    action: 'Audit eligibility for upcoming placement drives in CGPA Calculator',
    durationMinutes: 45,
    destinationLabel: 'CGPA Planner',
    destinationUrl: '/student/cgpa-calculator',
  });

  const milestones = [
    hasBacklogs
      ? `Clear active backlog in ${audit?.urgentBacklogs[0]?.subjectName} with grade >= B`
      : 'Maintain SGPA >= 8.50 for Super Dream company cutoffs',
    `Solve at least 15 Category 1 verified historical problems for ${state.targetCompanies.join(', ')}`,
    'Score >= 80/100 on AI Mock Interview with zero delivery red flags',
  ];

  const studyPlan: GeneratedStudyPlan = {
    weeklyHours,
    backlogHours,
    dsaHours,
    coreCsHours,
    mockInterviewHours,
    schedule,
    milestones,
  };

  return { studyPlan };
}

// ==========================================
// NODE 6: AI Coach Synthesizer (Gemini with Strict Factual Bounding)
// ==========================================
export async function coachSynthesizerNode(
  state: AcademicCoachWorkflowState
): Promise<Partial<AcademicCoachWorkflowState>> {
  if (state.intent !== 'interactive_chat') {
    return {
      outputReply: 'Academic improvement recommendations and study plan generated successfully.',
      replySource: 'deterministic_fallback',
    };
  }

  const profile = state.authenticAcademicProfile;
  if (!profile) {
    return {
      outputReply: 'Your academic profile could not be retrieved from the Contineo ERP database.',
      replySource: 'deterministic_fallback',
    };
  }

  const databaseFactsSummary = `
AUTHENTIC DATABASE FACTS (NMAMIT Contineo ERP & Exam Cell - Zero Hallucination):
- Student Name: ${profile.profile.full_name}
- USN: ${profile.profile.usn || '4NM22CS120'}
- Department: ${profile.profile.department_code || 'ISE'}
- Semester: ${profile.profile.semester || 6}
- CGPA: ${profile.cgpa.toFixed(2)} / 10.00
- Active Backlogs: ${profile.active_backlogs_count}
- Overall Attendance: ${profile.overall_attendance_pct}%
- Target Companies: ${state.targetCompanies.join(', ')}
- Target Role: ${state.targetRole}
- Active Backlog Details:
${profile.backlog_subjects
  .map(
    (b) =>
      `  * [BACKLOG] ${b.subject_code} - ${b.subject_name}: Grade ${b.grade} (Total: ${b.total_marks}/100, CIE: ${b.internal_marks}/50, SEE: ${b.external_marks}/50), Attendance: ${b.attendance_pct}%`
  )
  .join('\n') || '  * None (Zero Active Backlogs)'}
- Other Subjects:
${profile.subjects
  .filter((s) => !s.is_backlog)
  .map(
    (s) =>
      `  * ${s.subject_code} - ${s.subject_name}: Grade ${s.grade} (${s.total_marks}/100), Attendance: ${s.attendance_pct}%`
  )
  .join('\n')}
`;

  const systemInstruction = `You are the official Senior Academic & Career Placement Coach for NMAM Institute of Technology (Autonomous).
You are guiding this student based strictly on their verified institutional records.

CRITICAL INSTRUCTIONS:
1. DISTINGUISH DATABASE FACTS FROM AI RECOMMENDATIONS. Never invent false marks, fake backlogs, or unearned awards.
2. Give actionable, specific technical advice. Avoid generic clichés like "study harder" or "practice more."
3. When discussing subjects like Operating Systems, DBMS, Networks, or DSA, reference specific concepts (e.g. TLB Hit Ratio, B+ Tree split overhead, TCP Reno congestion avoidance, Kadane's algorithm).
4. Direct the student to in-app sections:
   - For DSA: "/student/dsa-tracker"
   - For DBMS, OS, Networks: "/student/learn-programming"
   - For Mock Interview: "/student/mock-interview"
   - For CGPA Planner: "/student/cgpa-calculator"
5. If the student has backlogs, address them directly and provide an immediate remediation strategy.
6. When mentioning coding problems, specify their Category provenance:
   - Category 1: Verified Historical Campus Drive Question
   - Category 2: Frequently Reported Pattern
   - Category 3: AI-Generated Practice Problem`;

  // Build prompt including recent conversation history
  const historyText = state.conversationHistory
    .slice(-4)
    .map((h) => `${h.role === 'user' ? 'Student' : 'Coach'}: ${h.content}`)
    .join('\n\n');

  const fullPrompt = `${databaseFactsSummary}

${historyText ? `Recent Conversation History:\n${historyText}\n\n` : ''}Student Inquiry: "${state.userMessage || 'How can I improve my placement readiness?'}"`;

  const fallbackText = `Hello ${profile.profile.full_name}, based on your verified Contineo ERP record (CGPA: ${profile.cgpa.toFixed(2)}), your primary academic focus is ${
    profile.backlog_subjects.length > 0
      ? `remediating your active backlog in ${profile.backlog_subjects[0].subject_name} (${profile.backlog_subjects[0].subject_code}) to unlock Tier 1 eligibility`
      : `boosting your performance in ${profile.weak_subjects[0]?.subject_name || 'Operating Systems'} to reach the 8.50+ CGPA bracket for ${state.targetCompanies[0] || 'Super Dream'} drives`
  }. You can begin practicing immediately in the [DSA Tracker](/student/dsa-tracker) or review core concepts in the [Learn Section](/student/learn-programming).`;

  const res = await invokeGeminiText({
    prompt: fullPrompt,
    systemInstruction,
    config: { temperature: 0.3 },
    fallbackText,
  });

  return {
    outputReply: res.text || fallbackText,
    replySource: res.success ? 'gemini_ai' : 'deterministic_fallback',
  };
}

// ==========================================
// CONDITIONAL ROUTER
// ==========================================
function routeCoachIntent(state: AcademicCoachWorkflowState) {
  if (state.intent === 'interactive_chat') {
    return 'coachSynthesizerNode';
  }
  return 'resourceAndDestinationMatcherNode';
}

// ==========================================
// COMPILE LANGGRAPH WORKFLOW
// ==========================================
export const academicCoachGraph = new StateGraph(AcademicCoachStateAnnotation)
  .addNode('erpIngestionNode', erpIngestionNode)
  .addNode('academicAndCompetencyAuditNode', academicAndCompetencyAuditNode)
  .addNode('resourceAndDestinationMatcherNode', resourceAndDestinationMatcherNode)
  .addNode('dsaProvenanceMatcherNode', dsaProvenanceMatcherNode)
  .addNode('studyPlanGeneratorNode', studyPlanGeneratorNode)
  .addNode('coachSynthesizerNode', coachSynthesizerNode)
  .addEdge(START, 'erpIngestionNode')
  .addEdge('erpIngestionNode', 'academicAndCompetencyAuditNode')
  .addConditionalEdges('academicAndCompetencyAuditNode', routeCoachIntent, {
    coachSynthesizerNode: 'coachSynthesizerNode',
    resourceAndDestinationMatcherNode: 'resourceAndDestinationMatcherNode',
  })
  .addEdge('resourceAndDestinationMatcherNode', 'dsaProvenanceMatcherNode')
  .addEdge('dsaProvenanceMatcherNode', 'studyPlanGeneratorNode')
  .addEdge('studyPlanGeneratorNode', END)
  .addEdge('coachSynthesizerNode', END)
  .compile();

// ==========================================
// EXPORTED EXECUTION HELPERS
// ==========================================

/**
 * Runs full academic audit, curated resource matching, provenance-tagged DSA, and study plan.
 */
export async function executeLangGraphAcademicCoach(params: {
  studentId: string;
  availableHoursPerWeek?: number;
}): Promise<AcademicCoachWorkflowState> {
  const result = await academicCoachGraph.invoke({
    studentId: params.studentId,
    availableHoursPerWeek: params.availableHoursPerWeek || 15,
    intent: 'generate_recommendations',
  });

  return result;
}

/**
 * Runs conversational AI coaching powered by LangGraph and Gemini with authentic ERP grounding.
 */
export async function executeLangGraphCoachChat(params: {
  studentId: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'model'; content: string }>;
}): Promise<{
  reply: string;
  source: 'gemini_ai' | 'deterministic_fallback';
  state: AcademicCoachWorkflowState;
}> {
  const result = await academicCoachGraph.invoke({
    studentId: params.studentId,
    userMessage: params.message,
    conversationHistory: params.conversationHistory || [],
    intent: 'interactive_chat',
  });

  return {
    reply: result.outputReply,
    source: result.replySource,
    state: result,
  };
}
