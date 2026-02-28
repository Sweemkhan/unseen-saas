'use client';

import { useState } from 'react';
import { createEntry } from '../actions';
import Link from 'next/link';

const EMOTIONS = [
  { id: 'joy', emoji: '☀️', label: 'Joy' },
  { id: 'calm', emoji: '🌊', label: 'Calm' },
  { id: 'gratitude', emoji: '🙏', label: 'Gratitude' },
  { id: 'hope', emoji: '🌱', label: 'Hope' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'sad', emoji: '💧', label: 'Sad' },
  { id: 'frustrated', emoji: '😤', label: 'Frustrated' },
  { id: 'angry', emoji: '🔥', label: 'Angry' },
  { id: 'overwhelmed', emoji: '🌀', label: 'Overwhelmed' }
];

const EMOTION_COLORS: Record<string, string> = {
  joy: '#fbbf24',
  calm: '#a78bfa',
  gratitude: '#34d399',
  hope: '#60a5fa',
  neutral: '#9ca3af',
  anxious: '#f97316',
  sad: '#6366f1',
  frustrated: '#ef4444',
  angry: '#dc2626',
  overwhelmed: '#8b5cf6'
};

export default function NewEntryForm() {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [intensity, setIntensity] = useState(5);
  const [pending, setPending] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/journal"
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">New Entry</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <form
          action={async (formData: FormData) => {
            formData.set('emotion', selectedEmotion);
            formData.set('intensity', String(intensity));
            setPending(true);
            await createEntry(formData);
          }}
          className="space-y-7"
        >
          {/* Title (optional) */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">
              Title <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              name="title"
              type="text"
              placeholder="Give this entry a name..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">
              What&apos;s on your mind today?
            </label>
            <textarea
              name="content"
              required
              rows={7}
              placeholder="Write freely. This is your private space. There's no right or wrong..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Emotion Picker */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {EMOTIONS.map((e) => {
                const isSelected = selectedEmotion === e.id;
                const color = EMOTION_COLORS[e.id];
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEmotion(e.id)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 transition-all duration-150 text-center"
                    style={{
                      borderColor: isSelected ? color + '80' : 'rgb(39 39 42)',
                      backgroundColor: isSelected ? color + '15' : 'rgb(24 24 27)'
                    }}
                  >
                    <span className="text-xl leading-none">{e.emoji}</span>
                    <span
                      className="text-xs font-medium leading-none"
                      style={{ color: isSelected ? color : '#71717a' }}
                    >
                      {e.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          {selectedEmotion && (
            <div>
              <label className="block text-zinc-400 text-sm font-medium mb-3">
                How strongly do you feel this?{' '}
                <span className="text-white font-semibold">{intensity}/10</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>Barely</span>
                <span>Intensely</span>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-zinc-400 text-sm font-medium mb-2">
              Tags <span className="text-zinc-600">(optional, comma-separated)</span>
            </label>
            <input
              name="tags"
              type="text"
              placeholder="work, relationships, growth..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-all duration-150 shadow-lg shadow-violet-500/20"
          >
            {pending ? 'Saving...' : 'Save Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
