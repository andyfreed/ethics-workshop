import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, DollarSign, ClipboardCheck, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.isAdmin || user?.is_admin;
  const [, navigate] = useLocation();
  console.log('isAuthenticated:', isAuthenticated, 'user:', user);
  return (
    <div className="space-y-8">
      {/* Admin Menu */}
      {isAuthenticated && isAdmin && (
        <section className="p-6 rounded-lg bg-accent/10 border border-accent mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-accent mr-2" />
            <h2 className="text-lg font-bold text-accent">Admin Menu</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/workshop-sessions">
              <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
                Workshop Sessions
              </span>
            </Link>
            <Link href="/admin/chapter-requests">
              <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
                Chapter Requests
              </span>
            </Link>
            <Link href="/admin/participant-data">
              <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer">
                Participant Data
              </span>
            </Link>
          </div>
        </section>
      )}
      <section className="p-6 sm:p-10 rounded-lg bg-white border border-border shadow-md">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              CFP Ethics Workshop
            </h1>
            <p className="text-lg text-foreground mb-8">
              Our CFP Board-approved workshop helps financial professionals meet ethics CE requirements
              with interactive, real-world case discussions.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/course-description">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/chapter-request">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold">
                Request Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border border-border shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              CFP Board Approved
            </h2>
            <p className="text-foreground">
              Our workshop is pre-approved by the CFP Board for 2 CE credits in Ethics.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-border shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 text-accent mb-6">
              <DollarSign className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              Transparent Pricing
            </h2>
            <p className="text-foreground">
              $995 flat fee per workshop for FPA Chapters, with no additional per-attendee charges.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border border-border shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              Simple Verification
            </h2>
            <p className="text-foreground">
              Participants verify attendance with our easy sign-in system, and we handle reporting to the CFP Board.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg border border-border shadow-md overflow-hidden mt-12">
        <div className="px-6 py-6 sm:p-8 bg-primary">
          <h2 className="text-2xl leading-6 font-bold text-foreground">Ready to Get Started?</h2>
          <p className="mt-2 text-foreground/90">
            Follow these simple steps to bring the Ethics Workshop to your FPA Chapter
          </p>
        </div>
        <div className="px-6 py-8 sm:p-8 space-y-6 bg-muted">
          <ol className="space-y-6 text-foreground">
            {[
              { title: "Request the CFP Ethics Workshop", desc: "Complete our simple request form with your chapter details and preferred dates." },
              { title: "Confirm Details", desc: "We'll reach out to confirm workshop details and provide an invoice." },
              { title: "Receive Materials", desc: "Upon payment, we'll send your instructor all necessary workshop materials." },
              { title: "Hold the Workshop", desc: "Your chapter conducts the workshop for its members." },
              { title: "Verify Attendance", desc: "Participants complete the attendance verification through our portal." },
              { title: "CE Reporting", desc: "We handle submitting the records to the CFP Board." }
            ].map((step, index) => (
              <li key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-accent/20 text-accent font-bold">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          
          <div className="mt-8 flex justify-center">
            <Link href="/chapter-request">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold">
                Request the CFP Ethics Workshop <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
