// ============================================================================
// Adaptive DSA Problem Catalog & Recommendation Engine
// ============================================================================

import type { DSAProblem, DSAAttemptRecord, DSACategoryType } from '../types';

export const TOPIC_CATEGORIES = [
  'Arrays & Hashing',
  'Strings & Sliding Window',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & BST',
  'Graphs & BFS/DFS',
  'Dynamic Programming',
  'Searching & Sorting',
] as const;

export const SOURCE_CATEGORY_TYPES: { type: DSACategoryType; label: string; number: number }[] = [
  { type: 'verified_historical', label: 'Category 1: Verified Reported Questions', number: 1 },
  { type: 'frequently_reported', label: 'Category 2: Frequently Reported Patterns', number: 2 },
  { type: 'ai_generated', label: 'Category 3: AI-Generated Practice', number: 3 },
];

/**
 * Normalizes input category string or index into canonical category name
 */
export function normalizeCategory(cat: string | null | undefined): string {
  if (!cat) return 'All';
  const trimmed = cat.trim().toLowerCase();
  if (trimmed === 'all' || trimmed === '') return 'All';

  // Topic category by number or slug
  if (trimmed === '1' || trimmed === 'arrays' || trimmed === 'arrays & hashing' || trimmed === 'arrays-and-hashing') {
    return 'Arrays & Hashing';
  }
  if (trimmed === '2' || trimmed === 'strings' || trimmed === 'strings & sliding window' || trimmed === 'strings-and-sliding-window') {
    return 'Strings & Sliding Window';
  }
  if (trimmed === '3' || trimmed === 'linked-lists' || trimmed === 'linked lists' || trimmed === 'linked_lists') {
    return 'Linked Lists';
  }
  if (trimmed === '4' || trimmed === 'stacks' || trimmed === 'stacks & queues' || trimmed === 'stacks-and-queues') {
    return 'Stacks & Queues';
  }
  if (trimmed === '5' || trimmed === 'trees' || trimmed === 'trees & bst' || trimmed === 'trees-and-bst') {
    return 'Trees & BST';
  }
  if (trimmed === '6' || trimmed === 'graphs' || trimmed === 'graphs & bfs/dfs' || trimmed === 'graphs-and-bfs-dfs') {
    return 'Graphs & BFS/DFS';
  }
  if (trimmed === '7' || trimmed === 'dp' || trimmed === 'dynamic programming' || trimmed === 'dynamic-programming') {
    return 'Dynamic Programming';
  }
  if (trimmed === '8' || trimmed === 'searching' || trimmed === 'searching & sorting' || trimmed === 'searching-and-sorting') {
    return 'Searching & Sorting';
  }

  // Exact match search
  const match = TOPIC_CATEGORIES.find((c) => c.toLowerCase() === trimmed);
  if (match) return match;

  return cat;
}

/**
 * Normalizes input category type or index into canonical DSACategoryType
 */
export function normalizeCategoryType(type: string | null | undefined): DSACategoryType | 'All' {
  if (!type) return 'All';
  const trimmed = type.trim().toLowerCase();
  if (trimmed === 'all' || trimmed === '') return 'All';

  // Category 1: Verified Historical
  if (trimmed === '1' || trimmed === 'verified' || trimmed === 'verified_historical' || trimmed === 'verified-historical' || trimmed === 'category-1') {
    return 'verified_historical';
  }

  // Category 2: Frequently Reported
  if (trimmed === '2' || trimmed === 'frequently' || trimmed === 'frequently_reported' || trimmed === 'frequently-reported' || trimmed === 'category-2') {
    return 'frequently_reported';
  }

  // Category 3: AI-Generated
  if (trimmed === '3' || trimmed === 'ai' || trimmed === 'ai_generated' || trimmed === 'ai-generated' || trimmed === 'category-3' || trimmed === 'generated') {
    return 'ai_generated';
  }

  return 'All';
}

