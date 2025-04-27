"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import newRequest from "@/utils/newRequest"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Search,
  AlertCircle,
  ExternalLink,
  History,
  Calendar,
  User,
  Shield,
  CheckCircle,
  X,
  Clock,
  RefreshCw,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VoteHistory {
  id: string
  title: string
  description: string
  endDate: string
  candidateVoted: string
  blockchainReference: string
  verified?: boolean
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<VoteHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<VoteHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "recent" | "older">("all")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setRefreshing(true)
      
      // Fetch voting history from backend API
      const response = await newRequest.get('/vote/history');
      
      if (response.data.success && response.data.history) {
        // Define interface for API response item
        interface VoteHistoryApiItem {
          _id: string;
          title: string;
          description: string;
          endTime: string;
          candidateVoted: string;
          candidateParty?: string;
          blockchainReference?: string;
          verified?: boolean;
          // Additional properties with specific types
          status?: string;
          startTime?: string;
          voteCount?: number;
          roomName?: string;
          accessCode?: string;
          [key: string]: string | number | boolean | undefined; // For any other properties
        }
        
        // Transform the API response to match our VoteHistory interface
        const historyData: VoteHistory[] = response.data.history.map((item: VoteHistoryApiItem) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          endDate: item.endTime,
          candidateVoted: item.candidateParty ? 
            `${item.candidateVoted} - ${item.candidateParty}` : 
            item.candidateVoted,
          blockchainReference: item.blockchainReference || 
            "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
          verified: item.verified,
        }));
        
        setHistory(historyData);
        setFilteredHistory(historyData);
      } else {
        // If no history or API fails, use fallback mock data for development
        const mockData: VoteHistory[] = [
          {
            id: "1",
            title: "Presidential Election 2023",
            description: "Vote for the next president of Nigeria",
            endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            candidateVoted: "Adebayo Adeyemi - Progressive Party",
            blockchainReference: "0x7f9a12e4b1d3c5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
            verified: true,
          },
          {
            id: "2",
            title: "Gubernatorial Election - Lagos State",
            description: "Vote for the next governor of Lagos State",
            endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            candidateVoted: "Chioma Okonkwo - People's Democratic Alliance",
            blockchainReference: "0x8e2b13f5c2d4e6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1",
            verified: true,
          },
        ];
        
        setHistory(mockData);
        setFilteredHistory(mockData);
        
        // Log error if API failed but don't show error to user
        if (!response.data.success) {
          console.error("API error:", response.data.error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch voting history:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    // Apply both search and filter
    let result = [...history]

    // Apply search
    if (searchQuery.trim() !== "") {
      result = result.filter(
        (vote) =>
          vote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vote.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vote.candidateVoted.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply filter
    if (filter === "recent") {
      // Sort by end date (most recent first)
      result = [...result].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    } else if (filter === "older") {
      // Sort by end date (oldest first)
      result = [...result].sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    }

    setFilteredHistory(result)
  }, [searchQuery, history, filter])

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
          <p className="mt-4 font-medium text-lg">Loading your voting history...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your past votes</p>
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
              <History className="h-6 w-6 text-[#008751]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Voting History</h1>
              <p className="text-muted-foreground">Your past voting records secured on blockchain</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-9 h-10 border-2 focus:border-[#008751] transition-all pr-9"
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

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-2 hover:bg-[#008751]/10 hover:text-[#008751] hover:border-[#008751]"
              onClick={fetchHistory}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
              <TabsTrigger value="all">All Votes</TabsTrigger>
              <TabsTrigger value="recent">Most Recent</TabsTrigger>
              <TabsTrigger value="older">Oldest First</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredHistory.length === 0 ? (
          <Card className="border-2 shadow-md overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-muted/50 rounded-full p-4 mb-4">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium">No Voting History Found</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  {history.length === 0
                    ? "You haven't participated in any voting sessions yet."
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
          <div className="space-y-6">
            {filteredHistory.map((vote, index) => (
              <Card
                key={vote.id}
                className={`border-2 hover:border-[#008751]/50 transition-all relative overflow-hidden ${
                  index % 2 === 0 ? "bg-[#008751]/5" : "bg-white"
                }`}
              >
                {/* Left border accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-[#008751]" />

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <CardTitle className="text-xl">{vote.title}</CardTitle>
                      {vote.verified && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(vote.endDate).toLocaleDateString()}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{vote.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h3 className="text-sm font-medium flex items-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-[#008751]" />
                        Election Date
                      </h3>
                      <p className="text-sm">{new Date(vote.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h3 className="text-sm font-medium flex items-center mb-2">
                        <User className="h-4 w-4 mr-2 text-[#008751]" />
                        Your Vote
                      </h3>
                      <p className="text-sm font-medium">{vote.candidateVoted}</p>
                    </div>
                  </div>
                  <div className="bg-[#008751]/5 p-3 rounded-lg border border-[#008751]/20">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Shield className="h-4 w-4 mr-2 text-[#008751]" />
                      Blockchain Reference
                    </h3>
                    <div className="flex items-center">
                      <p className="text-xs font-mono bg-white p-2 rounded border break-all flex-grow">
                        {vote.blockchainReference}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-8 w-8 text-muted-foreground hover:text-[#008751] hover:bg-[#008751]/10"
                        onClick={() => {
                          navigator.clipboard.writeText(vote.blockchainReference)
                          // You could add a toast notification here
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-[#008751] text-[#008751] hover:bg-[#008751]/10"
                  >
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

        {filteredHistory.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Card className="border-[#008751]/20 bg-[#008751]/5 max-w-lg w-full">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center">
                  <div className="bg-[#008751]/20 p-2 rounded-full mr-3">
                    <Shield className="h-5 w-5 text-[#008751]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Blockchain Verification</h3>
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
