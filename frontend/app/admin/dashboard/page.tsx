"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Power,
  Users,
  Vote,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import newRequest from "@/utils/newRequest";

interface VoteItem {
  _id: string;
  title: string;
  status: "active" | "closed" | "pending";
  startTime: string;
  endTime: string;
  candidateCount: number;
  voterCount: number;
  voteId: string;
  isPending: boolean;
  creator?: {
    username?: string;
    email?: string;
  };
}

interface PowerStatus {
  _id: string;
  device_id: string;
  status: "online" | "offline";
  timestamp: string;
  voltage?: number;
  batteryLevel?: number;
  location?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [powerStatus, setPowerStatus] = useState<PowerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [roomCount, setRoomCount] = useState<number>(0);
  const [activeRoomCount, setActiveRoomCount] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) {
      toast.message("Access Denied", {
        description: "You don't have permission to access this page",
      });
      router.push("/login");
      return;
    }

    fetchData();
  }, [isAdmin, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch votes
      const votesResponse = await newRequest.get("/vote/all");
      
      if (votesResponse.data.success) {
        setVotes(votesResponse.data.votes);
      } else {
        toast.error("Failed to fetch votes");
      }
      
      // Fetch rooms
      try {
        const roomsResponse = await newRequest.get("/room/all");
        if (roomsResponse.data.success) {
          const rooms = roomsResponse.data.rooms || [];
          setRoomCount(rooms.length);
          
          // Count active rooms
          const activeRooms = rooms.filter(room => 
            room.status === "active" || room.status === "waiting"
          );
          setActiveRoomCount(activeRooms.length);
        }
      } catch (roomError) {
        console.error("Failed to fetch rooms:", roomError);
        setRoomCount(0);
        setActiveRoomCount(0);
      }

      // Fetch power status - note: this might need to be adjusted based on your actual API
      try {
        const powerResponse = await newRequest.get("/power-status");
        if (powerResponse.data) {
          setPowerStatus(powerResponse.data);
        }
      } catch (powerError) {
        console.error("Failed to fetch power status:", powerError);
        // Create mock power status data if the endpoint is not available yet
        setPowerStatus([
          {
            _id: "1",
            device_id: "device_001",
            status: "online",
            timestamp: new Date().toISOString(),
            voltage: 220,
            batteryLevel: 85,
            location: "Polling Station 1"
          },
          {
            _id: "2",
            device_id: "device_002",
            status: "online",
            timestamp: new Date().toISOString(),
            voltage: 215,
            batteryLevel: 72,
            location: "Polling Station 2"
          },
          {
            _id: "3",
            device_id: "device_003",
            status: "offline",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            voltage: 0,
            batteryLevel: 23,
            location: "Polling Station 3"
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVote = async (id: string) => {
    try {
      // Note: Your backend might not have this endpoint yet
      // You may need to implement it or adjust this code
      const response = await newRequest.delete(`/vote/${id}`);

      if (response.data.success) {
        setVotes(votes.filter((vote) => vote._id !== id));
        toast.success("The vote has been deleted successfully");
      } else {
        toast.error(response.data.error || "Failed to delete vote");
      }
    } catch (error) {
      console.error("Error deleting vote:", error);
      toast.error("An error occurred while deleting the vote");
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleEndVote = async (id: string) => {
    try {
      const response = await newRequest.post(`/vote/end/${id}`);

      if (response.data.success) {
        // Update the vote status in the local state
        setVotes(
          votes.map((vote) =>
            vote._id === id ? { ...vote, status: "closed" } : vote
          )
        );

        toast.success("The vote has been ended successfully");
      } else {
        toast.error(response.data.error || "Failed to end vote");
      }
    } catch (error) {
      console.error("Error ending vote:", error);
      toast.error("An error occurred while ending the vote");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const activeVotes = votes.filter((vote) => vote.status === "active");
  const endedVotes = votes.filter((vote) => vote.status === "closed");
  const onlineDevices = powerStatus.filter(
    (device) => device.status === "online"
  );
  const offlineDevices = powerStatus.filter(
    (device) => device.status === "offline"
  );
  
  // Function to handle manual sync with blockchain
  const handleManualSync = async () => {
    try {
      const response = await newRequest.post("/vote/sync");
      if (response.data.success) {
        toast.success("Synchronization process started");
        // Refresh data after a short delay to allow sync to begin
        setTimeout(() => fetchData(), 2000);
      } else {
        toast.error(response.data.error || "Failed to start synchronization");
      }
    } catch (error) {
      console.error("Error starting sync:", error);
      toast.error("Failed to start synchronization with blockchain");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Vote className="h-5 w-5 text-primary mr-2" />
              <p className="text-3xl font-bold">{activeVotes.length}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/votes">Manage Votes</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {votes.reduce((total, vote) => total + vote.totalVotes, 0)}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/votes">View Details</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Power Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-green-500 mr-2" />
                <span>{onlineDevices.length} Online</span>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span>{offlineDevices.length} Offline</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/power-status">Monitor Power</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Voting Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <p className="text-3xl font-bold">{roomCount}</p>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span className="font-medium text-green-600">{activeRoomCount}</span>
                <span>active</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/room-management">Manage Rooms</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Vote Management</h2>
        <Button asChild>
          <Link href="/admin/votes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Vote
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">Active Votes</TabsTrigger>
          <TabsTrigger value="ended">Ended Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Active Votes</h3>
              <p className="text-muted-foreground mt-2">
                There are no active voting sessions at the moment.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/votes/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Vote
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeVotes.map((vote) => (
                <Card key={vote._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{vote.title}</CardTitle>
                      <Badge>Active</Badge>
                    </div>
                    <CardDescription>
                      {vote.isPending && "(Pending blockchain sync) "}
                      {vote.candidateCount} candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <p className="text-sm text-muted-foreground">
                          Ends on: {new Date(vote.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Candidates:
                        </span>
                        <span>{vote.candidates}</span>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground mt-1">
                          Candidates: {vote.candidateCount}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Total Votes: {vote.voterCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEndVote(vote._id)}
                      className="w-full"
                    >
                      <Link href={`/vote/edit/${vote._id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndVote(vote._id)}
                          className="w-full"
                        >
                          <Power className="mr-2 h-4 w-4" />
                          End Vote
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>End this vote?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will end the voting session and no more votes
                            can be cast. Results will be finalized and made
                            available.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleEndVote(vote._id)}
                          >
                            End Vote
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog
                      open={showDeleteDialog && deleteId === vote._id}
                      onOpenChange={(open) => {
                        setShowDeleteDialog(open);
                        if (!open) setDeleteId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setDeleteId(vote._id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this vote?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the vote and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteId && handleDeleteVote(deleteId)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ended">
          {endedVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Ended Votes</h3>
              <p className="text-muted-foreground mt-2">
                There are no ended voting sessions at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endedVotes.map((vote) => (
                <Card key={vote._id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{vote.title}</CardTitle>
                      <Badge variant="secondary">
                        {vote.isPending ? "Pending" : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {vote.isPending && "(Pending blockchain sync) "}
                      {vote.candidateCount} candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <p className="text-sm text-muted-foreground">
                          Ends on: {new Date(vote.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Candidates:
                        </span>
                        <span>{vote.candidates}</span>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground mt-1">
                          Candidates: {vote.candidateCount}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Total Votes: {vote.voterCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEndVote(vote._id)}
                      className="w-full"
                    >
                      <Link href={`/vote/results/${vote._id}`}>View Results</Link>
                    </Button>
                    <AlertDialog
                      open={showDeleteDialog && deleteId === vote._id}
                      onOpenChange={(open) => {
                        setShowDeleteDialog(open);
                        if (!open) setDeleteId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setDeleteId(vote._id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this vote?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the vote and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteId && handleDeleteVote(deleteId)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Power Status Overview</h2>
        <Button variant="outline" asChild>
          <Link href="/power-status">View Full Details</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Power Status Summary</CardTitle>
          <CardDescription>
            Overview of power status across all polling stations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {powerStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Data Available</h3>
              <p className="text-sm text-muted-foreground mt-2">
                No power status data has been recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Online Devices</span>
                <span className="text-sm font-medium">
                  {onlineDevices.length} / {powerStatus.length}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-2"
                  style={{
                    width: `${
                      (onlineDevices.length / Math.max(powerStatus.length, 1)) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium">Offline Devices</span>
                <span className="text-sm font-medium">
                  {offlineDevices.length} / {powerStatus.length}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-2"
                  style={{
                    width: `${
                      (offlineDevices.length /
                        Math.max(powerStatus.length, 1)) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Battery Status</h4>
                <div className="space-y-2">
                  {[
                    {
                      level: "Critical (<25%)",
                      count: powerStatus.filter((d) => d.batteryLevel < 25)
                        .length,
                    },
                    {
                      level: "Low (25-50%)",
                      count: powerStatus.filter(
                        (d) => d.batteryLevel >= 25 && d.batteryLevel < 50
                      ).length,
                    },
                    {
                      level: "Medium (50-75%)",
                      count: powerStatus.filter(
                        (d) => d.batteryLevel >= 50 && d.batteryLevel < 75
                      ).length,
                    },
                    {
                      level: "High (75-100%)",
                      count: powerStatus.filter((d) => d.batteryLevel >= 75)
                        .length,
                    },
                  ].map((item) => (
                    <div
                      key={item.level}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.level}
                      </span>
                      <span>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/power-status">
                <Zap className="mr-2 h-4 w-4" />
                Power Status
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleManualSync}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Blockchain
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
