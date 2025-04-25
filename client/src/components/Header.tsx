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
import { Menu } from "lucide-react";

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

  const activeLink = "border-primary text-primary whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm";
  const inactiveLink = "border-transparent text-muted-foreground hover:text-foreground hover:border-border whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm";

  return (
    <header className="backdrop-blur-sm bg-background/90 border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer">
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px]">
                <nav className="flex flex-col space-y-4 mt-6">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span 
                        className={`px-2 py-1 rounded hover:bg-secondary cursor-pointer ${location === link.href ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
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
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
