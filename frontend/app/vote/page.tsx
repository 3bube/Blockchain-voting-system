"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, AlertCircle, VoteIcon, Calendar, Users, X, CheckCircle } from "lucide-react"
import newRequest from "@/utils/newRequest"
import { toast } from "sonner"

interface VoteItem {
  _id: string
  voteId: string
  title: string
  description: string
  status: string
  startTime: string
  endTime: string
  candidates: Array<{name: string, voteCount: number}>
  roomName?: string
  accessCode?: string
}

export default function VotePage() {
  // Auth context available if we need the user later
  useAuth()
  const [votes, setVotes] = useState<VoteItem[]>([])
  const [filteredVotes, setFilteredVotes] = useState<VoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "ending-soon" | "recent">("all")

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true)
        // Fetch real vote data from the backend
        const response = await newRequest.get("/vote/all")
        
        if (response.data.success) {
          const votesData = response.data.votes || []
          // Filter for active votes
          const activeVotes = votesData.filter((vote) => 
            vote.status === "active" || vote.status === "new" || vote.status === "waiting"
          )
          
          setVotes(activeVotes)
          setFilteredVotes(activeVotes)
        } else {
          toast.error("Failed to fetch votes")
        }
      } catch (error) {
        console.error("Failed to fetch votes:", error)
        toast.error("Error loading votes. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchVotes()
  }, [])

  useEffect(() => {
    // Apply both search and filter
    let result = [...votes]

    // Apply search
    if (searchQuery.trim() !== "") {
      result = result.filter(
        (vote) =>
          vote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vote.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply filter
    if (activeFilter === "ending-soon") {
      // Sort by end date (ascending)
      result = [...result].sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
    } else if (activeFilter === "recent") {
      // Sort by creation date (most recent first) - using MongoDB _id as a proxy for creation time
      result = [...result].sort((a, b) => b._id.localeCompare(a._id))
    }

    setFilteredVotes(result)
  }, [searchQuery, votes, activeFilter])

  // Calculate days remaining
  const getDaysRemaining = (endTime: string) => {
    const end = new Date(endTime)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Get appropriate badge color based on days remaining
  const getBadgeVariant = (daysRemaining: number) => {
    if (daysRemaining <= 1) return "destructive"
    if (daysRemaining <= 3) return "warning"
    return "default"
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
          <p className="mt-4 font-medium text-lg">Loading available votes...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the active voting sessions</p>
        </div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <div className="bg-[#008751]/10 p-2 rounded-full mr-3">
              <VoteIcon className="h-6 w-6 text-[#008751]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Active Votes</h1>
              <p className="text-muted-foreground">Cast your vote in ongoing elections</p>
            </div>
          </div>

          <div className="relative w-full md:w-64 ">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search votes..."
              className="pl-9 h-10 border-2 focus:border-[#008751] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveFilter(value as "all" | "ending-soon" | "recent")}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All Votes</TabsTrigger>
              <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredVotes.length === 0 ? (
          <Card className="border-2 shadow-md overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-muted/50 rounded-full p-4 mb-4">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No Active Votes Found</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  {votes.length === 0
                    ? "There are no active voting sessions at the moment."
                    : "No votes match your search criteria. Try a different search term."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    className="mt-6 border-[#008751] text-[#008751] hover:bg-[#008751]/10"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Search
                  </Button>
                )}
              </div>
            </CardContent>
            {/* Bottom flag accent */}
            <div className="absolute bottom-0 left-0 right-0 flex h-1">
              <div className="flex-1 bg-[#008751]"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-[#008751]"></div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVotes.map((vote, index) => {
              const daysRemaining = getDaysRemaining(vote.endTime)
              const badgeVariant = getBadgeVariant(daysRemaining)

              return (
                <Card
                  key={vote._id}
                  className={`flex flex-col border-2 hover:border-[#008751]/50 transition-all relative overflow-hidden ${
                    index % 2 === 0 ? "bg-[#008751]/5" : "bg-white"
                  }`}
                >
                  {/* Status indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#008751]" />

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{vote.title}</CardTitle>
                      <Badge variant={badgeVariant} className="ml-2">
                        {daysRemaining <= 1 ? "Ends Today" : `${daysRemaining} days left`}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{vote.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="ml-auto font-medium">{new Date(vote.endTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">Candidates:</span>
                        <span className="ml-auto font-medium">{vote.candidates ? vote.candidates.length : 0}</span>
                      </div>

                      {/* Progress bar showing time remaining */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Time remaining</span>
                          <span className="font-medium">{daysRemaining} days</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              daysRemaining <= 1 ? "bg-red-500" : daysRemaining <= 3 ? "bg-amber-500" : "bg-[#008751]"
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(5, (daysRemaining / 7) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button asChild className="w-full bg-[#008751] hover:bg-[#008751]/90 text-white">
                      <Link href={`/vote/${vote._id}`}>
                        <VoteIcon className="mr-2 h-4 w-4" />
                        Cast Vote
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {filteredVotes.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Card className="border-[#008751]/20 bg-[#008751]/5 max-w-lg w-full">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center">
                  <div className="bg-[#008751]/20 p-2 rounded-full mr-3">
                    <CheckCircle className="h-5 w-5 text-[#008751]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Blockchain Voting</h3>
                    <p className="text-sm text-muted-foreground">
                      All votes are securely recorded on the blockchain for maximum transparency and security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
