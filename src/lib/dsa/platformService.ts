import { CodingPlatform, PlatformStatistics, STANDARD_DSA_TOPICS } from '@/types/dsa';

export interface ParsedProfileUrl {
  platform: CodingPlatform;
  username: string;
  normalizedUrl: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates and identifies coding platform profile URL
 */
export function parseCodingProfileUrl(urlInput: string, platformHint?: CodingPlatform): ParsedProfileUrl {
  const trimmed = (urlInput || '').trim();
  if (!trimmed) {
    return { platform: 'custom', username: '', normalizedUrl: '', isValid: false, errorMessage: 'URL cannot be empty' };
  }

  // Ensure protocol
  let urlStr = trimmed;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = `https://${urlStr}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch (err) {
    return { platform: 'custom', username: '', normalizedUrl: trimmed, isValid: false, errorMessage: 'Invalid URL format' };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.replace(/\/+$/, ''); // strip trailing slash
  const segments = pathname.split('/').filter(Boolean);

  // 1. LeetCode
  if (hostname.includes('leetcode.com')) {
    // formats: leetcode.com/u/username or leetcode.com/username
    let username = '';
    if (segments[0] === 'u' && segments[1]) {
      username = segments[1];
    } else if (segments[0]) {
      username = segments[0];
    }
    if (!username) {
      return { platform: 'leetcode', username: '', normalizedUrl: urlStr, isValid: false, errorMessage: 'Could not extract LeetCode username from URL' };
    }
    return {
      platform: 'leetcode',
      username,
      normalizedUrl: `https://leetcode.com/u/${username}/`,
      isValid: true,
    };
  }

  // 2. Codeforces
  if (hostname.includes('codeforces.com')) {
    // formats: codeforces.com/profile/username or codeforces.com/profile/username/
    let username = '';
    if (segments[0] === 'profile' && segments[1]) {
      username = segments[1];
    } else if (segments[0]) {
      username = segments[0];
    }
    if (!username) {
      return { platform: 'codeforces', username: '', normalizedUrl: urlStr, isValid: false, errorMessage: 'Could not extract Codeforces handle from URL' };
    }
    return {
      platform: 'codeforces',
      username,
      normalizedUrl: `https://codeforces.com/profile/${username}`,
      isValid: true,
    };
  }

  // 3. HackerRank
  if (hostname.includes('hackerrank.com')) {
    // formats: hackerrank.com/profile/username or hackerrank.com/username
    let username = '';
    if (segments[0] === 'profile' && segments[1]) {
      username = segments[1];
    } else if (segments[0]) {
      username = segments[0];
    }
    if (!username) {
      return { platform: 'hackerrank', username: '', normalizedUrl: urlStr, isValid: false, errorMessage: 'Could not extract HackerRank username from URL' };
    }
    return {
      platform: 'hackerrank',
      username,
      normalizedUrl: `https://www.hackerrank.com/profile/${username}`,
      isValid: true,
    };
  }

  // 4. CodeChef
  if (hostname.includes('codechef.com')) {
    // formats: codechef.com/users/username
    let username = '';
    if (segments[0] === 'users' && segments[1]) {
      username = segments[1];
    } else if (segments[0]) {
      username = segments[0];
    }
    if (!username) {
      return { platform: 'codechef', username: '', normalizedUrl: urlStr, isValid: false, errorMessage: 'Could not extract CodeChef username from URL' };
    }
    return {
      platform: 'codechef',
      username,
      normalizedUrl: `https://www.codechef.com/users/${username}`,
      isValid: true,
    };
  }

  // 5. GeeksforGeeks
  if (hostname.includes('geeksforgeeks.org')) {
    // formats: geeksforgeeks.org/user/username
    let username = '';
    if (segments[0] === 'user' && segments[1]) {
      username = segments[1];
    } else if (segments[0]) {
      username = segments[0];
    }
    if (!username) {
      return { platform: 'geeksforgeeks', username: '', normalizedUrl: urlStr, isValid: false, errorMessage: 'Could not extract GeeksforGeeks username from URL' };
    }
    return {
      platform: 'geeksforgeeks',
      username,
      normalizedUrl: `https://www.geeksforgeeks.org/user/${username}/`,
      isValid: true,
    };
  }

  // 6. Custom Platform
  const chosenPlatform = platformHint || 'custom';
  const customUsername = segments[segments.length - 1] || 'coder';
  return {
    platform: chosenPlatform,
    username: customUsername,
    normalizedUrl: urlStr,
    isValid: true,
  };
}

