import {
  FullStudentProfile,
  StudentDsaProgress,
  TargetCareerRole,
  SkillGapAnalysisResult,
  EvaluatedSkill,
  DsaPatternMetrics,
  SkillStatus,
  SkillPriority,
} from '@/types';

export interface RoleSkillBenchmark {
  skill_name: string;
  category: string;
  importance: 'mandatory' | 'preferred';
  weight: number; // 1 to 3
  required_level: 'foundational' | 'intermediate' | 'advanced';
  relevant_aliases: string[];
  why_it_matters: string;
  recommended_learning: {
    activity: string;
    resource_title: string;
    resource_url: string;
    resource_type: 'practice' | 'project' | 'course' | 'doc';
    measurable_completion_criterion: string;
  };
}

export const ROLE_BENCHMARKS: Record<TargetCareerRole, RoleSkillBenchmark[]> = {
  'Software Developer': [
    {
      skill_name: 'Data Structures & Algorithms',
      category: 'Algorithms',
      importance: 'mandatory',
      weight: 3,
      required_level: 'intermediate',
      relevant_aliases: ['dsa', 'data structures', 'algorithms', 'problem solving', 'competitive programming'],
      why_it_matters: 'Forms the core technical screening round for campus placements at all Tier-1 and product engineering firms.',
      recommended_learning: {
        activity: 'Solve 15 essential placement patterns focusing on Trees, Graphs, and Dynamic Programming in the DSA Tracker.',
        resource_title: 'YojanaSethu DSA Pattern Tracker',
        resource_url: '/student/dsa-tracker',
        resource_type: 'practice',
        measurable_completion_criterion: 'Complete at least 12 out of 20 patterns with zero active failures.',
      },
    },
    {
      skill_name: 'Object-Oriented Programming (OOP)',
      category: 'Programming',
      importance: 'mandatory',
      weight: 3,
      required_level: 'intermediate',
      relevant_aliases: ['python', 'java', 'c++', 'oop', 'object-oriented programming', 'clean code'],
      why_it_matters: 'Essential for writing maintainable, scalable, modular code and passing technical architecture interviews.',
      recommended_learning: {
        activity: 'Implement a multi-tier object-oriented application applying SOLID principles, polymorphism, and design patterns.',
        resource_title: 'Core OOP & Programming Masterclass',
        resource_url: '/student/learn-programming',
        resource_type: 'course',
        measurable_completion_criterion: 'Take and score >=70% on the Python or Java subject assessment.',
      },
    },
    {
      skill_name: 'SQL & Relational Databases',
      category: 'Database',
      importance: 'mandatory',
      weight: 2,
      required_level: 'intermediate',
      relevant_aliases: ['sql', 'postgresql', 'mysql', 'database', 'rdbms', 'relational database'],
      why_it_matters: 'Crucial for enterprise backend workflows, ACID transaction safety, and query performance optimization.',
      recommended_learning: {
        activity: 'Practice complex SQL queries including window functions, subqueries, indexing, and joins.',
        resource_title: 'SQL & Relational Database Assessment',
        resource_url: '/student/certificates',
        resource_type: 'practice',
        measurable_completion_criterion: 'Earn verified skill tier in SQL or complete Database assessment with >=60%.',
      },
    },
    {
      skill_name: 'Git, GitHub & Version Control',
      category: 'DevOps & Tools',
      importance: 'mandatory',
      weight: 2,
      required_level: 'foundational',
      relevant_aliases: ['git', 'github', 'version control', 'git & github'],
      why_it_matters: 'Non-negotiable collaborative skill required for team pull request workflows, CI/CD, and open source development.',
      recommended_learning: {
        activity: 'Maintain a clean GitHub portfolio repository with branch workflows, commits, and a comprehensive README.',
        resource_title: 'GitHub Collaboration & Version Control Guide',
        resource_url: 'https://docs.github.com/en/get-started',
        resource_type: 'doc',
        measurable_completion_criterion: 'Submit verified GitHub project repository evidence to faculty mentor desk.',
      },
    },
    {
      skill_name: 'RESTful API & Web Architecture',
      category: 'Software Engineering',
      importance: 'mandatory',
      weight: 2,
      required_level: 'intermediate',
      relevant_aliases: ['rest', 'rest api', 'next.js', 'react', 'node.js', 'fastapi', 'express', 'web development'],
      why_it_matters: 'The standard communication protocol connecting modern microservices, single-page apps, and cloud backends.',
      recommended_learning: {
        activity: 'Build a production-grade full-stack CRUD application with JWT authentication and documented endpoints.',
        resource_title: 'Full-Stack Web Architecture Track',
        resource_url: '/student/roadmap',
        resource_type: 'project',
        measurable_completion_criterion: 'Deploy a live project URL with API documentation verified in Skill Passport.',
      },
    },
    {
      skill_name: 'Docker & Containerization',
      category: 'Cloud & DevOps',
      importance: 'preferred',
      weight: 1,
      required_level: 'foundational',
      relevant_aliases: ['docker', 'containers', 'containerization', 'kubernetes', 'cloud_devops'],
      why_it_matters: 'Industry standard for ensuring reproducible local dev environments and cloud deployments.',
      recommended_learning: {
        activity: 'Write a multi-stage Dockerfile and docker-compose.yml file for a multi-container application.',
        resource_title: 'Docker Getting Started Guide',
        resource_url: 'https://docs.docker.com/get-started/',
        resource_type: 'doc',
        measurable_completion_criterion: 'Add containerized project evidence to YojanaSethu evidence desk.',
      },
    },
  ],

  'AI/ML Engineer': [
    {
      skill_name: 'Python for Machine Learning',
      category: 'Programming',
      importance: 'mandatory',
      weight: 3,
      required_level: 'advanced',
      relevant_aliases: ['python', 'pandas', 'numpy', 'scipy', 'python programming'],
      why_it_matters: 'The foundational language of the artificial intelligence, data engineering, and deep learning ecosystems.',
      recommended_learning: {
        activity: 'Master vectorization in NumPy, DataFrame operations in Pandas, and Python functional programming.',
        resource_title: 'Python for AI Specialization',
        resource_url: '/student/learn-programming',
        resource_type: 'practice',
        measurable_completion_criterion: 'Pass Python assessment exam with >=80% and register credential.',
      },
    },
    {
      skill_name: 'Deep Learning & Neural Frameworks (PyTorch/TensorFlow)',
      category: 'AI & Data Science',
      importance: 'mandatory',
      weight: 3,
      required_level: 'intermediate',
      relevant_aliases: ['pytorch', 'tensorflow', 'deep learning', 'neural networks', 'machine learning', 'ai_ml'],
      why_it_matters: 'Required for implementing, tuning, and training neural network architectures, CNNs, and Transformers.',
      recommended_learning: {
        activity: 'Build and train an end-to-end classification or generative PyTorch model with validation checkpoints.',
        resource_title: 'Machine Learning & Deep Neural Networks Assessment',
        resource_url: '/student/certificates',
        resource_type: 'project',
        measurable_completion_criterion: 'Obtain verified badge for PyTorch or Machine Learning in Skill Passport.',
      },
    },
    {
      skill_name: 'Data Preprocessing & Exploratory Analysis (EDA)',
      category: 'AI & Data Science',
      importance: 'mandatory',
      weight: 2,
      required_level: 'intermediate',
      relevant_aliases: ['data analysis', 'eda', 'data preprocessing', 'feature engineering', 'matplotlib', 'seaborn'],
      why_it_matters: '80% of production ML time is spent cleaning raw messy datasets, handling missing values, and engineering features.',
      recommended_learning: {
        activity: 'Perform exploratory data analysis on a real-world dataset and visualize key correlations and outliers.',
        resource_title: 'Exploratory Data Analysis Lab',
        resource_url: 'https://kaggle.com/learn',
        resource_type: 'course',
        measurable_completion_criterion: 'Submit a verified Jupyter Notebook project on GitHub.',
      },
    },
    {
      skill_name: 'Algorithmic Problem Solving (DSA)',
      category: 'Algorithms',
      importance: 'mandatory',
      weight: 2,
      required_level: 'intermediate',
      relevant_aliases: ['dsa', 'data structures', 'algorithms', 'math', 'problem solving'],
      why_it_matters: 'Ensures efficient model inference, data structure optimization, and matrix computation reasoning.',
      recommended_learning: {
        activity: 'Complete Array & Matrix manipulation, Graph search, and recursion patterns in the DSA Tracker.',
        resource_title: 'DSA Pattern Tracker',
        resource_url: '/student/dsa-tracker',
        resource_type: 'practice',
        measurable_completion_criterion: 'Solve at least 10 DSA patterns including Matrix and Graph traversal.',
      },
    },
    {
      skill_name: 'Transformers, LLM & Model Serving',
      category: 'AI & Data Science',
      importance: 'preferred',
      weight: 2,
      required_level: 'intermediate',
      relevant_aliases: ['transformers', 'hugging face', 'llm', 'rag', 'langchain', 'model serving', 'fastapi'],
      why_it_matters: 'Modern corporate AI drives demand candidates who can serve models via APIs or implement RAG pipelines.',
      recommended_learning: {
        activity: 'Build a small Retrieval-Augmented Generation (RAG) assistant using LangChain and a vector store.',
        resource_title: 'Hugging Face NLP Course',
        resource_url: 'https://huggingface.co/learn/nlp-course',
        resource_type: 'course',
        measurable_completion_criterion: 'Deploy a demo RAG app with GitHub repository evidence.',
      },
    },
    {
      skill_name: 'SQL & Vector Databases',
      category: 'Database',
      importance: 'preferred',
      weight: 1,
      required_level: 'foundational',
      relevant_aliases: ['sql', 'vector database', 'chroma', 'pinecone', 'pgvector'],
      why_it_matters: 'Required for embedding retrieval and structured data extraction in enterprise AI products.',
      recommended_learning: {
        activity: 'Practice writing relational SQL queries and explore pgvector or similarity search basics.',
        resource_title: 'SQL Database Fundamentals',
        resource_url: '/student/certificates',
        resource_type: 'practice',
        measurable_completion_criterion: 'Complete SQL assessment with >=60%.',
      },
    },
  ],

  'Cybersecurity Analyst': [
    {
      skill_name: 'Computer Networks & Protocols (TCP/IP)',
      category: 'Systems & Networks',
      importance: 'mandatory',
      weight: 3,
      required_level: 'intermediate',
      relevant_aliases: ['computer networks', 'networking', 'tcp/ip', 'dns', 'wireshark', 'network security'],
      why_it_matters: 'You cannot defend what you do not understand. Network packet inspection and topology are cybersecurity prerequisites.',
      recommended_learning: {
        activity: 'Capture and inspect HTTP, DNS, and TCP 3-way handshakes using Wireshark.',
        resource_title: 'Wireshark Network Analysis Training',
        resource_url: 'https://wireshark.org',
        resource_type: 'practice',
        measurable_completion_criterion: 'Demonstrate academic verification in Computer Networks course (>=8.0 SGPA).',
      },
    },
    {
      skill_name: 'Linux CLI & System Administration',
      category: 'Systems & Infrastructure',
      importance: 'mandatory',
      weight: 3,
      required_level: 'intermediate',
      relevant_aliases: ['linux', 'linux cli', 'bash', 'shell scripting', 'unix', 'system administration'],
      why_it_matters: 'Over 90% of security tools, servers, and cloud environments run on Linux operating systems.',
      recommended_learning: {
        activity: 'Master file permissions (chmod, chown), process inspection, logs analysis in /var/log, and SSH security.',
        resource_title: 'Linux Fundamentals & Bash Scripting',
        resource_url: '/student/learn-programming',
        resource_type: 'course',
        measurable_completion_criterion: 'Submit a verified bash automation script project in evidence submissions.',
      },
    },
    {
      skill_name: 'Security Fundamentals & Cryptography',
      category: 'Security',
      importance: 'mandatory',
      weight: 3,
      required_level: 'intermediate',
      relevant_aliases: ['security', 'cryptography', 'cybersecurity', 'encryption', 'pki', 'ssl', 'tls'],
      why_it_matters: 'Core principles of symmetric/asymmetric encryption, hashing, digital signatures, and key exchange protocols.',
      recommended_learning: {
        activity: 'Understand AES, RSA, SHA-256, and implement secure data encryption in Python or OpenSSL.',
        resource_title: 'Cryptography & Information Security Assessment',
        resource_url: '/student/certificates',
        resource_type: 'practice',
        measurable_completion_criterion: 'Take and pass an accredited security certification or verified assessment.',
      },
    },
    {
      skill_name: 'Web Application Security (OWASP Top 10)',
      category: 'Security',
      importance: 'mandatory',
      weight: 2,
      required_level: 'intermediate',
      relevant_aliases: ['owasp', 'web security', 'sql injection', 'xss', 'penetration testing', 'vulnerability assessment'],
      why_it_matters: 'Protects customer-facing applications against injection attacks, broken auth, and sensitive data exposure.',
      recommended_learning: {
        activity: 'Complete hands-on OWASP labs (SQLi, XSS, CSRF, SSRF) on PortSwigger Web Security Academy.',
        resource_title: 'PortSwigger Web Security Academy',
        resource_url: 'https://portswigger.net/web-security',
        resource_type: 'practice',
        measurable_completion_criterion: 'Solve at least 5 beginner/intermediate labs on PortSwigger Academy.',
      },
    },
    {
      skill_name: 'Security Scripting with Python/Bash',
      category: 'Programming',
      importance: 'mandatory',
      weight: 2,
      required_level: 'foundational',
      relevant_aliases: ['python', 'bash', 'scripting', 'automation'],
      why_it_matters: 'Security analysts write scripts to parse access logs, automate port scans, and detect anomalous activity.',
      recommended_learning: {
        activity: 'Write a Python port scanner using the socket module and an automated HTTP header inspection tool.',
        resource_title: 'Python for Security Automation',
        resource_url: '/student/learn-programming',
        resource_type: 'project',
        measurable_completion_criterion: 'Verify a Python security project repository with faculty mentor.',
      },
    },
    {
      skill_name: 'SIEM & Incident Monitoring',
      category: 'Security Operations',
      importance: 'preferred',
      weight: 1,
      required_level: 'foundational',
      relevant_aliases: ['siem', 'splunk', 'soc', 'incident response', 'log analysis', 'suricata', 'snort'],
      why_it_matters: 'Essential for Security Operations Center (SOC) entry-level roles and threat hunting.',
      recommended_learning: {
        activity: 'Analyze Apache or Nginx access logs to identify brute-force login attempts and unauthorized access.',
        resource_title: 'SOC Analyst Incident Handling Basics',
        resource_url: 'https://tryhackme.com',
        resource_type: 'practice',
        measurable_completion_criterion: 'Submit an incident investigation write-up to faculty review desk.',
      },
    },
  ],
};

