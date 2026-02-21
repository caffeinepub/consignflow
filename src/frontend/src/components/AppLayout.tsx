import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Package, Users, TrendingUp, TrendingDown, DollarSign, FileText, ArrowLeftRight, Calendar, Edit3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Reps', href: '/reps', icon: Users },
  { name: 'Consignments', href: '/consignments', icon: TrendingUp },
  { name: 'Sales', href: '/sales', icon: ArrowLeftRight },
  { name: 'Returns', href: '/returns', icon: TrendingDown },
  { name: 'Payouts', href: '/payouts', icon: DollarSign },
  { name: 'Statements', href: '/statements', icon: FileText },
  { name: 'Settlement Periods', href: '/settlement-periods', icon: Calendar },
  { name: 'Adjustments', href: '/adjustments', icon: Edit3 },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'consignflow';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">ConsignFlow</span>
            </Link>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/50 print:hidden">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href || (currentPath === '/' && item.href === '/dashboard');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="mt-16 border-t border-border bg-card/50 py-8 print:hidden">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {currentYear}. Built with <Heart className="inline h-4 w-4 text-accent fill-accent" /> using{' '}
          <a 
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
