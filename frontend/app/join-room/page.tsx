"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, DoorOpen } from "lucide-react";
import { toast } from "sonner";

export default function JoinRoomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.message("Error", {
        description: "Please enter an access code",
      });
      return;
    }

    setLoading(true);

    router.push(`/vote/${accessCode}`);

    // try {
    //   const token = localStorage.getItem("token");
    //   const response = await fetch("/api/join", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({ code: accessCode }),
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     toast.message("Room joined successfully", {
    //       description: `You've joined: ${data.title}`,
    //     });
    //     router.push(`/vote/${data.id}`);
    //   } else {
    //     const error = await response.json();
    //     toast.message("Failed to join room", {
    //       description: error.message || "Invalid access code",
    //     });
    //   }
    // } catch (error) {
    //   if (error instanceof Error) {
    //     toast.message("Error", {
    //       description: error.message,
    //     });
    //   } else {
    //     toast.message("Error", {
    //       description: "An error occurred while joining the room",
    //     });
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="container mx-auto py-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <DoorOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle className="text-2xl">Join a Voting Room</CardTitle>
          <CardDescription>
            Enter the access code to join a specific voting session
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleJoinRoom}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="accessCode"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center text-lg tracking-wider"
              />
              <p className="text-xs text-center text-muted-foreground">
                The access code is provided by the election administrator
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
