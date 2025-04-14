"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Loader2, Vote, History, AlertCircle } from "lucide-react";
import newRequest from "@/utils/newRequest";
import { toast } from "sonner";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeVotes, setActiveVotes] = useState<VoteItem[]>([]);
  const [pastVotes, setPastVotes] = useState<VoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const { data } = await newRequest.get("/vote/all");

        if (data.success) {
          const activeVotesList = data.votes.filter(
            (vote: VoteItem) => vote.status === "active"
          );
          const pastVotesList = data.votes.filter(
            (vote: VoteItem) => vote.status === "closed"
          );

          setActiveVotes(activeVotesList);
          setPastVotes(pastVotesList);
        } else {
          toast.error("Failed to fetch votes");
        }
      } catch (error) {
        console.error("Failed to fetch votes:", error);
        toast.error("Error connecting to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  console.log(activeVotes, pastVotes);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeVotes.length}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/vote">
                <Vote className="mr-2 h-4 w-4" />
                Cast Vote
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Past Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pastVotes.length}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/history">
                <History className="mr-2 h-4 w-4" />
                View History
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Join Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enter a room code to access a specific voting session
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/join-room">Join Room</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">Active Votes</TabsTrigger>
          <TabsTrigger value="past">Past Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Active Votes</h3>
              <p className="text-sm text-muted-foreground mt-2">
                There are no active voting sessions at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeVotes.map((vote) => (
                <Card key={vote._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{vote.title}</CardTitle>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <CardDescription>
                      {vote.isPending ? "(Pending blockchain sync)" : ""}
                      {vote.candidateCount} candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Ends on: {new Date(vote.endTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votes cast: {vote.voterCount}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/vote/${vote._id}`}>Cast Vote</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Past Votes</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You haven't participated in any voting sessions yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastVotes.map((vote) => (
                <Card key={vote._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{vote.title}</CardTitle>
                      <Badge variant="outline">Ended</Badge>
                    </div>
                    <CardDescription>
                      {vote.candidateCount} candidates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Ended on: {new Date(vote.endTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total votes: {vote.voterCount}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/history/${vote._id}`}>View Results</Link>
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
