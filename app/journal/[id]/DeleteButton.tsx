'use client';

import { deleteEntry } from '../actions';

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    const formData = new FormData();
    await deleteEntry(id);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm text-zinc-600 hover:text-red-400 transition-colors"
    >
      Delete entry
    </button>
  );
}
