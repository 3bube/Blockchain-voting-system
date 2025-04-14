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
import { Loader2, Search, AlertCircle, ExternalLink } from "lucide-react";

interface VoteHistory {
  id: string;
  title: string;
  description: string;
  endDate: string;
  candidateVoted: string;
  blockchainReference: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<VoteHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<VoteHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/vote/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data);
          setFilteredHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch voting history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(
        (vote) =>
          vote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vote.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vote.candidateVoted.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

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
        <h1 className="text-3xl font-bold">Voting History</h1>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No Voting History Found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {history.length === 0
              ? "You haven't participated in any voting sessions yet."
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
        <div className="space-y-6">
          {filteredHistory.map((vote) => (
            <Card key={vote.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{vote.title}</CardTitle>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <CardDescription>{vote.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Date
                    </h3>
                    <p>{new Date(vote.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Your Vote
                    </h3>
                    <p>{vote.candidateVoted}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Blockchain Reference
                  </h3>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {vote.blockchainReference}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/history/${vote.id}`}>
                    View Full Results
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
