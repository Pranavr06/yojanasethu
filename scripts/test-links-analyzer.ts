import assert from 'assert';
import {
  dbGetStudentProfileLinks,
  dbSaveStudentProfileLinks,
  dbGetStudentLinksAnalysis,
  dbSaveStudentLinksAnalysis,
  dbGetFullStudent,
  dbBuildDefaultResumeFromProfile,
} from '@/lib/db';
import { LinksAnalysisReport } from '@/types';

export async function runLinksAnalyzerTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING LINKS ANALYZER & SHARED PROFILE LINKS TESTS');
  console.log('======================================================');

  const testUsn = 'NNM24IS159';
  const student = await dbGetFullStudent(testUsn);
  if (!student) {
    throw new Error(`Test student ${testUsn} not found`);
  }
  const testStudentId = student.profile.id;

  // TEST 1: Save and edit three links
  console.log('\n[TEST 1] Saving and Editing 3 Shared Profile Links...');
  const testLinks = {
    linkedin_url: 'https://linkedin.com/in/pranav-r-engineer',
    github_url: 'https://github.com/pranavr06',
    leetcode_url: 'https://leetcode.com/pranav_r',
    target_role: 'Full Stack Engineer',
  };

  const saveOk = await dbSaveStudentProfileLinks(testStudentId, testLinks);
  assert.strictEqual(saveOk, true, 'dbSaveStudentProfileLinks must return true');

  const loadedLinks = await dbGetStudentProfileLinks(testStudentId);
  assert.strictEqual(loadedLinks.linkedin_url, testLinks.linkedin_url);
  assert.strictEqual(loadedLinks.github_url, testLinks.github_url);
  assert.strictEqual(loadedLinks.leetcode_url, testLinks.leetcode_url);
  assert.strictEqual(loadedLinks.target_role, testLinks.target_role);
  console.log('  ✓ Shared links saved and retrieved accurately:');
  console.log(`    • LinkedIn: ${loadedLinks.linkedin_url}`);
  console.log(`    • GitHub: ${loadedLinks.github_url}`);
  console.log(`    • LeetCode: ${loadedLinks.leetcode_url}`);

  // TEST 2: Reuse shared links in AI Resume Builder
  console.log('\n[TEST 2] Verifying Reusability in AI Resume Builder...');
  const updatedStudent = await dbGetFullStudent(testStudentId);
  assert(updatedStudent !== null);
  const defaultResume = dbBuildDefaultResumeFromProfile(updatedStudent);

  assert.strictEqual(defaultResume.contact.linkedin, testLinks.linkedin_url);
  assert.strictEqual(defaultResume.contact.github, testLinks.github_url);
  assert.strictEqual(defaultResume.contact.codingProfile, testLinks.leetcode_url);
  console.log('  ✓ Resume Builder automatically reuses saved links without manual re-entry:');
  console.log(`    • Resume Contact LinkedIn: ${defaultResume.contact.linkedin}`);
  console.log(`    • Resume Contact GitHub: ${defaultResume.contact.github}`);
  console.log(`    • Resume Contact Coding Profile: ${defaultResume.contact.codingProfile}`);

  // TEST 3: Partial Links Support (Allow whichever links student has)
  console.log('\n[TEST 3] Testing Partial Links (Omitted LeetCode)...');
  await dbSaveStudentProfileLinks(testStudentId, {
    linkedin_url: 'https://linkedin.com/in/pranav-r',
    github_url: 'https://github.com/pranavr06',
    leetcode_url: undefined, // omitted
    target_role: 'Software Development Engineer',
  });
  const partialLinks = await dbGetStudentProfileLinks(testStudentId);
  assert.strictEqual(partialLinks.linkedin_url, 'https://linkedin.com/in/pranav-r');
  assert.strictEqual(partialLinks.github_url, 'https://github.com/pranavr06');
  console.log('  ✓ Partial links successfully permitted (student not forced to provide all three)');

  // TEST 4: Save & Retrieve Separate Analysis Report
  console.log('\n[TEST 4] Testing Analysis Report Persistence (Separation from Resume)...');
  const sampleReport: LinksAnalysisReport = {
    target_role: 'Full Stack Engineer',
    analyzed_at: new Date().toISOString(),
    ai_provider: 'deterministic_fallback',
    overall_assessment: {
      readiness_score: 85,
      executive_summary: 'Competitive engineering candidate presence with active GitHub commits and LinkedIn engagement.',
      visibility_rating: 'Competitive',
      key_takeaway: 'Focus on production README diagrams and Medium-difficulty algorithmic distribution.',
    },
    strengths: [
      'Active GitHub repository portfolio with modular full-stack projects',
      'Professional LinkedIn headline targeting Full Stack Engineering',
    ],
    missing_information: [
      'LeetCode profile omitted: limits automated visibility into algorithmic complexity discipline',
    ],
    improvement_areas: [
      'Add system architecture diagrams to top pinned repositories',
    ],
    linkedin_analysis: {
      url: 'https://linkedin.com/in/pranav-r',
      status: 'accessible',
      headline_critique: 'Headline is well-aligned with Full Stack Engineering role.',
      summary_critique: 'Quantify team size and project throughput metrics.',
      missing_sections: ['Featured Section'],
      experience_projects_critique: 'Add live demo links to project items.',
      skills_recommendations: ['Next.js', 'PostgreSQL', 'Docker'],
      actionable_tips: ['Request mentor recommendations.'],
    },
    github_analysis: {
      url: 'https://github.com/pranavr06',
      status: 'accessible',
      portfolio_completeness: 'Solid repository portfolio with conventional commit messages.',
      repository_presentation_critique: 'Provide clean tags and descriptions for all public repositories.',
      readme_documentation_critique: 'Include local setup and testing instructions.',
      code_quality_and_stack: 'Idiomatic TypeScript and modular layout.',
      highlighted_projects: ['YojanaSethu Platform', 'Telemetry Engine'],
      actionable_tips: ['Add a GitHub profile README.'],
    },
    leetcode_analysis: {
      status: 'not_provided',
      problem_solving_tier: 'Unassessed',
      difficulty_distribution_critique: 'Link not provided.',
      dsa_preparation_gaps: ['Graphs', 'Dynamic Programming'],
      recommended_practice_topics: ['Trees & BST', 'Sliding Window'],
      actionable_tips: ['Create a LeetCode profile to benchmark problem solving speed.'],
    },
    personalized_roadmap: [
      {
        week: 1,
        phase_title: 'Repository Documentation & Profile README',
        tasks: ['Add architectural diagrams', 'Setup profile README'],
      },
      {
        week: 2,
        phase_title: 'Algorithmic Mastery',
        tasks: ['Solve 10 Medium LeetCode problems'],
      },
    ],
  };

  const reportSaveOk = await dbSaveStudentLinksAnalysis(testStudentId, sampleReport);
  assert.strictEqual(reportSaveOk, true);

  const retrievedReport = await dbGetStudentLinksAnalysis(testStudentId);
  assert(retrievedReport !== null);
  assert.strictEqual(retrievedReport.overall_assessment.readiness_score, 85);
  assert.strictEqual(retrievedReport.target_role, 'Full Stack Engineer');
  assert.strictEqual(retrievedReport.linkedin_analysis?.status, 'accessible');
  assert.strictEqual(retrievedReport.leetcode_analysis?.status, 'not_provided');
  console.log('  ✓ Analysis report saved separately from resume:');
  console.log(`    • Readiness Score: ${retrievedReport.overall_assessment.readiness_score}%`);
  console.log(`    • Visibility Rating: ${retrievedReport.overall_assessment.visibility_rating}`);
  console.log(`    • Inaccessible / Omitted Status: ${retrievedReport.leetcode_analysis?.status}`);

  console.log('\n======================================================');
  console.log('✨ ALL LINKS ANALYZER & SHARED PROFILE TESTS PASSED!');
  console.log('======================================================\n');
}
