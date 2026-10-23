'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Code2,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Sparkles,
  Zap,
  Target,
  ExternalLink,
  Flame,
  Award,
  Layers,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  TrendingDown,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { StudentDsaProgress, DsaPatternMetrics } from '@/types';

interface DSATopic {
  id: string;
  category: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: 'High' | 'Very High' | 'Critical';
  corePattern: string;
  targetCompany: string;
}

const DSA_DATA: DSATopic[] = [
  // Arrays & Hashing
  {
    id: 'dsa-1',
    category: 'Arrays & Hashing',
    title: 'Two Sum & 3Sum Problem',
    difficulty: 'Easy',
    frequency: 'Critical',
    corePattern: 'Hash Map Lookup & Two Pointers',
    targetCompany: 'Google, Amazon, TCS Digital',
  },
  {
    id: 'dsa-2',
    category: 'Arrays & Hashing',
    title: 'Kadane’s Algorithm (Maximum Subarray)',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Dynamic Programming / Greedy Prefix Sum',
    targetCompany: 'Microsoft, Infosys SP',
  },
  {
    id: 'dsa-3',
    category: 'Arrays & Hashing',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    frequency: 'High',
    corePattern: 'Two Pointers / Monotonic Stack',
    targetCompany: 'Amazon, Adobe, Cisco',
  },

  // Strings & Sliding Window
  {
    id: 'dsa-4',
    category: 'Strings & Sliding Window',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    frequency: 'Critical',
    corePattern: 'Sliding Window + Hash Set',
    targetCompany: 'Meta, Amazon, Accenture Advanced',
  },
  {
    id: 'dsa-5',
    category: 'Strings & Sliding Window',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    frequency: 'High',
    corePattern: 'Dynamic Sized Sliding Window',
    targetCompany: 'Microsoft, Oracle',
  },

  // Linked Lists
  {
    id: 'dsa-6',
    category: 'Linked Lists',
    title: 'Reverse Linked List & Detect Cycle (Floyd’s)',
    difficulty: 'Easy',
    frequency: 'Critical',
    corePattern: 'Fast & Slow Pointer / In-Place Pointer Swap',
    targetCompany: 'All Tier 1 & Tier 2 Drives',
  },
  {
    id: 'dsa-7',
    category: 'Linked Lists',
    title: 'LRU Cache Implementation',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Doubly Linked List + Hash Map',
    targetCompany: 'Google, Cisco, SAP Labs',
  },

  // Stacks & Queues
  {
    id: 'dsa-8',
    category: 'Stacks & Queues',
    title: 'Valid Parentheses & Min Stack',
    difficulty: 'Easy',
    frequency: 'Critical',
    corePattern: 'LIFO Auxiliary Stack',
    targetCompany: 'Standard Screening Round',
  },
  {
    id: 'dsa-9',
    category: 'Stacks & Queues',
    title: 'Daily Temperatures / Next Greater Element',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Monotonic Decreasing Stack',
    targetCompany: 'Amazon, Infosys Turbo',
  },

  // Trees & BST
  {
    id: 'dsa-10',
    category: 'Trees & BST',
    title: 'Lowest Common Ancestor (LCA) in BST & Binary Tree',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Recursive DFS & Tree Traversal',
    targetCompany: 'Microsoft, TCS Innovator',
  },
  {
    id: 'dsa-11',
    category: 'Trees & BST',
    title: 'Binary Tree Level Order Traversal (BFS)',
    difficulty: 'Medium',
    frequency: 'Critical',
    corePattern: 'FIFO Queue BFS',
    targetCompany: 'Cognizant GenC Next, Wipro Elite',
  },
  {
    id: 'dsa-12',
    category: 'Trees & BST',
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    frequency: 'High',
    corePattern: 'Preorder DFS with Delimiters',
    targetCompany: 'Google, Uber',
  },

  // Graphs
  {
    id: 'dsa-13',
    category: 'Graphs & BFS/DFS',
    title: 'Number of Islands & Flood Fill',
    difficulty: 'Medium',
    frequency: 'Critical',
    corePattern: 'Matrix DFS / BFS Exploration',
    targetCompany: 'Amazon, Oracle, Capgemini',
  },
  {
    id: 'dsa-14',
    category: 'Graphs & BFS/DFS',
    title: 'Course Schedule (Topological Sort / Kahn’s Algo)',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Directed Graph Cycle Detection / In-Degree BFS',
    targetCompany: 'Microsoft, Cisco',
  },
  {
    id: 'dsa-15',
    category: 'Graphs & BFS/DFS',
    title: 'Dijkstra’s Algorithm (Shortest Path)',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Min-Heap Priority Queue BFS',
    targetCompany: 'Adobe, Samsung R&D',
  },

  // Dynamic Programming
  {
    id: 'dsa-16',
    category: 'Dynamic Programming',
    title: 'Climbing Stairs & Coin Change Problem',
    difficulty: 'Medium',
    frequency: 'Critical',
    corePattern: 'Bottom-up DP Table / 1D Memoization',
    targetCompany: 'Tier 1 Product Companies',
  },
  {
    id: 'dsa-17',
    category: 'Dynamic Programming',
    title: 'Longest Increasing Subsequence (LIS)',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'O(N log N) Binary Search + Patience Sorting',
    targetCompany: 'Goldman Sachs, Amazon',
  },
  {
    id: 'dsa-18',
    category: 'Dynamic Programming',
    title: '0/1 Knapsack & Subset Sum',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: '2D DP Matrix Formulation',
    targetCompany: 'All Campus Coding Rounds',
  },

  // Searching & Sorting
  {
    id: 'dsa-19',
    category: 'Searching & Sorting',
    title: 'Binary Search on Rotated Sorted Array',
    difficulty: 'Medium',
    frequency: 'Critical',
    corePattern: 'Modified Boundary Check Binary Search',
    targetCompany: 'Google, Microsoft, Infosys',
  },
  {
    id: 'dsa-20',
    category: 'Searching & Sorting',
    title: 'Merge Sort & Quick Select (Kth Largest Element)',
    difficulty: 'Medium',
    frequency: 'Very High',
    corePattern: 'Divide and Conquer Partitioning',
    targetCompany: 'Tier 1 Campus Rounds',
  },
];

