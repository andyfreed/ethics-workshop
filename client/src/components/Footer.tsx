import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 backdrop-blur-sm bg-background/90">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="#">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Contact Support
              </span>
            </Link>
            <Link href="#">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Privacy Policy
              </span>
            </Link>
            <Link href="#">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Terms of Service
              </span>
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Ethics Workshop Management Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