/**
 * Computes deterministic, objective DSA pattern metrics from student DSA activity.
 */
export function computeDsaPatternMetrics(
  dsaRecords: StudentDsaProgress[],
  totalPatternsCatalogCount: number = 20
): DsaPatternMetrics {
  const solvedRecords = dsaRecords.filter((r) => r.status === 'solved');
  const solvedCount = solvedRecords.length;

  let totalAttempts = 0;
  let failedAttempts = 0;

  for (const r of dsaRecords) {
    totalAttempts += Math.max(1, r.attempts_count || 1);
    failedAttempts += Math.max(0, r.failed_attempts || 0);
  }

  // Calculate overall accuracy percentage from real attempts
  let overallAccuracy = 100.0;
  if (totalAttempts > 0) {
    const successful = Math.max(0, totalAttempts - failedAttempts);
    overallAccuracy = Math.round((successful / totalAttempts) * 100);
  }

  // Count difficulty distribution of solved patterns
  // Pattern IDs convention: dsa-1 to dsa-3 easy/med/hard
  const easyIds = new Set(['dsa-1', 'dsa-6', 'dsa-8']);
  const hardIds = new Set(['dsa-3', 'dsa-5', 'dsa-12']);

  let easyCount = 0;
  let hardCount = 0;
  let mediumCount = 0;

  for (const s of solvedRecords) {
    if (easyIds.has(s.topic_id)) easyCount++;
    else if (hardIds.has(s.topic_id)) hardCount++;
    else mediumCount++;
  }

  // Category tracking
  const categoryMap: Record<string, { total: number; solved: number; failures: number }> = {
    'Arrays & Hashing': { total: 3, solved: 0, failures: 0 },
    'Strings & Sliding Window': { total: 2, solved: 0, failures: 0 },
    'Linked Lists': { total: 2, solved: 0, failures: 0 },
    'Stacks & Queues': { total: 2, solved: 0, failures: 0 },
    'Trees & BST': { total: 3, solved: 0, failures: 0 },
    'Graphs & BFS/DFS': { total: 3, solved: 0, failures: 0 },
    'Dynamic Programming': { total: 3, solved: 0, failures: 0 },
    'Searching & Sorting': { total: 2, solved: 0, failures: 0 },
  };

  const topicCategoryMap: Record<string, string> = {
    'dsa-1': 'Arrays & Hashing',
    'dsa-2': 'Arrays & Hashing',
    'dsa-3': 'Arrays & Hashing',
    'dsa-4': 'Strings & Sliding Window',
    'dsa-5': 'Strings & Sliding Window',
    'dsa-6': 'Linked Lists',
    'dsa-7': 'Linked Lists',
    'dsa-8': 'Stacks & Queues',
    'dsa-9': 'Stacks & Queues',
    'dsa-10': 'Trees & BST',
    'dsa-11': 'Trees & BST',
    'dsa-12': 'Trees & BST',
    'dsa-13': 'Graphs & BFS/DFS',
    'dsa-14': 'Graphs & BFS/DFS',
    'dsa-15': 'Graphs & BFS/DFS',
    'dsa-16': 'Dynamic Programming',
    'dsa-17': 'Dynamic Programming',
    'dsa-18': 'Dynamic Programming',
    'dsa-19': 'Searching & Sorting',
    'dsa-20': 'Searching & Sorting',
  };

  for (const r of dsaRecords) {
    const cat = topicCategoryMap[r.topic_id];
    if (cat && categoryMap[cat]) {
      if (r.status === 'solved') categoryMap[cat].solved++;
      categoryMap[cat].failures += r.failed_attempts || 0;
    }
  }

  const weakCategories: { category: string; accuracy: number; unsolved_critical: number }[] = [];
  const strongCategories: string[] = [];

  for (const [cat, data] of Object.entries(categoryMap)) {
    const unsolved = data.total - data.solved;
    const catAttempts = data.solved + data.failures;
    const catAcc = catAttempts > 0 ? Math.round((data.solved / catAttempts) * 100) : 0;

    if (unsolved > 0 || (catAttempts > 0 && catAcc < 70)) {
      weakCategories.push({
        category: cat,
        accuracy: catAcc,
        unsolved_critical: unsolved,
      });
    } else if (data.solved === data.total) {
      strongCategories.push(cat);
    }
  }

  // Algorithmic Readiness Score (0 to 100)
  // 50% from pattern coverage (solved / total)
  // 30% from accuracy
  // 20% from hard / medium problem depth
  const coverageScore = (solvedCount / totalPatternsCatalogCount) * 50;
  const accuracyScore = (overallAccuracy / 100) * 30;
  const depthBonus = Math.min(20, mediumCount * 1.5 + hardCount * 3.5);
  const algorithmicReadinessScore = Math.min(100, Math.round(coverageScore + accuracyScore + depthBonus));

  return {
    total_patterns: totalPatternsCatalogCount,
    solved_count: solvedCount,
    overall_accuracy: overallAccuracy,
    total_attempts: totalAttempts,
    failed_attempts: failedAttempts,
    solved_by_difficulty: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
    weak_categories: weakCategories,
    strong_categories: strongCategories,
    algorithmic_readiness_score: algorithmicReadinessScore,
  };
}

