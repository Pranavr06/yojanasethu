import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';

export interface QuizQuestionServer {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

const TOPIC_QUIZZES: Record<string, { title: string; subject: string; questions: QuizQuestionServer[] }> = {
  os_virtual_memory: {
    title: 'Operating Systems: Virtual Memory & Page Replacement',
    subject: '22CS402 Operating Systems',
    questions: [
      {
        id: 'q-vm-1',
        question: 'What constitutes a "Page Fault" in virtual memory architecture?',
        options: [
          'An invalid memory address write error that aborts the program immediately.',
          'An interrupt generated when a program attempts to access a page that is mapped in the virtual address space but not currently loaded in physical RAM.',
          'A hardware fault in the Level 1 cache controller.',
          'A disk sector bad-block read error during I/O operations.',
        ],
        correctOptionIndex: 1,
        explanation: 'A page fault is an interrupt trap raised by the MMU when the accessed page table entry valid bit is 0, requiring the OS to bring the page from secondary storage.',
      },
      {
        id: 'q-vm-2',
        question: 'Which page replacement algorithm suffers from Belady’s Anomaly (where increasing page frames increases page faults)?',
        options: [
          'Least Recently Used (LRU)',
          'Optimal Page Replacement (OPT)',
          'First-In, First-Out (FIFO)',
          'Least Frequently Used (LFU)',
        ],
        correctOptionIndex: 2,
        explanation: 'FIFO is not a stack algorithm and can experience Belady’s anomaly. LRU and Optimal are stack algorithms and are mathematically immune.',
      },
      {
        id: 'q-vm-3',
        question: 'What is the primary role of the Translation Lookaside Buffer (TLB)?',
        options: [
          'Store virtual page numbers mapped directly to physical frame numbers to avoid accessing main memory page tables on every read/write.',
          'Serve as secondary storage when main memory runs out of swap space.',
          'Encrypt virtual addresses before transmission over the PCI bus.',
          'Buffer disk writes before flushing them to NVMe storage.',
        ],
        correctOptionIndex: 0,
        explanation: 'The TLB is a high-speed hardware associative cache located inside the CPU MMU that caches recent virtual-to-physical address translations.',
      },
      {
        id: 'q-vm-4',
        question: 'What condition causes "Thrashing" in an operating system?',
        options: [
          'A high CPU utilization exceeding 99% for sustained mathematical computations.',
          'When the sum of the working set sizes of all active processes exceeds available physical memory frames, causing the OS to spend more time servicing page faults than executing user instructions.',
          'When two threads deadlock waiting for the same mutex semaphore.',
          'When a file system journal runs out of transaction inodes.',
        ],
        correctOptionIndex: 1,
        explanation: 'Thrashing occurs when memory is oversubscribed and pages are continuously evicted and immediately paged back in, degrading CPU throughput to near zero.',
      },
    ],
  },
  dbms_normalization: {
    title: 'DBMS: Relational Normalization (1NF, 2NF, 3NF & BCNF)',
    subject: '22CS404 Database Management Systems',
    questions: [
      {
        id: 'q-db-1',
        question: 'Under what condition is a relational schema in Third Normal Form (3NF)?',
        options: [
          'It is in 2NF, and no non-prime attribute is transitively dependent on any candidate key.',
          'Every attribute in the table must be an integer primary key.',
          'It contains zero foreign key constraints.',
          'All columns are atomic and multivalue dependencies are completely removed.',
        ],
        correctOptionIndex: 0,
        explanation: '3NF requires that the relation is in 2NF and for every functional dependency X -> A, either X is a superkey or A is a prime attribute (eliminating transitive dependencies on non-prime attributes).',
      },
      {
        id: 'q-db-2',
        question: 'What distinguishes Boyce-Codd Normal Form (BCNF) from 3NF?',
        options: [
          'BCNF relaxes the candidate key rule for composite primary keys.',
          'In BCNF, for every non-trivial functional dependency X -> Y, X must strictly be a superkey (no exception for prime attributes on the right-hand side).',
          'BCNF requires all tables to be partitioned into key-value stores.',
          'BCNF only applies to NoSQL document databases.',
        ],
        correctOptionIndex: 1,
        explanation: 'BCNF is a stricter form of 3NF where for every X -> Y, X MUST be a superkey. Unlike 3NF, Y being a prime attribute does not satisfy BCNF.',
      },
      {
        id: 'q-db-3',
        question: 'A relation R(A, B, C) has functional dependencies A -> B and B -> C. What anomaly occurs if A is the only candidate key?',
        options: [
          'A partial dependency anomaly.',
          'A transitive dependency anomaly violating 3NF, where non-prime attribute C depends on non-candidate key B.',
          'A multi-valued join failure.',
          'A deadlock during transaction commit.',
        ],
        correctOptionIndex: 1,
        explanation: 'Since A -> B and B -> C, and B is not a candidate key, C is transitively dependent on candidate key A via non-key attribute B, violating 3NF.',
      },
    ],
  },
  dsa_dp: {
    title: 'DSA: Dynamic Programming & Memoization',
    subject: '22CS401 Design & Analysis of Algorithms',
    questions: [
      {
        id: 'q-dp-1',
        question: 'What two fundamental mathematical properties characterize a problem solvable by Dynamic Programming?',
        options: [
          'Linear time complexity and binary state transitions.',
          'Optimal substructure and overlapping subproblems.',
          'Greedy choice property and divide-and-conquer disjoint sets.',
          'NP-complete reducibility and asymptotic polynomial bounds.',
        ],
        correctOptionIndex: 1,
        explanation: 'Dynamic Programming applies when an optimal solution to the problem contains optimal solutions to subproblems (optimal substructure) and recursive subproblems repeat multiple times (overlapping subproblems).',
      },
      {
        id: 'q-dp-2',
        question: 'What is the primary difference between Memoization and Tabulation?',
        options: [
          'Memoization is top-down using recursion and a cache, while Tabulation is bottom-up iteratively filling an array/table.',
          'Memoization runs in $O(N!)$ time while Tabulation runs in $O(1)$ time.',
          'Memoization is only applicable to graphs, while Tabulation is only for arrays.',
          'Memoization does not require auxiliary memory.',
        ],
        correctOptionIndex: 0,
        explanation: 'Memoization is top-down recursion with caching to avoid recomputation, whereas Tabulation iteratively constructs solutions to smaller subproblems first in a bottom-up table.',
      },
    ],
  },
};

/**
 * GET /api/coach/quiz?topic=os_virtual_memory
 * Returns sanitized questions without answer keys.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || 'os_virtual_memory';

    const quiz = TOPIC_QUIZZES[topic] || TOPIC_QUIZZES.os_virtual_memory;

    // Strip answers
    const sanitizedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({
      topicKey: topic,
      title: quiz.title,
      subject: quiz.subject,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
      passPercentage: 70,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/coach/quiz
 * Grades candidate responses deterministically and returns detailed rationales.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicKey, answers, studentId } = body as {
      topicKey: string;
      answers: { questionId: string; selectedIndex: number }[];
      studentId?: string;
    };

    if (!topicKey || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'topicKey and answers array are required' }, { status: 400 });
    }

    // Authenticate
    const authResult = await validateStudentSession(request, studentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: authResult.status });
    }

    const quiz = TOPIC_QUIZZES[topicKey] || TOPIC_QUIZZES.os_virtual_memory;

    let correctCount = 0;
    const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));

    const gradedResults = quiz.questions.map((q) => {
      const selected = answerMap.get(q.id) ?? -1;
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedIndex: selected,
        correctIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = scorePercentage >= 70;

    return NextResponse.json({
      topicKey,
      title: quiz.title,
      totalQuestions: quiz.questions.length,
      correctCount,
      scorePercentage,
      passed,
      results: gradedResults,
      coachingAdvice: passed
        ? `Great job! Your score of ${scorePercentage}% demonstrates solid comprehension of ${quiz.title}. Mastery status updated.`
        : `Score: ${scorePercentage}%. Review the explanations below, revisit the lecture notes, and re-attempt to solidify understanding.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
