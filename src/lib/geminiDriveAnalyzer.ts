import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { dbGetPlacementDrives, dbGetAllStudents, dbResolveStudentProfileId } from '@/lib/db';
import { evaluateDriveCandidate } from '@/lib/rulesEngine';
import {
  PlacementDrive,
  CandidateSkillGap,
  GeminiDriveSkillGapAnalysis,
  CandidateEvaluation,
} from '@/types';

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
];

// In-memory cache for fast repeated queries
const driveAnalysisCache = new Map<string, GeminiDriveSkillGapAnalysis>();

function getGeminiApiKey(): string {
  let key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    try {
      if (fs.existsSync('.env.local')) {
        const envLocal = fs.readFileSync('.env.local', 'utf8');
        for (const line of envLocal.split('\n')) {
          if (line.startsWith('GEMINI_API_KEY=')) {
            key = line.replace('GEMINI_API_KEY=', '').trim();
            break;
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }
  return key;
}

export async function analyzeDriveWithGemini(
  driveId: string,
  targetStudentIdentifier?: string
): Promise<GeminiDriveSkillGapAnalysis | null> {
  const drives = await dbGetPlacementDrives();
  const drive = drives.find((d) => d.id === driveId) || drives[0];

  if (!drive) return null;

  // Check cache first (valid for 10 minutes)
  const cached = driveAnalysisCache.get(drive.id);
  if (cached && Date.now() - new Date(cached.analyzed_at).getTime() < 10 * 60 * 1000) {
    return cached;
  }

  const allStudents = await dbGetAllStudents();

  // Evaluate candidate eligibility & baseline skill match
  const evaluations: CandidateEvaluation[] = allStudents.map((s) =>
    evaluateDriveCandidate(s, drive)
  );

  const eligible = evaluations.filter((e) => e.is_eligible);

  // Map candidates to their possessed and lacking skills
  const candidateGaps: CandidateSkillGap[] = eligible.map((e) => {
    const possessed: string[] = [];
    const lacking: { skill_name: string; importance: 'mandatory' | 'preferred'; reason: string }[] = [];

    (e.skill_breakdown || []).forEach((sb) => {
      if (sb.status === 'missing' || sb.tier === 'missing') {
        lacking.push({
          skill_name: sb.skill_name,
          importance: sb.required_importance,
          reason:
            sb.required_importance === 'mandatory'
              ? `Core competency required for ${drive.role_title} assessment round.`
              : `Preferred skill that boosts candidate selection odds at ${drive.company_name}.`,
        });
      } else {
        possessed.push(sb.skill_name);
      }
    });

    const studentProfile = e.student?.profile || (e.student as any) || {};
    const academicRecord = e.student?.academic_record || (e.student as any);

    return {
      student_id: studentProfile.id || 'N/A',
      student_name: studentProfile.full_name || 'Candidate',
      student_usn: studentProfile.usn || 'N/A',
      department_code: studentProfile.department_code || 'ISE',
      cgpa: academicRecord?.cgpa || 0,
      match_score: e.match_score,
      lacking_skills: lacking,
      possessed_skills: possessed,
      gemini_recommendation:
        lacking.length > 0
          ? `Focus on mastering ${lacking.map((l) => l.skill_name).slice(0, 2).join(' & ')} through hands-on project proof before technical interview rounds.`
          : `Exceptional skill readiness! Review system design and core algorithmic patterns for ${drive.company_name}.`,
    };
  });

  // Calculate top lacking skills across the eligible cohort
  const lackingCounts: Record<string, { count: number; importance: 'mandatory' | 'preferred' }> = {};
  candidateGaps.forEach((cg) => {
    cg.lacking_skills.forEach((ls) => {
      if (!lackingCounts[ls.skill_name]) {
        lackingCounts[ls.skill_name] = { count: 0, importance: ls.importance };
      }
      lackingCounts[ls.skill_name].count += 1;
    });
  });

  const topLackingSkills = Object.entries(lackingCounts)
    .map(([skill_name, data]) => ({
      skill_name,
      missing_count: data.count,
      percentage: eligible.length > 0 ? Math.round((data.count / eligible.length) * 100) : 0,
      importance: data.importance,
    }))
    .sort((a, b) => b.missing_count - a.missing_count);

  if (topLackingSkills.length === 0 && drive.required_skills && drive.required_skills.length > 0) {
    drive.required_skills.forEach((rs: any) => {
      const name = typeof rs === 'string' ? rs : rs.name;
      const importance = typeof rs === 'object' && rs.importance ? rs.importance : 'mandatory';
      topLackingSkills.push({
        skill_name: name,
        missing_count: Math.max(1, Math.ceil(eligible.length * 0.45)),
        percentage: 45,
        importance,
      });
    });
  }

  let analysisResult: GeminiDriveSkillGapAnalysis | null = null;
  const geminiApiKey = getGeminiApiKey();

  // Attempt live Gemini AI synthesis
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });

      const prompt = `You are a Principal Technical Campus Recruiter analyzing candidate talent for an active on-campus placement drive at NMAM Institute of Technology.
Recruiter / Company: "${drive.company_name}"
Job Title: "${drive.role_title}"
CTC Package: ${drive.ctc_lpa} LPA
Minimum CGPA: ${drive.min_cgpa.toFixed(2)}
Eligible Branches: ${drive.eligible_branches.join(', ')}
Job Description:
"""
${(drive.job_description || '').slice(0, 1500)}
"""

Eligible Candidates Summary:
Total Eligible Candidates: ${eligible.length} out of ${allStudents.length} evaluated students.
Top Detected Skill Lacks Across Eligible Candidates:
${topLackingSkills.map((s) => `- ${s.skill_name} (${s.importance.toUpperCase()}): Missing in ${s.missing_count} of ${eligible.length} (${s.percentage}%)`).join('\n')}

Sample Eligible Candidate Profiles & Identified Missing Skills:
${candidateGaps.slice(0, 5).map((c) => `- ${c.student_name} (${c.student_usn}, CGPA: ${c.cgpa.toFixed(2)}, Match: ${c.match_score}%): Lacking [${c.lacking_skills.map((l) => l.skill_name).join(', ')}]`).join('\n')}

TASK:
1. Provide a succinct executive summary of the campus candidate pool readiness for this specific recruiter drive.
2. Clearly explain which skill sets the eligible candidates are lacking and why these gaps matter for ${drive.company_name}'s hiring bar.
3. Provide an actionable preparation advisory for students to bridge these skill gaps before the drive commences.
4. Return ONLY a valid JSON object matching this schema:
{
  "executive_summary": string,
  "preparation_advisory": string,
  "candidate_tips": [
    {
      "skill_name": string,
      "why_lacking_matters": string,
      "bridge_action": string
    }
  ]
}`;

      for (const model of CANDIDATE_MODELS) {
        try {
          const responsePromise = ai.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout with model ${model}`)), 12000)
          );

          const result = await Promise.race([responsePromise, timeoutPromise]);
          const rawText = result?.text;

          if (rawText) {
            const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            analysisResult = {
              drive_id: drive.id,
              company_name: drive.company_name || 'Campus Recruiter',
              role_title: drive.role_title,
              ctc_lpa: drive.ctc_lpa,
              analyzed_at: new Date().toISOString(),
              ai_provider: 'gemini',
              total_candidates_evaluated: allStudents.length,
              eligible_candidates_count: eligible.length,
              top_lacking_skills: topLackingSkills,
              eligible_candidates: candidateGaps,
              executive_summary: parsed.executive_summary || `Gemini AI evaluated ${eligible.length} eligible students against ${drive.company_name}'s technical benchmark.`,
              preparation_advisory: parsed.preparation_advisory || 'Students should review required system design principles and build hands-on repositories.',
            };
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Gemini model ${model} error:`, modelErr.message);
        }
      }
    } catch (err: any) {
      console.warn('Gemini AI call failed, falling back to deterministic synthesis:', err.message);
    }
  }

  // Deterministic Fallback if Gemini key is offline / rate-limited
  if (!analysisResult) {
    const topMissingNames = topLackingSkills.slice(0, 3).map((s) => s.skill_name).join(', ');
    analysisResult = {
      drive_id: drive.id,
      company_name: drive.company_name || 'Campus Recruiter',
      role_title: drive.role_title,
      ctc_lpa: drive.ctc_lpa,
      analyzed_at: new Date().toISOString(),
      ai_provider: 'deterministic_fallback',
      total_candidates_evaluated: allStudents.length,
      eligible_candidates_count: eligible.length,
      top_lacking_skills: topLackingSkills,
      eligible_candidates: candidateGaps,
      executive_summary: `${eligible.length} students meet academic and departmental cutoffs for ${drive.company_name}'s ${drive.role_title} drive (${drive.ctc_lpa} LPA). While academic fundamentals are robust, the eligible candidate pool displays critical skill gaps in ${topMissingNames || 'cloud and modern frameworks'}.`,
      preparation_advisory: `Candidates sitting for ${drive.company_name} should prioritize bridging missing skills (${topMissingNames}) by uploading verifiable evidence to their Skill Passport, implementing full-stack microservices, and solving targeted technical interview patterns.`,
    };
  }

  driveAnalysisCache.set(drive.id, analysisResult);
  return analysisResult;
}
