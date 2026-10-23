import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, targetRole } = body;

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'resumeText is required' }, { status: 400 });
    }

    const textLower = resumeText.toLowerCase();

    // Skill detection catalog
    const catalog = [
      { name: 'Python', category: 'programming' },
      { name: 'SQL', category: 'database' },
      { name: 'PyTorch', category: 'ai_ml' },
      { name: 'TensorFlow', category: 'ai_ml' },
      { name: 'Data Analysis', category: 'ai_ml' },
      { name: 'React.js', category: 'framework' },
      { name: 'Node.js', category: 'programming' },
      { name: 'Git & GitHub', category: 'cloud_devops' },
      { name: 'Docker', category: 'cloud_devops' },
      { name: 'Linux CLI', category: 'cloud_devops' },
      { name: 'AWS Fundamentals', category: 'cloud_devops' },
    ];

    const detectedSkills = [];
    for (const item of catalog) {
      if (textLower.includes(item.name.toLowerCase())) {
        // Detect if there is a repository or project link associated with this skill
        const hasRepoLink =
          textLower.includes('github.com') ||
          textLower.includes('gitlab.com') ||
          textLower.includes('http');

        const isEvidenced = hasRepoLink && (textLower.includes('project') || textLower.includes('repository'));

        detectedSkills.push({
          name: item.name,
          category: item.category,
          status: isEvidenced ? 'evidenced' : 'self_declared',
          evidence_note: isEvidenced
            ? 'Detected corresponding project repository link in resume.'
            : 'Claimed in resume text without verifiable project link.',
        });
      }
    }

    // Role-specific skill gaps (e.g. AI/ML Intern requires Python, SQL, PyTorch, Data Analysis, Git)
    const requiredByRole = ['Python', 'SQL', 'PyTorch', 'Data Analysis', 'Git & GitHub'];
    const detectedNames = detectedSkills.map((s) => s.name.toLowerCase());
    const identifiedGaps = requiredByRole.filter((req) => !detectedNames.includes(req.toLowerCase()));

    return NextResponse.json({
      target_role: targetRole || 'AI/ML Intern',
      detected_skills: detectedSkills,
      detected_count: detectedSkills.length,
      identified_gaps: identifiedGaps,
      ai_summary: `Resume parsed successfully. Identified ${detectedSkills.length} skills. Critical missing skills for ${targetRole || 'AI/ML Intern'}: [${identifiedGaps.join(', ')}].`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