export default function DSATrackerPage() {
  const { user } = useAuth();
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [recordsMap, setRecordsMap] = useState<Record<string, StudentDsaProgress>>({});
  const [patternMetrics, setPatternMetrics] = useState<DsaPatternMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Fetch student DSA progress from backend
  const fetchDsaProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/student/dsa');
      if (res.ok) {
        const data = await res.json();
        if (data.records && Array.isArray(data.records)) {
          const rMap: Record<string, StudentDsaProgress> = {};
          const solved: string[] = [];

          data.records.forEach((r: StudentDsaProgress) => {
            rMap[r.topic_id] = r;
            if (r.status === 'solved') {
              solved.push(r.topic_id);
            }
          });

          setRecordsMap(rMap);
          setSolvedIds(solved);
          if (data.patternMetrics) {
            setPatternMetrics(data.patternMetrics);
          }
          try {
            localStorage.setItem('yojanasethu_dsa_solved', JSON.stringify(solved));
          } catch {}
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch server DSA records, using local fallback:', e);
    } finally {
      setIsLoading(false);
    }

    // Fallback to localStorage if offline
    try {
      const saved = localStorage.getItem('yojanasethu_dsa_solved');
      if (saved) {
        setSolvedIds(JSON.parse(saved));
      } else {
        setSolvedIds([]);
      }
    } catch (e) {
      console.error(e);
      setSolvedIds([]);
    }
  }, []);

  useEffect(() => {
    fetchDsaProgress();
  }, [fetchDsaProgress]);

  const toggleSolved = async (id: string) => {
    const isCurrentlySolved = solvedIds.includes(id);
    const newStatus = isCurrentlySolved ? 'attempted' : 'solved';
    const updated = isCurrentlySolved
      ? solvedIds.filter((x) => x !== id)
      : [...solvedIds, id];

    setSolvedIds(updated);
    try {
      localStorage.setItem('yojanasethu_dsa_solved', JSON.stringify(updated));
    } catch {}

    setIsSyncing(id);
    try {
      const currentRecord = recordsMap[id];
      const attempts = (currentRecord?.attempts_count || 0) + 1;
      const failed = isCurrentlySolved
        ? (currentRecord?.failed_attempts || 0) + 1
        : Math.max(0, currentRecord?.failed_attempts || 0);

      const res = await fetch('/api/student/dsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: id,
          status: newStatus,
          attempts_count: attempts,
          failed_attempts: failed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setRecordsMap((prev) => ({ ...prev, [id]: data.record }));
        }
        if (data.patternMetrics) {
          setPatternMetrics(data.patternMetrics);
        }
      }
    } catch (e) {
      console.error('Failed to sync DSA progress to server:', e);
    } finally {
      setIsSyncing(null);
    }
  };

  const recordPracticeAttempt = async (id: string, wasFailed: boolean) => {
    setIsSyncing(id);
    try {
      const currentRecord = recordsMap[id];
      const attempts = (currentRecord?.attempts_count || 1) + 1;
      const failed = wasFailed
        ? (currentRecord?.failed_attempts || 0) + 1
        : currentRecord?.failed_attempts || 0;
      const status = wasFailed ? 'attempted' : (currentRecord?.status || 'solved');

      const res = await fetch('/api/student/dsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: id,
          status,
          attempts_count: attempts,
          failed_attempts: failed,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setRecordsMap((prev) => ({ ...prev, [id]: data.record }));
        }
        if (data.patternMetrics) {
          setPatternMetrics(data.patternMetrics);
        }
        if (status === 'solved' && !solvedIds.includes(id)) {
          setSolvedIds((prev) => [...prev, id]);
        }
      }
    } catch (e) {
      console.error('Failed to log attempt:', e);
    } finally {
      setIsSyncing(null);
    }
  };

  const categories = ['All', ...Array.from(new Set(DSA_DATA.map((d) => d.category)))];

  const filteredData = DSA_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDiff = difficultyFilter === 'All' || item.difficulty === difficultyFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.corePattern.toLowerCase().includes(search.toLowerCase()) ||
      item.targetCompany.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesDiff && matchesSearch;
  });

  const totalCount = DSA_DATA.length;
  const solvedCount = solvedIds.length;
  const overallPercent = Math.round((solvedCount / totalCount) * 100);

  const easySolved = DSA_DATA.filter((d) => d.difficulty === 'Easy' && solvedIds.includes(d.id)).length;
  const mediumSolved = DSA_DATA.filter((d) => d.difficulty === 'Medium' && solvedIds.includes(d.id)).length;
  const hardSolved = DSA_DATA.filter((d) => d.difficulty === 'Hard' && solvedIds.includes(d.id)).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              DSA Practice Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Placement Coding Patterns
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your mastery of recurring algorithmic interview patterns asked by top campus recruiters. Synced with your Skill Gap Engine.
          </p>
        </div>

        {/* Global Progress Pill & Skill Gap Action */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/skill-gap"
            className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 p-2.5 px-4 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Analyze Skill Gap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 px-4 rounded-2xl shadow-sm self-start sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Mastery</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {solvedCount} / {totalCount} ({overallPercent}%)
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
              {overallPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* High Failure / Weakness Alert (if detected by Skill Gap Engine) */}
      {patternMetrics && patternMetrics.weak_categories && patternMetrics.weak_categories.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Algorithmic Weakness Flagged: High Failure Rate Detected
            </h4>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              Your average failure rate in <strong>{patternMetrics.weak_categories.map((w) => w.category).join(', ')}</strong> exceeds the placement benchmark (accuracy {patternMetrics.overall_accuracy}%). Prioritize revisiting these patterns before campus screening rounds.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Solved</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{solvedCount}</span>
            <span className="text-xs text-slate-400">/ {totalCount}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">Easy Patterns</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{easySolved}</span>
            <span className="text-xs text-slate-400">/ 3</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block">Medium Patterns</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{mediumSolved}</span>
            <span className="text-xs text-slate-400">/ 14</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold block">Hard Patterns</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{hardSolved}</span>
            <span className="text-xs text-slate-400">/ 3</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems, algorithmic patterns, or recruiting companies..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none shadow-sm"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
              selectedCategory === cat
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Problems Checklist Table / Cards */}
      <div className="space-y-3">
        {filteredData.map((item) => {
          const isDone = solvedIds.includes(item.id);
          const record = recordsMap[item.id];
          const isCurrentSyncing = isSyncing === item.id;

          return (
            <div
              key={item.id}
              onClick={() => toggleSolved(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDone
                  ? 'border-emerald-200/80 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <button
                  type="button"
                  disabled={isCurrentSyncing}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSolved(item.id);
                  }}
                  className="mt-0.5 sm:mt-0 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                  aria-label={isDone ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {isCurrentSyncing ? (
                    <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  ) : isDone ? (
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
                    <span className="text-[10px] text-slate-400">
                      • {item.category}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>
                      Pattern: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.corePattern}</strong>
                    </span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                    <span>
                      Asked by: <span className="text-indigo-600 dark:text-indigo-400">{item.targetCompany}</span>
                    </span>
                  </div>

                  {/* Practice Accuracy & Attempts Details if logged */}
                  {record && (
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                        Attempts: {record.attempts_count}
                      </span>
                      {record.failed_attempts > 0 && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold">
                          Failed: {record.failed_attempts}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold">
                        Accuracy: {record.accuracy_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Action & Quick Practice Logger */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  title="Log a failed submission (practice retry)"
                  onClick={(e) => {
                    e.stopPropagation();
                    recordPracticeAttempt(item.id, true);
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Failed Attempt</span>
                </button>

                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isDone ? 'Solved ✓' : 'Practice Pattern'}
                </span>
              </div>
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs">
            No algorithmic patterns found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
