'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import s from './Navbar.module.css';
import Logo from '@/components/icons/Logo';
import { SignOut } from '@/utils/auth-helpers/client';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { getURL } from '@/utils/helpers';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href ? s.activeLink : s.link;

  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" aria-label="Logo" className="mr-8">
          <Logo />
        </Link>
        {user && (
          <nav className="flex items-center gap-6">
            <Link href="/journal" className={isActive('/journal')}>
              Journal
            </Link>
            <Link href="/insights" className={isActive('/insights')}>
              Insights
            </Link>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/account" className={s.link}>
              Account
            </Link>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
              <input type="hidden" name="pathName" value={usePathname()} />
              <button type="submit" className={s.link}>
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/signin" className={s.link}>
              Sign in
            </Link>
            <Link href="/signin/signup" className={s.cta}>
              Get started
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
