import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CourseDescription() {
  return (
    <div>
      <Card>
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-500 to-primary-600">
          <h1 className="text-xl leading-6 font-bold text-white">Ethics Workshop</h1>
          <p className="mt-1 max-w-2xl text-sm text-white opacity-90">CFP Board Approved Professional Development Course</p>
        </div>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              Our Ethics Workshop is designed to fulfill the CFP Board's ethics CE requirement for financial planning professionals. This comprehensive workshop covers essential ethical considerations, case studies, and best practices in financial planning.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Course Highlights</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Pre-approved by the CFP Board for 2 CE credits</li>
              <li>Interactive workshop format with real-world case discussions</li>
              <li>Covers the latest Code of Ethics and Standards of Conduct</li>
              <li>Professional PowerPoint presentation provided to instructors</li>
              <li>Flexible scheduling options for FPA Chapters</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">How It Works</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>FPA Chapter requests the workshop using our request form</li>
              <li>We coordinate with the chapter to confirm details and send an invoice</li>
              <li>Upon payment, we provide all necessary materials to the instructor</li>
              <li>The chapter conducts the workshop for their members</li>
              <li>Participants complete the attendance verification after the workshop</li>
              <li>We submit completion records to the CFP Board</li>
            </ol>
            
            <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-100">
              <h4 className="text-md font-semibold text-primary-700 mb-2">Request This Workshop</h4>
              <p className="text-sm text-gray-600 mb-3">
                If you're interested in bringing this Ethics Workshop to your FPA Chapter, please use our Chapter Request Form to get started.
              </p>
              <Link href="/chapter-request">
                <Button className="bg-primary-500 hover:bg-primary-600">
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
