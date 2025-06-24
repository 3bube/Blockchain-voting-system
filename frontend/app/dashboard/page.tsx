"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Vote,
  History,
  AlertCircle,
  DoorOpen,
  Calendar,
  Clock,
  Users,
  BarChart3,
  Clipboard,
  CheckCircle,
  Key,
  Shield,
} from "lucide-react"
import newRequest from "@/utils/newRequest"
import { toast } from "sonner"


interface VoteItem {
  _id: string
  title: string
  status: "active" | "closed" | "pending" | "new"
  startTime: string
  endTime: string
  candidateCount: number
  voterCount: number
  voteId: string
  isPending: boolean
  accessCode?: string
  roomName?: string
  creator?: {
    username?: string
    email?: string
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeVotes, setActiveVotes] = useState<VoteItem[]>([])
  const [upcomingVotes, setUpcomingVotes] = useState<VoteItem[]>([])
  const [pastVotes, setPastVotes] = useState<VoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchVotes = async () => {
    try {
      setRefreshing(true)
      const { data } = await newRequest.get("/vote/all")

      if (data.success) {
        const now = new Date()
        
        // Filter active votes (current time is between start and end time)
        const activeVotesList = data.votes.filter((vote: VoteItem) => 
          vote.status === "active" && new Date(vote.startTime) <= now
        )
        
        // Filter upcoming votes (start time is in the future)
        const upcomingVotesList = data.votes.filter((vote: VoteItem) => 
          vote.status === "new" && new Date(vote.startTime) > now
        )
        
        // Filter past votes (already closed)
        const pastVotesList = data.votes.filter((vote: VoteItem) => 
          vote.status === "closed"
        )

        setActiveVotes(activeVotesList)
        setUpcomingVotes(upcomingVotesList)
        setPastVotes(pastVotesList)
      } else {
        toast.error("Failed to fetch votes")
      }
    } catch (error) {
      console.error("Failed to fetch votes:", error)
      toast.error("Error connecting to the server")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  // handle copy access code
  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Access code copied to clipboard")
  }

  useEffect(() => {
    // Fetch votes when component mounts
    fetchVotes()
    
    // Set up an event listener for when the page becomes visible again
    // This ensures vote counts are refreshed when user navigates back after voting
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVotes()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#008751] mx-auto mb-4" />
          <p className="text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate total votes cast
  const totalVotesCast = [...activeVotes, ...pastVotes].reduce((total, vote) => total + (vote.voterCount || 0), 0)

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name || "Voter"}</h1>
            <p className="text-muted-foreground mt-1">Your secure blockchain voting dashboard</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVotes}
            disabled={refreshing}
            className="self-start md:self-auto"
          >
            <Loader2 className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#008751] shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Vote className="h-5 w-5 text-[#008751] mr-2" />
                Active Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-3xl font-bold">{activeVotes.length}</p>
                {activeVotes.length > 0 && <Badge className="ml-2 bg-[#008751]">Live</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeVotes.length === 0
                  ? "No active votes"
                  : `${activeVotes.filter((v) => v.isPending).length} pending sync`}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full hover:bg-[#008751]/10 hover:text-[#008751] hover:border-[#008751]"
              >
                <Link href="/vote">
                  <Vote className="mr-2 h-4 w-4" />
                  Cast Vote
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <History className="h-5 w-5 text-blue-500 mr-2" />
                Past Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-3xl font-bold">{pastVotes.length}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {pastVotes.length === 0 ? "No past votes" : `Total completed elections`}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              >
                <Link href="/history">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Results
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 text-amber-500 mr-2" />
                Total Votes Cast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-3xl font-bold">{totalVotesCast}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all voting sessions</p>
            </CardContent>
            <CardFooter>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{
                    width: `${
                      totalVotesCast > 0
                        ? Math.min(
                            100,
                            Math.max(
                              10,
                              (totalVotesCast / Math.max(1, activeVotes.length + pastVotes.length) / 10) * 100,
                            ),
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </CardFooter>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <DoorOpen className="h-5 w-5 text-purple-500 mr-2" />
                Join Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Enter a room code to access a specific voting session</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
              >
                <Link href="/join-room">
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Join Room
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-white rounded-lg border-2 p-4 mb-8 relative overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]" />
          <div className="flex items-center mb-4">
            <div className="bg-[#008751]/10 p-2 rounded-full mr-3">
              <Shield className="h-5 w-5 text-[#008751]" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Blockchain Voting System</h2>
              <p className="text-sm text-muted-foreground">Secure, transparent, and tamper-proof electoral polling</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="bg-[#008751]/10 p-1.5 rounded-full mr-2 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#008751]" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Secure Authentication</h3>
                <p className="text-xs text-muted-foreground">Your identity is verified using NIN</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-[#008751]/10 p-1.5 rounded-full mr-2 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#008751]" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Immutable Records</h3>
                <p className="text-xs text-muted-foreground">All votes are permanently recorded on blockchain</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-[#008751]/10 p-1.5 rounded-full mr-2 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#008751]" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Transparent Results</h3>
                <p className="text-xs text-muted-foreground">View verified results after voting ends</p>
              </div>
            </div>
          </div>

          {/* Bottom flag accent */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-[#008751]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-[#008751]"></div>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="active">Active Votes ({activeVotes.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Votes ({upcomingVotes.length})</TabsTrigger>
            <TabsTrigger value="past">Past Votes ({pastVotes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeVotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No Active Votes</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  There are no active voting sessions at the moment. Check back later or join a specific voting room.
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/join-room">
                    <DoorOpen className="mr-2 h-4 w-4" />
                    Join a Room
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeVotes.map((vote) => (
                  <Card
                    key={vote._id}
                    className="relative overflow-hidden border-2 hover:border-gray-300 transition-all"
                  >
                    {/* Status indicator */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-gray-400" />

                    {vote.isPending && (
                      <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-bl-md">
                        Pending Sync
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1">{vote.title}</CardTitle>
                        <Badge className="bg-[#008751]">Active</Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {vote.candidateCount} candidates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Ends: {new Date(vote.endTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Vote className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Votes cast: {vote.voterCount || 0}</span>
                        </div>
                        
                        {vote.accessCode && (
                          <div className="flex items-center justify-between mt-2 bg-[#008751]/10 p-1.5 rounded-md">
                            <div className="flex items-center">
                              <Key className="h-4 w-4 mr-2 text-[#008751]" />
                              <code className="text-xs font-mono text-[#008751] font-semibold">{vote.accessCode}</code>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyAccessCode(vote.accessCode!)}
                              className="cursor-pointer"
                            >
                              <Clipboard className="h-2 w-2" />
                            </Button>
                          </div>
                        )}

                        {/* Progress bar showing time remaining */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Time remaining</span>
                            <span className="font-medium">
                              {Math.max(
                                0,
                                Math.ceil(
                                  (new Date(vote.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                                ),
                              )}{" "}
                              days
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#008751] h-full"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    ((new Date(vote.endTime).getTime() - new Date().getTime()) /
                                      (new Date(vote.endTime).getTime() - new Date(vote.startTime).getTime())) *
                                      100,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    {/* <CardFooter>
                      <Button asChild className="w-full bg-[#008751] hover:bg-[#008751]/90">
                        <Link href={`/vote/${vote._id}`}>Cast Vote</Link>
                      </Button>
                    </CardFooter> */}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {upcomingVotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No Upcoming Votes</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  There are no scheduled upcoming voting sessions. Check back later for new voting opportunities.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingVotes.map((vote) => (
                  <Card
                    key={vote._id}
                    className="relative overflow-hidden border-2 hover:border-blue-400/50 transition-all"
                  >
                    {/* Status indicator */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-400" />

                    {vote.isPending && (
                      <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-bl-md">
                        Pending Sync
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1">{vote.title}</CardTitle>
                        <Badge className="bg-blue-500">Upcoming</Badge>
                      </div>
                      <CardDescription>
                        Created by {vote.creator?.username || vote.creator?.email || "Admin"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Starts: {new Date(vote.startTime).toLocaleDateString()} at {new Date(vote.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{vote.candidateCount} candidates</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-blue-500 font-medium">Scheduled</span>
                          </div>
                        </div>
                        
                        {vote.accessCode && (
                          <div className="flex items-center mt-2 bg-blue-100 p-1.5 rounded-md">
                            <Key className="h-4 w-4 mr-2 text-blue-500" />
                            <code className="text-xs font-mono text-blue-500 font-semibold">{vote.accessCode}</code>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:text-blue-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastVotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No Past Votes</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  You haven't participated in any voting sessions yet. Cast your vote in an active election to see it
                  here.
                </p>
                {activeVotes.length > 0 && (
                  <Button className="mt-6" asChild>
                    <Link href="/vote">
                      <Vote className="mr-2 h-4 w-4" />
                      View Active Votes
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastVotes.map((vote) => (
                  <Card
                    key={vote._id}
                    className="relative overflow-hidden border-2 hover:border-gray-300 transition-all"
                  >
                    {/* Status indicator */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-gray-400" />

                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-1">{vote.title}</CardTitle>
                        <Badge variant="outline">Ended</Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {new Date(vote.endTime).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{vote.candidateCount} candidates</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Total votes: {vote.voterCount || 0}</span>
                        </div>

                        {/* Total votes indicator */}
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-green-600">Total votes: {vote.voterCount || 0}</span>
                        </div>
                        
                        {/* Access code */}
                        {vote.accessCode && (
                          <div className="flex items-center text-sm mt-2 p-2 bg-gray-50 rounded border">
                            <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-mono text-xs">{vote.accessCode}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="grid grid-cols-1 gap-2 w-full">
                        <Button variant="outline" asChild className="w-full">
                          <Link href={`/history/${vote._id}`}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Results
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
