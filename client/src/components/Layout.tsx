import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent/20 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-30"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
