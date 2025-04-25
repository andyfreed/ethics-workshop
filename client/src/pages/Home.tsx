import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Calendar, ClipboardCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="p-6 sm:p-10 rounded-lg backdrop-blur-sm bg-card/90 border border-border shadow-xl">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 animate-fade-in">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ethics Workshop Management Portal
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 animate-fade-up delay-200">
              Our CFP Board-approved workshop helps financial professionals meet ethics CE requirements
              with interactive, real-world case discussions.
            </p>
          </div>
          <div className="space-x-4 animate-fade-up delay-300">
            <Link href="/course-description">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/chapter-request">
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                Request Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="backdrop-blur-sm bg-card/50 border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 mb-6">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CFP Board Approved
            </h2>
            <p className="text-muted-foreground">
              Our workshop is pre-approved by the CFP Board for 2 CE credits in Ethics.
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/50 border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 mb-6">
              <Calendar className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Flexible Scheduling
            </h2>
            <p className="text-muted-foreground">
              We work with your FPA Chapter to find a date and time that works best for your members.
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/50 border border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 mb-6">
              <ClipboardCheck className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Simple Verification
            </h2>
            <p className="text-muted-foreground">
              Participants verify attendance with our easy sign-in system, and we handle reporting to the CFP Board.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg border border-border shadow-xl backdrop-blur-sm bg-card/50 overflow-hidden mt-12 animate-fade-in">
        <div className="px-6 py-6 sm:p-8 bg-gradient-to-r from-primary to-accent">
          <h2 className="text-2xl leading-6 font-bold text-primary-foreground">Ready to Get Started?</h2>
          <p className="mt-2 text-primary-foreground/90">
            Follow these simple steps to bring the Ethics Workshop to your FPA Chapter
          </p>
        </div>
        <div className="px-6 py-8 sm:p-8 space-y-6">
          <ol className="space-y-6 text-foreground">
            {[
              { title: "Request the Workshop", desc: "Complete our simple request form with your chapter details and preferred dates." },
              { title: "Confirm Details", desc: "We'll reach out to confirm workshop details and provide an invoice." },
              { title: "Receive Materials", desc: "Upon payment, we'll send your instructor all necessary workshop materials." },
              { title: "Hold the Workshop", desc: "Your chapter conducts the workshop for its members." },
              { title: "Verify Attendance", desc: "Participants complete the attendance verification through our portal." },
              { title: "CE Reporting", desc: "We handle submitting the records to the CFP Board." }
            ].map((step, index) => (
              <li key={index} className="flex gap-4 items-start group">
                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          
          <div className="mt-8 flex justify-center">
            <Link href="/chapter-request">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 text-base">
                Request the Ethics Workshop <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
