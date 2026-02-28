'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createEntry(formData: FormData) {
  const supabase = createClient() as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const emotion = formData.get('emotion') as string;
  const intensity = parseInt(formData.get('intensity') as string, 10);
  const tagsRaw = formData.get('tags') as string;
  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      title: title || null,
      content,
      tags,
      is_favorite: false
    })
    .select()
    .single();

  if (entryError || !entry) {
    console.error('Error creating entry:', entryError);
    throw new Error('Failed to create journal entry');
  }

  // Insert emotion log
  if (emotion) {
    await supabase.from('emotion_logs').insert({
      user_id: user.id,
      entry_id: entry.id,
      emotion,
      intensity: isNaN(intensity) ? 5 : intensity,
      logged_at: new Date().toISOString()
    });
  }

  revalidatePath('/journal');
  redirect('/journal');
}

export async function deleteEntry(id: string) {
  const supabase = createClient() as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  await supabase
    .from('emotion_logs')
    .delete()
    .eq('entry_id', id)
    .eq('user_id', user.id);

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting entry:', error);
    throw new Error('Failed to delete entry');
  }

  revalidatePath('/journal');
  redirect('/journal');
}

export async function toggleFavorite(id: string, currentValue: boolean) {
  const supabase = createClient() as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('journal_entries')
    .update({ is_favorite: !currentValue })
    .eq('id', id)
    .eq('user_id', user.id);

  revalidatePath('/journal');
  revalidatePath(`/journal/${id}`);
}

export async function getEntries() {
  const supabase = createClient() as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('journal_entries')
    .select(
      `
      *,
      emotion_logs (
        emotion,
        intensity,
        logged_at
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }

  return (data ?? []) as any[];
}

export async function getEntry(id: string) {
  const supabase = createClient() as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('journal_entries')
    .select(
      `
      *,
      emotion_logs (
        emotion,
        intensity,
        logged_at
      )
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching entry:', error);
    return null;
  }

  return data as any;
}

export async function getEmotionStats() {
  const supabase = createClient() as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { logs: [], entries: [] };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: logs } = await supabase
    .from('emotion_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true });

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { logs: (logs ?? []) as any[], entries: (entries ?? []) as any[] };
}
