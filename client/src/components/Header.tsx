import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const navLinks = [
    { href: "/course-description", label: "Course Description" },
    { href: "/chapter-request", label: "Chapter Request Form" },
    { href: "/participant-signin", label: "Participant Sign-in" },
  ];

  if (isAuthenticated && user?.isAdmin) {
    navLinks.push({ href: "/admin", label: "Admin Dashboard" });
  }

  const activeLink = "border-accent text-primary-foreground whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm";
  const inactiveLink = "border-transparent text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/30 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm";

  return (
    <header className="bg-primary border-b border-primary/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-foreground cursor-pointer">
                CFP Ethics Workshop
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={location === link.href ? activeLink : inactiveLink}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span 
                        className={`px-3 py-2 rounded hover:bg-primary/10 cursor-pointer font-medium ${location === link.href ? 'text-accent font-bold' : 'text-foreground'}`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  
                  {/* Admin Login in mobile menu */}
                  {!isAuthenticated && (
                    <Link href="/admin">
                      <span 
                        className="px-3 py-2 rounded hover:bg-primary/10 cursor-pointer font-medium flex items-center text-foreground"
                        onClick={() => setOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Login
                      </span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">
                  {user?.username}
                </span>
                <Button 
                  onClick={handleLogout} 
                  variant="default" 
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
