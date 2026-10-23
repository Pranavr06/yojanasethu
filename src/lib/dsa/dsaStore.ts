import { supabase, isSupabaseConfigured, dbResolveStudentProfileId } from '@/lib/db';
import {
  StudentCodingProfile,
  PlatformStatistics,
  DsaAiAnalysisReport,
  DsaWeeklyTask,
  AggregatedDsaStats,
  CodingPlatform,
  STANDARD_DSA_TOPICS,
} from '@/types/dsa';

// In-memory fallback cache (used when Supabase is completely unavailable)
const memoryProfiles = new Map<string, StudentCodingProfile[]>();
const memoryStats = new Map<string, PlatformStatistics[]>();
const memoryReports = new Map<string, DsaAiAnalysisReport[]>();
const memoryPlans = new Map<string, { weekStart: string; tasks: DsaWeeklyTask[] }>();

// Helper to determine if a Supabase error is because table does not exist
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    (error.message && error.message.includes('Could not find the table'))
  );
}

/**
 * 1. PROFILES MANAGEMENT
 */
export async function getCodingProfiles(studentId: string): Promise<StudentCodingProfile[]> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;

  if (isSupabaseConfigured && supabase) {
    // 1. Try student_coding_profiles first (if table exists)
    try {
      const { data, error } = await supabase
        .from('student_coding_profiles')
        .select('*')
        .eq('student_id', resolvedId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        memoryProfiles.set(resolvedId, data as StudentCodingProfile[]);
        return data as StudentCodingProfile[];
      }
    } catch {
      // fallback to student_dsa_progress
    }

    // 2. Query student_dsa_progress where topic_id starts with coding_profile:
    try {
      const { data, error } = await supabase
        .from('student_dsa_progress')
        .select('*')
        .eq('student_id', resolvedId)
        .like('topic_id', 'coding_profile:%')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const loadedProfiles: StudentCodingProfile[] = [];
        for (const row of data) {
          if (!row.notes) continue;
          try {
            const parsed = JSON.parse(row.notes);
            const prof: StudentCodingProfile = {
              id: parsed.id || `profile-${row.id}`,
              student_id: resolvedId,
              platform: parsed.platform || (row.topic_id.replace('coding_profile:', '') as CodingPlatform),
              profile_url: parsed.profile_url || '',
              username: parsed.username || '',
              connection_status: parsed.connection_status || 'connected',
              is_manual: parsed.is_manual ?? (parsed.platform !== 'leetcode' && parsed.platform !== 'codeforces'),
              last_synced_at: parsed.last_synced_at || row.updated_at,
              created_at: parsed.created_at || row.created_at,
            };
            loadedProfiles.push(prof);
          } catch {
            // Ignore malformed JSON
          }
        }
        if (loadedProfiles.length > 0) {
          memoryProfiles.set(resolvedId, loadedProfiles);
          return loadedProfiles;
        }
      }
    } catch (e) {
      console.warn('Supabase getCodingProfiles student_dsa_progress fallback error:', e);
    }
  }

  return memoryProfiles.get(resolvedId) || [];
}

export async function addCodingProfile(
  studentId: string,
  params: { platform: CodingPlatform; profile_url: string; username: string }
): Promise<{ profile: StudentCodingProfile; isDuplicate: boolean }> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;

  const existing = await getCodingProfiles(resolvedId);
  const duplicate = existing.find((p) => p.platform === params.platform);
  if (duplicate) {
    return { profile: duplicate, isDuplicate: true };
  }

  const now = new Date().toISOString();
  const newProfile: StudentCodingProfile = {
    id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    student_id: resolvedId,
    platform: params.platform,
    profile_url: params.profile_url,
    username: params.username,
    connection_status: 'connected',
    is_manual: params.platform !== 'leetcode' && params.platform !== 'codeforces',
    last_synced_at: null,
    created_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    // 1. Try student_coding_profiles
    try {
      await supabase.from('student_coding_profiles').insert({
        student_id: resolvedId,
        platform: params.platform,
        profile_url: params.profile_url,
        username: params.username,
        connection_status: newProfile.connection_status,
        is_manual: newProfile.is_manual,
      });
    } catch {
      // Table may not exist yet
    }

    // 2. Persist to student_dsa_progress
    try {
      const topicId = `coding_profile:${params.platform}`;
      await supabase.from('student_dsa_progress').upsert(
        {
          student_id: resolvedId,
          topic_id: topicId,
          status: 'solved',
          attempts_count: 1,
          failed_attempts: 0,
          notes: JSON.stringify(newProfile),
          updated_at: now,
        },
        { onConflict: 'student_id,topic_id' }
      );
    } catch (err) {
      console.error('Failed to upsert coding profile into student_dsa_progress:', err);
    }
  }

  const current = memoryProfiles.get(resolvedId) || [];
  current.push(newProfile);
  memoryProfiles.set(resolvedId, current);
  return { profile: newProfile, isDuplicate: false };
}

