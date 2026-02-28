import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getEmotionStats } from '../journal/actions';
import Link from 'next/link';

const EMOTION_META: Record<string, { emoji: string; color: string; label: string }> = {
  joy: { emoji: '☀️', color: '#fbbf24', label: 'Joy' },
  calm: { emoji: '🌊', color: '#a78bfa', label: 'Calm' },
  gratitude: { emoji: '🙏', color: '#34d399', label: 'Gratitude' },
  hope: { emoji: '🌱', color: '#60a5fa', label: 'Hope' },
  neutral: { emoji: '😐', color: '#9ca3af', label: 'Neutral' },
  anxious: { emoji: '😰', color: '#f97316', label: 'Anxious' },
  sad: { emoji: '💧', color: '#6366f1', label: 'Sad' },
  frustrated: { emoji: '😤', color: '#ef4444', label: 'Frustrated' },
  angry: { emoji: '🔥', color: '#dc2626', label: 'Angry' },
  overwhelmed: { emoji: '🌀', color: '#8b5cf6', label: 'Overwhelmed' }
};

function buildLast30Days() {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function calculateStreak(entries: any[]) {
  if (!entries.length) return 0;
  const dates = entries.map((e: any) => new Date(e.created_at).toISOString().split('T')[0]);
  const unique = Array.from(new Set(dates)).sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = today;

  for (const date of unique) {
    if (date === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

function getMostFrequentEmotion(logs: any[]) {
  if (!logs.length) return null;
  const counts: Record<string, number> = {};
  for (const log of logs) {
    counts[log.emotion] = (counts[log.emotion] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export default async function InsightsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/signin');
  }

  const { logs, entries } = await getEmotionStats();

  const last30Days = buildLast30Days();
  const streak = calculateStreak(entries);
  const mostFrequent = getMostFrequentEmotion(logs);
  const mostFrequentMeta = mostFrequent ? EMOTION_META[mostFrequent] : null;

  // Build a map of date -> first emotion log
  const dayEmotionMap: Record<string, string> = {};
  for (const log of logs) {
    const day = new Date(log.logged_at).toISOString().split('T')[0];
    if (!dayEmotionMap[day]) {
      dayEmotionMap[day] = log.emotion;
    }
  }

  const hasData = logs.length > 0 || entries.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Your Mood Over Time</h1>
          <p className="text-zinc-500 text-sm">Last 30 days at a glance.</p>
        </div>

        {!hasData ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-5">🌱</div>
            <p className="text-zinc-300 text-lg font-medium mb-2">No data yet.</p>
            <p className="text-zinc-500 text-sm mb-8">
              Start journaling to see your emotional patterns here.
            </p>
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all"
            >
              Write your first entry →
            </Link>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">
                Mood Timeline
              </p>
              <div className="flex flex-wrap gap-1.5">
                {last30Days.map((day) => {
                  const emotion = dayEmotionMap[day];
                  const meta = emotion ? EMOTION_META[emotion] : null;
                  const dayNum = new Date(day + 'T12:00:00').getDate();
                  const isToday = day === new Date().toISOString().split('T')[0];

                  return (
                    <div key={day} className="group relative" title={`${day}${meta ? ': ' + meta.label : ''}`}>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform group-hover:scale-125"
                        style={{
                          backgroundColor: meta ? meta.color + '33' : 'rgb(39 39 42)',
                          border: isToday
                            ? '2px solid rgba(167,139,250,0.6)'
                            : `1px solid ${meta ? meta.color + '44' : 'rgb(63 63 70)'}`
                        }}
                      >
                        {meta ? (
                          <span className="text-xs leading-none">{meta.emoji}</span>
                        ) : (
                          <span className="text-zinc-700 text-xs font-medium">{dayNum}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Emotion legend */}
              <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-wrap gap-x-4 gap-y-2">
                {Object.entries(EMOTION_META).map(([id, meta]) => (
                  <div key={id} className="flex items-center gap-1.5">
                    <span className="text-xs">{meta.emoji}</span>
                    <span className="text-zinc-500 text-xs">{meta.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {/* Total Entries */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-center">
                <p className="text-3xl font-bold text-white mb-1">{entries.length}</p>
                <p className="text-zinc-500 text-xs">Total Entries</p>
              </div>

              {/* Streak */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-center">
                <p className="text-3xl font-bold text-amber-400 mb-1">{streak}</p>
                <p className="text-zinc-500 text-xs">Day Streak 🔥</p>
              </div>

              {/* Most frequent */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-center">
                {mostFrequentMeta ? (
                  <>
                    <p className="text-3xl mb-1">{mostFrequentMeta.emoji}</p>
                    <p className="text-zinc-500 text-xs">{mostFrequentMeta.label}</p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-1">—</p>
                    <p className="text-zinc-500 text-xs">Top Emotion</p>
                  </>
                )}
              </div>
            </div>

            {/* Emotion breakdown */}
            {logs.length > 0 && (
              <div className="mt-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">
                  Emotion Breakdown (30 days)
                </p>
                <div className="space-y-3">
                  {Object.entries(EMOTION_META).map(([id, meta]) => {
                    const count = logs.filter((l: any) => l.emotion === id).length;
                    if (count === 0) return null;
                    const pct = Math.round((count / logs.length) * 100);
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <span className="text-sm w-5">{meta.emoji}</span>
                        <span className="text-zinc-400 text-xs w-20 flex-shrink-0">{meta.label}</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <span className="text-zinc-500 text-xs w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
