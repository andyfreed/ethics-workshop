import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

// Create a form schema
const formSchema = z.object({
  sessionId: z.string().min(1, "Please select a workshop session"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cfpId: z.string().min(1, "CFP ID is required").regex(/^\d+$/, "CFP ID must contain only numbers"),
  email: z.string().email("Invalid email address"),
  attendanceConfirmed: z.boolean().refine(val => val === true, {
    message: "You must confirm your attendance to receive CE credit",
  }),
});

export default function ParticipantSignIn() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch workshop sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/workshop-sessions"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionId: "",
      firstName: "",
      lastName: "",
      cfpId: "",
      email: "",
      attendanceConfirmed: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      // Convert sessionId from string to number for the API
      const participantData = {
        ...values,
        sessionId: parseInt(values.sessionId),
      };
      return apiRequest("POST", "/api/participants", participantData);
    },
    onSuccess: () => {
      toast({
        title: "Attendance Recorded",
        description: "Your attendance has been successfully recorded.",
      });
      form.reset();
      setIsSuccess(true);
      window.scrollTo(0, 0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record attendance: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const formatWorkshopDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <Card>
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-500 to-primary-600">
          <h1 className="text-xl leading-6 font-bold text-white">Participant Sign-In</h1>
          <p className="mt-1 max-w-2xl text-sm text-white opacity-90">Verify your attendance at the Ethics Workshop</p>
        </div>
        <CardContent className="px-4 py-5 sm:p-6">
          {isSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Attendance Recorded Successfully</AlertTitle>
              <AlertDescription className="text-green-700">
                Thank you for attending the Ethics Workshop. Your attendance has been recorded and will be reported to the CFP Board for CE credit.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-8">
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Your Workshop Session</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a session..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoading ? (
                            <SelectItem value="loading">Loading sessions...</SelectItem>
                          ) : sessions && sessions.length > 0 ? (
                            sessions.map((session: any) => (
                              <SelectItem key={session.id} value={session.id.toString()}>
                                {session.chapterName} - {formatWorkshopDate(session.workshopDate)}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No active sessions available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="cfpId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CFP ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Your CFP Board ID number (numbers only)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Will be used for CE confirmation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sm:col-span-6">
                  <FormField
                    control={form.control}
                    name="attendanceConfirmed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I confirm that I attended the full Ethics Workshop session
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you certify that you attended the complete workshop as required by the CFP Board for continuing education credit.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {mutation.isPending ? "Submitting..." : "Submit Attendance"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