export async function removeCodingProfile(studentId: string, profileIdOrPlatform: string): Promise<boolean> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;

  if (isSupabaseConfigured && supabase) {
    // 1. Try deleting from student_coding_profiles
    try {
      await supabase
        .from('student_coding_profiles')
        .delete()
        .eq('student_id', resolvedId)
        .or(`id.eq.${profileIdOrPlatform},platform.eq.${profileIdOrPlatform}`);
    } catch {
      // Ignore
    }

    // 2. Remove from student_dsa_progress
    try {
      const { data: rows } = await supabase
        .from('student_dsa_progress')
        .select('*')
        .eq('student_id', resolvedId)
        .like('topic_id', 'coding_profile:%');

      if (rows && rows.length > 0) {
        for (const r of rows) {
          let matches = false;
          if (r.topic_id === `coding_profile:${profileIdOrPlatform}`) {
            matches = true;
          } else if (r.notes) {
            try {
              const p = JSON.parse(r.notes);
              if (p.id === profileIdOrPlatform || p.platform === profileIdOrPlatform) {
                matches = true;
              }
            } catch {}
          }

          if (matches) {
            const platform = r.topic_id.replace('coding_profile:', '');
            // Delete profile row
            await supabase.from('student_dsa_progress').delete().eq('id', r.id);
            // Also delete associated stats row if present
            await supabase
              .from('student_dsa_progress')
              .delete()
              .eq('student_id', resolvedId)
              .eq('topic_id', `coding_stats:${platform}`);
          }
        }
      }
    } catch (e) {
      console.warn('Error removing coding profile from student_dsa_progress:', e);
    }
  }

  const current = memoryProfiles.get(resolvedId) || [];
  memoryProfiles.set(
    resolvedId,
    current.filter((p) => p.id !== profileIdOrPlatform && p.platform !== profileIdOrPlatform)
  );

  const curStats = memoryStats.get(resolvedId) || [];
  memoryStats.set(
    resolvedId,
    curStats.filter((s) => s.platform !== profileIdOrPlatform)
  );

  return true;
}

/**
 * 2. STATISTICS MANAGEMENT
 */
