import { NextResponse } from 'next/server';
import { dbGetCohortMetrics, dbGetAllStudents } from '@/lib/db';

export async function GET() {
  try {
    const metrics = await dbGetCohortMetrics();
    const students = await dbGetAllStudents();

    const totalStudents = students.length;
    const cgpas = students
      .map((s) => s.academic_record?.cgpa)
      .filter((c): c is number => typeof c === 'number' && c > 0);
    const avgCgpa = (cgpas.length > 0 ? cgpas.reduce((a, b) => a + b, 0) / cgpas.length : 0).toFixed(2);
    const studentsWithBacklogs = students.filter((s) => (s.academic_record?.active_backlogs || 0) > 0).length;

    // AI/Rule-based interventions
    const criticalGaps = metrics.filter((m) => m.gap_percentage >= 50);
    const interventions = criticalGaps.map((gap) => ({
      id: `int-${gap.skill_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      skill_name: gap.skill_name,
      unverified_students: gap.total_students - gap.verified_count,
      recommendation: `Schedule a 2-day faculty-led workshop on ${gap.skill_name}. Currently ${gap.gap_percentage}% of cohort students lack verified proof in Skill Passport.`,
      urgency: gap.gap_percentage >= 70 ? 'high' : 'medium',
    }));

    return NextResponse.json({
      cohort_summary: {
        institution_name: 'NMAM Institute of Technology, Nitte',
        total_students: totalStudents,
        average_cgpa: avgCgpa,
        students_with_backlogs: studentsWithBacklogs,
        placement_ready_count: students.filter(
          (s) => (s.academic_record?.cgpa || 0) >= 7.0 && (s.academic_record?.active_backlogs || 0) === 0
        ).length,
      },
      skill_gap_analytics: metrics,
      recommended_interventions: interventions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
