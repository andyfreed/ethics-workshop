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

  const activeLink = "border-primary-500 text-primary-500 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm";
  const inactiveLink = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm";

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-500 cursor-pointer">
                Ethics Workshop Management Portal
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
                        className={`px-2 py-1 rounded hover:bg-gray-100 cursor-pointer ${location === link.href ? 'text-primary-500 font-medium' : 'text-gray-700'}`}
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
