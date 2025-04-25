import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Calendar, ClipboardCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="bg-white shadow rounded-lg p-6 sm:p-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ethics Workshop Management Portal
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Our CFP Board-approved workshop helps financial professionals meet ethics CE requirements
            with interactive, real-world case discussions.
          </p>
          <div className="space-x-4">
            <Link href="/course-description">
              <Button className="bg-primary-500 hover:bg-primary-600">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/chapter-request">
              <Button variant="outline">
                Request Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              CFP Board Approved
            </h2>
            <p className="text-gray-600">
              Our workshop is pre-approved by the CFP Board for 2 CE credits in Ethics.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Flexible Scheduling
            </h2>
            <p className="text-gray-600">
              We work with your FPA Chapter to find a date and time that works best for your members.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Simple Verification
            </h2>
            <p className="text-gray-600">
              Participants verify attendance with our easy sign-in system, and we handle reporting to the CFP Board.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6 bg-gradient-to-r from-primary-500 to-primary-600">
          <h2 className="text-xl leading-6 font-bold text-white">Ready to Get Started?</h2>
          <p className="mt-1 text-sm text-white opacity-90">
            Follow these simple steps to bring the Ethics Workshop to your FPA Chapter
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <ol className="list-decimal pl-5 space-y-4 text-gray-700">
            <li>
              <p><strong>Request the Workshop</strong> - Complete our simple request form with your chapter details and preferred dates.</p>
            </li>
            <li>
              <p><strong>Confirm Details</strong> - We'll reach out to confirm workshop details and provide an invoice.</p>
            </li>
            <li>
              <p><strong>Receive Materials</strong> - Upon payment, we'll send your instructor all necessary workshop materials.</p>
            </li>
            <li>
              <p><strong>Hold the Workshop</strong> - Your chapter conducts the workshop for its members.</p>
            </li>
            <li>
              <p><strong>Verify Attendance</strong> - Participants complete the attendance verification through our portal.</p>
            </li>
            <li>
              <p><strong>CE Reporting</strong> - We handle submitting the records to the CFP Board.</p>
            </li>
          </ol>
          
          <div className="mt-6 flex justify-center">
            <Link href="/chapter-request">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
                Request the Ethics Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
