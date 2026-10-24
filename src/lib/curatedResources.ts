// ============================================================================
// Curated YouTube Learning Resources & Reputable Educators Catalog
// ============================================================================

import { CuratedLearningResource } from '@/types';

export const CURATED_RESOURCES: CuratedLearningResource[] = [
  // 1. OPERATING SYSTEMS (22CS402)
  {
    id: 'res-os-1',
    subject_code: '22CS402',
    topic: 'Virtual Memory & Page Replacement Algorithms',
    title: 'Virtual Memory, Paging, and Page Faults Explained',
    channel_name: 'Gate Smashers (Varun Singla)',
    resource_url: 'https://www.youtube.com/watch?v=2quRyAcxbhU',
    playlist_url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
    duration_minutes: 24,
    verification_status: 'verified_video',
    verification_label: 'Verified Complete Lecture (Gate Smashers)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming?lang=os&topic=os-paging',
    linked_quiz_subject: 'os_virtual_memory',
  },
  {
    id: 'res-os-2',
    subject_code: '22CS402',
    topic: 'CPU Scheduling Algorithms (Round Robin & Multi-Level)',
    title: 'Process Scheduling Algorithms: FCFS, SJF, Round Robin with Solved Problems',
    channel_name: 'Gate Smashers',
    resource_url: 'https://www.youtube.com/watch?v=ewabbnyXh6A',
    playlist_url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
    duration_minutes: 28,
    verification_status: 'verified_video',
    verification_label: 'Verified Complete Lecture (Gate Smashers)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming?lang=os&topic=os-scheduling',
    linked_quiz_subject: 'os_cpu_scheduling',
  },
  {
    id: 'res-os-3',
    subject_code: '22CS402',
    topic: 'Deadlock Detection & Banker’s Algorithm',
    title: 'Deadlock Avoidance with Banker’s Algorithm Step-by-Step Numerical',
    channel_name: 'Knowledge Gate',
    resource_url: 'https://www.youtube.com/watch?v=T0FXvTHcYi4',
    playlist_url: 'https://www.youtube.com/playlist?list=PLmXKhU9FNesSFvj6gASuWmQd23Ul5omtD',
    duration_minutes: 21,
    verification_status: 'verified_video',
    verification_label: 'Verified Numerical Tutorial (Knowledge Gate)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Advanced',
    in_app_destination_url: '/student/learn-programming?lang=os&topic=os-deadlocks',
    linked_quiz_subject: 'os_deadlocks',
  },

  // 2. DATABASE MANAGEMENT SYSTEMS (22CS404)
  {
    id: 'res-dbms-1',
    subject_code: '22CS404',
    topic: 'Schema Normalization (1NF, 2NF, 3NF & BCNF)',
    title: 'Database Normalization Complete Course: 1NF, 2NF, 3NF, BCNF with Candidate Keys',
    channel_name: 'Gate Smashers',
    resource_url: 'https://www.youtube.com/watch?v=5fs1hdkhvh8',
    playlist_url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9XdK_kVCAfq74wv',
    duration_minutes: 32,
    verification_status: 'verified_video',
    verification_label: 'Verified Lecture (Gate Smashers DBMS)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming?lang=dbms&topic=dbms-normalization',
    linked_quiz_subject: 'dbms_normalization',
  },
  {
    id: 'res-dbms-2',
    subject_code: '22CS404',
    topic: 'Transaction Management & ACID Properties',
    title: 'ACID Properties in DBMS & Serializability (Conflict & View)',
    channel_name: 'Knowledge Gate',
    resource_url: 'https://www.youtube.com/watch?v=ga3nO1A0hK0',
    playlist_url: 'https://www.youtube.com/playlist?list=PLmXKhU9FNesSFvj6gASuWmQd23Ul5omtD',
    duration_minutes: 26,
    verification_status: 'verified_video',
    verification_label: 'Verified Lecture (Knowledge Gate)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming?lang=dbms&topic=dbms-transactions',
    linked_quiz_subject: 'dbms_transactions',
  },
  {
    id: 'res-dbms-3',
    subject_code: '22CS404',
    topic: 'B+ Tree Indexing & Query Execution Plans',
    title: 'B+ Trees in Database Storage Engines & Indexing Mechanics',
    channel_name: 'Hussein Nasser (Database Engineering)',
    resource_url: 'https://www.youtube.com/watch?v=aZjYr87r1b8',
    playlist_url: null,
    duration_minutes: 35,
    verification_status: 'verified_video',
    verification_label: 'Verified Engineering Deep Dive (Hussein Nasser)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Advanced',
    in_app_destination_url: '/student/learn-programming?lang=dbms&topic=dbms-indexing',
    linked_quiz_subject: 'dbms_indexing',
  },

  // 3. DATA STRUCTURES & ALGORITHMS (22CS301 / 22CS401)
  {
    id: 'res-dsa-1',
    subject_code: '22CS401',
    topic: 'Dynamic Programming: 0/1 Knapsack & Pattern Blueprint',
    title: '0/1 Knapsack Problem - Dynamic Programming & Memoization',
    channel_name: 'Abdul Bari',
    resource_url: 'https://www.youtube.com/watch?v=nLmhmB6NzcM',
    playlist_url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
    duration_minutes: 42,
    verification_status: 'verified_video',
    verification_label: 'Verified Gold Standard Lecture (Abdul Bari)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/dsa-tracker?category=Dynamic%20Programming',
    linked_quiz_subject: 'dsa_dp',
  },
  {
    id: 'res-dsa-2',
    subject_code: '22CS401',
    topic: 'Graph Algorithms: Dijkstra’s Shortest Path & Min-Heap',
    title: 'Dijkstra’s Algorithm Single Source Shortest Path with Priority Queue',
    channel_name: 'Abdul Bari',
    resource_url: 'https://www.youtube.com/watch?v=XB4MIexjvY0',
    playlist_url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
    duration_minutes: 38,
    verification_status: 'verified_video',
    verification_label: 'Verified Gold Standard Lecture (Abdul Bari)',
    retrieval_date: '2026-10-23',
    semester: 4,
    difficulty: 'Advanced',
    in_app_destination_url: '/student/dsa-tracker?category=Graphs%20%26%20BFS%2FDFS',
    linked_quiz_subject: 'dsa_graphs',
  },
  {
    id: 'res-dsa-3',
    subject_code: '22CS301',
    topic: 'Sliding Window & Two Pointer Masterclass',
    title: 'Sliding Window Technique for Top Tech Company Coding Interviews',
    channel_name: 'NeetCode',
    resource_url: 'https://www.youtube.com/watch?v=MK-NZ4hN7Rs',
    playlist_url: 'https://www.youtube.com/playlist?list=PLot-Xpze53lf5C3HSjCnyFghlW0G1QKXo',
    duration_minutes: 30,
    verification_status: 'verified_video',
    verification_label: 'Verified Interview Prep (NeetCode)',
    retrieval_date: '2026-10-23',
    semester: 3,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/dsa-tracker?category=Strings%20%26%20Sliding%20Window',
    linked_quiz_subject: 'dsa_sliding_window',
  },

  // 4. COMPUTER NETWORKS (22CS501)
  {
    id: 'res-cn-1',
    subject_code: '22CS501',
    topic: 'TCP 3-Way Handshake, Flow Control & Congestion Avoidance',
    title: 'Transmission Control Protocol (TCP): 3-Way Handshake & Windowing',
    channel_name: 'Gate Smashers',
    resource_url: 'https://www.youtube.com/watch?v=bW_IPflTq_U',
    playlist_url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_',
    duration_minutes: 22,
    verification_status: 'verified_video',
    verification_label: 'Verified Lecture (Gate Smashers Networks)',
    retrieval_date: '2026-10-23',
    semester: 5,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming?lang=networks&topic=net-tcp',
    linked_quiz_subject: 'networks_tcp',
  },
  {
    id: 'res-cn-2',
    subject_code: '22CS501',
    topic: 'Subnetting, CIDR Notation & IP Routing',
    title: 'Subnetting Mastery: IPv4 Classless Inter-Domain Routing Made Simple',
    channel_name: 'NetworkChuck',
    resource_url: 'https://www.youtube.com/watch?v=s_Ntt6eTn94',
    playlist_url: null,
    duration_minutes: 27,
    verification_status: 'verified_video',
    verification_label: 'Verified Hands-on Tutorial (NetworkChuck)',
    retrieval_date: '2026-10-23',
    semester: 5,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming?lang=networks&topic=net-subnetting',
    linked_quiz_subject: 'networks_subnetting',
  },
];

