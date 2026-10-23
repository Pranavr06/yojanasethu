// ============================================================================
// Adaptive DSA Problem Catalog & Recommendation Engine
// ============================================================================

import { DSAProblem, DSAAttemptRecord } from '@/types';

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
      'Consider the brute force $O(N^2)$ approach comparing every pair. How can we check if the complement `target - x` exists in $O(1)$ time?',
      'Use a Hash Map storing `val -> index` as you iterate over the array.',
      'Check if `target - nums[i]` is in the map before inserting `nums[i]`. If found, return `[map[target - nums[i]], i]`.',
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
      'Keep a running sum `currentSum`. At each element, decide whether to add `nums[i]` to `currentSum` or start a fresh subarray at `nums[i]`.',
      'Formula: `currentSum = max(nums[i], currentSum + nums[i])`; `maxSum = max(maxSum, currentSum)`.',
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
      'Think of a window `[left, right]`. Expand `right` until you hit a duplicate character.',
      'When a duplicate is encountered, advance `left` past the previous occurrence of that character.',
      'A Hash Map storing character to its latest index lets you jump `left = max(left, last_idx + 1)` in $O(1)$ time.',
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

  // --------------------------------------------------------------------------
  // 3. FREQUENTLY REPORTED TOPICS: TWO POINTERS & LINKED LISTS
  // --------------------------------------------------------------------------
  {
    id: 'dsa-6',
    title: 'Reverse Linked List & Detect Cycle (Floyd’s)',
    category: 'Linked Lists',
    difficulty: 'Easy',
    frequency: 'Critical',
    core_pattern: 'Fast & Slow Pointers / In-Place Pointer Swapping',
    category_type: 'frequently_reported',
    target_companies: ['Tier 1 & Tier 2 Campus Drives', 'Infosys', 'TCS', 'Cognizant'],
    target_role: 'Associate Software Engineer / Developer',
    statement:
      'Given the `head` of a singly linked list, reverse the list in-place and return the reversed list. Also determine if a cycle exists using $O(1)$ memory.',
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
      'Maintain three pointers: `prev = None`, `curr = head`, and `next_temp`.',
      'At each iteration: store `next_temp = curr.next`, set `curr.next = prev`, then advance `prev = curr`, `curr = next_temp`.',
      'Return `prev` as the new head.',
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

  // --------------------------------------------------------------------------
  // 4. DYNAMIC PROGRAMMING: 0/1 KNAPSACK & COIN CHANGE
  // --------------------------------------------------------------------------
  {
    id: 'dsa-16',
    title: 'Coin Change Problem (Minimum Coins)',
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
      'Define `dp[i]` as the minimum coins needed to form amount `i`. Initialize with infinity.',
      'Base case: `dp[0] = 0`.',
      'For each amount `i` from 1 to `amount` and each coin `c`: `if i >= c: dp[i] = min(dp[i], 1 + dp[i - c])`.',
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

  // --------------------------------------------------------------------------
  // 5. AI-GENERATED PRACTICE (EXPLICITLY LABELED)
  // --------------------------------------------------------------------------
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
      'If two prefix sums have the exact same remainder when divided by `k`, what does that mean about the sub-sequence between them?',
      'Keep a running prefix sum modulo `k`. Handle negative remainders by `(rem % k + k) % k`.',
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
 * Rules:
 * 1. If last attempt was 'failed' or mastery < 50: recommend a prerequisite or easier problem in the same category.
 * 2. If solved with heavy hints (hints >= 2 or mastery < 75): recommend a reinforcement problem with the same core pattern.
 * 3. If solved independently (mastery >= 85): increment difficulty (Easy -> Medium, Medium -> Hard) or advance to next topic.
 * 4. Never repeat already mastered problems unless scheduled for spaced revision.
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
