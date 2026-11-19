import type { ReactNode } from 'react';
import { NutriFoodLogo } from '@/components/NutriFoodLogo';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50/75 via-white to-emerald-50/45 px-4 py-10 sm:px-6">
      {/* Subtle botanical ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-[-8%] h-[360px] w-[360px] rounded-full bg-green-100/60 blur-3xl"
      />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center">
        <header className="mb-7 flex flex-col items-center text-center">
          <NutriFoodLogo size="lg" showTagline />
        </header>

        <main className="w-full">{children}</main>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} NutriFood · Plataforma para Nutricionistas
        </footer>
      </div>
    </div>
  );
}

