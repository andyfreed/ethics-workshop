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
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { EyeIcon, CheckCircleIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminChapterRequests() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["/api/chapter-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiRequest("PATCH", `/api/chapter-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chapter-requests"] });
      setApproveDialogOpen(false);
      toast({
        title: "Status Updated",
        description: "Chapter request status has been updated successfully.",
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

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setViewDetailsOpen(true);
  };

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      updateStatusMutation.mutate({ id: selectedRequest.id, status: "approved" });
    }
  };

  const handleMarkPaid = (request: any) => {
    updateStatusMutation.mutate({ id: request.id, status: "paid" });
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
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Approved</Badge>;
      case 'paid':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Paid</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Denied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading chapter requests...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-4">Error loading chapter requests.</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Chapter Requests</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all chapter workshop requests awaiting processing.
          </p>
        </div>
      </div>

      {requests?.length > 0 ? (
        <div className="mt-4 flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3.5">Chapter</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell className="py-4 px-4 font-medium text-gray-900">{request.chapterName}</TableCell>
                        <TableCell>{request.contactPerson}</TableCell>
                        <TableCell>{formatDate(request.preferredDate)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-3">
                            {request.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveRequest(request)}
                                className="text-primary-500 hover:text-primary-700"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {request.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkPaid(request)}
                                className="text-primary-500 hover:text-primary-700"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Mark Paid
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRequest(request)}
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
          No chapter requests found.
        </div>
      )}

      {/* View Request Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chapter Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedRequest.chapterName}</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Person</h4>
                    <p>{selectedRequest.contactPerson}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p>{selectedRequest.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p>{selectedRequest.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                    <p>{selectedRequest.instructorName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Preferred Date</h4>
                    <p>{formatDate(selectedRequest.preferredDate)}</p>
                  </div>
                  {selectedRequest.alternateDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Alternate Date</h4>
                      <p>{formatDate(selectedRequest.alternateDate)}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Estimated Attendees</h4>
                    <p>{selectedRequest.estimatedAttendees}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date Requested</h4>
                    <p>{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
                
                {selectedRequest.additionalInfo && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-500">Additional Information</h4>
                    <p className="whitespace-pre-line text-sm text-gray-700">{selectedRequest.additionalInfo}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: "pending" })}
                      disabled={selectedRequest.status === "pending"}
                    >
                      Set as Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: "approved" })}
                      disabled={selectedRequest.status === "approved"}
                    >
                      Set as Approved
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: "paid" })}
                      disabled={selectedRequest.status === "paid"}
                    >
                      Set as Paid
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: "completed" })}
                      disabled={selectedRequest.status === "completed"}
                    >
                      Set as Completed
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: "denied" })}
                      disabled={selectedRequest.status === "denied"}
                      className="text-red-500"
                    >
                      Set as Denied
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Request Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the workshop request from {selectedRequest?.chapterName}?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmApprove} 
              disabled={updateStatusMutation.isPending}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {updateStatusMutation.isPending ? "Approving..." : "Approve Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
