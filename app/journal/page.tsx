import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';
import { getEntries } from './actions';
import Link from 'next/link';

const EMOTION_META: Record<string, { emoji: string; color: string }> = {
  joy: { emoji: '☀️', color: '#fbbf24' },
  calm: { emoji: '🌊', color: '#a78bfa' },
  gratitude: { emoji: '🙏', color: '#34d399' },
  hope: { emoji: '🌱', color: '#60a5fa' },
  neutral: { emoji: '😐', color: '#9ca3af' },
  anxious: { emoji: '😰', color: '#f97316' },
  sad: { emoji: '💧', color: '#6366f1' },
  frustrated: { emoji: '😤', color: '#ef4444' },
  angry: { emoji: '🔥', color: '#dc2626' },
  overwhelmed: { emoji: '🌀', color: '#8b5cf6' }
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(text: string, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export default async function JournalPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/signin');
  }

  const entries = await getEntries();

  const todayEntries = entries.filter(
    (e: any) => new Date(e.created_at).toDateString() === new Date().toDateString()
  );
  const olderEntries = entries.filter(
    (e: any) => new Date(e.created_at).toDateString() !== new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Journal</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {entries.length === 0
                ? 'Your private space to reflect.'
                : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
            </p>
          </div>
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all shadow-lg shadow-violet-500/20"
          >
            <span className="text-base leading-none">+</span> New Entry
          </Link>
        </div>

        {entries.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="text-5xl mb-5">🌱</div>
            <p className="text-zinc-300 text-lg font-medium mb-2">Nothing here yet.</p>
            <p className="text-zinc-500 text-sm mb-8">
              Your journal is a quiet place for honest thoughts.
            </p>
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium text-sm transition-all"
            >
              Write your first entry →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Today's entries */}
            {todayEntries.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                  Today
                </p>
                <div className="space-y-3">
                  {todayEntries.map((entry: any) => {
                    const emotionLog = entry.emotion_logs?.[0];
                    const emotionMeta = emotionLog ? EMOTION_META[emotionLog.emotion] : null;
                    return (
                      <Link
                        key={entry.id}
                        href={`/journal/${entry.id}`}
                        className="block rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate">
                              {entry.title || 'Untitled'}
                            </p>
                            <p className="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">
                              {truncate(entry.content)}
                            </p>
                          </div>
                          {emotionMeta && (
                            <span
                              className="text-xl leading-none flex-shrink-0 mt-0.5"
                              title={emotionLog.emotion}
                            >
                              {emotionMeta.emoji}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Older entries */}
            {olderEntries.length > 0 && (
              <section>
                {todayEntries.length > 0 && (
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                    Earlier
                  </p>
                )}
                <div className="space-y-3">
                  {olderEntries.map((entry: any) => {
                    const emotionLog = entry.emotion_logs?.[0];
                    const emotionMeta = emotionLog ? EMOTION_META[emotionLog.emotion] : null;
                    return (
                      <Link
                        key={entry.id}
                        href={`/journal/${entry.id}`}
                        className="block rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-4 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-white text-sm truncate">
                                {entry.title || 'Untitled'}
                              </p>
                              {entry.is_favorite && (
                                <span className="text-amber-400 text-xs">★</span>
                              )}
                            </div>
                            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                              {truncate(entry.content)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {emotionMeta && (
                              <span className="text-xl leading-none" title={emotionLog.emotion}>
                                {emotionMeta.emoji}
                              </span>
                            )}
                            <span className="text-zinc-600 text-xs">
                              {formatDate(entry.created_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
