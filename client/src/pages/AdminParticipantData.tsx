import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { DownloadIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminParticipantData() {
  const { toast } = useToast();
  const [filterChapter, setFilterChapter] = useState("all-chapters");
  const [filterDate, setFilterDate] = useState("all-dates");
  const [filterStatus, setFilterStatus] = useState("all-statuses");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/workshop-sessions"],
    retry: 2,
    retryDelay: 1000,
  });

  const { 
    data: participants = [], 
    isLoading, 
    isError,
    refetch: refetchParticipants
  } = useQuery({
    queryKey: ["/api/participants"],
    retry: 2,
    retryDelay: 1000,
  });

  const markReportedMutation = useMutation({
    mutationFn: (participantIds: number[]) => 
      apiRequest("POST", "/api/participants/mark-reported", { participantIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
      toast({
        title: "Participants Reported",
        description: "Selected participants have been marked as reported to the CFP Board.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to mark participants as reported: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleExportAllData = async () => {
    try {
      // Create a link to download the CSV
      const response = await fetch('/api/export/participants', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-participants.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "All participant data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleMarkReported = () => {
    const unreportedParticipants = filteredParticipants
      .filter(p => !p.reportedToCfpBoard)
      .map(p => p.id);
    
    if (unreportedParticipants.length === 0) {
      toast({
        title: "No Participants to Report",
        description: "All selected participants have already been reported.",
      });
      return;
    }
    
    markReportedMutation.mutate(unreportedParticipants);
  };

  // Get chapter name from session
  const getChapterName = (sessionId: number | null) => {
    if (!sessionId || !Array.isArray(sessions) || sessions.length === 0) return "Unknown";
    const session = sessions.find((s) => s.id === sessionId);
    return session?.chapterName || "Unknown";
  };

  // Get formatted date from session
  const getSessionDate = (sessionId: number | null) => {
    if (!sessionId || !Array.isArray(sessions) || sessions.length === 0) return "Unknown";
    const session = sessions.find((s) => s.id === sessionId);
    return session?.workshopDate ? formatDate(session.workshopDate) : "Unknown";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter and search participants
  const filteredParticipants = Array.isArray(participants) ? participants.filter((participant: any) => {
    // Filter by chapter
    if (filterChapter && filterChapter !== "all-chapters" && getChapterName(participant.sessionId) !== filterChapter) {
      return false;
    }
    
    // Filter by date range
    if (filterDate && filterDate !== "all-dates") {
      const sessionDate = Array.isArray(sessions) ? 
        sessions.find((s) => s.id === participant.sessionId)?.workshopDate : null;
      
      if (sessionDate) {
        const date = new Date(sessionDate);
        const now = new Date();
        
        if (filterDate === "current_month") {
          if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (filterDate === "last_3_months") {
          // Calculate date 3 months ago
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          if (date < threeMonthsAgo) {
            return false;
          }
        } else if (filterDate === "ytd") {
          // Year to date - current year only
          if (date.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }
    }
    
    // Filter by reporting status
    if (filterStatus && filterStatus !== "all-statuses") {
      if (filterStatus === "reported" && !participant.reportedToCfpBoard) {
        return false;
      }
      if (filterStatus === "pending" && participant.reportedToCfpBoard) {
        return false;
      }
    }
    
    // Search by name, CFP ID, or email
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        participant.firstName?.toLowerCase().includes(searchLower) ||
        participant.lastName?.toLowerCase().includes(searchLower) ||
        participant.cfpId?.includes(searchTerm) ||
        participant.email?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }) : [];

  if (isLoading) {
    return <div className="text-center py-4">Loading participant data...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-4">Error loading participant data.</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Participant Data</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and export participant data for CFP Board reporting.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={handleExportAllData}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <div className="w-full sm:w-1/3">
            <Input
              placeholder="Search by name, CFP ID, or email"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-1/4">
            <Select value={filterChapter} onValueChange={setFilterChapter}>
              <SelectTrigger>
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-chapters">All Chapters</SelectItem>
                {Array.isArray(sessions) && sessions.map((session: any) => (
                  session.chapterName ? (
                    <SelectItem key={session.id} value={session.chapterName || `chapter-${session.id}`}>
                      {session.chapterName || `Workshop #${session.id}`}
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/4">
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger>
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-dates">All Dates</SelectItem>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="reported">Reported to CFP Board</SelectItem>
                <SelectItem value="pending">Pending Reporting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredParticipants.length > 0 && (
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredParticipants.length} participants
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkReported}
              disabled={markReportedMutation.isPending || !filteredParticipants.some(p => !p.reportedToCfpBoard)}
            >
              Mark Filtered as Reported to CFP Board
            </Button>
          </div>
        )}
      </div>

      {filteredParticipants.length > 0 ? (
        <div className="mt-4 flex flex-col">
          <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3.5">Name</TableHead>
                      <TableHead>CFP ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipants.map((participant: any) => (
                      <TableRow key={participant.id}>
                        <TableCell className="py-4 px-4 font-medium text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </TableCell>
                        <TableCell>{participant.cfpId}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{getChapterName(participant.sessionId)}</TableCell>
                        <TableCell>{getSessionDate(participant.sessionId)}</TableCell>
                        <TableCell>
                          {participant.reportedToCfpBoard ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Reported</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
                          )}
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
          No participants match your filter criteria.
        </div>
      )}
    </div>
  );
}