/**
 * Normalizes any topic tag into standard 15 DSA categories
 */
function normalizeDsaTopic(tag: string): string | null {
  const t = (tag || '').toLowerCase();
  if (t.includes('array') || t.includes('matrix') || t.includes('simulation')) return 'Arrays';
  if (t.includes('string')) return 'Strings';
  if (t.includes('linked list') || t.includes('linked-list')) return 'Linked Lists';
  if (t.includes('stack') || t.includes('queue') || t.includes('monotonic stack')) return 'Stacks and Queues';
  if (t.includes('tree') || t.includes('binary tree') || t.includes('bst')) return 'Trees and Binary Trees';
  if (t.includes('binary search') || t.includes('binary-search')) return 'Binary Search';
  if (t.includes('graph') || t.includes('bfs') || t.includes('dfs') || t.includes('topological')) return 'Graphs';
  if (t.includes('dynamic programming') || t.includes('dp') || t.includes('memoization')) return 'Dynamic Programming';
  if (t.includes('greedy')) return 'Greedy Algorithms';
  if (t.includes('recursion') || t.includes('backtracking')) return 'Recursion and Backtracking';
  if (t.includes('heap') || t.includes('priority queue')) return 'Heaps';
  if (t.includes('hash') || t.includes('hash table') || t.includes('hash-table') || t.includes('map')) return 'Hashing';
  if (t.includes('two pointers') || t.includes('two-pointers')) return 'Two Pointers';
  if (t.includes('sliding window') || t.includes('sliding-window')) return 'Sliding Window';
  if (t.includes('sort') || t.includes('sorting') || t.includes('quickselect')) return 'Sorting';
  return null;
}

/**
 * Fetch Live Statistics from LeetCode Official GraphQL
 */
