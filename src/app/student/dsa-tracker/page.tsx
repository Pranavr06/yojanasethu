'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Code2,
  CheckCircle2,
  Circle,
  Search,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  Layers,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  BrainCircuit,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  ChevronRight,
  Info,
  X,
  Edit3,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAuth } from '@/lib/authContext';
import {
  CodingPlatform,
  StudentCodingProfile,
  PlatformStatistics,
  AggregatedDsaStats,
  DsaAiAnalysisReport,
  DsaWeeklyTask,
  STANDARD_DSA_TOPICS,
} from '@/types/dsa';

// 20 Curated Algorithmic Patterns (Retained & Integrated)
interface CuratedPattern {
  id: string;
  category: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: 'High' | 'Very High' | 'Critical';
  corePattern: string;
  targetCompany: string;
}

const CURATED_PATTERNS: CuratedPattern[] = [
  { id: 'dsa-1', category: 'Arrays & Hashing', title: 'Two Sum & 3Sum Problem', difficulty: 'Easy', frequency: 'Critical', corePattern: 'Hash Map Lookup & Two Pointers', targetCompany: 'Google, Amazon, TCS Digital' },
  { id: 'dsa-2', category: 'Arrays & Hashing', title: 'Kadane’s Algorithm (Maximum Subarray)', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Dynamic Programming / Greedy Prefix Sum', targetCompany: 'Microsoft, Infosys SP' },
  { id: 'dsa-3', category: 'Arrays & Hashing', title: 'Trapping Rain Water', difficulty: 'Hard', frequency: 'High', corePattern: 'Two Pointers / Monotonic Stack', targetCompany: 'Amazon, Adobe, Cisco' },
  { id: 'dsa-4', category: 'Strings & Sliding Window', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', frequency: 'Critical', corePattern: 'Sliding Window + Hash Set', targetCompany: 'Meta, Amazon, Accenture Advanced' },
  { id: 'dsa-5', category: 'Strings & Sliding Window', title: 'Minimum Window Substring', difficulty: 'Hard', frequency: 'High', corePattern: 'Dynamic Sized Sliding Window', targetCompany: 'Microsoft, Oracle' },
  { id: 'dsa-6', category: 'Linked Lists', title: 'Reverse Linked List & Detect Cycle (Floyd’s)', difficulty: 'Easy', frequency: 'Critical', corePattern: 'Fast & Slow Pointer / In-Place Pointer Swap', targetCompany: 'All Tier 1 & Tier 2 Drives' },
  { id: 'dsa-7', category: 'Linked Lists', title: 'LRU Cache Implementation', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Doubly Linked List + Hash Map', targetCompany: 'Google, Cisco, SAP Labs' },
  { id: 'dsa-8', category: 'Stacks & Queues', title: 'Valid Parentheses & Min Stack', difficulty: 'Easy', frequency: 'Critical', corePattern: 'LIFO Auxiliary Stack', targetCompany: 'Standard Screening Round' },
  { id: 'dsa-9', category: 'Stacks & Queues', title: 'Daily Temperatures / Next Greater Element', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Monotonic Decreasing Stack', targetCompany: 'Amazon, Infosys Turbo' },
  { id: 'dsa-10', category: 'Trees & BST', title: 'Lowest Common Ancestor (LCA) in BST & Binary Tree', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Recursive DFS & Tree Traversal', targetCompany: 'Microsoft, TCS Innovator' },
  { id: 'dsa-11', category: 'Trees & BST', title: 'Binary Tree Level Order Traversal (BFS)', difficulty: 'Medium', frequency: 'Critical', corePattern: 'FIFO Queue BFS', targetCompany: 'Cognizant GenC Next, Wipro Elite' },
  { id: 'dsa-12', category: 'Trees & BST', title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', frequency: 'High', corePattern: 'Preorder DFS with Delimiters', targetCompany: 'Google, Uber' },
  { id: 'dsa-13', category: 'Graphs & BFS/DFS', title: 'Number of Islands & Flood Fill', difficulty: 'Medium', frequency: 'Critical', corePattern: 'Matrix DFS / BFS Exploration', targetCompany: 'Amazon, Oracle, Capgemini' },
  { id: 'dsa-14', category: 'Graphs & BFS/DFS', title: 'Course Schedule (Topological Sort / Kahn’s Algo)', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Directed Graph Cycle Detection / In-Degree BFS', targetCompany: 'Microsoft, Cisco' },
  { id: 'dsa-15', category: 'Graphs & BFS/DFS', title: 'Dijkstra’s Algorithm (Shortest Path)', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Min-Heap Priority Queue BFS', targetCompany: 'Adobe, Samsung R&D' },
  { id: 'dsa-16', category: 'Dynamic Programming', title: 'Climbing Stairs & Coin Change Problem', difficulty: 'Medium', frequency: 'Critical', corePattern: 'Bottom-up DP Table / 1D Memoization', targetCompany: 'Tier 1 Product Companies' },
  { id: 'dsa-17', category: 'Dynamic Programming', title: 'Longest Increasing Subsequence (LIS)', difficulty: 'Medium', frequency: 'Very High', corePattern: 'O(N log N) Binary Search + Patience Sorting', targetCompany: 'Goldman Sachs, Amazon' },
  { id: 'dsa-18', category: 'Dynamic Programming', title: '0/1 Knapsack & Subset Sum', difficulty: 'Medium', frequency: 'Very High', corePattern: '2D DP Matrix Formulation', targetCompany: 'All Campus Coding Rounds' },
  { id: 'dsa-19', category: 'Searching & Sorting', title: 'Binary Search on Rotated Sorted Array', difficulty: 'Medium', frequency: 'Critical', corePattern: 'Modified Boundary Check Binary Search', targetCompany: 'Google, Microsoft, Infosys' },
  { id: 'dsa-20', category: 'Searching & Sorting', title: 'Merge Sort & Quick Select (Kth Largest Element)', difficulty: 'Medium', frequency: 'Very High', corePattern: 'Divide and Conquer Partitioning', targetCompany: 'Tier 1 Campus Rounds' },
];

const PLATFORM_OPTIONS: { id: CodingPlatform; label: string; placeholder: string; defaultDomain: string }[] = [
  { id: 'leetcode', label: 'LeetCode', placeholder: 'https://leetcode.com/u/your_username', defaultDomain: 'leetcode.com' },
  { id: 'codeforces', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/your_handle', defaultDomain: 'codeforces.com' },
  { id: 'hackerrank', label: 'HackerRank', placeholder: 'https://www.hackerrank.com/profile/your_username', defaultDomain: 'hackerrank.com' },
  { id: 'codechef', label: 'CodeChef', placeholder: 'https://www.codechef.com/users/your_handle', defaultDomain: 'codechef.com' },
  { id: 'geeksforgeeks', label: 'GeeksforGeeks', placeholder: 'https://www.geeksforgeeks.org/user/your_username/', defaultDomain: 'geeksforgeeks.org' },
  { id: 'custom', label: 'Custom Platform', placeholder: 'https://custom-coding-platform.com/profile/you', defaultDomain: '' },
];

const DIFFICULTY_COLORS = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#f43f5e',
};

export default function DSATrackerPage() {
  const { user } = useAuth();
  const studentId = user?.id || 'student-mock-1';

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'patterns'>('analytics');

  // Core Data States
  const [profiles, setProfiles] = useState<StudentCodingProfile[]>([]);
  const [stats, setStats] = useState<PlatformStatistics[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedDsaStats | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<DsaWeeklyTask[]>([]);
  const [latestReport, setLatestReport] = useState<DsaAiAnalysisReport | null>(null);
  const [reportsHistory, setReportsHistory] = useState<DsaAiAnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Syncing & Action states
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Modals
  const [isAddPlatformOpen, setIsAddPlatformOpen] = useState(false);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [selectedPlatformForEdit, setSelectedPlatformForEdit] = useState<CodingPlatform | null>(null);
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
  const [selectedHistoryReport, setSelectedHistoryReport] = useState<DsaAiAnalysisReport | null>(null);

  // Add Platform Form
  const [addPlatformType, setAddPlatformType] = useState<CodingPlatform>('leetcode');
  const [addProfileUrl, setAddProfileUrl] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Manual Stats Form
  const [manualEasy, setManualEasy] = useState('0');
  const [manualMedium, setManualMedium] = useState('0');
  const [manualHard, setManualHard] = useState('0');
  const [manualStreak, setManualStreak] = useState('0');
  const [manualRating, setManualRating] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  // Filter States for Charts & Tables
  const [topicSearch, setTopicSearch] = useState('');
  const [patternCategory, setPatternCategory] = useState('All');
  const [patternDiff, setPatternDiff] = useState('All');
  const [patternSearch, setPatternSearch] = useState('');
  const [solvedPatternIds, setSolvedPatternIds] = useState<string[]>([]);

  // Hydration safety for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all DSA Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/dsa/profiles?student_id=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
        setStats(data.stats || []);
        setAggregated(data.aggregated || null);
        setWeeklyPlan(data.weeklyPlan || []);
        setLatestReport(data.latestReport || null);
      }

      // Fetch reports history
      const histRes = await fetch(`/api/student/dsa/analyze?student_id=${encodeURIComponent(studentId)}`);
      if (histRes.ok) {
        const histData = await histRes.json();
        setReportsHistory(histData.reports || []);
      }
    } catch (err) {
      console.error('Error fetching DSA tracker data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load Curated Pattern Checkbox state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yojanasethu_dsa_solved');
      if (saved) {
        setSolvedPatternIds(JSON.parse(saved));
      } else {
        setSolvedPatternIds(['dsa-1', 'dsa-2', 'dsa-6', 'dsa-8', 'dsa-10', 'dsa-13', 'dsa-19']);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const togglePatternSolved = (id: string) => {
    const updated = solvedPatternIds.includes(id)
      ? solvedPatternIds.filter((x) => x !== id)
      : [...solvedPatternIds, id];
    setSolvedPatternIds(updated);
    try {
      localStorage.setItem('yojanasethu_dsa_solved', JSON.stringify(updated));
    } catch (e) {}
  };

  // Add Platform Handler
  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!addProfileUrl.trim()) {
      setAddError('Please enter your public profile URL.');
      return;
    }

    try {
      setAddLoading(true);
      const res = await fetch('/api/student/dsa/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          url: addProfileUrl.trim(),
          platform_hint: addPlatformType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add coding platform');
      }

      setIsAddPlatformOpen(false);
      setAddProfileUrl('');
      await fetchData();
    } catch (err: any) {
      setAddError(err.message || 'Error connecting platform');
    } finally {
      setAddLoading(false);
    }
  };

  // Sync Platform Handler
  const handleSyncPlatform = async (profile: StudentCodingProfile) => {
    try {
      setSyncingPlatform(profile.platform);
      const res = await fetch('/api/student/dsa/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          platform: profile.platform,
          username: profile.username,
          profile_url: profile.profile_url,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync platform');
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error synchronizing statistics');
    } finally {
      setSyncingPlatform(null);
    }
  };

  // Disconnect Platform Handler
  const handleRemovePlatform = async (profileId: string, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}? Your stored statistics for this platform will be detached.`)) {
      return;
    }
    try {
      const res = await fetch('/api/student/dsa/profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, profile_id: profileId }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error removing platform:', err);
    }
  };

  // Manual Stats Save Handler
  const handleSaveManualStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatformForEdit) return;

    try {
      setManualLoading(true);
      const prof = profiles.find((p) => p.platform === selectedPlatformForEdit);

      const res = await fetch('/api/student/dsa/manual-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          platform: selectedPlatformForEdit,
          username: prof?.username || 'coder',
          profile_url: prof?.profile_url || '',
          easy_solved: parseInt(manualEasy, 10) || 0,
          medium_solved: parseInt(manualMedium, 10) || 0,
          hard_solved: parseInt(manualHard, 10) || 0,
          contest_rating: manualRating ? parseInt(manualRating, 10) : null,
          current_streak: manualStreak ? parseInt(manualStreak, 10) : null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save statistics');
      }

      setIsManualEditOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error saving manual statistics');
    } finally {
      setManualLoading(false);
    }
  };

  // Trigger AI DSA Analysis
  const handleRunAiAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisError(null);

      const res = await fetch('/api/student/dsa/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI DSA evaluation');
      }

      setLatestReport(data.report);
      setSelectedHistoryReport(data.report);
      setIsAiReportModalOpen(true);
      await fetchData();
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to analyze DSA progress');
    } finally {
      setAnalyzing(false);
    }
  };

  // Toggle Weekly Task Completion
  const handleToggleWeeklyTask = async (taskId: string, currentCompleted: boolean) => {
    // Optimistic update
    setWeeklyPlan((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
    );

    try {
      await fetch('/api/student/dsa/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          task_id: taskId,
          completed: !currentCompleted,
        }),
      });
    } catch (err) {
      console.error('Error toggling weekly task completion:', err);
    }
  };

  // Recharts Data Prep
  const difficultyPieData = useMemo(() => {
    if (!aggregated) return [];
    return [
      { name: 'Easy', value: aggregated.easy_solved, color: DIFFICULTY_COLORS.Easy },
      { name: 'Medium', value: aggregated.medium_solved, color: DIFFICULTY_COLORS.Medium },
      { name: 'Hard', value: aggregated.hard_solved, color: DIFFICULTY_COLORS.Hard },
    ].filter((item) => item.value > 0);
  }, [aggregated]);

  const topicBarData = useMemo(() => {
    if (!aggregated || !aggregated.topic_breakdown) return [];
    return STANDARD_DSA_TOPICS.map((topic) => ({
      topic: topic.length > 12 ? topic.slice(0, 10) + '..' : topic,
      fullName: topic,
      solved: aggregated.topic_breakdown[topic] || 0,
    })).filter((item) => {
      if (!topicSearch) return true;
      return item.fullName.toLowerCase().includes(topicSearch.toLowerCase());
    });
  }, [aggregated, topicSearch]);

  // Open manual edit dialog pre-populated
  const openManualEdit = (platform: CodingPlatform) => {
    setSelectedPlatformForEdit(platform);
    const existing = stats.find((s) => s.platform === platform);
    if (existing) {
      setManualEasy(String(existing.easy_solved || 0));
      setManualMedium(String(existing.medium_solved || 0));
      setManualHard(String(existing.hard_solved || 0));
      setManualStreak(String(existing.current_streak || 0));
      setManualRating(existing.contest_rating ? String(existing.contest_rating) : '');
    } else {
      setManualEasy('0');
      setManualMedium('0');
      setManualHard('0');
      setManualStreak('0');
      setManualRating('');
    }
    setIsManualEditOpen(true);
  };

  // Filtered Curated Patterns
  const filteredPatterns = CURATED_PATTERNS.filter((item) => {
    const matchesCat = patternCategory === 'All' || item.category === patternCategory;
    const matchesDiff = patternDiff === 'All' || item.difficulty === patternDiff;
    const matchesQuery =
      item.title.toLowerCase().includes(patternSearch.toLowerCase()) ||
      item.corePattern.toLowerCase().includes(patternSearch.toLowerCase()) ||
      item.targetCompany.toLowerCase().includes(patternSearch.toLowerCase());
    return matchesCat && matchesDiff && matchesQuery;
  });

  const activeReport = selectedHistoryReport || latestReport;
  const completedWeeklyTasks = weeklyPlan.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              AI-Powered DSA Practice & Coding Tracker
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Placement Readiness System
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Connect your coding profiles (LeetCode, Codeforces, HackerRank, etc.) for live progress tracking, algorithmic weak-area detection, and personalized AI improvement roadmaps.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsAddPlatformOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-indigo-500" />
            <span>Connect Platform</span>
          </button>

          <button
            type="button"
            onClick={handleRunAiAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-60"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Portfolio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Analyze My DSA Progress</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Error Alert */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3 text-xs text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <strong className="font-extrabold block text-rose-900 dark:text-rose-100">
                AI Performance Analysis Notice
              </strong>
              <span className="leading-relaxed">{analysisError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAnalysisError(null)}
            className="p-1 rounded-lg text-rose-400 hover:text-rose-700 dark:hover:text-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Pills: Analytics Dashboard vs Curated Patterns */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Coding Analytics & AI Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab('patterns')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'patterns'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Core Interview Patterns (20)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
              {solvedPatternIds.length}/20
            </span>
          </button>
        </div>

        {latestReport && activeTab === 'analytics' && (
          <button
            onClick={() => {
              setSelectedHistoryReport(latestReport);
              setIsAiReportModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View Latest AI Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Connected Coding Platforms Bar */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Connected Coding Platforms ({profiles.length})
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">
                Supports LeetCode & Codeforces auto-sync + manual verification
              </span>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <Code2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No coding platform profiles connected yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Connect your LeetCode, Codeforces, HackerRank, or CodeChef public profile to aggregate your verified problem solving history.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddPlatformOpen(true)}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect Your First Platform</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {profiles.map((prof) => {
                  const stat = stats.find((s) => s.platform === prof.platform);
                  const isSyncing = syncingPlatform === prof.platform;
                  const canAutoSync = prof.platform === 'leetcode' || prof.platform === 'codeforces';

                  return (
                    <div
                      key={prof.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-sm hover:border-indigo-200 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                              {prof.platform}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                canAutoSync
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                              }`}
                            >
                              {canAutoSync ? 'Auto-Sync' : 'Manual'}
                            </span>
                          </div>
                          <a
                            href={prof.profile_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                          >
                            <span>@{prof.username}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePlatform(prof.id, prof.platform)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          title="Disconnect platform"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Numbers Snapshot */}
                      <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {stat?.total_solved ?? 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-500 block">Medium</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {stat?.medium_solved ?? 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 block">Hard</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {stat?.hard_solved ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                        <span className="text-[10px] text-slate-400">
                          {stat?.last_synced_at
                            ? `Synced ${new Date(stat.last_synced_at).toLocaleDateString()}`
                            : 'Not synced yet'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {canAutoSync ? (
                            <button
                              type="button"
                              onClick={() => handleSyncPlatform(prof)}
                              disabled={isSyncing}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                              <span>{isSyncing ? 'Syncing' : 'Sync'}</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => openManualEdit(prof.platform)}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Stats</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aggregated KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                Total Solved
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {aggregated?.total_solved ?? 0}
                </span>
                <span className="text-[11px] text-slate-400">problems</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Across {profiles.length} platforms
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 shadow-sm">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                Easy Solved
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {aggregated?.easy_solved ?? 0}
                </span>
                <span className="text-[11px] text-slate-400">
                  {aggregated?.total_solved
                    ? `(${Math.round((aggregated.easy_solved / aggregated.total_solved) * 100)}%)`
                    : ''}
                </span>
              </div>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">
                Foundations
              </span>
            </div>

            <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10 p-4 shadow-sm">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
                Medium Solved
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
                  {aggregated?.medium_solved ?? 0}
                </span>
                <span className="text-[11px] text-slate-400">
                  {aggregated?.total_solved
                    ? `(${Math.round((aggregated.medium_solved / aggregated.total_solved) * 100)}%)`
                    : ''}
                </span>
              </div>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1 block font-semibold">
                Screening Target
              </span>
            </div>

            <div className="rounded-2xl border border-rose-200/70 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 p-4 shadow-sm">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold block">
                Hard Solved
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-rose-700 dark:text-rose-300">
                  {aggregated?.hard_solved ?? 0}
                </span>
                <span className="text-[11px] text-slate-400">
                  {aggregated?.total_solved
                    ? `(${Math.round((aggregated.hard_solved / aggregated.total_solved) * 100)}%)`
                    : ''}
                </span>
              </div>
              <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1 block">
                Elite Tier
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                <span>Coding Streak</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {aggregated?.active_streak ?? 0}
                </span>
                <span className="text-[11px] text-slate-400">days</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {aggregated?.active_streak ? 'Active cadence' : 'Start streak today'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="flex items-center gap-1 text-xs text-indigo-500 font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Peak Rating</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {aggregated?.max_contest_rating ?? '—'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Contest rating
              </span>
            </div>
          </div>

          {/* AI Performance Evaluation Banner */}
          {latestReport ? (
            <div className="rounded-2xl border border-indigo-200/90 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-slate-50/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/60 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-indigo-600 text-white">
                      {latestReport.overall_performance.problem_solving_level}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Placement Readiness Score: {latestReport.overall_performance.score_percent}/100
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • Evaluated {new Date(latestReport.generated_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        latestReport.ai_status === 'gemini_live'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {latestReport.ai_status === 'gemini_live' ? 'Gemini AI Verified' : 'Standard Placement Evaluation'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                    {latestReport.overall_performance.total_progress_summary}
                  </p>

                  {latestReport.difficulty_analysis.is_over_relying_on_easy && (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl w-fit mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{latestReport.difficulty_analysis.verdict}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHistoryReport(latestReport);
                      setIsAiReportModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>View 8-Section Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 p-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Generate Your AI DSA Performance Evaluation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Analyze your problem solving distribution across 15 standard DSA domains, classify weak areas, and generate a personalized Monday–Sunday practice plan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={analyzing}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shrink-0 flex items-center justify-center gap-2"
              >
                {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>{analyzing ? 'Evaluating...' : 'Run Analysis Now'}</span>
              </button>
            </div>
          )}

          {/* Interactive Recharts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. Difficulty Donut Chart */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-indigo-500" />
                    <span>Difficulty Breakdown</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Target: 50%+ Medium</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Recruiters prioritize candidates demonstrating problem-solving ability in Medium-tier algorithms.
                </p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                {mounted && difficultyPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {difficultyPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-8">
                    No problem difficulty statistics logged yet.
                  </div>
                )}
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Easy: {aggregated?.easy_solved ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Med: {aggregated?.medium_solved ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hard: {aggregated?.hard_solved ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Topic-Wise Solved Bar Chart (Spans 2 columns) */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    <span>Topic-Wise Problem Distribution</span>
                  </h3>
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={topicSearch}
                      onChange={(e) => setTopicSearch(e.target.value)}
                      placeholder="Filter topics..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Distribution across standard syllabus domains. Target minimum 5+ Medium problems per high-yield topic.
                </p>
              </div>

              <div className="h-56 w-full">
                {mounted && topicBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicBarData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <XAxis
                        dataKey="topic"
                        angle={-30}
                        textAnchor="end"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${val} problems`,
                          item.payload.fullName,
                        ]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-16">
                    Connect LeetCode or enter topic-wise counts in manual edit to visualize syllabus coverage.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Core Topics: Arrays, DP, Trees, Graphs, Strings, Binary Search</span>
                <span className="font-semibold text-indigo-500">
                  {Object.values(aggregated?.topic_breakdown || {}).filter((c) => c > 0).length} of 15 Active
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Weekly DSA Improvement Plan */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Personalized Weekly DSA Improvement Plan
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Monday — Sunday
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tailored by AI to systematically tackle your identified weak areas and build regular contest rhythm.
                </p>
              </div>

              {weeklyPlan.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {completedWeeklyTasks} of {weeklyPlan.length} Tasks Completed
                  </span>
                  <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(completedWeeklyTasks / weeklyPlan.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {weeklyPlan.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                Click <strong>Analyze My DSA Progress</strong> to generate your tailored 7-day weekly schedule.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {weeklyPlan.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleWeeklyTask(task.id, task.completed)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      task.completed
                        ? 'border-emerald-200/80 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                          {task.day}
                        </span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-emerald-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleWeeklyTask(task.id, task.completed);
                          }}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <h4
                        className={`text-xs font-bold ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.topic}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {task.focus_description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {task.target_problem_type}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                        Target: {task.target_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Curated 20 Patterns Tab (Preserved & Enhanced) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Core Algorithmic Interview Patterns (20 High-Frequency Patterns)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Curated patterns asked in campus hiring rounds at Google, Amazon, Microsoft, and Infosys SP.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {solvedPatternIds.length} of 20 Mastered ({Math.round((solvedPatternIds.length / 20) * 100)}%)
              </span>
            </div>
          </div>

          {/* Search & Difficulty Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={patternSearch}
                onChange={(e) => setPatternSearch(e.target.value)}
                placeholder="Search problem title, algorithmic pattern, or recruiting company..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={patternDiff}
                onChange={(e) => setPatternDiff(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={patternCategory}
                onChange={(e) => setPatternCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="All">All Categories</option>
                {Array.from(new Set(CURATED_PATTERNS.map((p) => p.category))).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pattern Checklist List */}
          <div className="space-y-2.5">
            {filteredPatterns.map((item) => {
              const isDone = solvedPatternIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => togglePatternSolved(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone
                      ? 'border-emerald-200/80 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePatternSolved(item.id);
                      }}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-bold ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.difficulty === 'Easy'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              : item.difficulty === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                          }`}
                        >
                          {item.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-400">• {item.category}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>
                          Pattern:{' '}
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                            {item.corePattern}
                          </strong>
                        </span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                        <span>
                          Asked in: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.targetCompany}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isDone ? 'Mastered ✓' : 'Practice Pattern'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: Connect Coding Platform */}
      {isAddPlatformOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Connect Coding Platform
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlatformOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlatform} className="mt-4 space-y-4">
              {addError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Platform
                </label>
                <select
                  value={addPlatformType}
                  onChange={(e) => setAddPlatformType(e.target.value as CodingPlatform)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Public Profile URL
                </label>
                <input
                  type="text"
                  value={addProfileUrl}
                  onChange={(e) => setAddProfileUrl(e.target.value)}
                  placeholder={
                    PLATFORM_OPTIONS.find((p) => p.id === addPlatformType)?.placeholder ||
                    'https://leetcode.com/u/your_username'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Paste the direct link to your public user profile. Username is extracted automatically.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Compatibility Note</span>
                </div>
                <p>
                  <strong>LeetCode</strong> and <strong>Codeforces</strong> will automatically sync problem counts and topic statistics immediately upon connection. Other platforms allow quick manual verification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlatformOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  {addLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{addLoading ? 'Connecting...' : 'Add Platform'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manual Edit Statistics */}
      {isManualEditOpen && selectedPlatformForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  Edit {selectedPlatformForEdit} Statistics
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualStats} className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your verified problem solving counts for this platform. Total problems solved will be calculated automatically.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Easy Solved
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualEasy}
                    onChange={(e) => setManualEasy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">
                    Medium Solved
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualMedium}
                    onChange={(e) => setManualMedium(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1">
                    Hard Solved
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualHard}
                    onChange={(e) => setManualHard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Contest Rating (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1540"
                    value={manualRating}
                    onChange={(e) => setManualRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Streak Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualStreak}
                    onChange={(e) => setManualStreak(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm disabled:opacity-60"
                >
                  {manualLoading ? 'Saving...' : 'Save Statistics'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Full AI Performance Analysis Report (8 Sections) */}
      {isAiReportModalOpen && activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Report Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <BrainCircuit className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    DSA Performance Evaluation & Campus Readiness Report
                  </h2>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>Generated: {new Date(activeReport.generated_at).toLocaleString()}</span>
                  <span>•</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {activeReport.ai_status === 'gemini_live'
                      ? 'Google Gemini Live Analysis'
                      : 'Campus Placement Deterministic Engine'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {reportsHistory.length > 1 && (
                  <select
                    value={activeReport.id}
                    onChange={(e) => {
                      const sel = reportsHistory.find((r) => r.id === e.target.value);
                      if (sel) setSelectedHistoryReport(sel);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {reportsHistory.map((h, i) => (
                      <option key={h.id} value={h.id}>
                        Report #{reportsHistory.length - i} ({new Date(h.generated_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => setIsAiReportModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Provider Transparency Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 mb-0.5">
                <Info className="w-3.5 h-3.5" />
                <span>Evaluation Methodology & Provider Note</span>
              </div>
              <p>{activeReport.provider_note}</p>
            </div>

            {/* SECTION 1: Overall Performance & Score */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Section 1: Overall Performance
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Level: {activeReport.overall_performance.problem_solving_level}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Readiness Score</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {activeReport.overall_performance.score_percent} / 100
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {activeReport.overall_performance.score_percent}%
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeReport.overall_performance.total_progress_summary}
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-1">
                <span>Consistency: <strong>{activeReport.overall_performance.consistency_rating}</strong></span>
              </div>
            </div>

            {/* SECTION 2 & 3: Strengths vs Weak Areas (Strict Classification) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SECTION 2: Strengths */}
              <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Section 2: Strength Areas
                </span>
                <div className="space-y-2">
                  {activeReport.strengths.length === 0 ? (
                    <p className="text-xs text-slate-400">No demonstrated strength areas recorded yet.</p>
                  ) : (
                    activeReport.strengths.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>{s.topic}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{s.problems_solved} solved</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {s.insight}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION 3: Weak Areas & Knowledge Gaps */}
              <div className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 space-y-3">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                  Section 3: Weak Areas & Knowledge Gaps
                </span>
                <div className="space-y-2">
                  {activeReport.weak_areas.map((w, idx) => {
                    const badgeColor =
                      w.classification === 'demonstrated_weakness'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                        : w.classification === 'insufficient_data'
                        ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/30';

                    const label =
                      w.classification === 'demonstrated_weakness'
                        ? 'Demonstrated Weakness'
                        : w.classification === 'insufficient_data'
                        ? 'Insufficient Data'
                        : 'Not Yet Attempted';

                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>{w.topic}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                            {label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {w.recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 4: Difficulty Distribution Analysis */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Section 4: Difficulty Distribution & Skew Analysis
              </span>

              {activeReport.difficulty_analysis.is_over_relying_on_easy && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <strong className="font-extrabold block">Caution: Over-Reliance on Easy Problems Detected</strong>
                    <span>{activeReport.difficulty_analysis.verdict}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Your Current Breakdown
                  </span>
                  <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-emerald-500">Easy: {Math.round(activeReport.difficulty_analysis.easy_ratio * 100)}%</span>
                    <span className="text-amber-500">Medium: {Math.round(activeReport.difficulty_analysis.medium_ratio * 100)}%</span>
                    <span className="text-rose-500">Hard: {Math.round(activeReport.difficulty_analysis.hard_ratio * 100)}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Recruiter Placement Benchmark
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {activeReport.difficulty_analysis.target_ratio}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 5 & 6: Recommendations & Next Topics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SECTION 5: Recommended Next Topics */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                  Section 5: Recommended Focus
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {activeReport.personalized_recommendations.priority_topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                    <span className="text-[10px] text-slate-400 block">Daily Target</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeReport.personalized_recommendations.daily_target} Medium Problems
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950">
                    <span className="text-[10px] text-slate-400 block">Weekly Target</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeReport.personalized_recommendations.weekly_target} Problems
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Tips */}
              <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Section 6: Actionable Interview Advice
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {activeReport.personalized_recommendations.actionable_tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SECTION 7: Placement Readiness Indicator & Transparent Evaluation */}
            <div className="p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-3">
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                Section 7: Placement Readiness Evaluation
              </span>

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Placement Gate: {activeReport.placement_readiness.readiness_level}</span>
                <span>Score: {activeReport.placement_readiness.interview_readiness_score}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${activeReport.placement_readiness.interview_readiness_score}%` }}
                />
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white font-bold block mb-1">
                  Transparent Evaluation Basis:
                </strong>
                <p>{activeReport.placement_readiness.transparent_evaluation_basis}</p>
              </div>
            </div>

            {/* SECTION 8: Weekly Schedule Snapshot */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Section 8: Generated Weekly Practice Plan
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {completedWeeklyTasks} / {weeklyPlan.length} Tasks Checked
                </span>
              </div>
              <p className="text-xs text-slate-500">
                You can mark these tasks completed directly on your main dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
