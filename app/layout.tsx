import { Metadata } from 'next';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PHProvider } from './providers';
import Navbar from '@/components/ui/Navbar/Navbar';
import Footer from '@/components/ui/Footer/Footer';
import '../styles/main.css';

const title = 'Unseen';
const description = 'Your private emotional journal';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  title,
  description
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 min-h-screen">
        <PHProvider>
          <Navbar />
          <main
            id="skip"
            className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
          >
            <Suspense>
              {children}
            </Suspense>
          </main>
          <Footer />
          <Suspense>
            <Toaster />
          </Suspense>
        </PHProvider>
      </body>
    </html>
  );
}