/**
 * Deterministic, explainable Skill Gap Analyzer.
 * Adheres to:
 * 1. Missing data is never treated as a demonstrated skill gap.
 * 2. Unassessed areas are clearly separated from demonstrated failures.
 * 3. Verified evidence from faculty and assessments is prioritized.
 * 4. Transparent scoring formula without fabricated industry stats.
 */
export function analyzeStudentSkillGap(params: {
  student: FullStudentProfile;
  dsaRecords: StudentDsaProgress[];
  targetRole?: TargetCareerRole;
}): SkillGapAnalysisResult {
  const { student, dsaRecords, targetRole = 'Software Developer' } = params;
  const effectiveRole: TargetCareerRole =
    targetRole in ROLE_BENCHMARKS ? targetRole : 'Software Developer';

  const benchmarks = ROLE_BENCHMARKS[effectiveRole];
  const dsaMetrics = computeDsaPatternMetrics(dsaRecords);

  // Normalize student demonstrated skills for lookup
  const passportSkills = student.skills || [];
  const submissions = student.evidence_submissions || [];
  const verifiedSubmissions = submissions.filter((s) => s.status === 'verified');

  let totalPossibleWeight = 0;
  let earnedScoreWeight = 0;
  let verifiedStrengthsCount = 0;
  let demonstratedGapsCount = 0;
  let unassessedSkillsCount = 0;

  const evaluatedSkills: EvaluatedSkill[] = [];

  for (const bench of benchmarks) {
    totalPossibleWeight += bench.weight;

    // 1. Search in verified skill passport
    const matchedPassport = passportSkills.find((ps) => {
      const name = ps.skill_name.toLowerCase();
      return (
        name === bench.skill_name.toLowerCase() ||
        bench.relevant_aliases.some((alias) => name.includes(alias.toLowerCase()))
      );
    });

    // 2. Search in verified evidence submissions (projects/certificates)
    const matchedSubmission = verifiedSubmissions.find((sub) => {
      const titleAndDesc = `${sub.title} ${sub.description} ${(sub.associated_skills || []).join(' ')} ${(sub.technologies || []).join(' ')}`.toLowerCase();
      return (
        titleAndDesc.includes(bench.skill_name.toLowerCase()) ||
        bench.relevant_aliases.some((alias) => titleAndDesc.includes(alias.toLowerCase()))
      );
    });

    // 3. For algorithmic / DSA benchmark, incorporate actual DSA tracker metrics
    const isDsaSkill = bench.category === 'Algorithms' || bench.skill_name.includes('Data Structures');

    let status: SkillStatus = 'unassessed_missing';
    let demonstratedLevel: 'none' | 'foundational' | 'intermediate' | 'advanced' = 'none';
    let evidenceSummary = '';
    let reason = '';

    if (matchedPassport && matchedPassport.verification_badge) {
      // Verified by Faculty Mentor in Skill Passport
      status = 'verified_strength';
      demonstratedLevel = matchedPassport.confidence_score && matchedPassport.confidence_score >= 85 ? 'advanced' : 'intermediate';
      evidenceSummary = `Faculty Verified Credential in Skill Passport: "${matchedPassport.skill_name}" (Confidence Score: ${matchedPassport.confidence_score || 90}%).`;
      reason = `Endorsed by faculty mentor (${matchedPassport.evidence_source || 'Faculty Review'}). Demonstrates proven competence.`;
      earnedScoreWeight += bench.weight;
      verifiedStrengthsCount++;
    } else if (matchedSubmission) {
      // Verified in Evidence Submission
      status = 'verified_strength';
      demonstratedLevel = 'intermediate';
      evidenceSummary = `Verified submission: "${matchedSubmission.title}" (${matchedSubmission.issuer_or_organization}).`;
      reason = `Evaluated and approved by institutional reviewer.`;
      earnedScoreWeight += bench.weight * 0.9;
      verifiedStrengthsCount++;
    } else if (isDsaSkill) {
      if (dsaMetrics.solved_count >= 10 && dsaMetrics.overall_accuracy >= 75) {
        status = 'verified_strength';
        demonstratedLevel = dsaMetrics.solved_count >= 16 ? 'advanced' : 'intermediate';
        evidenceSummary = `Demonstrated ${dsaMetrics.solved_count}/20 algorithmic patterns in DSA Tracker with ${dsaMetrics.overall_accuracy}% accuracy.`;
        reason = `Your verified pattern practice satisfies the ${bench.required_level} problem-solving requirement for ${effectiveRole}.`;
        earnedScoreWeight += bench.weight;
        verifiedStrengthsCount++;
      } else if (dsaMetrics.solved_count > 0 || dsaMetrics.failed_attempts > 0) {
        status = 'demonstrated_gap';
        demonstratedLevel = 'foundational';
        evidenceSummary = `Practiced ${dsaMetrics.solved_count}/20 patterns (${dsaMetrics.failed_attempts} failed attempts, ${dsaMetrics.overall_accuracy}% accuracy).`;
        reason = `Demonstrated initial activity, but has unresolved errors in: ${dsaMetrics.weak_categories.map((w) => w.category).join(', ') || 'unsolved patterns'}.`;
        earnedScoreWeight += bench.weight * 0.4;
        demonstratedGapsCount++;
      } else {
        status = 'unassessed_missing';
        demonstratedLevel = 'none';
        evidenceSummary = 'No practice patterns recorded in DSA Tracker yet.';
        reason = 'No active algorithmic practice data recorded in YojanaSethu yet. Complete recommended patterns to demonstrate readiness.';
        unassessedSkillsCount++;
      }
    } else if (matchedPassport && !matchedPassport.verification_badge) {
      // Self-declared claim without faculty verification
      status = 'demonstrated_gap';
      demonstratedLevel = 'foundational';
      evidenceSummary = `Self-declared claim in Skill Passport ("${matchedPassport.skill_name}"), but pending mentor verification.`;
      reason = `Self-declared without faculty verification or assessment exam proof. Requires empirical evidence.`;
      earnedScoreWeight += bench.weight * 0.35;
      demonstratedGapsCount++;
    } else {
      // No evidence exists in system
      // RULE: Do not penalize as "failed" - strictly categorize as unassessed
      status = 'unassessed_missing';
      demonstratedLevel = 'none';
      evidenceSummary = 'No credential, project repository, or assessment submitted in YojanaSethu yet.';
      reason = `No active record in database for ${bench.skill_name}. Submit a project, certification, or take an assessment to establish verified proof.`;
      unassessedSkillsCount++;
    }

    // Determine priority
    let priority: SkillPriority = 'medium';
    if (bench.importance === 'mandatory' && status !== 'verified_strength') {
      priority = bench.weight >= 3 ? 'critical' : 'high';
    } else if (status === 'verified_strength') {
      priority = 'medium';
    }

    evaluatedSkills.push({
      skill_name: bench.skill_name,
      category: bench.category,
      status,
      priority,
      required_level: bench.required_level,
      demonstrated_level: demonstratedLevel,
      weight: bench.weight,
      importance: bench.importance,
      evidence_summary: evidenceSummary,
      reason,
      recommended_action: bench.recommended_learning,
    });
  }

  // Calculate overall role readiness score (0 to 100)
  const roleReadinessScore = totalPossibleWeight > 0
    ? Math.round((earnedScoreWeight / totalPossibleWeight) * 100)
    : 0;

  // Generate prioritized roadmap recommendations
  const actionableItems = evaluatedSkills
    .filter((s) => s.status !== 'verified_strength')
    .sort((a, b) => {
      const pOrder: Record<SkillPriority, number> = { critical: 3, high: 2, medium: 1 };
      return pOrder[b.priority] - pOrder[a.priority];
    });

  const prioritizedRoadmap = actionableItems.map((item) => ({
    priority: item.priority,
    skill_or_topic: item.skill_name,
    reason: item.status === 'demonstrated_gap'
      ? `Demonstrated gap: ${item.reason}`
      : `Unassessed requirement: ${item.reason}`,
    suggested_activity: item.recommended_action?.activity || `Practice and document ${item.skill_name} milestones.`,
    measurable_completion_criterion: item.recommended_action?.measurable_completion_criterion || 'Pass subject assessment with >=60%.',
    resource_link: item.recommended_action?.resource_url,
  }));

  const studentName = student.profile?.full_name || 'Student';

  const transparencyNote = `Readiness score of ${roleReadinessScore}% calculated deterministically from ${verifiedStrengthsCount} verified skills, ${demonstratedGapsCount} unverified claims, and ${unassessedSkillsCount} unassessed benchmark areas. Unassessed areas carry 0 earned weight but are strictly isolated from negative gap penalties until evidence is submitted.`;

  return {
    student_id: student.profile?.id || '',
    student_name: studentName,
    target_role: effectiveRole,
    role_readiness_score: roleReadinessScore,
    verified_strengths_count: verifiedStrengthsCount,
    demonstrated_gaps_count: demonstratedGapsCount,
    unassessed_skills_count: unassessedSkillsCount,
    skills: evaluatedSkills,
    dsa_metrics: dsaMetrics,
    prioritized_roadmap: prioritizedRoadmap,
    transparency_note: transparencyNote,
  };
}
