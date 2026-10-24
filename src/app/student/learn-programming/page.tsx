'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  Circle,
  Sparkles,
  Terminal,
  Search,
  Database,
  Cpu,
  Wifi,
  HelpCircle,
  Award,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface TopicItem {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  quizTopicKey?: string;
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
  dbms: {
    name: 'DBMS',
    badge: 'Relational Core CS',
    overview: 'Database management systems, SQL query optimization, transaction ACID guarantees, and schema normalization.',
    topics: [
      {
        id: 'dbms-normalization',
        title: 'Schema Normalization (1NF, 2NF, 3NF & BCNF)',
        description: 'Eliminating insertion, update, and deletion anomalies through functional dependency analysis and canonical decomposition.',
        codeSnippet: `-- Decomposing Student_Course_Dept into 3NF\nCREATE TABLE students (\n    student_id UUID PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    department_code VARCHAR(10) REFERENCES departments(code)\n);\n\nCREATE TABLE student_courses (\n    student_id UUID REFERENCES students(student_id),\n    course_code VARCHAR(20),\n    PRIMARY KEY (student_id, course_code)\n);`,
        quizTopicKey: 'dbms_normalization',
      },
      {
        id: 'dbms-transactions',
        title: 'Transaction ACID Properties & Two-Phase Locking',
        description: 'Atomicity, Consistency, Isolation levels (Read Committed, Repeatable Read, Serializable), and 2PL concurrency.',
        codeSnippet: `-- Serializable Isolation Level for Financial Credit Balance\nBEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;\nUPDATE student_accounts\nSET earned_credits = earned_credits + 4\nWHERE student_id = '4NM22CS120';\nCOMMIT;`,
        quizTopicKey: 'dbms_transactions',
      },
      {
        id: 'dbms-indexing',
        title: 'B+ Tree Indexing & Query Plans (EXPLAIN ANALYZE)',
        description: 'Clustered vs non-clustered indexes, multi-column composite indexing, and sequential scan vs index scan costs.',
        codeSnippet: `-- Create covering B+ tree index for fast placement queries\nCREATE INDEX idx_students_placement_eligibility\nON students(department_code, current_cgpa DESC)\nINCLUDE (name, usn);\n\nEXPLAIN ANALYZE\nSELECT name, usn FROM students\nWHERE department_code = 'ISE' AND current_cgpa >= 8.5;`,
        quizTopicKey: 'dbms_indexing',
      },
      {
        id: 'dbms-sql',
        title: 'Advanced SQL: Window Functions & Common Table Expressions',
        description: '`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `PARTITION BY`, recursive CTEs, and rollup summaries.',
        codeSnippet: `WITH DepartmentRanked AS (\n    SELECT \n        usn, name, department_code, cgpa,\n        DENSE_RANK() OVER (PARTITION BY department_code ORDER BY cgpa DESC) as dept_rank\n    FROM students\n)\nSELECT * FROM DepartmentRanked WHERE dept_rank <= 5;`,
        quizTopicKey: 'dbms_normalization',
      },
    ],
  },
  os: {
    name: 'Operating Systems',
    badge: 'Systems Core CS',
    overview: 'Operating system internals, process virtual memory layout, CPU scheduling, thread synchronization, and deadlocks.',
    topics: [
      {
        id: 'os-paging',
        title: 'Virtual Memory, Paging & Page Replacement (LRU/OPT)',
        description: 'Page tables, multi-level paging, Translation Lookaside Buffer (TLB), page fault traps, and Belady’s anomaly.',
        codeSnippet: `// Effective Memory Access Time (EMAT) Calculation\n// Hit Ratio = a, TLB access time = t, Main memory access time = m\ndouble calculate_emat(double hit_ratio, double tlb_time, double mem_time) {\n    return hit_ratio * (tlb_time + mem_time) + \n           (1.0 - hit_ratio) * (tlb_time + 2 * mem_time);\n}`,
        quizTopicKey: 'os_virtual_memory',
      },
      {
        id: 'os-scheduling',
        title: 'CPU Scheduling Algorithms (Round Robin, SRTF, MLFQ)',
        description: 'Preemptive vs non-preemptive scheduling, turnaround time, waiting time, convoy effect, and multi-level feedback queues.',
        codeSnippet: `struct Process {\n    int pid;\n    int burst_time;\n    int arrival_time;\n    int remaining_time;\n};\n// Round Robin scheduling with time quantum Q\nvoid round_robin(Process p[], int n, int quantum);`,
        quizTopicKey: 'os_cpu_scheduling',
      },
      {
        id: 'os-deadlocks',
        title: 'Concurrency, Mutexes, Semaphores & Banker’s Algorithm',
        description: 'Critical section problem, Peterson’s solution, POSIX semaphores, deadlock 4 Coffman conditions, and resource safety check.',
        codeSnippet: `#include <pthread.h>\n#include <semaphore.h>\n\nsem_t mutex;\n\nvoid* worker(void* arg) {\n    sem_wait(&mutex); // Lock critical section\n    // Safe access to shared academic ledger\n    sem_post(&mutex); // Unlock\n    return NULL;\n}`,
        quizTopicKey: 'os_deadlocks',
      },
      {
        id: 'os-memory',
        title: 'Process Address Space & Context Switching',
        description: 'Text, Data, BSS, Heap, and Stack memory segments. CPU register preservation and process control blocks (PCB).',
        codeSnippet: `// Linux /proc/[pid]/maps layout structure\n// [Virtual Address Range]  [Permissions]  [Offset]  [Device]  [Inode]  [Pathname]\n// 00400000-00452000        r-xp           00000000  08:02     173521   /bin/server (Text)`,
        quizTopicKey: 'os_virtual_memory',
      },
    ],
  },
  networks: {
    name: 'Computer Networks',
    badge: 'Protocols & Architecture',
    overview: 'OSI 7-layer stack, TCP 3-way handshake, flow control, IPv4/IPv6 subnetting, CIDR, and socket programming.',
    topics: [
      {
        id: 'net-tcp',
        title: 'TCP 3-Way Handshake, Flow Control & Congestion Control',
        description: 'SYN, SYN-ACK, ACK sequence number synchronization, sliding window flow control, slow start, and Reno/Cubic algorithms.',
        codeSnippet: `// TCP Connection Establishment\n// Client ---> SYN (seq = x) ---------> Server (LISTEN -> SYN_RCVD)\n// Client <--- SYN-ACK (seq=y, ack=x+1) - Server\n// Client ---> ACK (ack=y+1) ---------> Server (ESTABLISHED)`,
      },
      {
        id: 'net-subnetting',
        title: 'IPv4 Subnetting, CIDR & Routing Tables',
        description: 'Classless Inter-Domain Routing, network prefix masking, host range calculation, and Longest Prefix Match routing.',
        codeSnippet: `// Subnet mask /26 = 255.255.255.192\n// Block size = 256 - 192 = 64\n// Subnet 1: 192.168.1.0 to 192.168.1.63 (Usable: .1 - .62)\n// Subnet 2: 192.168.1.64 to 192.168.1.127 (Usable: .65 - .126)`,
      },
      {
        id: 'net-http',
        title: 'HTTP/2, HTTP/3, TLS 1.3 & DNS Resolution',
        description: 'Multiplexing streams over single TCP connection, QUIC over UDP, TLS key exchange (ECDHE), and recursive DNS traversal.',
        codeSnippet: `// Modern HTTP/3 Architecture\n// Application: HTTP/3 (Frames, Streams)\n// Security & Transport: QUIC (UDP + Built-in TLS 1.3 Encryption)\n// Network: IP`,
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

function LearnProgrammingContent() {
  const searchParams = useSearchParams();
  const initialLang = searchParams?.get('lang') || 'python';
  const initialTopic = searchParams?.get('topic') || null;

  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);

  // Initialize selected language and topic from URL params
  useEffect(() => {
    if (initialLang && CURRICULUM[initialLang]) {
      setSelectedLang(initialLang);
    }
  }, [initialLang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yojanasethu_learn_progress');
      if (saved) {
        setCompletedTopics(JSON.parse(saved));
      } else {
        setCompletedTopics(['py-1', 'py-2', 'ts-1']);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const currentLang = CURRICULUM[selectedLang] || CURRICULUM.python;

  useEffect(() => {
    if (initialTopic) {
      const matched = currentLang.topics.find((t) => t.id === initialTopic || t.id.includes(initialTopic));
      if (matched) {
        setActiveTopic(matched);
        return;
      }
    }
    setActiveTopic(currentLang.topics[0]);
  }, [selectedLang, initialTopic]);

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
              Core Technical Curriculum
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              Languages & Core CS
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive syllabus modules for programming languages, Database Systems, Operating Systems, and Networks.
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

      {/* Language / Domain Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.entries(CURRICULUM).map(([key, lang]) => {
          const isSelected = selectedLang === key;
          const completedCount = lang.topics.filter((t) => completedTopics.includes(t.id)).length;
          const isCoreCS = key === 'dbms' || key === 'os' || key === 'networks';
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
              {key === 'dbms' ? (
                <Database className="w-4 h-4" />
              ) : key === 'os' ? (
                <Cpu className="w-4 h-4" />
              ) : key === 'networks' ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <Code2 className="w-4 h-4" />
              )}
              <span>{lang.name}</span>
              {isCoreCS && (
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-extrabold">
                  Core CS
                </span>
              )}
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

      {/* Domain Overview Banner */}
      <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-purple-50/30 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentLang.name} Module
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

      {/* Two Column Layout: Topics Checklist (Left) vs Code/Schema Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topics List (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Technical Modules ({currentLang.topics.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click to inspect code & architecture</span>
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
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
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
                  {activeTopic
                    ? `${activeTopic.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${
                        selectedLang === 'python'
                          ? 'py'
                          : selectedLang === 'typescript'
                          ? 'ts'
                          : selectedLang === 'java'
                          ? 'java'
                          : selectedLang === 'dbms'
                          ? 'sql'
                          : selectedLang === 'os' || selectedLang === 'networks'
                          ? 'c'
                          : 'cpp'
                      }`
                    : 'snippet.code'}
                </span>
              </div>

              {activeTopic && (
                <div className="flex items-center gap-2">
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
                </div>
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

            {/* Practice Tip & Links */}
            <div className="rounded-xl bg-indigo-950/40 border border-indigo-900/50 p-3.5 text-xs text-indigo-300 flex items-start justify-between gap-2.5">
              <div className="space-y-1">
                <strong className="block text-white">Campus Interview Note:</strong>
                <p className="text-slate-300">
                  Engineering interviewers frequently ask you to walk through concurrency, indexing, or memory tradeoffs on whiteboard.
                </p>
              </div>

              <Link
                href="/student/career-coach"
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all"
              >
                <span>AI Coach Advice</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearnProgrammingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading curriculum...</div>}>
      <LearnProgrammingContent />
    </Suspense>
  );
}