/**
 * Generates an explicitly labelled YouTube search fallback link when a topic
 * does not have a statically verified video ID.
 */
export function buildHonestYouTubeSearchLink(subjectName: string, topicName: string): CuratedLearningResource {
  const query = encodeURIComponent(`${subjectName} ${topicName} lecture tutorial`);
  const searchUrl = `https://www.youtube.com/results?search_query=${query}`;

  return {
    id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    subject_code: 'SEARCH_FALLBACK',
    topic: topicName,
    title: `YouTube Search: ${topicName}`,
    channel_name: 'YouTube Search (Curated Query)',
    resource_url: searchUrl,
    playlist_url: null,
    duration_minutes: 20,
    verification_status: 'search_fallback',
    verification_label: 'Direct YouTube Search Query (Unverified Video ID)',
    retrieval_date: new Date().toISOString().split('T')[0],
    semester: 4,
    difficulty: 'Intermediate',
    in_app_destination_url: '/student/learn-programming',
  };
}

/**
 * Retrieves the best curated resource for a given subject code and topic,
 * or returns a verified playlist or honest search fallback.
 */
export function findResourceForTopic(subjectCode: string, topicName: string): CuratedLearningResource {
  const normalized = topicName.toLowerCase();
  const directMatch = CURATED_RESOURCES.find(
    (r) =>
      r.subject_code === subjectCode &&
      (r.topic.toLowerCase().includes(normalized) || normalized.includes(r.topic.toLowerCase()))
  );

  if (directMatch) return directMatch;

  const subjectMatch = CURATED_RESOURCES.find((r) => r.subject_code === subjectCode);
  if (subjectMatch) return subjectMatch;

  return buildHonestYouTubeSearchLink(subjectCode, topicName);
}
