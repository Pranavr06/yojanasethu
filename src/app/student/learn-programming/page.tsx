'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  Circle,
  Sparkles,
  ExternalLink,
  Flame,
  Terminal,
  Layers,
  Search,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

interface TopicItem {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
}

interface LanguageCurriculum {
  name: string;
  badge: string;
  overview: string;
  topics: TopicItem[];
}

const CURRICULUM: Record<string, LanguageCurriculum> = {
  python: {
    name: 'Python',
    badge: 'Python 3.12+',
    overview: 'Essential for AI/ML engineering, data analysis, automation scripts, and backend microservices.',
    topics: [
      {
        id: 'py-1',
        title: 'Variables, Types & Type Annotations',
        description: 'Dynamic typing, type hints (`typing.List`, `Optional`), type casting, and immutability.',
        codeSnippet: `from typing import Optional, List\n\ndef calculate_gpa(grades: List[float], bonus: Optional[float] = 0.0) -> float:\n    total = sum(grades) + (bonus or 0.0)\n    return round(total / len(grades), 2)`,
      },
      {
        id: 'py-2',
        title: 'Control Flow, List Comprehensions & Generators',
        description: 'Iterators, generator expressions `(x for x in data)`, dictionary comprehensions, and walrus operator `:=`.',
        codeSnippet: `users = [{'name': 'Pranav', 'cgpa': 9.2}, {'name': 'Arun', 'cgpa': 8.4}]\nhonor_roll = [u['name'] for u in users if u['cgpa'] >= 9.0]\nprint(honor_roll) # ['Pranav']`,
      },
      {
        id: 'py-3',
        title: 'Functions, *args, **kwargs & Decorators',
        description: 'First-class functions, closures, custom execution-time decorators, and wrapper functions.',
        codeSnippet: `import time\n\ndef timed(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        res = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.time() - start:.4f}s")\n        return res\n    return wrapper`,
      },
      {
        id: 'py-4',
        title: 'Object-Oriented Programming (OOP) & Dunder Methods',
        description: 'Classes, dataclasses, `__repr__`, `__eq__`, inheritance, and method overriding.',
        codeSnippet: `from dataclasses import dataclass\n\n@dataclass\nclass StudentRecord:\n    usn: str\n    name: str\n    cgpa: float\n    verified: bool = False`,
      },
      {
        id: 'py-5',
        title: 'File I/O, Context Managers & JSON Handling',
        description: '`with open(...)`, custom context managers, serialization with `json`, and exception handling.',
        codeSnippet: `import json\n\nwith open("students.json", "r", encoding="utf-8") as f:\n    records = json.load(f)\n    print(f"Loaded {len(records)} students")`,
      },
      {
        id: 'py-6',
        title: 'Asynchronous Programming (asyncio & aiohttp)',
        description: 'Coroutines, event loops, `async def`, `await`, `asyncio.gather()`, and non-blocking I/O.',
        codeSnippet: `import asyncio\n\nasync def fetch_student_data(student_id: str):\n    await asyncio.sleep(0.1) # Simulate async I/O\n    return {"id": student_id, "status": "active"}`,
      },
    ],
  },
  java: {
    name: 'Java',
    badge: 'Java 21 LTS',
    overview: 'Crucial for enterprise product firms, distributed systems, Android, and banking backends.',
    topics: [
      {
        id: 'java-1',
        title: 'JVM Architecture, Memory & Primitive Types',
        description: 'Heap vs Stack memory, Garbage Collection (G1GC/ZGC), Bytecode compilation, and JIT.',
        codeSnippet: `public record Student(String usn, String name, double cgpa) {\n    public boolean isEligibleForTier1() {\n        return this.cgpa >= 8.5;\n    }\n}`,
      },
      {
        id: 'java-2',
        title: 'Object-Oriented Principles (Encapsulation, Polymorphism)',
        description: 'Abstract classes, Interfaces, Sealed classes, Pattern matching for switch, and SOLID principles.',
        codeSnippet: `public sealed interface VerificationService permits ContineoVerificationService {\n    boolean verifyUSN(String usn);\n}`,
      },
      {
        id: 'java-3',
        title: 'Java Collections Framework & Generics',
        description: 'ArrayList, HashMap collision resolution (Red-Black trees), ConcurrentHashMap, PriorityQueue.',
        codeSnippet: `Map<String, Double> studentScores = new ConcurrentHashMap<>();\nstudentScores.put("4NM22CS120", 9.25);\nstudentScores.computeIfPresent("4NM22CS120", (k, v) -> v + 0.1);`,
      },
      {
        id: 'java-4',
        title: 'Java Streams API & Functional Interfaces',
        description: 'Filter, map, flatMap, reduce, parallelStreams, Collectors.groupingBy, and Optional.',
        codeSnippet: `List<String> topPerformers = students.stream()\n    .filter(s -> s.cgpa() >= 9.0)\n    .map(Student::name)\n    .collect(Collectors.toList());`,
      },
      {
        id: 'java-5',
        title: 'Multithreading & Virtual Threads (Project Loom)',
        description: 'Executors, Thread Pools, Synchronized blocks, ReentrantLock, and lightweight Virtual Threads.',
        codeSnippet: `try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 10_000).forEach(i -> {\n        executor.submit(() -> fetchPlacementDrive(i));\n    });\n}`,
      },
    ],
  },
  cpp: {
    name: 'C++',
    badge: 'C++20 Standard',
    overview: 'The golden standard for Competitive Programming, High-Frequency Trading, Game Engines, and Operating Systems.',
    topics: [
      {
        id: 'cpp-1',
        title: 'Pointers, References & Memory Management',
        description: 'Raw pointers, pointer arithmetic, dynamic memory `new/delete`, reference semantics.',
        codeSnippet: `void swapWithPointers(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}`,
      },
      {
        id: 'cpp-2',
        title: 'C++ Standard Template Library (STL)',
        description: 'std::vector, std::map, std::unordered_map, std::set, std::priority_queue, std::lower_bound.',
        codeSnippet: `#include <vector>\n#include <algorithm>\n\nstd::vector<int> arr = {5, 2, 8, 1, 9};\nstd::sort(arr.begin(), arr.end()); // O(N log N)\nauto it = std::lower_bound(arr.begin(), arr.end(), 5);`,
      },
      {
        id: 'cpp-3',
        title: 'Smart Pointers & RAII Idiom',
        description: 'Resource Acquisition Is Initialization, `std::unique_ptr`, `std::shared_ptr`, and `std::weak_ptr`.',
        codeSnippet: `#include <memory>\n\nauto student = std::make_unique<StudentRecord>("4NM22CS120", 9.1);\n// Automatically deallocated when going out of scope`,
      },
      {
        id: 'cpp-4',
        title: 'Object-Oriented C++ & Rule of Five',
        description: 'Constructors, Destructors, Copy/Move semantics, Virtual functions, and vtables.',
        codeSnippet: `class PlacementRecord {\npublic:\n    virtual void renderOffer() = 0;\n    virtual ~PlacementRecord() = default;\n};`,
      },
    ],
  },
  typescript: {
    name: 'TypeScript',
    badge: 'TypeScript 5.x',
    overview: 'Essential for modern Full-Stack development, Next.js, Node.js enterprise microservices, and React apps.',
    topics: [
      {
        id: 'ts-1',
        title: 'Type Annotations, Interfaces & Type Aliases',
        description: 'Primitive types, object types, union & intersection types, optional chaining, nullish coalescing.',
        codeSnippet: `type PlacementTier = 'Super Dream' | 'Dream' | 'Core';\n\ninterface PlacementDrive {\n  id: string;\n  company: string;\n  ctcLpa: number;\n  tier: PlacementTier;\n}`,
      },
      {
        id: 'ts-2',
        title: 'Generics, Constraints & Utility Types',
        description: '`Record<K, T>`, `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, and custom generic functions.',
        codeSnippet: `async function fetchApiResponse<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(res.statusText);\n  return (await res.json()) as T;\n}`,
      },
      {
        id: 'ts-3',
        title: 'Promises, Async/Await & Concurrency Patterns',
        description: '`Promise.all`, `Promise.allSettled`, error handling with try/catch, and abort controllers.',
        codeSnippet: `const [profile, history] = await Promise.all([\n  fetchStudentProfile(id),\n  fetchPlacementHistory(),\n]);`,
      },
    ],
  },
};

