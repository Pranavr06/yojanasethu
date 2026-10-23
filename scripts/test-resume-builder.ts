import fs from 'fs';
import { dbGetFullStudent, dbBuildDefaultResumeFromProfile, dbSaveStudentResume, dbGetStudentResumes, dbDeleteStudentResume } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

export async function runResumeBuilderTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING AI RESUME BUILDER & ATS ANALYZER TESTS');
  console.log('======================================================');

  // Test 1: Import real student profile from institutional database
  console.log('\n[TEST 1] Verifying Student Profile Import & ERP Truth...');
  const student = await dbGetFullStudent('NNM24IS159');
  if (!student) {
    throw new Error('Test student NNM24IS159 not found');
  }
  const defaultResume = dbBuildDefaultResumeFromProfile(student);
  if (!defaultResume.contact.fullName || !defaultResume.education.cgpa) {
    throw new Error('Imported resume missing essential contact or education data');
  }
  console.log('  ✓ Student profile imported successfully:');
  console.log(`    • Name: ${defaultResume.contact.fullName} (${defaultResume.contact.email})`);
  console.log(`    • College: ${defaultResume.education.institution}`);
  console.log(`    • Degree & CGPA: ${defaultResume.education.degree} in ${defaultResume.education.field} | CGPA: ${defaultResume.education.cgpa}`);
  console.log(`    • Technical Skills: ${defaultResume.skills.languages.length} languages, ${defaultResume.skills.frameworks.length} frameworks`);
  console.log(`    • Real Projects Loaded: ${defaultResume.projects.length} projects`);
  console.log(`    • Verified Credentials: ${defaultResume.certifications.length} credentials`);

  // Test 2: AI Gemini ATS Analysis
  console.log('\n[TEST 2] Verifying Live Gemini AI ATS Audit Engine...');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  let key = '';
  for (const line of envContent.split('\n')) {
    if (line.startsWith('GEMINI_API_KEY=')) key = line.replace('GEMINI_API_KEY=', '').trim();
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const testRole = 'Full Stack Engineer';
  const prompt = `Analyze this engineering student resume for the role "${testRole}".
Return a strict JSON object with:
- atsScoreEstimate (number 0-100)
- summaryFeedback (string)
- strengths (array of strings)
- issues (array of objects with category, severity, description, recommendation)
- missingSkills (array of objects with skill, category, importance)
- disclaimer (string)

Resume details:
Name: ${defaultResume.contact.fullName}
CGPA: ${defaultResume.education.cgpa}
Languages: ${defaultResume.skills.languages.join(', ')}
Frameworks: ${defaultResume.skills.frameworks.join(', ')}
Projects: ${defaultResume.projects.map(p => `${p.title}: ${p.description}`).join('; ')}`;

  const result = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const parsedAnalysis = JSON.parse(result.text || '{}');
  if (typeof parsedAnalysis.atsScoreEstimate !== 'number') {
    throw new Error('Gemini ATS analysis failed to produce a numeric atsScoreEstimate');
  }
  console.log('  ✓ Live Gemini AI ATS Analysis Succeeded:');
  console.log(`    • Estimated ATS Score: ${parsedAnalysis.atsScoreEstimate}%`);
  console.log(`    • Feedback: ${parsedAnalysis.summaryFeedback?.slice(0, 100)}...`);
  console.log(`    • Identified Strengths: ${parsedAnalysis.strengths?.length || 0} items`);
  console.log(`    • Critical/Warning Issues: ${parsedAnalysis.issues?.length || 0} items`);
  console.log(`    • Missing Skills: ${parsedAnalysis.missingSkills?.map((m: any) => m.skill).join(', ') || 'None'}`);
  console.log(`    • Disclaimer: ${parsedAnalysis.disclaimer || 'AI estimate'}`);

  // Test 3: Save Resume to Database
  console.log('\n[TEST 3] Verifying Resume Cloud Persistence (dbSaveStudentResume)...');
  const studentId = student.profile.id;
  const savedResume = await dbSaveStudentResume({
    student_id: studentId,
    title: 'Full Stack Engineering Resume 2026',
    target_role: testRole,
    target_job_description: 'Looking for a Full Stack Engineer with Next.js, Node.js, and PostgreSQL experience.',
    template: 'modern',
    resume_data: defaultResume,
    analysis_result: parsedAnalysis,
  });

  if (!savedResume || !savedResume.id) {
    throw new Error('Failed to persist student resume in database');
  }
  console.log(`  ✓ Resume saved successfully: ID=${savedResume.id}, Title="${savedResume.title}"`);

  // Test 4: Fetch Student Resumes
  console.log('\n[TEST 4] Verifying Private Resume Retrieval (dbGetStudentResumes)...');
  const resumesList = await dbGetStudentResumes(studentId);
  const found = resumesList.find((r) => r.id === savedResume.id);
  if (!found) {
    throw new Error('Saved resume was not found in student resume list');
  }
  console.log(`  ✓ Successfully retrieved ${resumesList.length} saved resumes for student.`);

  // Test 5: Delete Student Resume
  console.log('\n[TEST 5] Verifying Resume Deletion (dbDeleteStudentResume)...');
  const isDeleted = await dbDeleteStudentResume(savedResume.id, studentId);
  if (!isDeleted) {
    throw new Error('Failed to delete test resume');
  }
  console.log('  ✓ Successfully cleaned up test resume.');

  console.log('\n🎉 ALL AI RESUME BUILDER & ANALYZER TESTS PASSED CLEANLY!\n');
}

if (require.main === module) {
  runResumeBuilderTests().catch((err) => {
    console.error('Test suite error:', err);
    process.exit(1);
  });
}
