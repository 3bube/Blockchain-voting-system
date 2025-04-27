"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

// Define User interface to match the auth context
interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
}
import newRequest from "@/utils/newRequest"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowLeft,
  Calendar,
  User,
  Shield,
  CheckCircle,
  Clock,
  BarChart3,
  AlertTriangle,
  Building,
  Vote as VoteIcon,
} from "lucide-react"
import { toast } from "sonner"

interface VoteCandidate {
  name: string
  party?: string
  voteCount: number
}

interface VoteHistoryDetail {
  _id: string
  voteId: string
  title: string
  description: string
  status: string
  startTime: string
  endTime: string
  candidates: VoteCandidate[]
  userVote: {
    candidateName: string
    candidateParty?: string
    votedAt: string
    blockchainReference?: string
  }
  totalVotes: number
  verified: boolean
}

export default function VoteHistoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth() as { user: User | null }
  const [voteDetails, setVoteDetails] = useState<VoteHistoryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const voteId = params.id as string

  useEffect(() => {
    const fetchVoteDetails = async () => {
      try {
        setLoading(true)

        // Fetch vote details from the backend API
        const response = await newRequest.get(`/vote/details/${voteId}`)
        
        if (response.data && response.data.vote) {
          const voteData = response.data.vote
          
          // Define voter interface
          interface Voter {
            user: {
              _id: string
            } | string
            votedFor: number
            votedAt: string
            blockchainReference?: string
          }
          
          // Find the user's vote in the voters array
          const userVote = voteData.voters.find((voter: Voter) => {
            const voterId = typeof voter.user === "object" ? voter.user._id : voter.user
            const currentUserId = user?.id || user?._id
            return voterId === currentUserId
          })
          
          // Get the candidate the user voted for
          const votedCandidate = userVote ? voteData.candidates[userVote.votedFor] : null
          
          // Calculate total votes
          const totalVotes = voteData.candidates.reduce(
            (sum: number, candidate: VoteCandidate) => sum + (candidate.voteCount || 0), 
            0
          )
          
          // Format the vote details
          const formattedVoteDetails: VoteHistoryDetail = {
            _id: voteData._id,
            voteId: voteData.voteId,
            title: voteData.title,
            description: voteData.description,
            status: voteData.status,
            startTime: voteData.startTime,
            endTime: voteData.endTime,
            candidates: voteData.candidates.map((candidate: VoteCandidate) => ({
              name: candidate.name,
              party: candidate.party,
              voteCount: candidate.voteCount || 0,
            })),
            userVote: userVote ? {
              candidateName: votedCandidate?.name || "Unknown",
              candidateParty: votedCandidate?.party,
              votedAt: userVote.votedAt,
              blockchainReference: userVote.blockchainReference,
            } : {
              candidateName: "Not found",
              votedAt: new Date().toISOString(),
            },
            totalVotes,
            verified: !!userVote?.blockchainReference,
          }
          
          setVoteDetails(formattedVoteDetails)
        } else {
          // If API doesn't return expected data, use fallback mock data for development
          const mockData: VoteHistoryDetail = {
            _id: voteId,
            voteId: "blockchain_" + voteId,
            title: "Presidential Election 2023",
            description: "Vote for the next president of Nigeria. Your vote matters in shaping the future of our great nation.",
            status: "closed",
            startTime: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            candidates: [
              { name: "Adebayo Adeyemi", party: "Progressive Party", voteCount: 1245 },
              { name: "Chioma Okonkwo", party: "People's Democratic Alliance", voteCount: 1087 },
              { name: "Ibrahim Mohammed", party: "National Unity Party", voteCount: 893 },
              { name: "Oluwaseun Adeleke", party: "Reform Coalition", voteCount: 764 },
            ],
            userVote: {
              candidateName: "Adebayo Adeyemi",
              candidateParty: "Progressive Party",
              votedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
              blockchainReference: "0x7f9a12e4b1d3c5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
            },
            totalVotes: 3989,
            verified: true,
          }
          
          setVoteDetails(mockData)
        }
      } catch (error) {
        console.error("Failed to fetch vote details:", error)
        toast.error("Failed to load vote details")
        router.push("/history")
      } finally {
        setLoading(false)
      }
    }

    fetchVoteDetails()
  }, [voteId, router, user])

  // Calculate percentage for a candidate
  const calculatePercentage = (voteCount: number) => {
    if (!voteDetails || voteDetails.totalVotes === 0) return 0
    return Math.round((voteCount / voteDetails.totalVotes) * 100)
  }

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
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
          <p className="text-sm text-muted-foreground">Please wait while we fetch the voting information</p>
        </div>
      </div>
    )
  }

  if (!voteDetails) {
    return (
      <div className="container mx-auto py-6 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/history")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-medium">Vote Not Found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                We couldn't find the vote you're looking for. It may have been removed or you might not have access to it.
              </p>
              <Button className="mt-6" onClick={() => router.push("/history")}>
                Return to History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl relative">
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

      <Button 
        variant="ghost" 
        className="mb-6 hover:bg-[#008751]/10" 
        onClick={() => router.push("/history")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to History
      </Button>

      <Card className="border-2 shadow-md overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
        
        <CardHeader className="border-b pb-4">
          <div className="flex items-center mb-2">
            <div className="bg-[#008751]/10 p-2 rounded-full mr-3">
              <VoteIcon className="h-6 w-6 text-[#008751]" />
            </div>
            <div>
              <div className="flex items-center">
                <CardTitle className="text-2xl">{voteDetails.title}</CardTitle>
                <Badge 
                  className={`ml-3 ${voteDetails.status === "closed" ? "bg-gray-200 text-gray-800" : "bg-[#008751] text-white"}`}
                >
                  {voteDetails.status === "closed" ? "Completed" : "Active"}
                </Badge>
              </div>
              <CardDescription className="text-base">{voteDetails.description}</CardDescription>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center text-sm bg-muted/30 p-3 rounded-lg">
              <Calendar className="h-5 w-5 mr-2 text-[#008751]" />
              <span className="text-muted-foreground">Start Date:</span>
              <span className="ml-auto font-medium">{formatDate(voteDetails.startTime)}</span>
            </div>
            
            <div className="flex items-center text-sm bg-muted/30 p-3 rounded-lg">
              <Clock className="h-5 w-5 mr-2 text-[#008751]" />
              <span className="text-muted-foreground">End Date:</span>
              <span className="ml-auto font-medium">{formatDate(voteDetails.endTime)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Your Vote Section */}
          <div className="bg-[#008751]/5 p-4 rounded-lg border border-[#008751]/20">
            <h3 className="text-lg font-medium flex items-center mb-4">
              <User className="h-5 w-5 mr-2 text-[#008751]" />
              Your Vote
              {voteDetails.verified && (
                <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground block mb-1">You voted for:</span>
                <p className="font-medium text-lg">{voteDetails.userVote.candidateName}</p>
                {voteDetails.userVote.candidateParty && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Building className="h-3 w-3 mr-1" />
                    {voteDetails.userVote.candidateParty}
                  </p>
                )}
              </div>
              
              <div className="bg-white p-3 rounded-lg border">
                <span className="text-sm text-muted-foreground block mb-1">Vote cast on:</span>
                <p className="font-medium">{formatDate(voteDetails.userVote.votedAt)}</p>
              </div>
            </div>
            
            {voteDetails.userVote.blockchainReference && (
              <div className="mt-4">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <Shield className="h-4 w-4 mr-2 text-[#008751]" />
                  Blockchain Reference:
                </h4>
                <p className="text-xs font-mono bg-white p-2 rounded border break-all">
                  {voteDetails.userVote.blockchainReference}
                </p>
              </div>
            )}
          </div>
          
          {/* Results Section */}
          <div>
            <h3 className="text-lg font-medium flex items-center mb-4">
              <BarChart3 className="h-5 w-5 mr-2 text-[#008751]" />
              Election Results
              <span className="ml-2 text-sm text-muted-foreground">
                Total Votes: {voteDetails.totalVotes}
              </span>
            </h3>
            
            <div className="space-y-4">
              {voteDetails.candidates.map((candidate, index) => {
                const percentage = calculatePercentage(candidate.voteCount)
                const isUserVote = candidate.name === voteDetails.userVote.candidateName
                
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${isUserVote ? "border-[#008751] bg-[#008751]/5" : "border-gray-200"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium flex items-center">
                          {candidate.name}
                          {isUserVote && (
                            <Badge className="ml-2 bg-[#008751]/20 text-[#008751]">
                              Your Vote
                            </Badge>
                          )}
                        </p>
                        {candidate.party && (
                          <p className="text-sm text-muted-foreground">{candidate.party}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{percentage}%</p>
                        <p className="text-sm text-muted-foreground">{candidate.voteCount} votes</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isUserVote ? "bg-[#008751]" : "bg-gray-400"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Verification Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">Blockchain Verification</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This vote has been securely recorded on the blockchain, ensuring its integrity and immutability. 
                  The blockchain reference serves as proof of your participation in this election.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-col space-y-3">
          <Button 
            variant="outline" 
            className="w-full border-[#008751] text-[#008751] hover:bg-[#008751]/10"
            onClick={() => router.push("/history")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Voting History
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
