import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 backdrop-blur-sm bg-card/50 border border-border shadow-xl animate-fade-in">
        <CardContent className="pt-8 pb-8 px-6">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-destructive/20 blur-md"></div>
              <div className="relative z-10 p-4 rounded-full bg-card border border-border">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-destructive to-accent bg-clip-text text-transparent">
            404 Not Found
          </h1>

          <p className="mt-4 text-center text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex justify-center">
            <Link href="/">
              <Button className="group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