export async function fetchLeetCodeStats(username: string, profileUrl: string): Promise<PlatformStatistics> {
  const query = `
    query getUserFullProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
          reputation
        }
        tagProblemCounts {
          fundamental { tagName problemsSolved }
          intermediate { tagName problemsSolved }
          advanced { tagName problemsSolved }
        }
      }
    }
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify({ query, variables: { username } }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`LeetCode server responded with HTTP ${res.status}`);
    }

    const json = await res.json();
    const user = json.data?.matchedUser;

    if (!user) {
      throw new Error(`LeetCode profile "${username}" not found or profile is private.`);
    }

    const acNums = user.submitStats?.acSubmissionNum || [];
    const allObj = acNums.find((d: any) => d.difficulty === 'All') || { count: 0, submissions: 0 };
    const easyObj = acNums.find((d: any) => d.difficulty === 'Easy') || { count: 0 };
    const mediumObj = acNums.find((d: any) => d.difficulty === 'Medium') || { count: 0 };
    const hardObj = acNums.find((d: any) => d.difficulty === 'Hard') || { count: 0 };

    const totalSolved = allObj.count || 0;
    const totalSubmissions = allObj.submissions || 0;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((totalSolved / totalSubmissions) * 1000) / 10 : 0;

    // Process Topic Tags
    const topicStats: Record<string, number> = {};
    STANDARD_DSA_TOPICS.forEach((t) => { topicStats[t] = 0; });

    const allTags = [
      ...(user.tagProblemCounts?.fundamental || []),
      ...(user.tagProblemCounts?.intermediate || []),
      ...(user.tagProblemCounts?.advanced || []),
    ];

    allTags.forEach((t: any) => {
      const norm = normalizeDsaTopic(t.tagName);
      if (norm) {
        topicStats[norm] = (topicStats[norm] || 0) + (Number(t.problemsSolved) || 0);
      }
    });

    return {
      platform: 'leetcode',
      username,
      profile_url: profileUrl,
      total_solved: totalSolved,
      easy_solved: easyObj.count || 0,
      medium_solved: mediumObj.count || 0,
      hard_solved: hardObj.count || 0,
      total_submissions: totalSubmissions,
      accepted_submissions: totalSolved,
      acceptance_rate: acceptanceRate,
      global_ranking: user.profile?.ranking || null,
      topic_statistics: topicStats,
      last_synced_at: new Date().toISOString(),
      is_automatic: true,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(err.message || 'Failed to fetch LeetCode statistics');
  }
}

/**
 * Fetch Live Statistics from Codeforces Official REST API
 */
export async function fetchCodeforcesStats(username: string, profileUrl: string): Promise<PlatformStatistics> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    // 1. User Info
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`, {
      signal: controller.signal,
    });
    if (!infoRes.ok) {
      throw new Error(`Codeforces handle "${username}" not found.`);
    }
    const infoData = await infoRes.json();
    if (infoData.status !== 'OK' || !infoData.result?.[0]) {
      throw new Error(`Codeforces API error: ${infoData.comment || 'Handle not found'}`);
    }
    const userInfo = infoData.result[0];

    // 2. User Submissions
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=500`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const statusData = await statusRes.json();
    const submissions = statusData.status === 'OK' ? statusData.result || [] : [];

    // Filter unique accepted problems
    const solvedMap = new Map<string, { rating?: number; tags: string[] }>();
    submissions.forEach((sub: any) => {
      if (sub.verdict === 'OK' && sub.problem) {
        const key = `${sub.problem.contestId}-${sub.problem.index}-${sub.problem.name}`;
        if (!solvedMap.has(key)) {
          solvedMap.set(key, { rating: sub.problem.rating, tags: sub.problem.tags || [] });
        }
      }
    });

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    const topicStats: Record<string, number> = {};
    STANDARD_DSA_TOPICS.forEach((t) => { topicStats[t] = 0; });

    solvedMap.forEach((prob) => {
      const rating = prob.rating || 1000;
      if (rating < 1200) easyCount++;
      else if (rating <= 1600) mediumCount++;
      else hardCount++;

      prob.tags.forEach((tag) => {
        const norm = normalizeDsaTopic(tag);
        if (norm) {
          topicStats[norm] = (topicStats[norm] || 0) + 1;
        }
      });
    });

    const totalSolved = solvedMap.size;
    const totalSubmissions = submissions.length;
    const acceptanceRate = totalSubmissions > 0 ? Math.round((totalSolved / totalSubmissions) * 1000) / 10 : 0;

    return {
      platform: 'codeforces',
      username,
      profile_url: profileUrl,
      total_solved: totalSolved,
      easy_solved: easyCount,
      medium_solved: mediumCount,
      hard_solved: hardCount,
      total_submissions: totalSubmissions,
      accepted_submissions: totalSolved,
      acceptance_rate: acceptanceRate,
      contest_rating: userInfo.rating || null,
      global_ranking: userInfo.rank ? null : null,
      topic_statistics: topicStats,
      last_synced_at: new Date().toISOString(),
      is_automatic: true,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(err.message || 'Failed to fetch Codeforces statistics');
  }
}

/**
 * Unified statistics synchronizer for any supported coding platform
 */
export async function syncPlatformStatistics(
  platform: CodingPlatform,
  username: string,
  profileUrl: string
): Promise<PlatformStatistics> {
  if (platform === 'leetcode') {
    return await fetchLeetCodeStats(username, profileUrl);
  }

  if (platform === 'codeforces') {
    return await fetchCodeforcesStats(username, profileUrl);
  }

  // Platforms without open unauthenticated APIs (HackerRank, CodeChef, GeeksforGeeks, Custom)
  // Transparently return a clean manual-ready profile object without fabricating data
  const defaultTopics: Record<string, number> = {};
  STANDARD_DSA_TOPICS.forEach((t) => { defaultTopics[t] = 0; });

  return {
    platform,
    username,
    profile_url: profileUrl,
    total_solved: 0,
    easy_solved: 0,
    medium_solved: 0,
    hard_solved: 0,
    total_submissions: 0,
    accepted_submissions: 0,
    acceptance_rate: 0,
    contest_rating: null,
    global_ranking: null,
    current_streak: null,
    topic_statistics: defaultTopics,
    last_synced_at: new Date().toISOString(),
    is_automatic: false,
    sync_error: 'Automatic API sync unavailable for this platform. Please enter your verified statistics manually.',
  };
}
