"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Loader2, ArrowLeft, BarChart2, Download } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  votes: number;
}

interface VoteDetails {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: "active" | "ended";
  candidates: Candidate[];
  totalVotes: number;
}

export default function VoteResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null);

  const voteId = params.id as string;

  useEffect(() => {
    if (!isAdmin) {
      toast.message("Access Denied", {
        description: "You don't have permission to access this page",
      });
      router.push("/dashboard");
      return;
    }

    const fetchVoteDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/vote/${voteId}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVoteDetails(data);
        } else {
          toast.message("Error", {
            description: "Failed to load vote results",
          });
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch vote results:", error);
        toast.message("Error", {
          description: "An error occurred while loading vote results",
        });
        router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, [voteId, router, isAdmin]);

  const handleExportResults = () => {
    if (!voteDetails) return;

    // Create CSV content
    const headers = "Candidate,Party,Votes,Percentage\n";
    const rows = voteDetails.candidates
      .map((candidate) => {
        const percentage =
          voteDetails.totalVotes > 0
            ? ((candidate.votes / voteDetails.totalVotes) * 100).toFixed(2)
            : "0.00";
        return `"${candidate.name}","${candidate.party}",${candidate.votes},${percentage}%`;
      })
      .join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);

    // Create download link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vote-results-${voteDetails.title.replace(/\s+/g, "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin || !voteDetails) {
    return null;
  }

  // Sort candidates by votes (descending)
  const sortedCandidates = [...voteDetails.candidates].sort(
    (a, b) => b.votes - a.votes
  );
  const winner = sortedCandidates[0];
  const hasVotes = voteDetails.totalVotes > 0;

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/admin/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {voteDetails.title}
                  </CardTitle>
                  <CardDescription>{voteDetails.description}</CardDescription>
                </div>
                <Badge
                  variant={
                    voteDetails.status === "active" ? "default" : "outline"
                  }
                >
                  {voteDetails.status === "active" ? "Active" : "Ended"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">End Date:</span>
                <span>{new Date(voteDetails.endDate).toLocaleString()}</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Results</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportResults}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>

                {!hasVotes ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No votes have been cast yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedCandidates.map((candidate) => {
                      const percentage = (
                        (candidate.votes / voteDetails.totalVotes) *
                        100
                      ).toFixed(2);
                      const isWinner =
                        candidate.id === winner.id &&
                        voteDetails.status === "ended";

                      return (
                        <div key={candidate.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">
                                {candidate.name}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {candidate.party}
                              </span>
                              {isWinner && (
                                <Badge className="ml-2 bg-green-500">
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-medium">
                                {candidate.votes}
                              </span>
                              <span className="text-sm text-muted-foreground ml-1">
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-2 ${
                                isWinner ? "bg-green-500" : "bg-primary"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full text-center">
                <span className="text-muted-foreground">Total Votes: </span>
                <span className="font-bold">{voteDetails.totalVotes}</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <Badge
                  variant={
                    voteDetails.status === "active" ? "default" : "outline"
                  }
                  className="w-full justify-center py-1"
                >
                  {voteDetails.status === "active" ? "Active" : "Ended"}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total Votes
                </h3>
                <div className="text-3xl font-bold text-center">
                  {voteDetails.totalVotes}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Candidates
                </h3>
                <div className="text-3xl font-bold text-center">
                  {voteDetails.candidates.length}
                </div>
              </div>

              {hasVotes && voteDetails.status === "ended" && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Winner
                  </h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="font-bold text-lg">{winner.name}</h4>
                        <p className="text-muted-foreground">{winner.party}</p>
                        <div className="mt-2">
                          <span className="font-medium">
                            {winner.votes} votes
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">
                            (
                            {(
                              (winner.votes / voteDetails.totalVotes) *
                              100
                            ).toFixed(2)}
                            %)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {voteDetails.status === "active" && (
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/admin/votes/edit/${voteId}`}>Edit Vote</Link>
                </Button>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href={`/vote/${voteId}`}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Voting Page
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
