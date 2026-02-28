import Pricing from '@/components/ui/Pricing/Pricing';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LandingPage() {
  const supabase = createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 max-w-4xl mx-auto text-center">
        {/* Glow */}
        <div
          className="absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Private. Personal. Yours.
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          The journal that{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-300">
            holds space
          </span>
          <br />for how you actually feel.
        </h1>

        <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Unseen helps you track your emotions, reflect on your days, and
          understand your inner world — without judgment.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              href="/journal"
              className="px-8 py-3.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-base transition-all shadow-lg shadow-violet-500/25"
            >
              Go to my journal →
            </Link>
          ) : (
            <>
              <Link
                href="/signin/signup"
                className="px-8 py-3.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-semibold text-base transition-all shadow-lg shadow-violet-500/25"
              >
                Start journaling free
              </Link>
              <Link
                href="/signin"
                className="px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-medium text-base transition-all"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          Everything you need to understand yourself
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: '📝',
              title: 'Daily journaling',
              desc: 'Write freely, title optionally, tag by theme. Your entries are private and always yours.'
            },
            {
              icon: '🌊',
              title: 'Emotion tracking',
              desc: 'Pick from 10 nuanced emotions and rate their intensity. Move beyond “good” and “bad”.'
            },
            {
              icon: '📈',
              title: 'Mood insights',
              desc: 'See your emotional patterns at a glance with a 30-day timeline and streak tracking.'
            }
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          Simple, honest pricing
        </h2>
        <Pricing
          user={user}
          products={products ?? []}
          subscription={subscription}
        />
      </section>
    </div>
  );
}
