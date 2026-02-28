import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect, notFound } from 'next/navigation';
import { getEntry, toggleFavorite } from '../actions';
import DeleteButton from './DeleteButton';
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

interface Props {
  params: { id: string };
}

export default async function EntryDetailPage({ params }: Props) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/signin');
  }

  const entry = await getEntry(params.id);

  if (!entry) {
    notFound();
  }

  const emotionLog = entry.emotion_logs?.[0];
  const emotionMeta = emotionLog ? EMOTION_META[emotionLog.emotion] : null;

  async function handleToggleFavorite() {
    'use server';
    await toggleFavorite(entry.id, entry.is_favorite ?? false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        <Link
          href="/journal"
          className="inline-flex items-center text-zinc-500 hover:text-zinc-300 text-sm mb-8 transition-colors"
        >
          ← Back to Journal
        </Link>

        {/* Entry card */}
        <article className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-zinc-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-zinc-500 text-xs mb-1">
                  {formatDate(entry.created_at)}
                </p>
                <h1 className="text-xl font-bold text-white">
                  {entry.title || 'Untitled Entry'}
                </h1>
              </div>
              {/* Favorite toggle */}
              <form action={handleToggleFavorite}>
                <button
                  type="submit"
                  className="text-2xl hover:scale-110 transition-transform leading-none"
                  title={entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <span style={{ color: entry.is_favorite ? '#fbbf24' : '#3f3f46' }}>
                    {entry.is_favorite ? '★' : '☆'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Emotion badge */}
          {emotionMeta && (
            <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  backgroundColor: emotionMeta.color + '22',
                  border: `1px solid ${emotionMeta.color}44`
                }}
              >
                {emotionMeta.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: emotionMeta.color }}>
                  {emotionMeta.label}
                </p>
                {emotionLog?.intensity && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(emotionLog.intensity / 10) * 100}%`,
                          backgroundColor: emotionMeta.color
                        }}
                      />
                    </div>
                    <span className="text-zinc-500 text-xs">{emotionLog.intensity}/10</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">
              {entry.content}
            </p>
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="px-6 pb-5 flex flex-wrap gap-2">
              {entry.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-5 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-600">
              {/* Edit is future feature */}
            </span>
            <DeleteButton id={entry.id} />
          </div>
        </article>
      </div>
    </div>
  );
}