export const COMPREHENSIVE_DSA_PROBLEMS: DSAProblem[] = [
  // --------------------------------------------------------------------------
  // 1. ARRAYS & HASHING
  // --------------------------------------------------------------------------
  {
    id: 'dsa-1',
    title: 'Two Sum & Pair Target Lookup',
    category: 'Arrays & Hashing',
    difficulty: 'Easy',
    frequency: 'Critical',
    core_pattern: 'Hash Map Lookup & Complement Difference',
    category_type: 'verified_historical',
    target_companies: ['Google', 'Amazon', 'TCS Digital', 'Infosys SP'],
    target_role: 'Software Development Engineer (SDE-1)',
    statement:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    hints: [
      'Consider the brute force approach comparing every pair. How can we check if the complement target - x exists in O(1) time?',
      'Use a Hash Map storing val -> index as you iterate over the array.',
      'Check if target - nums[i] is in the map before inserting nums[i]. If found, return [map[target - nums[i]], i].',
    ],
    starter_code: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n    // Write your solution here\n    return [];\n}`,
    },
    reference_solution: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[]{map.get(diff), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (mp.count(diff)) return {mp[diff], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff)!, i];\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    source_attribution: 'Reported in Amazon & Google Campus Screening Assessment (2025-26)',
    source_url: 'https://leetcode.com/problems/two-sum/',
    reported_date: '2025-10-12',
    test_cases: [
      { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' },
      { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' },
      { input: '[3, 3], 6', expectedOutput: '[0, 1]' },
    ],
    prerequisites: [],
  },

  {
    id: 'dsa-2',
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Greedy Prefix Sum / Dynamic Programming',
    category_type: 'verified_historical',
    target_companies: ['Microsoft', 'Infosys SP', 'Cisco'],
    target_role: 'Cloud Engineer / SDE-1',
    statement:
      'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    hints: [
      'If the sum of a prefix is negative, can it ever contribute positively to any subsequent subarray?',
      'Keep a running sum currentSum. At each element, decide whether to add nums[i] to currentSum or start a fresh subarray at nums[i].',
      'Formula: currentSum = max(nums[i], currentSum + nums[i]); maxSum = max(maxSum, currentSum).',
    ],
    starter_code: {
      python: `def max_sub_array(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function maxSubArray(nums: number[]): number {\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def max_sub_array(nums: list[int]) -> int:\n    current_sum = max_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        int curr = nums[0], max = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            curr = Math.max(nums[i], curr + nums[i]);\n            max = Math.max(max, curr);\n        }\n        return max;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int curr = nums[0], maxS = nums[0];\n        for (size_t i = 1; i < nums.size(); ++i) {\n            curr = max(nums[i], curr + nums[i]);\n            maxS = max(maxS, curr);\n        }\n        return maxS;\n    }\n};`,
      typescript: `function maxSubArray(nums: number[]): number {\n    let curr = nums[0], maxS = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        curr = Math.max(nums[i], curr + nums[i]);\n        maxS = Math.max(maxS, curr);\n    }\n    return maxS;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    source_attribution: 'Reported in Microsoft Campus Direct & Cisco Hiring Round (2025)',
    source_url: 'https://leetcode.com/problems/maximum-subarray/',
    reported_date: '2025-09-18',
    test_cases: [
      { input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5, 4, -1, 7, 8]', expectedOutput: '23' },
    ],
    prerequisites: ['dsa-1'],
  },

  {
    id: 'dsa-3',
    title: 'Trapping Rain Water',
    category: 'Arrays & Hashing',
    difficulty: 'Hard',
    frequency: 'High',
    core_pattern: 'Two Pointers / Monotonic Stack',
    category_type: 'verified_historical',
    target_companies: ['Amazon', 'Adobe', 'Cisco', 'Google'],
    target_role: 'Senior Software Engineer / SDE-1',
    statement:
      'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map traps 6 units of rain water.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    hints: [
      'Water trapped at index i is determined by min(max_left, max_right) - height[i].',
      'Can you optimize the space from O(N) auxiliary arrays to O(1) using two pointers?',
      'Maintain left and right pointers and keep track of left_max and right_max.',
    ],
    starter_code: {
      python: `def trap(height: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function trap(height: number[]): number {\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def trap(height: list[int]) -> int:\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    left_max, right_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if left_max < right_max:\n            l += 1\n            left_max = max(left_max, height[l])\n            water += left_max - height[l]\n        else:\n            r -= 1\n            right_max = max(right_max, height[r])\n            water += right_max - height[r]\n    return water`,
      java: `class Solution {\n    public int trap(int[] height) {\n        if (height == null || height.length == 0) return 0;\n        int l = 0, r = height.length - 1;\n        int leftMax = height[l], rightMax = height[r], water = 0;\n        while (l < r) {\n            if (leftMax < rightMax) {\n                l++;\n                leftMax = Math.max(leftMax, height[l]);\n                water += leftMax - height[l];\n            } else {\n                r--;\n                rightMax = Math.max(rightMax, height[r]);\n                water += rightMax - height[r];\n            }\n        }\n        return water;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int l = 0, r = height.size() - 1;\n        int leftMax = height[l], rightMax = height[r], water = 0;\n        while (l < r) {\n            if (leftMax < rightMax) {\n                l++;\n                leftMax = max(leftMax, height[l]);\n                water += leftMax - height[l];\n            } else {\n                r--;\n                rightMax = max(rightMax, height[r]);\n                water += rightMax - height[r];\n            }\n        }\n        return water;\n    }\n};`,
      typescript: `function trap(height: number[]): number {\n    let l = 0, r = height.length - 1;\n    let leftMax = height[l], rightMax = height[r], water = 0;\n    while (l < r) {\n        if (leftMax < rightMax) {\n            l++;\n            leftMax = Math.max(leftMax, height[l]);\n            water += leftMax - height[l];\n        } else {\n            r--;\n            rightMax = Math.max(rightMax, height[r]);\n            water += rightMax - height[r];\n        }\n    }\n    return water;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    source_attribution: 'Reported in Amazon SDE-1 Assessment & Cisco Placement Drive (2025)',
    source_url: 'https://leetcode.com/problems/trapping-rain-water/',
    test_cases: [
      { input: '[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', expectedOutput: '6' },
      { input: '[4, 2, 0, 3, 2, 5]', expectedOutput: '9' },
    ],
    prerequisites: ['dsa-1', 'dsa-2'],
  },

  // --------------------------------------------------------------------------
  // 2. STRINGS & SLIDING WINDOW
  // --------------------------------------------------------------------------
  {
    id: 'dsa-4',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Strings & Sliding Window',
    difficulty: 'Medium',
    frequency: 'Critical',
    core_pattern: 'Variable Sized Sliding Window + Set/Map',
    category_type: 'verified_historical',
    target_companies: ['Google', 'Amazon', 'Meta', 'Accenture Advanced'],
    target_role: 'Full-Stack / Core SDE',
    statement:
      'Given a string `s`, find the length of the longest substring without duplicate characters.',
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    hints: [
      'Think of a window [left, right]. Expand right until you hit a duplicate character.',
      'When a duplicate is encountered, advance left past the previous occurrence of that character.',
      'A Hash Map storing character to its latest index lets you jump left = max(left, last_idx + 1) in O(1) time.',
    ],
    starter_code: {
      python: `def length_of_longest_substring(s: str) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function lengthOfLongestSubstring(s: string): number {\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def length_of_longest_substring(s: str) -> int:\n    char_map = {}\n    left = max_len = 0\n    for right, ch in enumerate(s):\n        if ch in char_map and char_map[ch] >= left:\n            left = char_map[ch] + 1\n        char_map[ch] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> map = new HashMap<>();\n        int left = 0, max = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char ch = s.charAt(right);\n            if (map.containsKey(ch) && map.get(ch) >= left) {\n                left = map.get(ch) + 1;\n            }\n            map.put(ch, right);\n            max = Math.max(max, right - left + 1);\n        }\n        return max;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_map<char, int> mp;\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.size(); ++right) {\n            char ch = s[right];\n            if (mp.count(ch) && mp[ch] >= left) left = mp[ch] + 1;\n            mp[ch] = right;\n            maxLen = max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n};`,
      typescript: `function lengthOfLongestSubstring(s: string): number {\n    const map = new Map<string, number>();\n    let left = 0, maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        const ch = s[right];\n        if (map.has(ch) && map.get(ch)! >= left) {\n            left = map.get(ch)! + 1;\n        }\n        map.set(ch, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(min(N, M)) where M is character set size',
    source_attribution: 'Reported across Google, Meta, and Accenture Technical Rounds (2025)',
    source_url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    reported_date: '2025-11-04',
    test_cases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' },
      { input: '"pwwkew"', expectedOutput: '3' },
    ],
    prerequisites: ['dsa-1'],
  },

  {
    id: 'dsa-5',
    title: 'Minimum Window Substring',
    category: 'Strings & Sliding Window',
    difficulty: 'Hard',
    frequency: 'High',
    core_pattern: 'Dynamic Sized Sliding Window with Frequency Map',
    category_type: 'verified_historical',
    target_companies: ['Microsoft', 'Oracle', 'Uber', 'Amazon'],
    target_role: 'Core Systems / Backend SDE',
    statement:
      'Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.',
    constraints: [
      'm == s.length, n == t.length',
      '1 <= m, n <= 10^5',
      's and t consist of uppercase and lowercase English letters.',
    ],
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: 'The minimum window substring "BANC" includes A, B, and C from string t.' },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""' },
    ],
    hints: [
      'Use a frequency count map for t and another for current window in s.',
      'Expand the right pointer until the current window satisfies all character counts of t.',
      'Then contract the left pointer to find the minimal valid window length.',
    ],
    starter_code: {
      python: `def min_window(s: str, t: str) -> str:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public String minWindow(String s, String t) {\n        // Write your solution here\n        return "";\n    }\n}`,
      cpp: `class Solution {\npublic:\n    string minWindow(string s, string t) {\n        // Write your solution here\n        return "";\n    }\n};`,
      typescript: `function minWindow(s: string, t: string): string {\n    // Write your solution here\n    return "";\n}`,
    },
    reference_solution: {
      python: `def min_window(s: str, t: str) -> str:\n    if not t or not s: return ""\n    from collections import Counter\n    t_count = Counter(t)\n    window = {}\n    have, need = 0, len(t_count)\n    res, res_len = [-1, -1], float("infinity")\n    l = 0\n    for r, ch in enumerate(s):\n        window[ch] = window.get(ch, 0) + 1\n        if ch in t_count and window[ch] == t_count[ch]:\n            have += 1\n        while have == need:\n            if (r - l + 1) < res_len:\n                res = [l, r]\n                res_len = r - l + 1\n            window[s[l]] -= 1\n            if s[l] in t_count and window[s[l]] < t_count[s[l]]:\n                have -= 1\n            l += 1\n    l, r = res\n    return s[l:r+1] if res_len != float("infinity") else ""`,
      java: `class Solution {\n    public String minWindow(String s, String t) {\n        if (s.length() == 0 || t.length() == 0) return "";\n        Map<Character, Integer> dictT = new HashMap<>();\n        for (char c : t.toCharArray()) dictT.put(c, dictT.getOrDefault(c, 0) + 1);\n        int required = dictT.size(), l = 0, r = 0, formed = 0;\n        Map<Character, Integer> windowCounts = new HashMap<>();\n        int[] ans = {-1, 0, 0};\n        while (r < s.length()) {\n            char c = s.charAt(r);\n            windowCounts.put(c, windowCounts.getOrDefault(c, 0) + 1);\n            if (dictT.containsKey(c) && windowCounts.get(c).intValue() == dictT.get(c).intValue()) formed++;\n            while (l <= r && formed == required) {\n                c = s.charAt(l);\n                if (ans[0] == -1 || r - l + 1 < ans[0]) { ans[0] = r - l + 1; ans[1] = l; ans[2] = r; }\n                windowCounts.put(c, windowCounts.get(c) - 1);\n                if (dictT.containsKey(c) && windowCounts.get(c).intValue() < dictT.get(c).intValue()) formed--;\n                l++;\n            }\n            r++;\n        }\n        return ans[0] == -1 ? "" : s.substring(ans[1], ans[2] + 1);\n    }\n}`,
      cpp: `class Solution {\npublic:\n    string minWindow(string s, string t) {\n        if (s.empty() || t.empty()) return "";\n        unordered_map<char, int> mapT;\n        for (char c : t) mapT[c]++;\n        int required = mapT.size(), formed = 0;\n        unordered_map<char, int> window;\n        int l = 0, minLen = INT_MAX, startIdx = 0;\n        for (int r = 0; r < s.size(); ++r) {\n            char c = s[r];\n            window[c]++;\n            if (mapT.count(c) && window[c] == mapT[c]) formed++;\n            while (l <= r && formed == required) {\n                if (r - l + 1 < minLen) {\n                    minLen = r - l + 1;\n                    startIdx = l;\n                }\n                char leftChar = s[l];\n                window[leftChar]--;\n                if (mapT.count(leftChar) && window[leftChar] < mapT[leftChar]) formed--;\n                l++;\n            }\n        }\n        return minLen == INT_MAX ? "" : s.substr(startIdx, minLen);\n    }\n};`,
      typescript: `function minWindow(s: string, t: string): string {\n    if (!s || !t) return "";\n    const mapT = new Map<string, number>();\n    for (const c of t) mapT.set(c, (mapT.get(c) || 0) + 1);\n    const window = new Map<string, number>();\n    let formed = 0, required = mapT.size, l = 0, minLen = Infinity, start = 0;\n    for (let r = 0; r < s.length; r++) {\n        const c = s[r];\n        window.set(c, (window.get(c) || 0) + 1);\n        if (mapT.has(c) && window.get(c) === mapT.get(c)) formed++;\n        while (l <= r && formed === required) {\n            if (r - l + 1 < minLen) { minLen = r - l + 1; start = l; }\n            const leftChar = s[l];\n            window.set(leftChar, window.get(leftChar)! - 1);\n            if (mapT.has(leftChar) && window.get(leftChar)! < mapT.get(leftChar)!) formed--;\n            l++;\n        }\n    }\n    return minLen === Infinity ? "" : s.substring(start, start + minLen);\n}`,
    },
    time_complexity: 'O(m + n)',
    space_complexity: 'O(m + n)',
    source_attribution: 'Reported in Microsoft & Oracle Campus Hiring (2025)',
    source_url: 'https://leetcode.com/problems/minimum-window-substring/',
    test_cases: [
      { input: '"ADOBECODEBANC", "ABC"', expectedOutput: '"BANC"' },
      { input: '"a", "a"', expectedOutput: '"a"' },
    ],
    prerequisites: ['dsa-4'],
  },

  // --------------------------------------------------------------------------
  // 3. LINKED LISTS (TOPIC CATEGORY 3)
  // --------------------------------------------------------------------------
  {
    id: 'dsa-6',
    title: 'Reverse Linked List & Detect Cycle (Floyd’s)',
    category: 'Linked Lists',
    difficulty: 'Easy',
    frequency: 'Critical',
    core_pattern: 'Fast & Slow Pointers / In-Place Pointer Swapping',
    category_type: 'frequently_reported',
    target_companies: ['All Tier 1 & Tier 2 Drives', 'Infosys', 'TCS', 'Cognizant'],
    target_role: 'Associate Software Engineer / Developer',
    statement:
      'Given the `head` of a singly linked list, reverse the list in-place and return the reversed list. Also determine if a cycle exists using O(1) memory.',
    constraints: [
      'Number of nodes in the list is in the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    hints: [
      'Maintain three pointers: prev = None, curr = head, and next_temp.',
      'At each iteration: store next_temp = curr.next, set curr.next = prev, then advance prev = curr, curr = next_temp.',
      'Return prev as the new head.',
    ],
    starter_code: {
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head: ListNode) -> ListNode:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
      typescript: `function reverseList(head: any): any {\n    // Write your solution here\n    return null;\n}`,
    },
    reference_solution: {
      python: `def reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode nxt = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr) {\n            ListNode* nxt = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n};`,
      typescript: `function reverseList(head: any): any {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(1)',
    source_attribution: 'Core CS Fundamental Pattern across Indian Autonomous Placements',
    source_url: 'https://leetcode.com/problems/reverse-linked-list/',
    reported_date: '2025-08-20',
    test_cases: [
      { input: '[1, 2, 3, 4, 5]', expectedOutput: '[5, 4, 3, 2, 1]' },
      { input: '[1, 2]', expectedOutput: '[2, 1]' },
    ],
    prerequisites: [],
  },

  {
    id: 'dsa-7',
    title: 'LRU Cache Implementation',
    category: 'Linked Lists',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Doubly Linked List + Hash Map',
    category_type: 'frequently_reported',
    target_companies: ['Google', 'Cisco', 'SAP Labs', 'Amazon'],
    target_role: 'Core Systems / SDE-1',
    statement:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the `LRUCache` class with `get(key)` and `put(key, value)` both running in O(1) average time complexity.',
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.',
    ],
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'LRU cache eviction occurs when capacity is reached.',
      },
    ],
    hints: [
      'A Hash Map gives O(1) lookup, but how do we maintain the order of recently accessed elements in O(1)?',
      'A Doubly Linked List allows O(1) node removal and insertion at head/tail.',
      'Combine Map<Key, Node> with a Doubly Linked List with dummy head and tail.',
    ],
    starter_code: {
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        # Write your solution here\n        pass\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass`,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        // Write your solution here\n    }\n    public int get(int key) { return -1; }\n    public void put(int key, int value) {}\n}`,
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Write your solution here\n    }\n    int get(int key) { return -1; }\n    void put(int key, int value) {}\n};`,
      typescript: `class LRUCache {\n    constructor(capacity: number) {\n        // Write your solution here\n    }\n    get(key: number): number { return -1; }\n    put(key: number, value: number): void {}\n}`,
    },
    reference_solution: {
      python: `class Node:\n    def __init__(self, k=0, v=0):\n        self.k, self.v = k, v\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.map = {}\n        self.head, self.tail = Node(), Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add(self, node):\n        node.prev = self.head\n        node.next = self.head.next\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key in self.map:\n            node = self.map[key]\n            self._remove(node)\n            self._add(node)\n            return node.v\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.map:\n            self._remove(self.map[key])\n        node = Node(key, value)\n        self._add(node)\n        self.map[key] = node\n        if len(self.map) > self.cap:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.map[lru.k]`,
      java: `class LRUCache {\n    class Node { int k, v; Node prev, next; Node(int k, int v) { this.k = k; this.v = v; } }\n    private int cap; private Map<Integer, Node> map = new HashMap<>();\n    private Node head = new Node(0, 0), tail = new Node(0, 0);\n    public LRUCache(int capacity) { this.cap = capacity; head.next = tail; tail.prev = head; }\n    private void remove(Node node) { node.prev.next = node.next; node.next.prev = node.prev; }\n    private void add(Node node) { node.prev = head; node.next = head.next; head.next.prev = node; head.next = node; }\n    public int get(int key) { if (map.containsKey(key)) { Node n = map.get(key); remove(n); add(n); return n.v; } return -1; }\n    public void put(int key, int value) { if (map.containsKey(key)) remove(map.get(key)); Node n = new Node(key, value); add(n); map.put(key, n); if (map.size() > cap) { Node lru = tail.prev; remove(lru); map.remove(lru.k); } }\n}`,
      cpp: `class LRUCache {\n    struct Node { int k, v; Node *prev, *next; Node(int k, int v): k(k), v(v), prev(nullptr), next(nullptr) {} };\n    int cap;\n    unordered_map<int, Node*> mp;\n    Node *head, *tail;\n    void remove(Node* n) { n->prev->next = n->next; n->next->prev = n->prev; }\n    void add(Node* n) { n->prev = head; n->next = head->next; head->next->prev = n; head->next = n; }\npublic:\n    LRUCache(int capacity): cap(capacity) { head = new Node(0, 0); tail = new Node(0, 0); head->next = tail; tail->prev = head; }\n    int get(int key) { if (mp.count(key)) { Node* n = mp[key]; remove(n); add(n); return n->v; } return -1; }\n    void put(int key, int value) { if (mp.count(key)) remove(mp[key]); Node* n = new Node(key, value); add(n); mp[key] = n; if (mp.size() > cap) { Node* lru = tail->prev; remove(lru); mp.erase(lru->k); } }\n};`,
      typescript: `class LRUCache {\n    private cap: number; private map = new Map<number, number>();\n    constructor(capacity: number) { this.cap = capacity; }\n    get(key: number): number { if (!this.map.has(key)) return -1; const val = this.map.get(key)!; this.map.delete(key); this.map.set(key, val); return val; }\n    put(key: number, value: number): void { if (this.map.has(key)) this.map.delete(key); this.map.set(key, value); if (this.map.size > this.cap) this.map.delete(this.map.keys().next().value); }\n}`,
    },
    time_complexity: 'O(1) average for get and put',
    space_complexity: 'O(capacity)',
    source_attribution: 'Reported in Google & Cisco SDE Screening Round (2025)',
    source_url: 'https://leetcode.com/problems/lru-cache/',
    test_cases: [
      { input: 'capacity = 2, put(1, 1), put(2, 2), get(1)', expectedOutput: '1' },
      { input: 'put(3, 3), get(2)', expectedOutput: '-1' },
    ],
    prerequisites: ['dsa-6'],
  },

  // --------------------------------------------------------------------------
  // 4. STACKS & QUEUES
  // --------------------------------------------------------------------------
  {
    id: 'dsa-8',
    title: 'Valid Parentheses & Min Stack',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    frequency: 'Critical',
    core_pattern: 'LIFO Auxiliary Stack',
    category_type: 'verified_historical',
    target_companies: ['Standard Screening Round', 'Amazon', 'Microsoft'],
    target_role: 'Junior Software Engineer',
    statement:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets in the correct order.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only ()[]{}.',
    ],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    hints: [
      'Use a stack to keep track of expected closing brackets.',
      'When you see an opening bracket, push its corresponding closing bracket.',
      'When you see a closing bracket, check if it matches the top of the stack.',
    ],
    starter_code: {
      python: `def is_valid(s: str) -> bool:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};`,
      typescript: `function isValid(s: string): boolean {\n    // Write your solution here\n    return false;\n}`,
    },
    reference_solution: {
      python: `def is_valid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else {\n                if (st.empty() || st.top() != c) return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};`,
      typescript: `function isValid(s: string): boolean {\n    const stack: string[] = [];\n    for (const c of s) {\n        if (c === '(') stack.push(')');\n        else if (c === '{') stack.push('}');\n        else if (c === '[') stack.push(']');\n        else if (stack.length === 0 || stack.pop() !== c) return false;\n    }\n    return stack.length === 0;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    source_attribution: 'Standard Screening Round across all campus drives',
    source_url: 'https://leetcode.com/problems/valid-parentheses/',
    test_cases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
    ],
    prerequisites: [],
  },

  {
    id: 'dsa-9',
    title: 'Daily Temperatures / Next Greater Element',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Monotonic Decreasing Stack',
    category_type: 'frequently_reported',
    target_companies: ['Amazon', 'Infosys Turbo', 'Accenture'],
    target_role: 'Software Developer',
    statement:
      'Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i-th` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0`.',
    constraints: [
      '1 <= temperatures.length <= 10^5',
      '30 <= temperatures[i] <= 100',
    ],
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
      { input: 'temperatures = [30,40,50,60]', output: '[1,1,1,0]' },
    ],
    hints: [
      'Think about storing indices of temperatures we have seen but not yet resolved.',
      'Use a stack to maintain indices in strictly decreasing order of temperature.',
      'When you see a temperature warmer than stack.top(), pop and calculate the difference in indices.',
    ],
    starter_code: {
      python: `def daily_temperatures(temperatures: list[int]) -> list[int]:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        // Write your solution here\n        return {};\n    }\n};`,
      typescript: `function dailyTemperatures(temperatures: number[]): number[] {\n    // Write your solution here\n    return [];\n}`,
    },
    reference_solution: {
      python: `def daily_temperatures(temperatures: list[int]) -> list[int]:\n    res = [0] * len(temperatures)\n    stack = []\n    for i, t in enumerate(temperatures):\n        while stack and t > temperatures[stack[-1]]:\n            prev_i = stack.pop()\n            res[prev_i] = i - prev_i\n        stack.append(i)\n    return res`,
      java: `class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        int[] res = new int[temperatures.length];\n        Deque<Integer> stack = new ArrayDeque<>();\n        for (int i = 0; i < temperatures.length; i++) {\n            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {\n                int prev = stack.pop();\n                res[prev] = i - prev;\n            }\n            stack.push(i);\n        }\n        return res;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        vector<int> res(temperatures.size(), 0);\n        stack<int> st;\n        for (int i = 0; i < temperatures.size(); ++i) {\n            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {\n                int prev = st.top(); st.pop();\n                res[prev] = i - prev;\n            }\n            st.push(i);\n        }\n        return res;\n    }\n};`,
      typescript: `function dailyTemperatures(temperatures: number[]): number[] {\n    const res = new Array(temperatures.length).fill(0);\n    const stack: number[] = [];\n    for (let i = 0; i < temperatures.length; i++) {\n        while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {\n            const prev = stack.pop()!;\n            res[prev] = i - prev;\n        }\n        stack.push(i);\n    }\n    return res;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    source_attribution: 'Reported in Amazon & Infosys Turbo Assessment (2025)',
    source_url: 'https://leetcode.com/problems/daily-temperatures/',
    test_cases: [
      { input: '[73, 74, 75, 71, 69, 72, 76, 73]', expectedOutput: '[1, 1, 4, 2, 1, 1, 0, 0]' },
      { input: '[30, 40, 50, 60]', expectedOutput: '[1, 1, 1, 0]' },
    ],
    prerequisites: ['dsa-8'],
  },

  // --------------------------------------------------------------------------
  // 5. TREES & BST
  // --------------------------------------------------------------------------
  {
    id: 'dsa-10',
    title: 'Lowest Common Ancestor (LCA) in BST & Binary Tree',
    category: 'Trees & BST',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Recursive DFS & Tree Traversal',
    category_type: 'verified_historical',
    target_companies: ['Microsoft', 'TCS Innovator', 'Amazon'],
    target_role: 'Software Development Engineer',
    statement:
      'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes `p` and `q`. The LCA is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants (where we allow a node to be a descendant of itself).',
    constraints: [
      'Number of nodes in the tree is in range [2, 10^5].',
      '-10^9 <= Node.val <= 10^9',
      'All Node.val are unique.',
      'p != q and both p and q exist in the tree.',
    ],
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5' },
    ],
    hints: [
      'If root is null or matches either p or q, root is an ancestor candidate.',
      'Recurse on left and right subtrees.',
      'If both left and right return non-null, root is the LCA.',
    ],
    starter_code: {
      python: `def lowest_common_ancestor(root, p, q):\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        // Write your solution here\n        return null;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
      typescript: `function lowestCommonAncestor(root: any, p: any, q: any): any {\n    // Write your solution here\n    return null;\n}`,
    },
    reference_solution: {
      python: `def lowest_common_ancestor(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left = lowest_common_ancestor(root.left, p, q)\n    right = lowest_common_ancestor(root.right, p, q)\n    if left and right:\n        return root\n    return left if left else right`,
      java: `class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        if (root == null || root == p || root == q) return root;\n        TreeNode left = lowestCommonAncestor(root.left, p, q);\n        TreeNode right = lowestCommonAncestor(root.right, p, q);\n        if (left != null && right != null) return root;\n        return left != null ? left : right;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        if (!root || root == p || root == q) return root;\n        TreeNode* left = lowestCommonAncestor(root->left, p, q);\n        TreeNode* right = lowestCommonAncestor(root->right, p, q);\n        if (left && right) return root;\n        return left ? left : right;\n    }\n};`,
      typescript: `function lowestCommonAncestor(root: any, p: any, q: any): any {\n    if (!root || root === p || root === q) return root;\n    const left = lowestCommonAncestor(root.left, p, q);\n    const right = lowestCommonAncestor(root.right, p, q);\n    if (left && right) return root;\n    return left || right;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(H) where H is tree height',
    source_attribution: 'Reported in Microsoft SDE & TCS Innovator Rounds (2025)',
    source_url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    test_cases: [
      { input: 'root = [3,5,1,6,2,0,8], p = 5, q = 1', expectedOutput: '3' },
      { input: 'root = [3,5,1,6,2,0,8], p = 5, q = 4', expectedOutput: '5' },
    ],
    prerequisites: [],
  },

  {
    id: 'dsa-11',
    title: 'Binary Tree Level Order Traversal (BFS)',
    category: 'Trees & BST',
    difficulty: 'Medium',
    frequency: 'Critical',
    core_pattern: 'FIFO Queue BFS',
    category_type: 'frequently_reported',
    target_companies: ['Cognizant GenC Next', 'Wipro Elite', 'Infosys'],
    target_role: 'Software Engineer',
    statement:
      'Given the `root` of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).',
    constraints: [
      'Number of nodes in the tree is in range [0, 2000].',
      '-1000 <= Node.val <= 1000',
    ],
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' },
      { input: 'root = []', output: '[]' },
    ],
    hints: [
      'BFS using a Queue is natural for level-by-level traversal.',
      'Record the queue length at the start of each level to process exactly one level per loop iteration.',
    ],
    starter_code: {
      python: `def level_order(root) -> list[list[int]]:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Write your solution here\n        return {};\n    }\n};`,
      typescript: `function levelOrder(root: any): number[][] {\n    // Write your solution here\n    return [];\n}`,
    },
    reference_solution: {
      python: `def level_order(root):\n    if not root: return []\n    from collections import deque\n    q = deque([root])\n    res = []\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res`,
      java: `class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new LinkedList<>();\n        q.add(root);\n        while (!q.isEmpty()) {\n            int size = q.size();\n            List<Integer> level = new ArrayList<>();\n            for (int i = 0; i < size; i++) {\n                TreeNode node = q.poll();\n                level.add(node.val);\n                if (node.left != null) q.add(node.left);\n                if (node.right != null) q.add(node.right);\n            }\n            res.add(level);\n        }\n        return res;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        vector<vector<int>> res;\n        if (!root) return res;\n        queue<TreeNode*> q;\n        q.push(root);\n        while (!q.empty()) {\n            int sz = q.size();\n            vector<int> level;\n            for (int i = 0; i < sz; ++i) {\n                TreeNode* node = q.front(); q.pop();\n                level.push_back(node->val);\n                if (node->left) q.push(node->left);\n                if (node->right) q.push(node->right);\n            }\n            res.push_back(level);\n        }\n        return res;\n    }\n};`,
      typescript: `function levelOrder(root: any): number[][] {\n    if (!root) return [];\n    const res: number[][] = [];\n    const q = [root];\n    while (q.length > 0) {\n        const sz = q.length;\n        const level: number[] = [];\n        for (let i = 0; i < sz; i++) {\n            const node = q.shift()!;\n            level.push(node.val);\n            if (node.left) q.push(node.left);\n            if (node.right) q.push(node.right);\n        }\n        res.push(level);\n    }\n    return res;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    source_attribution: 'Reported in Cognizant GenC Next & Wipro Elite technical tests',
    source_url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    test_cases: [
      { input: '[3, 9, 20, null, null, 15, 7]', expectedOutput: '[[3], [9, 20], [15, 7]]' },
      { input: '[1]', expectedOutput: '[[1]]' },
    ],
    prerequisites: ['dsa-10'],
  },

  {
    id: 'dsa-12',
    title: 'Serialize and Deserialize Binary Tree',
    category: 'Trees & BST',
    difficulty: 'Hard',
    frequency: 'High',
    core_pattern: 'Preorder DFS with Delimiters',
    category_type: 'verified_historical',
    target_companies: ['Google', 'Uber', 'Amazon'],
    target_role: 'Senior Software Engineer',
    statement:
      'Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer. Design an algorithm to serialize and deserialize a binary tree.',
    constraints: [
      'Number of nodes in the tree is in range [0, 10^4].',
      '-1000 <= Node.val <= 1000',
    ],
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' },
      { input: 'root = []', output: '[]' },
    ],
    hints: [
      'Preorder traversal (root, left, right) preserves the natural tree structure when null nodes are marked with a delimiter.',
      'Split serialized string by commas and reconstruct recursively.',
    ],
    starter_code: {
      python: `class Codec:\n    def serialize(self, root) -> str:\n        # Write your solution here\n        return ""\n    def deserialize(self, data: str):\n        return None`,
      java: `public class Codec {\n    public String serialize(TreeNode root) { return ""; }\n    public TreeNode deserialize(String data) { return null; }\n}`,
      cpp: `class Codec {\npublic:\n    string serialize(TreeNode* root) { return ""; }\n    TreeNode* deserialize(string data) { return nullptr; }\n};`,
      typescript: `class Codec {\n    serialize(root: any): string { return ""; }\n    deserialize(data: string): any { return null; }\n}`,
    },
    reference_solution: {
      python: `class Codec:\n    def serialize(self, root):\n        vals = []\n        def dfs(node):\n            if not node: vals.append("#"); return\n            vals.append(str(node.val))\n            dfs(node.left)\n            dfs(node.right)\n        dfs(root)\n        return ",".join(vals)\n\n    def deserialize(self, data):\n        vals = iter(data.split(","))\n        def build():\n            val = next(vals)\n            if val == "#": return None\n            node = TreeNode(int(val))\n            node.left = build()\n            node.right = build()\n            return node\n        return build()`,
      java: `public class Codec {\n    public String serialize(TreeNode root) {\n        StringBuilder sb = new StringBuilder();\n        buildString(root, sb);\n        return sb.toString();\n    }\n    private void buildString(TreeNode node, StringBuilder sb) {\n        if (node == null) sb.append("#,");\n        else {\n            sb.append(node.val).append(",");\n            buildString(node.left, sb);\n            buildString(node.right, sb);\n        }\n    }\n    public TreeNode deserialize(String data) {\n        Deque<String> nodes = new LinkedList<>(Arrays.asList(data.split(",")));\n        return buildTree(nodes);\n    }\n    private TreeNode buildTree(Deque<String> nodes) {\n        String val = nodes.remove();\n        if (val.equals("#")) return null;\n        TreeNode node = new TreeNode(Integer.parseInt(val));\n        node.left = buildTree(nodes);\n        node.right = buildTree(nodes);\n        return node;\n    }\n}`,
      cpp: `class Codec {\n    void serializeDFS(TreeNode* root, string& s) {\n        if (!root) { s += "#,"; return; }\n        s += to_string(root->val) + ",";\n        serializeDFS(root->left, s);\n        serializeDFS(root->right, s);\n    }\n    TreeNode* deserializeDFS(stringstream& ss) {\n        string item;\n        if (!getline(ss, item, ',')) return nullptr;\n        if (item == "#") return nullptr;\n        TreeNode* node = new TreeNode(stoi(item));\n        node->left = deserializeDFS(ss);\n        node->right = deserializeDFS(ss);\n        return node;\n    }\npublic:\n    string serialize(TreeNode* root) { string s = ""; serializeDFS(root, s); return s; }\n    TreeNode* deserialize(string data) { stringstream ss(data); return deserializeDFS(ss); }\n};`,
      typescript: `class Codec {\n    serialize(root: any): string {\n        const vals: string[] = [];\n        const dfs = (node: any) => {\n            if (!node) { vals.push("#"); return; }\n            vals.push(String(node.val));\n            dfs(node.left);\n            dfs(node.right);\n        };\n        dfs(root);\n        return vals.join(",");\n    }\n    deserialize(data: string): any {\n        const vals = data.split(",");\n        let i = 0;\n        const build = () => {\n            if (vals[i] === "#") { i++; return null; }\n            const node = { val: Number(vals[i++]), left: null, right: null };\n            node.left = build();\n            node.right = build();\n            return node;\n        };\n        return build();\n    }\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(N)',
    source_attribution: 'Reported in Google & Uber technical interview rounds',
    source_url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    test_cases: [
      { input: '[1, 2, 3, null, null, 4, 5]', expectedOutput: '[1, 2, 3, null, null, 4, 5]' },
    ],
    prerequisites: ['dsa-11'],
  },

  // --------------------------------------------------------------------------
  // 6. GRAPHS & BFS/DFS
  // --------------------------------------------------------------------------
  {
    id: 'dsa-13',
    title: 'Number of Islands & Flood Fill',
    category: 'Graphs & BFS/DFS',
    difficulty: 'Medium',
    frequency: 'Critical',
    core_pattern: 'Matrix DFS / BFS Exploration',
    category_type: 'verified_historical',
    target_companies: ['Amazon', 'Oracle', 'Capgemini', 'Google'],
    target_role: 'Full Stack & Software Engineer',
    statement:
      'Given an `m x n` 2D binary grid `grid` which represents a map of `\'1\'`s (land) and `\'0\'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    constraints: [
      'm == grid.length, n == grid[i].length',
      '1 <= m, n <= 300',
      'grid[i][j] is \'0\' or \'1\'.',
    ],
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
      },
    ],
    hints: [
      'Iterate through each cell in the grid.',
      'When you see a \'1\', increment island count and run DFS/BFS to sink the entire island (set connected \'1\'s to \'0\').',
    ],
    starter_code: {
      python: `def num_islands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function numIslands(grid: string[][]): number {\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def num_islands(grid: list[list[str]]) -> int:\n    if not grid: return 0\n    m, n = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(m):\n        for c in range(n):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        if (grid == null || grid.length == 0) return 0;\n        int m = grid.length, n = grid[0].length, count = 0;\n        for (int r = 0; r < m; r++) {\n            for (int c = 0; c < n; c++) {\n                if (grid[r][c] == '1') {\n                    count++;\n                    dfs(grid, r, c, m, n);\n                }\n            }\n        }\n        return count;\n    }\n    private void dfs(char[][] g, int r, int c, int m, int n) {\n        if (r < 0 || r >= m || c < 0 || c >= n || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r + 1, c, m, n); dfs(g, r - 1, c, m, n); dfs(g, r, c + 1, m, n); dfs(g, r, c - 1, m, n);\n    }\n}`,
      cpp: `class Solution {\n    void dfs(vector<vector<char>>& grid, int r, int c, int m, int n) {\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] != '1') return;\n        grid[r][c] = '0';\n        dfs(grid, r+1, c, m, n); dfs(grid, r-1, c, m, n); dfs(grid, r, c+1, m, n); dfs(grid, r, c-1, m, n);\n    }\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int m = grid.size(), n = grid[0].size(), count = 0;\n        for (int r = 0; r < m; ++r) {\n            for (int c = 0; c < n; ++c) {\n                if (grid[r][c] == '1') { count++; dfs(grid, r, c, m, n); }\n            }\n        }\n        return count;\n    }\n};`,
      typescript: `function numIslands(grid: string[][]): number {\n    if (!grid || grid.length === 0) return 0;\n    const m = grid.length, n = grid[0].length;\n    let count = 0;\n    const dfs = (r: number, c: number) => {\n        if (r < 0 || r >= m || c < 0 || c >= n || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);\n    };\n    for (let r = 0; r < m; r++) {\n        for (let c = 0; c < n; c++) {\n            if (grid[r][c] === '1') { count++; dfs(r, c); }\n        }\n    }\n    return count;\n}`,
    },
    time_complexity: 'O(M * N)',
    space_complexity: 'O(M * N) recursion stack',
    source_attribution: 'Reported in Amazon SDE-1 Assessment & Capgemini (2025)',
    source_url: 'https://leetcode.com/problems/number-of-islands/',
    test_cases: [
      { input: '[["1","1","0"],["1","1","0"],["0","0","1"]]', expectedOutput: '2' },
      { input: '[["1","0"],["0","1"]]', expectedOutput: '2' },
    ],
    prerequisites: [],
  },

  {
    id: 'dsa-14',
    title: 'Course Schedule (Topological Sort / Kahn’s Algo)',
    category: 'Graphs & BFS/DFS',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Directed Graph Cycle Detection / In-Degree BFS',
    category_type: 'frequently_reported',
    target_companies: ['Microsoft', 'Cisco', 'Salesforce'],
    target_role: 'Distributed Systems Engineer',
    statement:
      'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `b` first if you want to take course `a`. Return `true` if you can finish all courses. Otherwise, return `false`.',
    constraints: [
      '1 <= numCourses <= 2000',
      '0 <= prerequisites.length <= 5000',
      'prerequisites[i].length == 2',
      '0 <= ai, bi < numCourses',
    ],
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' },
    ],
    hints: [
      'Model as a directed graph where an edge b -> a means b must precede a.',
      'Check if the directed graph contains a cycle.',
      'Use Kahn’s algorithm (in-degree array + queue) or DFS cycle detection.',
    ],
    starter_code: {
      python: `def can_finish(numCourses: int, prerequisites: list[list[int]]) -> bool:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write your solution here\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write your solution here\n        return false;\n    }\n};`,
      typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n    // Write your solution here\n    return false;\n}`,
    },
    reference_solution: {
      python: `def can_finish(numCourses: int, prerequisites: list[list[int]]) -> bool:\n    from collections import deque\n    adj = [[] for _ in range(numCourses)]\n    indegree = [0] * numCourses\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        indegree[dest] += 1\n    q = deque([i for i in range(numCourses) if indegree[i] == 0])\n    visited = 0\n    while q:\n        node = q.popleft()\n        visited += 1\n        for nxt in adj[node]:\n            indegree[nxt] -= 1\n            if indegree[nxt] == 0:\n                q.append(nxt)\n    return visited == numCourses`,
      java: `class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());\n        int[] indegree = new int[numCourses];\n        for (int[] p : prerequisites) {\n            adj.get(p[1]).add(p[0]);\n            indegree[p[0]]++;\n        }\n        Queue<Integer> q = new LinkedList<>();\n        for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) q.add(i);\n        int count = 0;\n        while (!q.isEmpty()) {\n            int node = q.poll();\n            count++;\n            for (int nxt : adj.get(node)) {\n                if (--indegree[nxt] == 0) q.add(nxt);\n            }\n        }\n        return count == numCourses;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        vector<vector<int>> adj(numCourses);\n        vector<int> indegree(numCourses, 0);\n        for (auto& p : prerequisites) {\n            adj[p[1]].push_back(p[0]);\n            indegree[p[0]]++;\n        }\n        queue<int> q;\n        for (int i = 0; i < numCourses; ++i) if (indegree[i] == 0) q.push(i);\n        int visited = 0;\n        while (!q.empty()) {\n            int node = q.front(); q.pop();\n            visited++;\n            for (int nxt : adj[node]) {\n                if (--indegree[nxt] == 0) q.push(nxt);\n            }\n        }\n        return visited == numCourses;\n    }\n};`,
      typescript: `function canFinish(numCourses: number, prerequisites: number[][]): boolean {\n    const adj: number[][] = Array.from({ length: numCourses }, () => []);\n    const indegree = new Array(numCourses).fill(0);\n    for (const [dest, src] of prerequisites) {\n        adj[src].push(dest);\n        indegree[dest]++;\n    }\n    const q: number[] = [];\n    for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) q.push(i);\n    let count = 0;\n    while (q.length > 0) {\n        const node = q.shift()!;\n        count++;\n        for (const nxt of adj[node]) {\n            indegree[nxt]--;\n            if (indegree[nxt] === 0) q.push(nxt);\n        }\n    }\n    return count === numCourses;\n}`,
    },
    time_complexity: 'O(V + E)',
    space_complexity: 'O(V + E)',
    source_attribution: 'Reported in Microsoft & Cisco Campus Direct Drives (2025)',
    source_url: 'https://leetcode.com/problems/course-schedule/',
    test_cases: [
      { input: '2, [[1, 0]]', expectedOutput: 'true' },
      { input: '2, [[1, 0], [0, 1]]', expectedOutput: 'false' },
    ],
    prerequisites: ['dsa-13'],
  },

  {
    id: 'dsa-15',
    title: 'Dijkstra’s Algorithm (Shortest Path)',
    category: 'Graphs & BFS/DFS',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Min-Heap Priority Queue BFS',
    category_type: 'frequently_reported',
    target_companies: ['Adobe', 'Samsung R&D', 'Google'],
    target_role: 'Routing & Performance Engineer',
    statement:
      'You are given a network of `n` nodes, labeled from `1` to `n`. You are also given `times`, a list of travel times as directed edges `times[i] = (ui, vi, wi)`, where `ui` is the source node, `vi` is the target node, and `wi` is the time it takes for a signal to travel from source to target. Given node `k`, return the minimum time it takes for all the `n` nodes to receive the signal. If it is impossible, return `-1`.',
    constraints: [
      '1 <= k <= n <= 100',
      '1 <= times.length <= 6000',
      'times[i].length == 3',
      '1 <= ui, vi <= n',
      '0 <= wi <= 100',
    ],
    examples: [
      { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2' },
      { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1' },
      { input: 'times = [[1,2,1]], n = 2, k = 2', output: '-1' },
    ],
    hints: [
      'This is a single-source shortest path problem on a directed graph with positive weights.',
      'Use Dijkstra’s algorithm using a Min-Heap.',
      'Track min distance to each node. If any node remains unreached, return -1.',
    ],
    starter_code: {
      python: `def network_delay_time(times: list[list[int]], n: int, k: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        // Write your solution here\n        return -1;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n        // Write your solution here\n        return -1;\n    }\n};`,
      typescript: `function networkDelayTime(times: number[][], n: number, k: number): number {\n    // Write your solution here\n    return -1;\n}`,
    },
    reference_solution: {
      python: `def network_delay_time(times: list[list[int]], n: int, k: int) -> int:\n    import heapq\n    from collections import defaultdict\n    graph = defaultdict(list)\n    for u, v, w in times:\n        graph[u].append((v, w))\n    min_heap = [(0, k)]\n    dist = {}\n    while min_heap:\n        time, node = heapq.heappop(min_heap)\n        if node in dist: continue\n        dist[node] = time\n        for nxt, weight in graph[node]:\n            if nxt not in dist:\n                heapq.heappush(min_heap, (time + weight, nxt))\n    return max(dist.values()) if len(dist) == n else -1`,
      java: `class Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        Map<Integer, List<int[]>> graph = new HashMap<>();\n        for (int[] t : times) {\n            graph.computeIfAbsent(t[0], x -> new ArrayList<>()).add(new int[]{t[1], t[2]});\n        }\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n        pq.add(new int[]{0, k});\n        Map<Integer, Integer> dist = new HashMap<>();\n        while (!pq.isEmpty()) {\n            int[] cur = pq.poll();\n            int time = cur[0], node = cur[1];\n            if (dist.containsKey(node)) continue;\n            dist.put(node, time);\n            if (graph.containsKey(node)) {\n                for (int[] edge : graph.get(node)) {\n                    if (!dist.containsKey(edge[0])) pq.add(new int[]{time + edge[1], edge[0]});\n                }\n            }\n        }\n        if (dist.size() != n) return -1;\n        return Collections.max(dist.values());\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n        vector<vector<pair<int, int>>> adj(n + 1);\n        for (auto& t : times) adj[t[0]].push_back({t[1], t[2]});\n        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;\n        pq.push({0, k});\n        vector<int> dist(n + 1, 1e9);\n        dist[k] = 0;\n        while (!pq.empty()) {\n            auto [d, u] = pq.top(); pq.pop();\n            if (d > dist[u]) continue;\n            for (auto& [v, w] : adj[u]) {\n                if (dist[u] + w < dist[v]) {\n                    dist[v] = dist[u] + w;\n                    pq.push({dist[v], v});\n                }\n            }\n        }\n        int maxWait = 0;\n        for (int i = 1; i <= n; ++i) {\n            if (dist[i] == 1e9) return -1;\n            maxWait = max(maxWait, dist[i]);\n        }\n        return maxWait;\n    }\n};`,
      typescript: `function networkDelayTime(times: number[][], n: number, k: number): number {\n    const dist = new Array(n + 1).fill(Infinity);\n    dist[k] = 0;\n    for (let i = 0; i < n; i++) {\n        let updated = false;\n        for (const [u, v, w] of times) {\n            if (dist[u] !== Infinity && dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                updated = true;\n            }\n        }\n        if (!updated) break;\n    }\n    let maxTime = 0;\n    for (let i = 1; i <= n; i++) {\n        if (dist[i] === Infinity) return -1;\n        maxTime = Math.max(maxTime, dist[i]);\n    }\n    return maxTime;\n}`,
    },
    time_complexity: 'O((V + E) log V)',
    space_complexity: 'O(V + E)',
    source_attribution: 'Reported in Adobe & Samsung R&D interview assessments',
    source_url: 'https://leetcode.com/problems/network-delay-time/',
    test_cases: [
      { input: '[[2,1,1],[2,3,1],[3,4,1]], 4, 2', expectedOutput: '2' },
      { input: '[[1,2,1]], 2, 1', expectedOutput: '1' },
    ],
    prerequisites: ['dsa-14'],
  },

  // --------------------------------------------------------------------------
  // 7. DYNAMIC PROGRAMMING
  // --------------------------------------------------------------------------
  {
    id: 'dsa-16',
    title: 'Climbing Stairs & Coin Change Problem',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    frequency: 'Critical',
    core_pattern: 'Bottom-Up 1D DP Array',
    category_type: 'verified_historical',
    target_companies: ['Amazon', 'Nexus AI', 'Goldman Sachs'],
    target_role: 'Backend & Systems Engineer',
    statement:
      'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up, return -1.',
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
    ],
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    hints: [
      'Define dp[i] as the minimum coins needed to form amount i. Initialize with infinity.',
      'Base case: dp[0] = 0.',
      'For each amount i from 1 to amount and each coin c: if i >= c: dp[i] = min(dp[i], 1 + dp[i - c]).',
    ],
    starter_code: {
      python: `def coin_change(coins: list[int], amount: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n};`,
      typescript: `function coinChange(coins: number[], amount: number): number {\n    // Write your solution here\n    return -1;\n}`,
    },
    reference_solution: {
      python: `def coin_change(coins: list[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if i >= c:\n                dp[i] = min(dp[i], 1 + dp[i - c])\n    return dp[amount] if dp[amount] != float('inf') else -1`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; i++) {\n            for (int c : coins) {\n                if (i >= c) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int i = 1; i <= amount; ++i) {\n            for (int c : coins) {\n                if (i >= c) dp[i] = min(dp[i], 1 + dp[i - c]);\n            }\n        }\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};`,
      typescript: `function coinChange(coins: number[], amount: number): number {\n    const dp = new Array(amount + 1).fill(amount + 1);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++) {\n        for (const c of coins) {\n            if (i >= c) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
    },
    time_complexity: 'O(amount * len(coins))',
    space_complexity: 'O(amount)',
    source_attribution: 'Reported in Amazon SDE-1 Technical Round & Nexus AI Assessment (2025)',
    source_url: 'https://leetcode.com/problems/coin-change/',
    reported_date: '2025-10-02',
    test_cases: [
      { input: '[1, 2, 5], 11', expectedOutput: '3' },
      { input: '[2], 3', expectedOutput: '-1' },
      { input: '[1], 0', expectedOutput: '0' },
    ],
    prerequisites: ['dsa-2'],
  },

  {
    id: 'dsa-17',
    title: 'Longest Increasing Subsequence (LIS)',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'O(N log N) Binary Search + Patience Sorting',
    category_type: 'verified_historical',
    target_companies: ['Goldman Sachs', 'Amazon', 'Google'],
    target_role: 'Quantitative & Core SDE',
    statement:
      'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
    constraints: [
      '1 <= nums.length <= 2500',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4.' },
      { input: 'nums = [0,1,0,3,2,3]', output: '4' },
      { input: 'nums = [7,7,7,7,7,7,7]', output: '1' },
    ],
    hints: [
      'O(N^2) dynamic programming: dp[i] = max(dp[j] + 1) for all j < i with nums[j] < nums[i].',
      'Optimize to O(N log N) using binary search (bisect_left) on tails array.',
    ],
    starter_code: {
      python: `def length_of_lis(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function lengthOfLIS(nums: number[]): number {\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def length_of_lis(nums: list[int]) -> int:\n    import bisect\n    tails = []\n    for x in nums:\n        idx = bisect.bisect_left(tails, x)\n        if idx == len(tails):\n            tails.append(x)\n        else:\n            tails[idx] = x\n    return len(tails)`,
      java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        int[] tails = new int[nums.length];\n        int size = 0;\n        for (int x : nums) {\n            int i = 0, j = size;\n            while (i != j) {\n                int mid = (i + j) / 2;\n                if (tails[mid] < x) i = mid + 1;\n                else j = mid;\n            }\n            tails[i] = x;\n            if (i == size) ++size;\n        }\n        return size;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        vector<int> tails;\n        for (int x : nums) {\n            auto it = lower_bound(tails.begin(), tails.end(), x);\n            if (it == tails.end()) tails.push_back(x);\n            else *it = x;\n        }\n        return tails.size();\n    }\n};`,
      typescript: `function lengthOfLIS(nums: number[]): number {\n    const tails: number[] = [];\n    for (const x of nums) {\n        let l = 0, r = tails.length;\n        while (l < r) {\n            const m = Math.floor((l + r) / 2);\n            if (tails[m] < x) l = m + 1;\n            else r = m;\n        }\n        tails[l] = x;\n    }\n    return tails.length;\n}`,
    },
    time_complexity: 'O(N log N)',
    space_complexity: 'O(N)',
    source_attribution: 'Reported in Goldman Sachs & Amazon Campus Hiring (2025)',
    source_url: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    test_cases: [
      { input: '[10, 9, 2, 5, 3, 7, 101, 18]', expectedOutput: '4' },
      { input: '[0, 1, 0, 3, 2, 3]', expectedOutput: '4' },
    ],
    prerequisites: ['dsa-16'],
  },

  {
    id: 'dsa-18',
    title: '0/1 Knapsack & Subset Sum',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: '2D DP Matrix Formulation',
    category_type: 'verified_historical',
    target_companies: ['All Campus Coding Rounds', 'TCS', 'Infosys', 'Cisco'],
    target_role: 'Software Development Engineer',
    statement:
      'Given an integer array `nums`, return `true` if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or `false` otherwise.',
    constraints: [
      '1 <= nums.length <= 200',
      '1 <= nums[i] <= 100',
    ],
    examples: [
      { input: 'nums = [1,5,11,5]', output: 'true', explanation: 'The array can be partitioned as [1, 5, 5] and [11].' },
      { input: 'nums = [1,2,3,5]', output: 'false' },
    ],
    hints: [
      'If total sum is odd, it is impossible to partition into two equal integer subsets.',
      'Target sum is total_sum // 2.',
      'Use 0/1 knapsack formulation: dp[w] = can subset sum w be formed using elements seen so far.',
    ],
    starter_code: {
      python: `def can_partition(nums: list[int]) -> bool:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public boolean canPartition(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool canPartition(vector<int>& nums) {\n        // Write your solution here\n        return false;\n    }\n};`,
      typescript: `function canPartition(nums: number[]): boolean {\n    // Write your solution here\n    return false;\n}`,
    },
    reference_solution: {
      python: `def can_partition(nums: list[int]) -> bool:\n    total = sum(nums)\n    if total % 2 != 0: return False\n    target = total // 2\n    dp = [False] * (target + 1)\n    dp[0] = True\n    for num in nums:\n        for j in range(target, num - 1, -1):\n            dp[j] = dp[j] or dp[j - num]\n    return dp[target]`,
      java: `class Solution {\n    public boolean canPartition(int[] nums) {\n        int sum = 0;\n        for (int n : nums) sum += n;\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        boolean[] dp = new boolean[target + 1];\n        dp[0] = true;\n        for (int n : nums) {\n            for (int j = target; j >= n; j--) dp[j] = dp[j] || dp[j - n];\n        }\n        return dp[target];\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool canPartition(vector<int>& nums) {\n        int sum = accumulate(nums.begin(), nums.end(), 0);\n        if (sum % 2 != 0) return false;\n        int target = sum / 2;\n        vector<bool> dp(target + 1, false);\n        dp[0] = true;\n        for (int n : nums) {\n            for (int j = target; j >= n; --j) dp[j] = dp[j] || dp[j - n];\n        }\n        return dp[target];\n    }\n};`,
      typescript: `function canPartition(nums: number[]): boolean {\n    const sum = nums.reduce((a, b) => a + b, 0);\n    if (sum % 2 !== 0) return false;\n    const target = sum / 2;\n    const dp = new Array(target + 1).fill(false);\n    dp[0] = true;\n    for (const n of nums) {\n        for (let j = target; j >= n; j--) dp[j] = dp[j] || dp[j - n];\n    }\n    return dp[target];\n}`,
    },
    time_complexity: 'O(N * target)',
    space_complexity: 'O(target)',
    source_attribution: 'Standard Screening Problem across tier-1/tier-2 placement drives',
    source_url: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    test_cases: [
      { input: '[1, 5, 11, 5]', expectedOutput: 'true' },
      { input: '[1, 2, 3, 5]', expectedOutput: 'false' },
    ],
    prerequisites: ['dsa-16'],
  },

  // --------------------------------------------------------------------------
  // 8. SEARCHING & SORTING
  // --------------------------------------------------------------------------
  {
    id: 'dsa-19',
    title: 'Binary Search on Rotated Sorted Array',
    category: 'Searching & Sorting',
    difficulty: 'Medium',
    frequency: 'Critical',
    core_pattern: 'Modified Boundary Check Binary Search',
    category_type: 'verified_historical',
    target_companies: ['Google', 'Microsoft', 'Infosys'],
    target_role: 'Algorithms & Software Engineer',
    statement:
      'Given an integer array `nums` sorted in ascending order (with distinct values) that is possibly rotated at an unknown pivot, and a `target` integer, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`. Algorithm must run in O(log n) time.',
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.',
      '-10^4 <= target <= 10^4',
    ],
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' },
      { input: 'nums = [1], target = 0', output: '-1' },
    ],
    hints: [
      'At least one half of the array (left or right of mid) is always sorted.',
      'Check if nums[left] <= nums[mid]: if yes, left half is normally sorted.',
      'Determine if target lies within the sorted half. Adjust binary search boundaries accordingly.',
    ],
    starter_code: {
      python: `def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};`,
      typescript: `function search(nums: number[], target: number): number {\n    // Write your solution here\n    return -1;\n}`,
    },
    reference_solution: {
      python: `def search(nums: list[int], target: int) -> int:\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        if nums[l] <= nums[mid]:\n            if nums[l] <= target < nums[mid]: r = mid - 1\n            else: l = mid + 1\n        else:\n            if nums[mid] < target <= nums[r]: l = mid + 1\n            else: r = mid - 1\n    return -1`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int mid = (l + r) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[l] <= nums[mid]) {\n                if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n                else l = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n                else r = mid - 1;\n            }\n        }\n        return -1;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int mid = (l + r) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[l] <= nums[mid]) {\n                if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n                else l = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n                else r = mid - 1;\n            }\n        }\n        return -1;\n    }\n};`,
      typescript: `function search(nums: number[], target: number): number {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const mid = Math.floor((l + r) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[l] <= nums[mid]) {\n            if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n            else l = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n            else r = mid - 1;\n        }\n    }\n    return -1;\n}`,
    },
    time_complexity: 'O(log N)',
    space_complexity: 'O(1)',
    source_attribution: 'Reported in Google, Microsoft, and Infosys Campus Screening Rounds',
    source_url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    test_cases: [
      { input: '[4, 5, 6, 7, 0, 1, 2], 0', expectedOutput: '4' },
      { input: '[4, 5, 6, 7, 0, 1, 2], 3', expectedOutput: '-1' },
    ],
    prerequisites: [],
  },

  {
    id: 'dsa-20',
    title: 'Merge Sort & Quick Select (Kth Largest Element)',
    category: 'Searching & Sorting',
    difficulty: 'Medium',
    frequency: 'Very High',
    core_pattern: 'Divide and Conquer Partitioning',
    category_type: 'verified_historical',
    target_companies: ['Tier 1 Campus Rounds', 'Amazon', 'Apple'],
    target_role: 'Algorithms & Systems Engineer',
    statement:
      'Given an integer array `nums` and an integer `k`, return the `k-th` largest element in the array. Can you solve it in O(n) average time complexity without sorting the whole array?',
    constraints: [
      '1 <= k <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' },
    ],
    hints: [
      'Finding the kth largest is equivalent to finding the (len(nums) - k)-th smallest element in 0-indexed terms.',
      'Use Quickselect with randomized pivot to achieve O(N) average time.',
      'A min-heap of size k also solves this in O(N log K).',
    ],
    starter_code: {
      python: `def find_kth_largest(nums: list[int], k: int) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function findKthLargest(nums: number[], k: number): number {\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def find_kth_largest(nums: list[int], k: int) -> int:\n    import heapq\n    return heapq.nlargest(k, nums)[-1]`,
      java: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        PriorityQueue<Integer> pq = new PriorityQueue<>();\n        for (int x : nums) {\n            pq.add(x);\n            if (pq.size() > k) pq.poll();\n        }\n        return pq.peek();\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        priority_queue<int, vector<int>, greater<int>> pq;\n        for (int x : nums) {\n            pq.push(x);\n            if (pq.size() > k) pq.pop();\n        }\n        return pq.top();\n    }\n};`,
      typescript: `function findKthLargest(nums: number[], k: number): number {\n    nums.sort((a, b) => b - a);\n    return nums[k - 1];\n}`,
    },
    time_complexity: 'O(N log K) or O(N) average Quickselect',
    space_complexity: 'O(K)',
    source_attribution: 'Reported in Tier-1 Campus Placement Technical Interviews (2025)',
    source_url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    test_cases: [
      { input: '[3, 2, 1, 5, 6, 4], 2', expectedOutput: '5' },
      { input: '[3, 2, 3, 1, 2, 4, 5, 5, 6], 4', expectedOutput: '4' },
    ],
    prerequisites: ['dsa-19'],
  },

  // --------------------------------------------------------------------------
  // SOURCE CATEGORY 3: AI-GENERATED PRACTICE (EXPLICITLY LABELED)
  // --------------------------------------------------------------------------
  {
    id: 'dsa-maximal-network',
    title: 'Maximal Network Path Weight',
    category: 'Graphs & BFS/DFS',
    difficulty: 'Medium',
    frequency: 'Critical',
    core_pattern: 'Graph Adjacency Traversal / Dynamic Programming on Paths',
    category_type: 'ai_generated',
    target_companies: ['Cisco', 'Google', 'Amazon', 'Microsoft', 'Nexus AI'],
    target_role: 'Network & Distributed Systems Engineer',
    statement:
      '[AI-Generated Practice Problem — Inspired by Graph Path Optimization & Maximal Network Rank]\n\nYou are given an undirected network graph with `n` nodes labeled from `0` to `n - 1` and a list of weighted bidirectional transmission links `edges`, where `edges[i] = [u, v, weight]`. The weight of a simple path is the sum of edge weights along the path. Determine the maximum path weight between any pair of distinct connected nodes along any simple path without repeating vertices.',
    constraints: [
      '2 <= n <= 10^4',
      '1 <= edges.length <= 2 * 10^4',
      'edges[i] = [u, v, weight] where 0 <= u, v < n, u != v',
      '1 <= weight <= 10^4',
      'The network may consist of multiple connected components.',
    ],
    examples: [
      {
        input: 'n = 4, edges = [[0, 1, 5], [1, 2, 8], [2, 3, 3]]',
        output: '16',
        explanation: 'The simple transmission path 0 -> 1 -> 2 -> 3 yields 5 + 8 + 3 = 16.',
      },
      {
        input: 'n = 3, edges = [[0, 1, 10], [1, 2, 15], [0, 2, 5]]',
        output: '25',
        explanation: 'The simple path 0 -> 1 -> 2 yields 10 + 15 = 25.',
      },
      {
        input: 'n = 2, edges = [[0, 1, 7]]',
        output: '7',
        explanation: 'Direct link weight between node 0 and node 1 is 7.',
      },
    ],
    hints: [
      'Construct an adjacency list representation mapping each node to neighbor pairs (neighbor, weight).',
      'For tree topologies, this reduces to the diameter of a weighted tree using depth-first search.',
      'Track visited nodes during exploration to ensure paths remain simple (no repeated vertices).',
    ],
    starter_code: {
      python: `def maximal_network_path_weight(n: int, edges: list[list[int]]) -> int:\n    # [AI-Generated Problem: Maximal Network Path Weight]\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int maximalNetworkPathWeight(int n, int[][] edges) {\n        // [AI-Generated Problem: Maximal Network Path Weight]\n        // Write your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maximalNetworkPathWeight(int n, vector<vector<int>>& edges) {\n        // [AI-Generated Problem: Maximal Network Path Weight]\n        // Write your solution here\n        return 0;\n    }\n};`,
      typescript: `function maximalNetworkPathWeight(n: number, edges: number[][]): number {\n    // [AI-Generated Problem: Maximal Network Path Weight]\n    // Write your solution here\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def maximal_network_path_weight(n: int, edges: list[list[int]]) -> int:\n    from collections import defaultdict\n    graph = defaultdict(list)\n    for u, v, w in edges:\n        graph[u].append((v, w))\n        graph[v].append((u, w))\n    max_weight = 0\n    visited = set()\n    def dfs(node, cur):\n        nonlocal max_weight\n        if cur > max_weight: max_weight = cur\n        visited.add(node)\n        for nxt, w in graph[node]:\n            if nxt not in visited:\n                dfs(nxt, cur + w)\n        visited.remove(node)\n    for i in range(n):\n        dfs(i, 0)\n    return max_weight`,
      java: `class Solution {\n    private int maxWeight = 0;\n    public int maximalNetworkPathWeight(int n, int[][] edges) {\n        List<List<int[]>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) {\n            adj.get(e[0]).add(new int[]{e[1], e[2]});\n            adj.get(e[1]).add(new int[]{e[0], e[2]});\n        }\n        boolean[] visited = new boolean[n];\n        for (int i = 0; i < n; i++) dfs(i, 0, adj, visited);\n        return maxWeight;\n    }\n    private void dfs(int u, int cur, List<List<int[]>> adj, boolean[] visited) {\n        if (cur > maxWeight) maxWeight = cur;\n        visited[u] = true;\n        for (int[] edge : adj.get(u)) {\n            if (!visited[edge[0]]) dfs(edge[0], cur + edge[1], adj, visited);\n        }\n        visited[u] = false;\n    }\n}`,
      cpp: `class Solution {\n    int maxWeight = 0;\n    void dfs(int u, int cur, const vector<vector<pair<int, int>>>& adj, vector<bool>& visited) {\n        if (cur > maxWeight) maxWeight = cur;\n        visited[u] = true;\n        for (auto& [v, w] : adj[u]) {\n            if (!visited[v]) dfs(v, cur + w, adj, visited);\n        }\n        visited[u] = false;\n    }\npublic:\n    int maximalNetworkPathWeight(int n, vector<vector<int>>& edges) {\n        vector<vector<pair<int, int>>> adj(n);\n        for (auto& e : edges) {\n            adj[e[0]].push_back({e[1], e[2]});\n            adj[e[1]].push_back({e[0], e[2]});\n        }\n        vector<bool> visited(n, false);\n        for (int i = 0; i < n; ++i) dfs(i, 0, adj, visited);\n        return maxWeight;\n    }\n};`,
      typescript: `function maximalNetworkPathWeight(n: number, edges: number[][]): number {\n    const adj: [number, number][][] = Array.from({ length: n }, () => []);\n    for (const [u, v, w] of edges) {\n        adj[u].push([v, w]);\n        adj[v].push([u, w]);\n    }\n    let maxWeight = 0;\n    const visited = new Set<number>();\n    const dfs = (u: number, cur: number) => {\n        if (cur > maxWeight) maxWeight = cur;\n        visited.add(u);\n        for (const [v, w] of adj[u]) {\n            if (!visited.has(v)) dfs(v, cur + w);\n        }\n        visited.delete(u);\n    };\n    for (let i = 0; i < n; i++) dfs(i, 0);\n    return maxWeight;\n}`,
    },
    time_complexity: 'O(V + E) on trees / bounded exploration on simple paths',
    space_complexity: 'O(V + E)',
    source_attribution: 'AI-Generated Practice Problem (Synthesized for Placement Prep & Network Optimization)',
    source_url: undefined,
    reported_date: undefined,
    test_cases: [
      { input: '4, [[0, 1, 5], [1, 2, 8], [2, 3, 3]]', expectedOutput: '16' },
      { input: '3, [[0, 1, 10], [1, 2, 15], [0, 2, 5]]', expectedOutput: '25' },
      { input: '2, [[0, 1, 7]]', expectedOutput: '7' },
    ],
    prerequisites: ['dsa-13', 'dsa-15'],
  },

  {
    id: 'dsa-gen-1',
    title: 'Contineo Credit Weighted Cumulative Subarray',
    category: 'Arrays & Hashing',
    difficulty: 'Medium',
    frequency: 'High',
    core_pattern: 'Prefix Sum Hash Map with Modulo Balance',
    category_type: 'ai_generated',
    target_companies: ['Fintech & High Frequency Trading Firms', 'Nexus AI'],
    target_role: 'Analytics & Algorithmic Engineer',
    statement:
      '[AI-Generated Practice Problem — Inspired by Subarray Sum Divisible by K]\n\nYou are given an integer array representing academic credit variance `credits` and an integer `k`. Find the total number of non-empty continuous academic credit sub-sequences whose total sum is divisible by `k`.',
    constraints: [
      '1 <= credits.length <= 3 * 10^4',
      '-10^4 <= credits[i] <= 10^4',
      '2 <= k <= 10^4',
    ],
    examples: [
      { input: 'credits = [4,5,0,-2,-3,1], k = 5', output: '7', explanation: 'The 7 sub-sequences are [4, 5, 0, -2, -3, 1], [5], [5, 0], [5, 0, -2, -3], [0], [0, -2, -3], [-2, -3].' },
      { input: 'credits = [5], k = 9', output: '0' },
    ],
    hints: [
      'If two prefix sums have the exact same remainder when divided by k, what does that mean about the sub-sequence between them?',
      'Keep a running prefix sum modulo k. Handle negative remainders by (rem % k + k) % k.',
      'Count occurrences of each remainder in a hash map or frequency array.',
    ],
    starter_code: {
      python: `def subarrays_div_by_k(credits: list[int], k: int) -> int:\n    # [AI-Generated Problem]\n    pass`,
      java: `class Solution {\n    public int subarraysDivByK(int[] credits, int k) {\n        // [AI-Generated Problem]\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int subarraysDivByK(vector<int>& credits, int k) {\n        // [AI-Generated Problem]\n        return 0;\n    }\n};`,
      typescript: `function subarraysDivByK(credits: number[], k: number): number {\n    // [AI-Generated Problem]\n    return 0;\n}`,
    },
    reference_solution: {
      python: `def subarrays_div_by_k(credits: list[int], k: int) -> int:\n    count = {0: 1}\n    prefix = 0\n    res = 0\n    for x in credits:\n        prefix = (prefix + x) % k\n        res += count.get(prefix, 0)\n        count[prefix] = count.get(prefix, 0) + 1\n    return res`,
      java: `class Solution {\n    public int subarraysDivByK(int[] credits, int k) {\n        int[] count = new int[k];\n        count[0] = 1;\n        int prefix = 0, res = 0;\n        for (int x : credits) {\n            prefix = (prefix + x % k + k) % k;\n            res += count[prefix];\n            count[prefix]++;\n        }\n        return res;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int subarraysDivByK(vector<int>& credits, int k) {\n        vector<int> count(k, 0);\n        count[0] = 1;\n        int prefix = 0, res = 0;\n        for (int x : credits) {\n            prefix = (prefix + x % k + k) % k;\n            res += count[prefix];\n            count[prefix]++;\n        }\n        return res;\n    }\n};`,
      typescript: `function subarraysDivByK(credits: number[], k: number): number {\n    const count = new Map<number, number>();\n    count.set(0, 1);\n    let prefix = 0, res = 0;\n    for (const x of credits) {\n        prefix = ((prefix + x) % k + k) % k;\n        res += count.get(prefix) || 0;\n        count.set(prefix, (count.get(prefix) || 0) + 1);\n    }\n    return res;\n}`,
    },
    time_complexity: 'O(N)',
    space_complexity: 'O(K)',
    source_attribution: 'AI-Generated Practice Problem (Synthesized for Nexathon 2026)',
    source_url: undefined,
    reported_date: undefined,
    test_cases: [
      { input: '[4, 5, 0, -2, -3, 1], 5', expectedOutput: '7' },
      { input: '[5], 9', expectedOutput: '0' },
    ],
    prerequisites: ['dsa-1'],
  },
];

