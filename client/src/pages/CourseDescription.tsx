import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CourseDescription() {
  return (
    <div>
      <Card className="border border-border shadow-md">
        <div className="px-6 py-6 sm:p-8 bg-primary">
          <h1 className="text-2xl leading-6 font-bold text-primary-foreground">Ethics Workshop</h1>
          <p className="mt-2 text-primary-foreground/90">CFP Board Approved Professional Development Course</p>
        </div>
        <CardContent className="px-6 py-6 sm:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-foreground mb-6">
              Our Ethics Workshop is designed to fulfill the CFP Board's ethics CE requirement for financial planning professionals. This comprehensive workshop covers essential ethical considerations, case studies, and best practices in financial planning.
            </p>
            
            <h3 className="text-xl font-semibold text-primary mt-8 mb-4">Course Highlights</h3>
            <ul className="list-disc pl-5 space-y-3 text-foreground">
              <li>Pre-approved by the CFP Board for 2 CE credits</li>
              <li>Interactive workshop format with real-world case discussions</li>
              <li>Covers the latest Code of Ethics and Standards of Conduct</li>
              <li>Professional PowerPoint presentation provided to instructors</li>
              <li>Flexible scheduling options for FPA Chapters</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-primary mt-8 mb-4">How It Works</h3>
            <ol className="list-decimal pl-5 space-y-3 text-foreground">
              <li>FPA Chapter requests the workshop using our request form</li>
              <li>We coordinate with the chapter to confirm details and send an invoice</li>
              <li>Upon payment, we provide all necessary materials to the instructor</li>
              <li>The chapter conducts the workshop for their members</li>
              <li>Participants complete the attendance verification after the workshop</li>
              <li>We submit completion records to the CFP Board</li>
            </ol>
            
            <div className="mt-10 bg-secondary/50 p-6 rounded-md border border-border">
              <h4 className="text-lg font-semibold text-primary mb-3">Request This Workshop</h4>
              <p className="text-muted-foreground mb-4">
                If you're interested in bringing this Ethics Workshop to your FPA Chapter, please use our Chapter Request Form to get started.
              </p>
              <Link href="/chapter-request">
                <Button className="bg-primary hover:bg-primary/90">
                  Request Workshop
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
