import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { CalendarIcon, FileDownIcon, PlusIcon, EyeIcon } from "lucide-react";

const addSessionSchema = z.object({
  chapterName: z.string().min(1, "Chapter name is required"),
  workshopDate: z.string().min(1, "Workshop date is required"),
  instructorName: z.string().min(1, "Instructor name is required"),
  maxAttendees: z.coerce.number().min(1, "Must have at least 1 attendee"),
  requestId: z.coerce.number().optional(),
});

export default function AdminWorkshopSessions() {
  const { toast } = useToast();
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ["/api/workshop-sessions"],
  });

  const form = useForm<z.infer<typeof addSessionSchema>>({
    resolver: zodResolver(addSessionSchema),
    defaultValues: {
      chapterName: "",
      workshopDate: "",
      instructorName: "",
      maxAttendees: 0,
      requestId: undefined,
    },
  });

  const addSessionMutation = useMutation({
    mutationFn: (values: z.infer<typeof addSessionSchema>) => 
      apiRequest("POST", "/api/workshop-sessions", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-sessions"] });
      setAddSessionOpen(false);
      form.reset();
      toast({
        title: "Session Created",
        description: "Workshop session has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create session: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiRequest("PATCH", `/api/workshop-sessions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-sessions"] });
      toast({
        title: "Status Updated",
        description: "Workshop session status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleExportAttendance = async (sessionId: number) => {
    try {
      // Create a link to download the CSV
      const response = await fetch(`/api/export/participants?sessionId=${sessionId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participants-session-${sessionId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Participant data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setViewDetailsOpen(true);
  };

  const onSubmit = (values: z.infer<typeof addSessionSchema>) => {
    addSessionMutation.mutate(values);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Progress</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Upcoming</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading workshop sessions...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-4">Error loading workshop sessions.</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Workshop Sessions</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all workshop sessions including upcoming and past events.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button 
            onClick={() => setAddSessionOpen(true)}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        </div>
      </div>

      {sessions?.length > 0 ? (
        <div className="mt-4 flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3.5">Chapter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: any) => (
                      <TableRow key={session.id}>
                        <TableCell className="py-4 px-4 font-medium text-gray-900">{session.chapterName}</TableCell>
                        <TableCell>{formatDate(session.workshopDate)}</TableCell>
                        <TableCell>{session.attendeeCount || 0} / {session.maxAttendees}</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportAttendance(session.id)}
                              disabled={session.status !== 'completed'}
                              className="text-primary-500 hover:text-primary-700"
                            >
                              <FileDownIcon className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSession(session)}
                              className="text-primary-500 hover:text-primary-700"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No workshop sessions found. Add a new session to get started.
        </div>
      )}

      {/* Add Session Dialog */}
      <Dialog open={addSessionOpen} onOpenChange={setAddSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workshop Session</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="chapterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. FPA Denver Chapter" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="workshopDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workshop Date</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <CalendarIcon className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                        <Input type="date" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instructorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Attendees</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddSessionOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addSessionMutation.isPending}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  {addSessionMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Session Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workshop Session Details</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Chapter</h3>
                  <p>{selectedSession.chapterName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p>{formatDate(selectedSession.workshopDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Instructor</h3>
                  <p>{selectedSession.instructorName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Max Attendees</h3>
                  <p>{selectedSession.maxAttendees}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                  <p>{getStatusBadge(selectedSession.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reported to CFP Board</h3>
                  <p>{selectedSession.reportedToCfpBoard ? "Yes" : "No"}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedSession.id, status: "upcoming" });
                      setSelectedSession({ ...selectedSession, status: "upcoming" });
                    }}
                    disabled={selectedSession.status === "upcoming"}
                  >
                    Set as Upcoming
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedSession.id, status: "in_progress" });
                      setSelectedSession({ ...selectedSession, status: "in_progress" });
                    }}
                    disabled={selectedSession.status === "in_progress"}
                  >
                    Set as In Progress
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedSession.id, status: "completed" });
                      setSelectedSession({ ...selectedSession, status: "completed" });
                    }}
                    disabled={selectedSession.status === "completed"}
                  >
                    Set as Completed
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => handleExportAttendance(selectedSession.id)} 
                  variant="outline"
                  disabled={selectedSession.status !== "completed"}
                >
                  <FileDownIcon className="h-4 w-4 mr-1" />
                  Export Attendees
                </Button>
                <Button onClick={() => setViewDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
