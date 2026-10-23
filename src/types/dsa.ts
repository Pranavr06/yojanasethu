export type CodingPlatform =
  | 'leetcode'
  | 'codeforces'
  | 'hackerrank'
  | 'codechef'
  | 'geeksforgeeks'
  | 'custom';

export interface StudentCodingProfile {
  id: string;
  student_id: string;
  platform: CodingPlatform;
  profile_url: string;
  username: string;
  connection_status: 'connected' | 'synced' | 'sync_unavailable' | 'error' | 'syncing';
  is_manual: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export interface PlatformStatistics {
  id?: string;
  platform: CodingPlatform;
  username: string;
  profile_url: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_submissions?: number;
  accepted_submissions?: number;
  acceptance_rate?: number;
  contest_rating?: number | null;
  global_ranking?: number | null;
  current_streak?: number | null;
  topic_statistics: Record<string, number>;
  last_synced_at: string;
  is_automatic: boolean;
  sync_error?: string | null;
}

export interface AggregatedDsaStats {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_submissions: number;
  acceptance_rate: number;
  max_contest_rating: number | null;
  active_streak: number;
  topic_breakdown: Record<string, number>;
  platform_breakdown: {
    platform: CodingPlatform;
    platform_name: string;
    username: string;
    total_solved: number;
    easy: number;
    medium: number;
    hard: number;
    contest_rating?: number | null;
    last_synced: string;
  }[];
}

export interface DsaWeakArea {
  topic: string;
  classification: 'demonstrated_weakness' | 'insufficient_data' | 'not_yet_attempted';
  problems_solved: number;
  recommendation: string;
}

export interface DsaWeeklyTask {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  topic: string;
  focus_description: string;
  target_problem_type: string;
  target_count: number;
  completed: boolean;
}

export interface DsaAiAnalysisReport {
  id: string;
  student_id: string;
  generated_at: string;
  ai_provider: 'gemini' | 'deterministic_fallback';
  ai_status: 'gemini_live' | 'gemini_key_unconfigured' | 'gemini_error_fallback';
  provider_note?: string;
  overall_performance: {
    problem_solving_level: string;
    score_percent: number;
    total_progress_summary: string;
    consistency_rating: string;
    difficulty_distribution_critique: string;
  };
  strengths: {
    topic: string;
    problems_solved: number;
    insight: string;
  }[];
  weak_areas: DsaWeakArea[];
  difficulty_analysis: {
    easy_ratio: number;
    medium_ratio: number;
    hard_ratio: number;
    is_over_relying_on_easy: boolean;
    verdict: string;
    target_ratio: string;
  };
  topic_wise_analysis: {
    category: string;
    proficiency_level: 'Mastered' | 'Competent' | 'Needs Practice' | 'Not Started';
    solved: number;
    recommended_focus: string;
  }[];
  personalized_recommendations: {
    priority_topics: string[];
    recommended_difficulty: 'Easy-to-Medium' | 'Medium' | 'Medium-to-Hard' | 'Hard';
    daily_target: number;
    weekly_target: number;
    revision_focus: string[];
    actionable_tips: string[];
  };
  placement_readiness: {
    readiness_level: 'Early Preparation' | 'Approaching Readiness' | 'Placement Ready' | 'Highly Competitive';
    interview_readiness_score: number;
    strengths_for_interviews: string[];
    critical_gaps_to_close: string[];
    recommended_priorities: string[];
    transparent_evaluation_basis: string;
  };
  weekly_improvement_plan: DsaWeeklyTask[];
  statistics_snapshot: {
    total_solved: number;
    easy: number;
    medium: number;
    hard: number;
    platforms_analyzed: string[];
    synced_date: string;
  };
}

export const STANDARD_DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stacks and Queues',
  'Trees and Binary Trees',
  'Binary Search',
  'Graphs',
  'Dynamic Programming',
  'Greedy Algorithms',
  'Recursion and Backtracking',
  'Heaps',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Sorting',
] as const;
