import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { NutriFoodLogo } from '@/components/NutriFoodLogo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Pacientes',
    to: '/pacientes',
    icon: Users,
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const { user, nutricionista, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = nutricionista?.nome || user?.name || 'Nutricionista';
  const displayEmail = nutricionista?.email || user?.email || '';

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6">
      <div>
        <div className="mb-8 flex items-center justify-between px-2">
          <NutriFoodLogo size="sm" />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-emerald-900 hover:bg-emerald-50 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="space-y-1.5" aria-label="Menu principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-950/80 hover:bg-emerald-50 hover:text-emerald-950'
                  )
                }
              >
                <Icon className="size-4.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-emerald-100 pt-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-semibold text-emerald-950">
            {displayName}
          </p>
          {displayEmail && (
            <p className="truncate text-xs text-muted-foreground">
              {displayEmail}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full justify-start gap-2 border-emerald-200 text-emerald-900 hover:bg-emerald-50"
        >
          {isSigningOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30">
      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-emerald-100 bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-emerald-100 bg-white/90 px-4 backdrop-blur-md lg:hidden">
        <NutriFoodLogo size="sm" />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-emerald-900 hover:bg-emerald-50"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-emerald-950/30 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-emerald-100 bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

