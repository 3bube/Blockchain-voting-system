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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, AlertCircle } from "lucide-react";

interface VoteItem {
  id: string;
  title: string;
  description: string;
  status: "active" | "ended";
  endDate: string;
  candidates: number;
}

export default function VotePage() {
  const { user } = useAuth();
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [filteredVotes, setFilteredVotes] = useState<VoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/vote/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const activeVotes = data.filter(
            (vote: VoteItem) => vote.status === "active"
          );
          setVotes(activeVotes);
          setFilteredVotes(activeVotes);
        }
      } catch (error) {
        console.error("Failed to fetch votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVotes(votes);
    } else {
      const filtered = votes.filter(
        (vote) =>
          vote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vote.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVotes(filtered);
    }
  }, [searchQuery, votes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Active Votes</h1>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search votes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredVotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No Active Votes Found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {votes.length === 0
              ? "There are no active voting sessions at the moment."
              : "No votes match your search criteria. Try a different search term."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVotes.map((vote) => (
            <Card key={vote.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{vote.title}</CardTitle>
                  <Badge>Active</Badge>
                </div>
                <CardDescription>{vote.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date:</span>
                    <span>{new Date(vote.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Candidates:</span>
                    <span>{vote.candidates}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/vote/${vote.id}`}>Cast Vote</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