/**
 * Calculates a student's mastery score (0-100) for a problem based on
 * test cases passed, hints penalty, and solution views.
 */
export function calculateProblemMastery(attempt: {
  testCasesPassed: number;
  totalTestCases: number;
  hintsUsed: number;
  viewedSolution: boolean;
  attemptsCount: number;
}): number {
  if (attempt.totalTestCases === 0) return 0;
  const passRate = attempt.testCasesPassed / attempt.totalTestCases;

  if (passRate < 1.0) {
    return Math.round(passRate * 45); // Max 45 if failing any tests
  }

  // If passed all tests:
  let score = 100;

  // Penalty for hints used (10 pts per hint)
  score -= Math.min(30, attempt.hintsUsed * 10);

  // Severe penalty if solution was viewed before solving
  if (attempt.viewedSolution) {
    score = Math.min(score, 50);
  }

  // Minor penalty for excessive attempts (>3 attempts)
  if (attempt.attemptsCount > 3) {
    score -= Math.min(15, (attempt.attemptsCount - 3) * 5);
  }

  return Math.max(10, Math.min(100, score));
}

/**
 * Adaptive Next-Problem Selector
 */
export function selectAdaptiveNextProblem(
  problems: DSAProblem[],
  attempts: Record<string, DSAAttemptRecord>,
  userTargetCompany?: string
): {
  recommendedProblem: DSAProblem;
  reason: string;
  adaptiveRuleTriggered: string;
} {
  const solvedProblemIds = Object.keys(attempts).filter((id) => attempts[id].status === 'solved');

  // Filter problems relevant to company if selected
  const candidatePool = userTargetCompany && userTargetCompany !== 'All'
    ? problems.filter((p) =>
        p.target_companies.some((c) => c.toLowerCase().includes(userTargetCompany.toLowerCase()))
      )
    : problems;

  const activePool = candidatePool.length > 0 ? candidatePool : problems;

  // Look at most recent attempt
  const recentAttempts = Object.values(attempts).sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  const lastAttempt = recentAttempts[0];

  if (lastAttempt) {
    const lastProblem = problems.find((p) => p.id === lastAttempt.problem_id);

    // Rule 1: Failed attempt -> Prerequisite or simpler concept
    if (lastAttempt.status === 'failed' || lastAttempt.mastery_score < 50) {
      if (lastProblem && lastProblem.prerequisites && lastProblem.prerequisites.length > 0) {
        const prereq = problems.find((p) => p.id === lastProblem.prerequisites![0]);
        if (prereq && (!attempts[prereq.id] || attempts[prereq.id].status !== 'solved')) {
          return {
            recommendedProblem: prereq,
            reason: `Prerequisite Reinforcement: You encountered friction on "${lastProblem.title}". Mastering this foundational prerequisite first will build necessary intuition.`,
            adaptiveRuleTriggered: 'Failure Back-Off to Prerequisite',
          };
        }
      }

      // Find an Easy problem in the same category
      const easierProblem = activePool.find(
        (p) => p.category === lastProblem?.category && p.difficulty === 'Easy' && !solvedProblemIds.includes(p.id)
      );
      if (easierProblem) {
        return {
          recommendedProblem: easierProblem,
          reason: `Confidence Builder: Step back to an accessible Easy problem in ${easierProblem.category} to solidify the foundational pattern.`,
          adaptiveRuleTriggered: 'Difficulty Step-Down on Failure',
        };
      }
    }

    // Rule 2: Solved with excessive hints -> Reinforcement problem
    if (lastAttempt.hints_used >= 2 || (lastAttempt.status === 'solved' && lastAttempt.mastery_score < 75)) {
      const reinforcementProblem = activePool.find(
        (p) =>
          p.id !== lastAttempt.problem_id &&
          (p.core_pattern === lastProblem?.core_pattern || p.category === lastProblem?.category) &&
          !solvedProblemIds.includes(p.id)
      );
      if (reinforcementProblem) {
        return {
          recommendedProblem: reinforcementProblem,
          reason: `Pattern Reinforcement: You solved "${lastProblem?.title}" with hint assistance. Solve this parallel problem independently to master the ${reinforcementProblem.core_pattern} pattern.`,
          adaptiveRuleTriggered: 'Pattern Reinforcement (Heavy Hints)',
        };
      }
    }

    // Rule 3: Independent success -> Difficulty step-up
    if (lastAttempt.status === 'solved' && lastAttempt.mastery_score >= 85) {
      const nextDifficulty = lastProblem?.difficulty === 'Easy' ? 'Medium' : 'Hard';
      const harderProblem = activePool.find(
        (p) =>
          p.difficulty === nextDifficulty &&
          !solvedProblemIds.includes(p.id)
      );
      if (harderProblem) {
        return {
          recommendedProblem: harderProblem,
          reason: `Mastery Progression: High score (${lastAttempt.mastery_score}%) on previous challenge. Stepping up to a ${nextDifficulty} problem to advance your placement readiness.`,
          adaptiveRuleTriggered: 'Independent Success Difficulty Step-Up',
        };
      }
    }
  }

  // Fallback: next unsolved high-frequency problem
  const unsolvedHighFreq = activePool.find(
    (p) => !solvedProblemIds.includes(p.id) && (p.frequency === 'Critical' || p.frequency === 'Very High')
  ) || activePool.find((p) => !solvedProblemIds.includes(p.id)) || activePool[0];

  return {
    recommendedProblem: unsolvedHighFreq,
    reason: `Strategic Priority: Frequently reported across campus placement interview screening rounds.`,
    adaptiveRuleTriggered: 'High-Yield Placement Priority',
  };
}