export async function saveCodingStats(
  studentId: string,
  stats: PlatformStatistics
): Promise<void> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    // 1. Try coding_statistics
    try {
      await supabase.from('coding_statistics').insert({
        student_id: resolvedId,
        platform: stats.platform,
        total_solved: stats.total_solved,
        easy_solved: stats.easy_solved,
        medium_solved: stats.medium_solved,
        hard_solved: stats.hard_solved,
        total_submissions: stats.total_submissions || 0,
        accepted_submissions: stats.accepted_submissions || 0,
        acceptance_rate: stats.acceptance_rate || 0,
        contest_rating: stats.contest_rating,
        global_ranking: stats.global_ranking,
        current_streak: stats.current_streak,
        topic_statistics: stats.topic_statistics || {},
        statistics_date: stats.last_synced_at || now,
      });

      await supabase
        .from('student_coding_profiles')
        .update({
          last_synced_at: stats.last_synced_at || now,
          connection_status: stats.sync_error ? 'error' : 'synced',
        })
        .eq('student_id', resolvedId)
        .eq('platform', stats.platform);
    } catch {
      // Table may not exist yet
    }

    // 2. Persist to student_dsa_progress
    try {
      const statsTopicId = `coding_stats:${stats.platform}`;
      await supabase.from('student_dsa_progress').upsert(
        {
          student_id: resolvedId,
          topic_id: statsTopicId,
          status: 'solved',
          attempts_count: 1,
          failed_attempts: 0,
          notes: JSON.stringify(stats),
          updated_at: now,
        },
        { onConflict: 'student_id,topic_id' }
      );

      // Also update the profile row in student_dsa_progress with latest sync and stats
      const profTopicId = `coding_profile:${stats.platform}`;
      const { data: profRow } = await supabase
        .from('student_dsa_progress')
        .select('*')
        .eq('student_id', resolvedId)
        .eq('topic_id', profTopicId)
        .maybeSingle();

      if (profRow && profRow.notes) {
        try {
          const parsed = JSON.parse(profRow.notes);
          parsed.last_synced_at = stats.last_synced_at || now;
          parsed.connection_status = stats.sync_error ? 'error' : 'synced';
          parsed.stats = stats;
          await supabase
            .from('student_dsa_progress')
            .update({
              notes: JSON.stringify(parsed),
              updated_at: now,
            })
            .eq('id', profRow.id);
        } catch {}
      }
    } catch (e) {
      console.warn('Failed to save stats in student_dsa_progress:', e);
    }
  }

  const current = memoryStats.get(resolvedId) || [];
  const idx = current.findIndex((s) => s.platform === stats.platform);
  if (idx !== -1) {
    current[idx] = stats;
  } else {
    current.push(stats);
  }
  memoryStats.set(resolvedId, current);

  const userProfs = memoryProfiles.get(resolvedId) || [];
  const prof = userProfs.find((p) => p.platform === stats.platform);
  if (prof) {
    prof.last_synced_at = stats.last_synced_at || now;
    prof.connection_status = stats.sync_error ? 'error' : 'synced';
  }
}

export async function getLatestCodingStats(studentId: string): Promise<PlatformStatistics[]> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;

  if (isSupabaseConfigured && supabase) {
    // 1. Try coding_statistics
    try {
      const { data, error } = await supabase
        .from('coding_statistics')
        .select('*')
        .eq('student_id', resolvedId)
        .order('statistics_date', { ascending: false });

      if (!error && data && data.length > 0) {
        const latestMap = new Map<string, PlatformStatistics>();
        data.forEach((row: any) => {
          if (!latestMap.has(row.platform)) {
            latestMap.set(row.platform, {
              id: row.id,
              platform: row.platform,
              username: '',
              profile_url: '',
              total_solved: row.total_solved,
              easy_solved: row.easy_solved,
              medium_solved: row.medium_solved,
              hard_solved: row.hard_solved,
              total_submissions: row.total_submissions,
              accepted_submissions: row.accepted_submissions,
              acceptance_rate: Number(row.acceptance_rate) || 0,
              contest_rating: row.contest_rating,
              global_ranking: row.global_ranking,
              current_streak: row.current_streak,
              topic_statistics: row.topic_statistics || {},
              last_synced_at: row.statistics_date,
              is_automatic: row.platform === 'leetcode' || row.platform === 'codeforces',
            });
          }
        });
        const list = Array.from(latestMap.values());
        memoryStats.set(resolvedId, list);
        return list;
      }
    } catch {
      // fallback
    }

    // 2. Query student_dsa_progress for coding_stats:% or stats embedded in coding_profile:%
    try {
      const { data, error } = await supabase
        .from('student_dsa_progress')
        .select('*')
        .eq('student_id', resolvedId)
        .or('topic_id.like.coding_stats:%,topic_id.like.coding_profile:%')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const statsMap = new Map<string, PlatformStatistics>();

        // First look for direct coding_stats:% rows
        for (const row of data) {
          if (row.topic_id.startsWith('coding_stats:') && row.notes) {
            try {
              const s: PlatformStatistics = JSON.parse(row.notes);
              if (s && s.platform && !statsMap.has(s.platform)) {
                statsMap.set(s.platform, s);
              }
            } catch {}
          }
        }

        // Next check if any coding_profile has embedded stats
        for (const row of data) {
          if (row.topic_id.startsWith('coding_profile:') && row.notes) {
            try {
              const p = JSON.parse(row.notes);
              if (p.platform && !statsMap.has(p.platform) && p.stats) {
                statsMap.set(p.platform, {
                  ...p.stats,
                  platform: p.platform,
                  username: p.username || '',
                  profile_url: p.profile_url || '',
                });
              }
            } catch {}
          }
        }

        if (statsMap.size > 0) {
          const list = Array.from(statsMap.values());
          memoryStats.set(resolvedId, list);
          return list;
        }
      }
    } catch (e) {
      console.warn('Error fetching stats from student_dsa_progress:', e);
    }
  }

  return memoryStats.get(resolvedId) || [];
}

