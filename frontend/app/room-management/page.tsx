"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import newRequest from "@/utils/newRequest";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Vote {
  _id: string;
  title: string;
  description: string;
}

interface Room {
  _id: string;
  name: string;
  description: string;
  creator: string;
  vote: string | { _id: string; title: string };
  maxParticipants: number;
  participants: string[];
  startTime: string;
  endTime: string;
  status: "waiting" | "active" | "completed" | "cancelled";
  isPrivate: boolean;
  accessCode: string;
  createdAt: string;
  updatedAt: string;
}

export default function RoomManagementPage() {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [availableVotes, setAvailableVotes] = useState<Vote[]>([]);

  const [newRoomData, setNewRoomData] = useState({
    voteId: "",
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    maxParticipants: 100,
    isPrivate: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (!isAdmin) {
      toast.error("You don't have permission to access this page");
      router.push("/dashboard");
      return;
    }

    fetchRooms();
    fetchAvailableVotes();
  }, [isAdmin, router]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await newRequest.get("/room/all");

      if (response.data.success) {
        setRooms(response.data.rooms || []);
      } else {
        toast.error("Failed to load rooms");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "An error occurred while fetching rooms");
    } finally {
      setLoading(false);
    }
  };

  console.log(rooms);

  const fetchAvailableVotes = async () => {
    try {
      const response = await newRequest.get("/vote/all");

      if (response.data.success) {
        setAvailableVotes(response.data.votes || []);
      } else {
        toast.error("Failed to load available votes");
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "An error occurred while fetching votes");
    }
  };

  const handleCopyCode = (code: string, roomId: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopiedId(roomId);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success("Access code copied to clipboard");
      },
      () => {
        toast.error("Could not copy access code");
      }
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewRoomData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (name: string, value: number) => {
    setNewRoomData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setNewRoomData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRoom(true);

    try {
      // Create the payload for room creation
      const payload = {
        ...newRoomData,
        maxParticipants: newRoomData.maxParticipants || 100,
      };

      // Send the request to create a new room
      const response = await newRequest.post("/room/create", payload);

      if (response.data.success) {
        // Add the new room to the list
        setRooms((prev) => [...prev, response.data.room]);

        // Close the dialog and reset the form
        setDialogOpen(false);
        setNewRoomData({
          voteId: "",
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          maxParticipants: 100,
          isPrivate: false,
        });

        // Show success message
        toast.success("Room created successfully");

        // Refresh the rooms list
        fetchRooms();
      } else {
        toast.error(response.data.error || "Failed to create room");
      }
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while creating the room"
      );
    } finally {
      setCreatingRoom(false);
    }
  };

  const toggleRoomStatus = async (roomId: string, currentStatus: string) => {
    try {
      // Determine the new status
      const newStatus = currentStatus === "active" ? "cancelled" : "active";

      // Call the API to update the room status
      const response = await newRequest.put(`/room/${roomId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        // Update the local state
        setRooms((prev) =>
          prev.map((room) =>
            room._id === roomId ? { ...room, status: newStatus } : room
          )
        );

        toast.success(
          "Room " +
            (currentStatus === "active" ? "deactivated" : "activated") +
            " successfully"
        );

        // Refresh the rooms list
        fetchRooms();
      } else {
        toast.error(response.data.error || "Failed to update room status");
      }
    } catch (error) {
      const err = error as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      console.error("Error updating room status:", error);
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while updating room status"
      );
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
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeRooms = rooms.filter(
    (room) => room.status === "active" || room.status === "waiting"
  );
  const inactiveRooms = rooms.filter(
    (room) => room.status === "cancelled" || room.status === "completed"
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Room Management</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6">
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>
                Create a new voting room for participants to join
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRoom}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="voteId">
                    Select Vote <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="voteId"
                    name="voteId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newRoomData.voteId}
                    onChange={(e) => handleInputChange(e)}
                    required
                  >
                    <option value="">Select a vote</option>
                    {availableVotes.map((vote) => (
                      <option key={vote._id} value={vote._id}>
                        {vote.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Room Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter room name"
                    value={newRoomData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter room description"
                    value={newRoomData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="datetime-local"
                      value={newRoomData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endTime">
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="datetime-local"
                      value={newRoomData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="2"
                    max="1000"
                    value={newRoomData.maxParticipants}
                    onChange={(e) =>
                      handleNumberChange(
                        "maxParticipants",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={newRoomData.isPrivate}
                    onChange={(e) =>
                      handleSwitchChange("isPrivate", e.target.checked)
                    }
                  />
                  <Label htmlFor="isPrivate">
                    Make room private (requires access code)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creatingRoom}>
                  {creatingRoom ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">
            Active Rooms ({activeRooms.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive Rooms ({inactiveRooms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Active Rooms</h3>
              <p className="text-muted-foreground mt-2">
                There are no active voting rooms at the moment.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRooms.map((room) => (
                <Card key={room._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{room.name}</CardTitle>
                      <Badge>
                        {room.status === "waiting" ? "Waiting" : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created: {new Date(room.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Access Code</Label>
                      <div className="flex items-center">
                        <Input
                          value={room.accessCode}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={() =>
                            handleCopyCode(room.accessCode, room._id)
                          }
                        >
                          {copiedId === room._id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="text-muted-foreground">Vote ID:</span>{" "}
                        {room?.vote?._id}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Start:</span>{" "}
                        {new Date(room.startTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-muted-foreground">End:</span>{" "}
                        {new Date(room.endTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          Participants:
                        </span>{" "}
                        {room.participants.length} / {room.maxParticipants}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => toggleRoomStatus(room._id, room.status)}
                    >
                      Deactivate Room
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive">
          {inactiveRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Inactive Rooms</h3>
              <p className="text-muted-foreground mt-2">
                There are no inactive voting rooms at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inactiveRooms.map((room) => (
                <Card key={room._id} className="opacity-80">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{room.name}</CardTitle>
                      <Badge variant="outline">
                        {room.status === "completed"
                          ? "Completed"
                          : "Cancelled"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Created: {new Date(room.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Access Code</Label>
                      <div className="flex items-center">
                        <Input
                          value={room.accessCode}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={() =>
                            handleCopyCode(room.accessCode, room._id)
                          }
                        >
                          {copiedId === room._id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="text-muted-foreground">Vote ID:</span>{" "}
                        {typeof room.vote === "string"
                          ? room.vote
                          : room.vote._id}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Start:</span>{" "}
                        {new Date(room.startTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-muted-foreground">End:</span>{" "}
                        {new Date(room.endTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-muted-foreground">
                          Participants:
                        </span>{" "}
                        {room.participants.length} / {room.maxParticipants}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toggleRoomStatus(room._id, room.status)}
                    >
                      Reactivate Room
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
