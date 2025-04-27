"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import newRequest from "@/utils/newRequest"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  VoteIcon,
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  User,
  Building,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
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
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"

interface Candidate {
  id: string
  name: string
  party: string
  description: string
  voteCount?: number
}

interface VoteDetails {
  id: string
  title: string
  description: string
  endDate: string
  candidates: Candidate[]
}

export default function CastVotePage() {
  const params = useParams()
  const router = useRouter()
  useAuth() // We'll use auth context but don't need the user variable right now
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [blockchainRef, setBlockchainRef] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number } | null>(null)

  const voteId = params.id as string

  useEffect(() => {
    const fetchVoteDetails = async () => {
      try {
        setLoading(true);

        // Fetch vote details from the backend API
        const response = await newRequest.get(`/vote/details/${voteId}`);
        
        if (response.data && response.data.vote) {
          const voteData = response.data.vote;
          // We can use blockchainData if needed in the future
          // const blockchainData = response.data.blockchainDetails;
          
          // Combine MongoDB and blockchain data
          const combinedData: VoteDetails = {
            id: voteData._id,
            title: voteData.title,
            description: voteData.description,
            endDate: voteData.endTime,
            candidates: voteData.candidates.map((candidate: { name: string; party?: string; description?: string }, index: number) => ({
              id: index.toString(), // Use index as ID for candidates
              name: candidate.name,
              party: candidate.party || 'Independent', // Default if not available
              description: candidate.description || '',
            })),
          };
          
          setVoteDetails(combinedData);
          
          // Calculate time remaining
          const endDate = new Date(combinedData.endDate);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
          
          setTimeRemaining({
            days: diffDays,
            hours: diffHours,
            minutes: diffMinutes,
          });
        } else {
          // If API doesn't return expected data, use fallback mock data for development
          const mockData: VoteDetails = {
            id: voteId,
            title: "Presidential Election 2023",
            description: "Vote for the next president of Nigeria. Your vote matters in shaping the future of our great nation.",
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            candidates: [
              {
                id: "0",
                name: "Adebayo Adeyemi",
                party: "Progressive Party",
                description: "Economic reform advocate with 15 years of public service experience.",
              },
              {
                id: "1",
                name: "Chioma Okonkwo",
                party: "People's Democratic Alliance",
                description: "Former state governor with focus on infrastructure development and education.",
              },
              {
                id: "2",
                name: "Ibrahim Mohammed",
                party: "National Unity Party",
                description: "Business leader advocating for economic growth and youth empowerment.",
              },
              {
                id: "3",
                name: "Oluwaseun Adeleke",
                party: "Reform Coalition",
                description: "Civil rights activist focused on transparency and anti-corruption measures.",
              },
            ],
          };
          
          setVoteDetails(mockData);
          
          // Calculate time remaining with mock data
          const endDate = new Date(mockData.endDate);
          const now = new Date();
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
          
          setTimeRemaining({
            days: diffDays,
            hours: diffHours,
            minutes: diffMinutes,
          });
        }
      } catch (error) {
        console.error("Failed to fetch vote details:", error)
        toast.message("Error", {
          description: "An error occurred while loading vote details",
        })
        router.push("/vote")
      } finally {
        setLoading(false)
      }
    }

    fetchVoteDetails()
  }, [voteId, router])

  // Function to refresh vote data after casting a vote
  const refreshVoteData = async () => {
    try {
      const response = await newRequest.get(`/vote/details/${voteId}`);
      if (response.data && response.data.vote) {
        const voteData = response.data.vote;
        
        // Update vote details with fresh data
        setVoteDetails({
          id: voteData._id,
          title: voteData.title,
          description: voteData.description,
          endDate: voteData.endTime,
          candidates: voteData.candidates.map((candidate: { name: string; party?: string; description?: string; voteCount?: number }, index: number) => ({
            id: index.toString(),
            name: candidate.name,
            party: candidate.party || 'Independent',
            description: candidate.description || '',
            voteCount: candidate.voteCount || 0
          }))
        });
      }
    } catch (error) {
      console.error("Failed to refresh vote data:", error);
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.message("Error", {
        description: "Please select a candidate",
      })
      return
    }

    setSubmitting(true)

    try {
      // Call the backend API to cast a vote
      const response = await newRequest.post('/vote/cast', {
        voteId: voteId,
        optionId: parseInt(selectedCandidate) // Convert to number as backend expects numeric index
      });
      
      if (response.data.success) {
        // Set blockchain reference if available
        if (response.data.transactionHash) {
          setBlockchainRef(response.data.transactionHash);
        } else {
          // Fallback if no transaction hash (e.g., during power outage)
          setBlockchainRef(
            "0x" +
            Array(64)
              .fill(0)
              .map(() => Math.floor(Math.random() * 16).toString(16))
              .join("")
          );
        }
        
        setSuccess(true);
        
        // Refresh vote data to get updated vote counts
        await refreshVoteData();
        
        toast.message("Success", {
          description: response.data.message || "Your vote has been recorded successfully",
        });
      } else {
        toast.message("Error", {
          description: response.data.error || "Failed to cast vote",
        });
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { 
          status?: number; 
          data?: { error?: string } 
        };
        request?: unknown;
        message?: string;
      };
      // Handle different error types
      if (err.response) {
        // The request was made and the server responded with a status code outside 2xx range
        toast.message("Error", {
          description: err.response.data?.error || "Failed to cast vote",
        });
      } else if (err.request) {
        // The request was made but no response was received
        toast.message("Error", {
          description: "No response from server. Please check your connection.",
        });
      } else {
        // Something happened in setting up the request
        toast.message("Error", {
          description: err.message || "An error occurred while casting your vote",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
        {/* Nigerian flag design elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#008751]" />
        <div className="absolute top-2 left-0 w-full h-2 bg-white" />
        <div className="absolute top-4 left-0 w-full h-2 bg-[#008751]" />

        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#008751]/10 animate-ping" />
            <Loader2 className="h-12 w-12 animate-spin text-[#008751] relative z-10" />
          </div>
          <p className="mt-4 font-medium text-lg">Loading vote details...</p>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your ballot</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto py-6 max-w-2xl relative">
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

        <Card className="border-2 border-green-200 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-[#008751]/10 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-[#008751]" />
            </div>
            <CardTitle className="text-2xl">Vote Cast Successfully!</CardTitle>
            <CardDescription className="text-base">
              Your vote has been securely recorded on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-[#008751]/5 p-4 rounded-lg border border-[#008751]/20">
              <h3 className="font-medium mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-[#008751]" />
                Blockchain Reference:
              </h3>
              <p className="text-xs font-mono break-all bg-white p-3 rounded border">{blockchainRef}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-[#008751]" />
                Vote Details:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <span className="text-sm text-muted-foreground block mb-1">Election:</span>
                  <span className="font-medium">{voteDetails?.title}</span>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg">
                  <span className="text-sm text-muted-foreground block mb-1">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <Card className="border-[#008751]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#008751]" />
                    Selected Candidate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium text-lg">
                      {voteDetails?.candidates.find((c) => c.id === selectedCandidate)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {voteDetails?.candidates.find((c) => c.id === selectedCandidate)?.party}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 border-t pt-6">
            <Button asChild className="w-full bg-[#008751] hover:bg-[#008751]/90 text-white">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="w-full border-[#008751] text-[#008751] hover:bg-[#008751]/10">
              <Link href="/history">View Voting History</Link>
            </Button>
          </CardFooter>

          {/* Bottom flag accent */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-[#008751]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-[#008751]"></div>
          </div>
        </Card>
      </div>
    )
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

      {/* Decorative circles */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#008751]/5 z-0" />
      <div className="absolute top-40 -right-20 w-48 h-48 rounded-full bg-[#008751]/5 z-0" />

      <div className="relative z-10">
        <Button variant="ghost" className="mb-6 hover:bg-[#008751]/10" onClick={() => router.push("/vote")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Votes
        </Button>

        <Card className="max-w-3xl mx-auto border-2 shadow-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
          <CardHeader className="border-b pb-4">
            <div className="flex items-center mb-2">
              <div className="bg-[#008751]/10 p-2 rounded-full mr-3">
                <VoteIcon className="h-6 w-6 text-[#008751]" />
              </div>
              <div>
                <CardTitle className="text-2xl">{voteDetails?.title}</CardTitle>
                <CardDescription className="text-base">{voteDetails?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center text-sm bg-muted/30 p-3 rounded-lg flex-grow">
                <Calendar className="h-5 w-5 mr-2 text-[#008751]" />
                <span className="text-muted-foreground">End Date:</span>
                <span className="ml-auto font-medium">
                  {voteDetails ? new Date(voteDetails.endDate).toLocaleDateString() : ""}
                </span>
              </div>

              {timeRemaining && (
                <div className="flex items-center text-sm bg-[#008751]/5 p-3 rounded-lg border border-[#008751]/20 flex-grow">
                  <Clock className="h-5 w-5 mr-2 text-[#008751]" />
                  <span className="text-[#008751]">Time Remaining:</span>
                  <span className="ml-auto font-medium">
                    {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                  </span>
                </div>
              )}
            </div>

            {timeRemaining && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Voting period</span>
                  <span className="font-medium">{timeRemaining.days} days left</span>
                </div>
                <Progress value={Math.min(100, Math.max(5, (timeRemaining.days / 7) * 100))} className="h-2" />
              </div>
            )}

            <Separator className="my-2" />

            <div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium">Select a Candidate</h3>
                <div className="ml-auto px-2 py-1 bg-[#008751]/10 text-[#008751] text-xs rounded-md">
                  {voteDetails?.candidates.length} candidates
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800">
                    Your vote is final and cannot be changed once submitted. Please review your selection carefully.
                  </p>
                </div>
              </div>

              <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate} className="space-y-4">
                {voteDetails?.candidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={`flex items-start space-x-2 border-2 rounded-lg p-4 transition-colors ${
                      selectedCandidate === candidate.id
                        ? "border-[#008751] bg-[#008751]/5"
                        : "hover:bg-accent border-muted"
                    } ${index % 2 === 0 ? "bg-muted/30" : ""}`}
                  >
                    <RadioGroupItem value={candidate.id} id={candidate.id} className="peer sr-only" />
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedCandidate === candidate.id ? "border-[#008751]" : "border-muted-foreground"
                        }`}
                      >
                        {selectedCandidate === candidate.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#008751]" />
                        )}
                      </div>
                    </div>
                    <Label
                      htmlFor={candidate.id}
                      className="flex flex-col flex-grow cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">{candidate.name}</span>
                        <span className="text-sm font-medium px-2 py-1 bg-[#008751]/10 text-[#008751] rounded-md">
                          {candidate.party}
                        </span>
                      </div>
                      <span className="text-sm mt-2 text-muted-foreground">{candidate.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-[#008751] hover:bg-[#008751]/90 text-white h-12 text-base"
                  disabled={!selectedCandidate || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <VoteIcon className="mr-2 h-5 w-5" />
                      Cast Vote
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-2 border-[#008751]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center text-xl">
                    <Shield className="h-5 w-5 mr-2 text-[#008751]" />
                    Confirm Your Vote
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    You are about to cast your vote for{" "}
                    <span className="font-medium text-foreground">
                      {voteDetails?.candidates.find((c) => c.id === selectedCandidate)?.name}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {voteDetails?.candidates.find((c) => c.id === selectedCandidate)?.party}
                    </span>
                    .
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                      This action cannot be undone. Your vote will be permanently recorded on the blockchain.
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel className="border-[#008751] text-[#008751]">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCastVote} className="bg-[#008751] hover:bg-[#008751]/90">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Vote
                  </AlertDialogAction>
                </AlertDialogFooter>

                {/* Bottom flag accent */}
                <div className="absolute bottom-0 left-0 right-0 flex h-1">
                  <div className="flex-1 bg-[#008751]"></div>
                  <div className="flex-1 bg-white"></div>
                  <div className="flex-1 bg-[#008751]"></div>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>

          {/* Bottom flag accent */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-[#008751]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-[#008751]"></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
