import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Sparkles 
} from "lucide-react";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container h-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Job<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/dashboard" active={location === "/dashboard"} icon={<LayoutDashboard className="w-4 h-4" />}>
            Dashboard
          </NavLink>
          <NavLink href="/jobs" active={location === "/jobs"} icon={<Briefcase className="w-4 h-4" />}>
            Find Jobs
          </NavLink>
          <NavLink href="/profile" active={location === "/profile"} icon={<User className="w-4 h-4" />}>
            Profile
          </NavLink>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-muted-foreground text-right">
            <p className="font-medium text-foreground">{user?.firstName || user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children, icon }: { href: string; active: boolean; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }
      `}
    >
      {icon}
      {children}
    </Link>
  );
}