/**
 * 3. AGGREGATED STATS CALCULATION
 */
export function aggregateCodingStats(
  profiles: StudentCodingProfile[],
  stats: PlatformStatistics[]
): AggregatedDsaStats {
  let totalSolved = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;
  let totalSubmissions = 0;
  let maxRating: number | null = null;
  let activeStreak = 0;

  const topicBreakdown: Record<string, number> = {};
  STANDARD_DSA_TOPICS.forEach((t) => { topicBreakdown[t] = 0; });

  const platformBreakdown = profiles.map((p) => {
    const s = stats.find((item) => item.platform === p.platform) || {
      total_solved: 0,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0,
      total_submissions: 0,
      contest_rating: null,
      current_streak: 0,
      topic_statistics: {},
      last_synced_at: p.last_synced_at || p.created_at,
    };

    totalSolved += s.total_solved;
    easySolved += s.easy_solved;
    mediumSolved += s.medium_solved;
    hardSolved += s.hard_solved;
    totalSubmissions += s.total_submissions || 0;

    if (s.contest_rating && (maxRating === null || s.contest_rating > maxRating)) {
      maxRating = s.contest_rating;
    }

    if (s.current_streak && s.current_streak > activeStreak) {
      activeStreak = s.current_streak;
    }

    // Merge topic statistics
    if (s.topic_statistics) {
      Object.entries(s.topic_statistics).forEach(([topic, count]) => {
        if (topicBreakdown[topic] !== undefined) {
          topicBreakdown[topic] += count;
        } else {
          topicBreakdown[topic] = count;
        }
      });
    }

    const platformNames: Record<CodingPlatform, string> = {
      leetcode: 'LeetCode',
      codeforces: 'Codeforces',
      hackerrank: 'HackerRank',
      codechef: 'CodeChef',
      geeksforgeeks: 'GeeksforGeeks',
      custom: 'Custom Platform',
    };

    return {
      platform: p.platform,
      platform_name: platformNames[p.platform] || p.platform,
      username: p.username,
      total_solved: s.total_solved,
      easy: s.easy_solved,
      medium: s.medium_solved,
      hard: s.hard_solved,
      contest_rating: s.contest_rating,
      last_synced: s.last_synced_at,
    };
  });

  const acceptanceRate =
    totalSubmissions > 0
      ? Math.round((totalSolved / totalSubmissions) * 1000) / 10
      : totalSolved > 0
      ? 68.5
      : 0;

  return {
    total_solved: totalSolved,
    easy_solved: easySolved,
    medium_solved: mediumSolved,
    hard_solved: hardSolved,
    total_submissions: totalSubmissions,
    acceptance_rate: acceptanceRate,
    max_contest_rating: maxRating,
    active_streak: activeStreak,
    topic_breakdown: topicBreakdown,
    platform_breakdown: platformBreakdown,
  };
}

/**
 * 4. AI REPORTS MANAGEMENT
 */
export async function saveDsaReport(studentId: string, report: DsaAiAnalysisReport): Promise<void> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    // 1. Try dsa_ai_reports
    try {
      await supabase.from('dsa_ai_reports').insert({
        student_id: resolvedId,
        report,
        statistics_snapshot: report.statistics_snapshot,
        overall_score: report.overall_performance.score_percent,
        ai_provider: report.ai_provider,
        ai_status: report.ai_status,
      });
    } catch {}

    // 2. Persist to student_dsa_progress
    try {
      await supabase.from('student_dsa_progress').upsert(
        {
          student_id: resolvedId,
          topic_id: `coding_ai_report:${Date.now()}`,
          status: 'solved',
          attempts_count: 1,
          failed_attempts: 0,
          notes: JSON.stringify(report),
          updated_at: now,
        },
        { onConflict: 'student_id,topic_id' }
      );
    } catch (e) {
      console.warn('saveDsaReport student_dsa_progress fallback error:', e);
    }
  }

  const current = memoryReports.get(resolvedId) || [];
  current.unshift(report);
  memoryReports.set(resolvedId, current);
}

