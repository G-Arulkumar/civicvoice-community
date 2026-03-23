import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, LogOut, Settings } from 'lucide-react';

const ADMIN_PHONES = ['+918939202794'];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">CivicVoice</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/about"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              location.pathname === '/about'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            About
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs font-medium text-muted-foreground">{user?.phoneNumber || user?.email}</span>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
