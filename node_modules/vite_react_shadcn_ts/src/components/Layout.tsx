import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileHamburger from './LayoutMobile';
import { clearAuth, getCurrentUser } from '@/lib/storage';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  PieChart, 
  Settings, 
  LogOut,
  Target,
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/accounts', icon: Wallet, label: 'Accounts' },
    { path: '/budgets', icon: Target, label: 'Budgets' },
    { path: '/statistics', icon: PieChart, label: 'Statistics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isCalendar = location.pathname.startsWith('/calendar');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Money Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* For certain pages (calendar) we render full-bleed content without container side padding */}
      {isCalendar ? (
        <div className="w-full px-0 py-6">
          {/* Mobile hamburger navigation (visible on small screens) */}
          <div className="md:hidden mb-4">
            <MobileHamburger navItems={navItems} currentPath={location.pathname} navigate={(p: string) => navigate(p)} />
          </div>

          <div className="flex items-start">
            {/* Sidebar stays inside a centered container so it doesn't shift */}
            <div className="hidden md:block md:w-64">
              <div className="container mx-auto px-4">
                <aside className="w-64 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className="w-full justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </aside>
              </div>
            </div>

            {/* Main content flows full width */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          {/* Mobile hamburger navigation (visible on small screens) */}
          <div className="md:hidden mb-4">
            <MobileHamburger navItems={navItems} currentPath={location.pathname} navigate={(p: string) => navigate(p)} />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="hidden md:block w-full md:w-64 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </aside>

            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
