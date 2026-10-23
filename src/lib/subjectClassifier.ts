import { AssessmentSubject } from '@/types';
import { SUBJECT_METADATA } from './assessmentQuestions';

export interface SubjectClassificationResult {
  subject: AssessmentSubject;
  subjectLabel: string;
  confidence: number;
  needsConfirmation: boolean;
  matchedKeywords: string[];
  suggestedAlternatives: { subject: AssessmentSubject; label: string }[];
}

interface SubjectRule {
  subject: AssessmentSubject;
  keywords: string[];
  strongKeywords: string[];
}

const SUBJECT_RULES: SubjectRule[] = [
  {
    subject: 'cloud_aws',
    strongKeywords: ['aws', 'amazon web services', 'solutions architect', 'cloud practitioner', 'sysops', 'azure', 'gcp', 'google cloud'],
    keywords: ['cloud', 'ec2', 's3', 'vpc', 'serverless', 'lambda', 'iam', 'cloud computing'],
  },
  {
    subject: 'machine_learning',
    strongKeywords: ['deep learning', 'machine learning', 'pytorch', 'tensorflow', 'neural networks', 'computer vision', 'natural language processing', 'deeplearning.ai'],
    keywords: ['ai', 'artificial intelligence', 'nlp', 'llm', 'cnn', 'transformer', 'scikit-learn', 'data science'],
  },
  {
    subject: 'dsa',
    strongKeywords: ['data structures and algorithms', 'dsa', 'competitive programming', 'algorithms', 'leetcode'],
    keywords: ['data structures', 'sorting', 'binary tree', 'graph algorithms', 'dynamic programming', 'recursion'],
  },
  {
    subject: 'sql_databases',
    strongKeywords: ['sql', 'postgresql', 'mysql', 'oracle database', 'rdbms', 'relational database', 'database administrator'],
    keywords: ['database', 'queries', 'acid', 'indexing', 'sqlite', 'nosql', 'mongodb'],
  },
  {
    subject: 'web_development',
    strongKeywords: ['full stack', 'fullstack', 'react', 'next.js', 'frontend', 'backend developer', 'web development'],
    keywords: ['javascript', 'typescript', 'node.js', 'express', 'tailwind', 'html', 'css', 'web developer'],
  },
  {
    subject: 'cybersecurity',
    strongKeywords: ['cybersecurity', 'ethical hacking', 'ceh', 'comptia security+', 'cissp', 'penetration testing', 'infosec'],
    keywords: ['security', 'network defense', 'cryptography', 'soc', 'vulnerability', 'owasp', 'firewall'],
  },
  {
    subject: 'devops',
    strongKeywords: ['devops', 'kubernetes', 'docker', 'ci/cd', 'terraform', 'gitops', 'certified kubernetes administrator'],
    keywords: ['container', 'pipeline', 'jenkins', 'ansible', 'helm', 'argocd', 'infrastructure as code'],
  },
  {
    subject: 'python',
    strongKeywords: ['python', 'pcap', 'python institute', 'django', 'fastapi', 'flask'],
    keywords: ['python programming', 'scripting', 'python3', 'object oriented python'],
  },
];

/**
 * Classifies certificate metadata into a recognized academic assessment domain.
 * Supports both object signature `{ title, issuer, skillName }` and direct arguments `(title, issuer, skillName)`.
 * If confidence is below threshold (< 0.65), flags `needsConfirmation: true`.
 */
export function classifyCertificateSubject(
  paramOrTitle: { title: string; issuer?: string; skillName?: string } | string,
  issuerOrDesc?: string,
  skillName?: string
): SubjectClassificationResult {
  let titleStr = '';
  let issuerStr = '';
  let skillStr = '';

  if (typeof paramOrTitle === 'object' && paramOrTitle !== null) {
    titleStr = paramOrTitle.title || '';
    issuerStr = paramOrTitle.issuer || '';
    skillStr = paramOrTitle.skillName || '';
  } else {
    titleStr = String(paramOrTitle || '');
    issuerStr = issuerOrDesc || '';
    skillStr = skillName || '';
  }

  const combinedText = `${titleStr} ${issuerStr} ${skillStr}`.toLowerCase();

  let bestSubject: AssessmentSubject = 'python';
  let bestScore = 0;
  let bestKeywords: string[] = [];

  const scores: { subject: AssessmentSubject; score: number }[] = [];

  for (const rule of SUBJECT_RULES) {
    let score = 0;
    const matched: string[] = [];

    // Check strong keywords (+35 per hit)
    for (const kw of rule.strongKeywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 45;
        matched.push(kw);
      }
    }

    // Check regular keywords (+15 per hit)
    for (const kw of rule.keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 15;
        matched.push(kw);
      }
    }

    scores.push({ subject: rule.subject, score });

    if (score > bestScore) {
      bestScore = score;
      bestSubject = rule.subject;
      bestKeywords = matched;
    }
  }

  // Normalize confidence between 0.0 and 1.0
  const confidence = bestScore > 0 ? Math.min(1.0, Number((bestScore / 70).toFixed(2))) : 0.0;
  const needsConfirmation = confidence < 0.65;

  const alternatives = scores
    .filter((s) => s.subject !== bestSubject)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({
      subject: s.subject,
      label: SUBJECT_METADATA[s.subject]?.label || s.subject,
    }));

  return {
    subject: bestSubject,
    subjectLabel: SUBJECT_METADATA[bestSubject]?.label || bestSubject,
    confidence,
    needsConfirmation,
    matchedKeywords: bestKeywords,
    suggestedAlternatives: alternatives,
  };
}