export default function LearnProgrammingPage() {
  const [selectedLang, setSelectedLang] = useState<string>('python');
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load completed from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yojanasethu_learn_progress');
      if (saved) {
        setCompletedTopics(JSON.parse(saved));
      } else {
        // default starter completed
        setCompletedTopics(['py-1', 'py-2', 'ts-1']);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentLang = CURRICULUM[selectedLang] || CURRICULUM.python;

  // Set initial active topic when lang changes
  useEffect(() => {
    setActiveTopic(currentLang.topics[0]);
  }, [selectedLang]);

  const toggleTopic = (id: string) => {
    const updated = completedTopics.includes(id)
      ? completedTopics.filter((x) => x !== id)
      : [...completedTopics, id];

    setCompletedTopics(updated);
    try {
      localStorage.setItem('yojanasethu_learn_progress', JSON.stringify(updated));
    } catch (e) {}
  };

  const currentLangCompleted = currentLang.topics.filter((t) =>
    completedTopics.includes(t.id)
  ).length;
  const currentLangPercent = Math.round(
    (currentLangCompleted / currentLang.topics.length) * 100
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Learn Programming
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Interactive Placement Tracks
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Master the core programming languages tested in technical campus rounds and online coding assessments.
          </p>
        </div>

        {/* Global Progress Indicator */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 px-4 rounded-2xl shadow-sm self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Completed</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {completedTopics.length} Topics Mastered
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
            {completedTopics.length}
          </div>
        </div>
      </div>

      {/* Language Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(CURRICULUM).map(([key, lang]) => {
          const isSelected = selectedLang === key;
          const completedCount = lang.topics.filter((t) => completedTopics.includes(t.id)).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedLang(key)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>{lang.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {completedCount}/{lang.topics.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Language Overview Banner */}
      <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-purple-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentLang.name} Placement Track
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {currentLang.badge}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{currentLang.overview}</p>
        </div>

        {/* Progress bar */}
        <div className="sm:w-56 shrink-0">
          <div className="flex justify-between text-xs mb-1 font-bold">
            <span className="text-slate-600 dark:text-slate-400">Track Progress</span>
            <span className="text-indigo-600 dark:text-indigo-400">{currentLangPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${currentLangPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Topics Checklist (Left) vs Code Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics List (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Core Technical Modules ({currentLang.topics.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click to preview syntax</span>
          </div>

          <div className="space-y-2.5">
            {currentLang.topics.map((topic, index) => {
              const isDone = completedTopics.includes(topic.id);
              const isActive = activeTopic?.id === topic.id;

              return (
                <div
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopic(topic.id);
                      }}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h4
                          className={`text-sm font-bold truncate ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {topic.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Snippet & Interactive Cheatsheet (6 cols) */}
        <div className="lg:col-span-6">
          <div className="sticky top-20 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-slate-100 p-5 shadow-lg space-y-4">
            {/* Code Window Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-xs font-mono text-slate-400">
                  {activeTopic ? `${activeTopic.title.toLowerCase().replace(/\s+/g, '_')}.${selectedLang === 'python' ? 'py' : selectedLang === 'typescript' ? 'ts' : selectedLang === 'java' ? 'java' : 'cpp'}` : 'snippet.code'}
                </span>
              </div>

              {activeTopic && (
                <button
                  onClick={() => toggleTopic(activeTopic.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    completedTopics.includes(activeTopic.id)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {completedTopics.includes(activeTopic.id) ? 'Completed' : 'Mark Done'}
                  </span>
                </button>
              )}
            </div>

            {/* Topic Details in Header */}
            {activeTopic && (
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  {activeTopic.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {activeTopic.description}
                </p>
              </div>
            )}

            {/* Code Snippet Pre Block */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed scrollbar-thin">
              <pre>{activeTopic?.codeSnippet || '// Select a topic to view standard placement implementation'}</pre>
            </div>

            {/* Practice Tip */}
            <div className="rounded-xl bg-indigo-950/40 border border-indigo-900/50 p-3.5 text-xs text-indigo-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">Campus Round Advice:</strong>
                Write this implementation cleanly on whiteboard or paper without IDE autocomplete. Recruiters assess naming conventions and edge-case handling.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