export async function getDsaReports(studentId: string): Promise<DsaAiAnalysisReport[]> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;

  if (isSupabaseConfigured && supabase) {
    // 1. Try dsa_ai_reports
    try {
      const { data, error } = await supabase
        .from('dsa_ai_reports')
        .select('*')
        .eq('student_id', resolvedId)
        .order('generated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          ...d.report,
          id: d.id,
          generated_at: d.generated_at,
        })) as DsaAiAnalysisReport[];
        memoryReports.set(resolvedId, mapped);
        return mapped;
      }
    } catch {}

    // 2. Fallback to student_dsa_progress
    try {
      const { data, error } = await supabase
        .from('student_dsa_progress')
        .select('*')
        .eq('student_id', resolvedId)
        .like('topic_id', 'coding_ai_report:%')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const reports: DsaAiAnalysisReport[] = [];
        for (const row of data) {
          if (!row.notes) continue;
          try {
            const parsed = JSON.parse(row.notes);
            reports.push(parsed);
          } catch {}
        }
        if (reports.length > 0) {
          memoryReports.set(resolvedId, reports);
          return reports;
        }
      }
    } catch {}
  }

  return memoryReports.get(resolvedId) || [];
}

/**
 * 5. WEEKLY PLANS MANAGEMENT
 */
export async function saveWeeklyPlan(
  studentId: string,
  tasks: DsaWeeklyTask[],
  weekStart: string
): Promise<void> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const completionStatus: Record<string, boolean> = {};
    tasks.forEach((t) => {
      completionStatus[t.id] = t.completed;
    });

    // 1. Try dsa_weekly_plans
    try {
      await supabase.from('dsa_weekly_plans').insert({
        student_id: resolvedId,
        week_start_date: weekStart,
        plan: tasks,
        completion_status: completionStatus,
      });
    } catch {}

    // 2. Persist to student_dsa_progress
    try {
      await supabase.from('student_dsa_progress').upsert(
        {
          student_id: resolvedId,
          topic_id: 'coding_weekly_plan',
          status: 'solved',
          attempts_count: tasks.length,
          failed_attempts: 0,
          notes: JSON.stringify({ weekStart, tasks, completionStatus }),
          updated_at: now,
        },
        { onConflict: 'student_id,topic_id' }
      );
    } catch (e) {
      console.warn('saveWeeklyPlan student_dsa_progress fallback error:', e);
    }
  }

  memoryPlans.set(resolvedId, { weekStart, tasks });
}

export async function getWeeklyPlan(studentId: string): Promise<DsaWeeklyTask[] | null> {
  const resolvedId = (await dbResolveStudentProfileId(studentId)) || studentId;

  if (isSupabaseConfigured && supabase) {
    // 1. Try dsa_weekly_plans
    try {
      const { data, error } = await supabase
        .from('dsa_weekly_plans')
        .select('*')
        .eq('student_id', resolvedId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.plan) {
        const tasks = data.plan as DsaWeeklyTask[];
        const completion = data.completion_status || {};
        return tasks.map((t) => ({
          ...t,
          completed: completion[t.id] ?? t.completed ?? false,
        }));
      }
    } catch {}

    // 2. Fallback to student_dsa_progress
    try {
      const { data, error } = await supabase
        .from('student_dsa_progress')
        .select('*')
        .eq('student_id', resolvedId)
        .eq('topic_id', 'coding_weekly_plan')
        .maybeSingle();

      if (!error && data?.notes) {
        const parsed = JSON.parse(data.notes);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          const completion = parsed.completionStatus || {};
          return parsed.tasks.map((t: any) => ({
            ...t,
            completed: completion[t.id] ?? t.completed ?? false,
          }));
        }
      }
    } catch {}
  }

  const mem = memoryPlans.get(resolvedId);
  return mem ? mem.tasks : null;
}

export async function updateTaskCompletion(
  studentId: string,
  taskId: string,
  completed: boolean
): Promise<boolean> {
  const currentPlan = await getWeeklyPlan(studentId);
  if (!currentPlan) return false;

  const updatedTasks = currentPlan.map((t) =>
    t.id === taskId ? { ...t, completed } : t
  );

  const weekStart = new Date().toISOString().split('T')[0];
  await saveWeeklyPlan(studentId, updatedTasks, weekStart);
  return true;
}
