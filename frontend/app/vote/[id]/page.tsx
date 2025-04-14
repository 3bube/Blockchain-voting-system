"use client";

import Link from "next/link";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
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

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
}

interface VoteDetails {
  id: string;
  title: string;
  description: string;
  endDate: string;
  candidates: Candidate[];
}

export default function CastVotePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [blockchainRef, setBlockchainRef] = useState<string>("");

  const voteId = params.id as string;

  useEffect(() => {
    const fetchVoteDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/vote/${voteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVoteDetails(data);
        } else {
          toast.message("Error", {
            description: "Failed to load vote details",
          });
          router.push("/vote");
        }
      } catch (error) {
        console.error("Failed to fetch vote details:", error);
        toast.message("Error", {
          description: "An error occurred while loading vote details",
        });
        router.push("/vote");
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, [voteId, router, toast]);

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.message("Error", {
        description: "Please select a candidate",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/vote/${voteId}/cast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ candidateId: selectedCandidate }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(true);
        setBlockchainRef(data.blockchainReference);
        toast.message("Success", {
          description: "Your vote has been recorded on the blockchain",
        });
      } else {
        const error = await response.json();
        toast.message("Error", {
          description: error.message || "Failed to cast vote",
        });
      }
    } catch (error) {
      toast.message("Error", {
        description: "An error occurred while casting your vote",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Vote Cast Successfully!</CardTitle>
            <CardDescription>
              Your vote has been securely recorded on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Blockchain Reference:</h3>
              <p className="text-xs font-mono break-all">{blockchainRef}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Vote Details:</h3>
              <p>
                <span className="text-muted-foreground">Election:</span>{" "}
                {voteDetails?.title}
              </p>
              <p>
                <span className="text-muted-foreground">Candidate:</span>{" "}
                {
                  voteDetails?.candidates.find(
                    (c) => c.id === selectedCandidate
                  )?.name
                }
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/history">View Voting History</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/vote")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Votes
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{voteDetails?.title}</CardTitle>
          <CardDescription>{voteDetails?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">End Date:</span>
            <span>
              {voteDetails
                ? new Date(voteDetails.endDate).toLocaleDateString()
                : ""}
            </span>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Select a Candidate</h3>

            <RadioGroup
              value={selectedCandidate}
              onValueChange={setSelectedCandidate}
              className="space-y-4"
            >
              {voteDetails?.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`flex items-center space-x-2 border rounded-lg p-4 transition-colors ${
                    selectedCandidate === candidate.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem
                    value={candidate.id}
                    id={candidate.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={candidate.id}
                    className="flex flex-col flex-grow cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="text-lg font-medium">
                      {candidate.name}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {candidate.party}
                    </span>
                    <span className="text-sm mt-1">
                      {candidate.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!selectedCandidate || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Cast Vote"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to cast your vote for{" "}
                  <span className="font-medium">
                    {
                      voteDetails?.candidates.find(
                        (c) => c.id === selectedCandidate
                      )?.name
                    }
                  </span>
                  . This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCastVote}>
                  Confirm Vote
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
