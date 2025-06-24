"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import newRequest from "@/utils/newRequest";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the Vote interface from API
interface Vote {
  _id: string;
  voteId: string;
  title: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  roomName?: string;
  accessCode?: string;
  voterCount?: number;
  maxParticipants?: number;
}

// Define the Room interface
interface Room {
  _id: string;
  voteId: string;
  name: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  accessCode?: string;
  voterCount?: number;
  maxParticipants?: number;
  vote: { _id: string; title: string };
}

export default function RoomManagementPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalRoomCount, setTotalRoomCount] = useState(0);
  const [activeRoomCount, setActiveRoomCount] = useState(0);
  const [inactiveRoomCount, setInactiveRoomCount] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRoomData = useCallback(async () => {
    try {
      setRefreshing(true);

      // Fetch votes from backend API (which contain room information)
      const response = await newRequest.get("/vote/all");

      if (response.data.success) {
        // Extract room data from votes
        const votesData = response.data.votes || [];
        
        // Transform votes into room format
        const roomsData = votesData.map((vote: Vote) => ({
          _id: vote._id,
          voteId: vote.voteId,
          name: vote.roomName || "Unnamed Room",
          description: vote.description || "",
          status: vote.status,
          startTime: vote.startTime,
          endTime: vote.endTime,
          accessCode: vote.accessCode,
          voterCount: vote.voterCount || 0,
          maxParticipants: vote.maxParticipants || 100,
          vote: { _id: vote._id, title: vote.title }
        })).filter((room: Room) => room.name && room.name !== "Unnamed Room");
        
        setRooms(roomsData);
        setTotalRoomCount(roomsData.length);
        
        // Calculate active and inactive rooms
        const active = roomsData.filter((room: Room) =>
          room.status === "active" || room.status === "waiting"
        ).length;
        setActiveRoomCount(active);
        setInactiveRoomCount(roomsData.length - active);
      } else {
        toast.error("Failed to fetch room data");
      }
    } catch (error) {
      console.error("Error fetching room data:", error);
      toast.error("Error connecting to the server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  if (!isAdmin) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto py-6 relative">
      {/* Nigerian flag design elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#008751]" />
      <div className="absolute top-1 left-0 w-full h-1 bg-white" />
      <div className="absolute top-2 left-0 w-full h-1 bg-[#008751]" />

      {/* Flag corner decoration */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className="w-6 h-12 flex flex-col">
          <div className="flex-1 bg-[#008751]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#008751]" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground mt-1">Manage voting rooms and monitor blockchain status</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRoomData}
          disabled={refreshing}
          className="self-start md:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#008751] mx-auto mb-4" />
            <p className="text-lg font-medium">Loading room data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Room Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-[#008751] shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 text-[#008751] mr-2" />
                  Total Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold">{totalRoomCount}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total voting rooms in the system
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Active Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold">{activeRoomCount}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently active voting rooms
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-gray-500 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  Inactive Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-3xl font-bold">{inactiveRoomCount}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Completed or cancelled rooms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Room List */}
          <Card>
            <CardHeader>
              <CardTitle>Room List</CardTitle>
              <CardDescription>
                All voting rooms in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
                  <div className="bg-muted rounded-full p-3 mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium">No Rooms Found</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    There are no voting rooms created yet. Create a new vote to generate a room.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <Card key={room._id} className="overflow-hidden">
                      <div className={`h-1 w-full ${room.status === "active" ? "bg-green-500" : room.status === "waiting" ? "bg-blue-500" : "bg-gray-300"}`} />
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-medium">{room.name}</h3>
                              <Badge variant={room.status === "active" ? "default" : room.status === "waiting" ? "secondary" : "outline"}>
                                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{room.description}</p>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Access Code:</span>
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{room.accessCode}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Voters:</span>
                                <span>{room.voterCount || 0} / {room.maxParticipants || "∞"}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Start:</span>{" "}
                                {room.startTime ? new Date(room.startTime).toLocaleString() : "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">End:</span>{" "}
                                {room.endTime ? new Date(room.endTime).toLocaleString() : "N/A"}
                              </div>
                            </div>
                          </div>
                          {/* <div className="flex items-center gap-2 self-end md:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/vote/${room.vote._id}`)}
                              className="flex-shrink-0"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Vote
                            </Button>
                          </div> */}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
