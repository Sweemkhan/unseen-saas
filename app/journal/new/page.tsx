import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import NewEntryForm from './NewEntryForm';

export default async function NewEntryPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/signin');
  }

  return <NewEntryForm />;
}
