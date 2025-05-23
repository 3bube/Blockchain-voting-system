"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  Vote,
  AlertCircle,
  Calendar,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Power,
  Clock,
  Key,
  RefreshCw,
  Zap,
  Shield,
  CheckCircle,
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
import newRequest from "@/utils/newRequest"

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
  roomName?: string
  accessCode?: string
  creator?: {
    username?: string
    email?: string
  }
  username?: string
  email?: string
}

// Interface for vote with room information
interface VoteWithRoom {
  _id: string
  title: string
  status: string
  roomName?: string
  isPending?: boolean
}

interface PowerStatus {
  powered: boolean
  timestamp: string
  voltage?: number
  powerCut?: boolean
  syncComplete?: boolean
  syncStats?: {
    votesProcessed: number
    ballotsProcessed: number
    successfulBallots: number
    failedBallots: number
  }
  message?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [votes, setVotes] = useState<VoteItem[]>([])
  const [powerStatus, setPowerStatus] = useState<PowerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [roomCount, setRoomCount] = useState<number>(0)
  const [activeRoomCount, setActiveRoomCount] = useState<number>(0)
  const [syncingBlockchain, setSyncingBlockchain] = useState(false)
  const [voltage, setVoltage] = useState<number | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  // Define the fetchData function to load all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const votesResponse = await newRequest.get("/vote/all")
      
      // Process the votes
      if (votesResponse.data.success) {
        // Use a proper type for vote objects
        const formattedVotes = votesResponse.data.votes.map((vote: VoteWithRoom) => ({
          ...vote,
          candidateCount: vote.candidates?.length || 0,
          voterCount: vote.voters?.length || 0,
        }))
        setVotes(formattedVotes)
      }
      
      try {
        // Votes have already been fetched above
        const votesData = votesResponse.data.votes || []
        
        // Count rooms (votes with roomName)
        const rooms = votesData.filter((vote: VoteWithRoom) => vote.roomName && vote.roomName.trim() !== "")
        setRoomCount(rooms.length)
        
        // Count active rooms - check for active status
        const activeRooms = votesData.filter((vote: VoteWithRoom) => 
          vote.status === "active" && vote.roomName && vote.roomName.trim() !== "")
        setActiveRoomCount(activeRooms.length)
      } catch (roomError) {
        console.error("Failed to process room data:", roomError)
      }
      
      // Fetch power status
      try {
        const powerResponse = await newRequest.get("/vote/power-status")
        if (powerResponse.data.success) {
          setPowerStatus(powerResponse.data.powerStatus)
          if (powerResponse.data.powerStatus.voltage) {
            setVoltage(powerResponse.data.powerStatus.voltage)
          }
        }
      } catch (powerError) {
        console.error("Failed to fetch power status:", powerError)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  // Function to fetch just the power status update
  const fetchPowerStatus = useCallback(async () => {
    try {
      const powerResponse = await newRequest.get("/vote/power-status")
      if (powerResponse.data) {
        setPowerStatus(powerResponse.data)
        if (powerResponse.data.voltage) {
          setVoltage(powerResponse.data.voltage)
        }
        if (powerResponse.data.timestamp) {
          setLastSyncTime(powerResponse.data.timestamp)
        }
        console.log('Power status updated from API:', powerResponse.data)
      }
    } catch (error) {
      console.error("Failed to fetch power status:", error)
    }
  }, [])

  // Set up polling interval for power status updates
  useEffect(() => {
    // Initial fetch
    fetchPowerStatus()
    
    // Set up polling every 10 seconds
    const intervalId = setInterval(() => {
      fetchPowerStatus()
    }, 10000)
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId)
  }, [fetchPowerStatus])


  console.log(powerStatus)

  // Define the triggerManualSync function
  const triggerManualSync = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch votes
      const votesResponse = await newRequest.get("/vote/all")

      if (votesResponse.data.success) {
        setVotes(votesResponse.data.votes)
      } else {
        toast.error("Failed to fetch votes")
      }

      // Extract room data from votes
      try {
        // Votes have already been fetched above
        const votesData = votesResponse.data.votes || []
        
        // Count rooms (votes with roomName)
        const rooms = votesData.filter((vote: VoteWithRoom) => vote.roomName && vote.roomName.trim() !== "")
        setRoomCount(rooms.length)
        
        // Count active rooms - check for active status
        const activeRooms = votesData.filter((vote: VoteWithRoom) => 
          vote.status === "active" && vote.roomName && vote.roomName.trim() !== "")
        setActiveRoomCount(activeRooms.length)
      } catch (roomError) {
        console.error("Failed to process room data:", roomError)
        setRoomCount(0)
        setActiveRoomCount(0)
      }

      // Fetch initial power status
      try {
        const powerResponse = await newRequest.get("/vote/power-status")
        // The response format is now directly the power status object, not wrapped in a success/status structure
        if (powerResponse.data) {
          setPowerStatus(powerResponse.data)
          if (powerResponse.data.voltage) {
            setVoltage(powerResponse.data.voltage)
          }
          if (powerResponse.data.timestamp) {
            setLastSyncTime(powerResponse.data.timestamp)
          }
        }
      } catch (powerError) {
        console.error("Failed to fetch power status:", powerError)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      toast.message("Access Denied", {
        description: "You don't have permission to access this page",
      })
      router.push("/login")
      return
    }

    // Fetch initial data
    fetchData()
  }, [isAdmin, router, fetchData])


  const handleDeleteVote = async (id: string) => {
    try {
      // Note: Your backend might not have this endpoint yet
      // You may need to implement it or adjust this code
      const response = await newRequest.delete(`/vote/${id}`)

      if (response.data.success) {
        setVotes(votes.filter((vote) => vote._id !== id))
        toast.success("The vote has been deleted successfully")
      } else {
        toast.error(response.data.error || "Failed to delete vote")
      }
    } catch (error) {
      console.error("Error deleting vote:", error)
      toast.error("An error occurred while deleting the vote")
    } finally {
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const handleEndVote = async (id: string) => {
    try {
      const response = await newRequest.post(`/vote/end/${id}`)

      if (response.data.success) {
        // Update the vote status in the local state
        setVotes(votes.map((vote) => (vote._id === id ? { ...vote, status: "closed" } : vote)))

        toast.success("The vote has been ended successfully")
      } else {
        toast.error(response.data.error || "Failed to end vote")
      }
    } catch (error) {
      console.error("Error ending vote:", error)
      toast.error("An error occurred while ending the vote")
    }
  }

  // Function to handle manual sync button click
  const handleManualSync = () => {
    // Call manual sync directly
    if (!powerStatus?.powered) {
      toast.error("Cannot sync while system is offline")
      return
    }

    setSyncingBlockchain(true)
    newRequest.post("/vote/sync")
      .then(response => {
        if (response.data.success) {
          toast.success("Manual sync initiated")
          // Refresh data after a delay
          setTimeout(() => {
            fetchData()
            setSyncingBlockchain(false)
          }, 3000)
        } else {
          toast.error("Failed to initiate sync")
          setSyncingBlockchain(false)
        }
      })
      .catch(error => {
        console.error("Error triggering manual sync:", error)
        toast.error("Failed to initiate sync")
        setSyncingBlockchain(false)
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#008751] mx-auto mb-4" />
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  // Separate votes into active, upcoming, and ended categories
  const now = new Date()
  const activeVotes = votes.filter((vote: VoteItem) => 
    vote.status === "active" && new Date(vote.startTime) <= now
  )
  const upcomingVotes = votes.filter((vote: VoteItem) => 
    vote.status === "new" && new Date(vote.startTime) > now
  )
  const endedVotes = votes.filter((vote: VoteItem) => vote.status === "closed")

  // System is considered online if powerStatus.powered is true
  const systemOnline = powerStatus?.powered === true

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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage votes, rooms, and monitor system status</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm" className="gap-2 z-1000">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Power Status Card */}
      <Card className="mb-6 border-2 border-gray-200 shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold flex items-center">
              <Power className="mr-2 h-5 w-5 text-[#008751]" />
              System Power Status
            </CardTitle>
            <Badge 
              variant={powerStatus?.powered ? "default" : "destructive"}
              className={`px-3 py-1 ${powerStatus?.powered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {powerStatus?.powered ? "Online" : "Offline"}
            </Badge>
          </div>
          <CardDescription>
            Real-time power monitoring and blockchain sync status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Voltage Indicator */}
            {voltage !== null && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Voltage</span>
                  <span className="text-sm font-bold">{voltage}V</span>
                </div>
                <Progress 
                  value={voltage ? Math.min((voltage / 240) * 100, 100) : 0} 
                  className="h-2"
                />
                {voltage && voltage < 180 && (
                  <p className="text-xs text-amber-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Low voltage detected
                  </p>
                )}
              </div>
            )}
            
            {/* Last Update Time */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Last Update:
              </span>
              <span className="font-medium">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            
            {/* Sync Status */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-gray-500">
                <RefreshCw className="h-4 w-4 mr-1" />
                Blockchain Sync:
              </span>
              <Badge variant={syncingBlockchain ? "outline" : "secondary"} className="font-normal">
                {syncingBlockchain ? (
                  <span className="flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Syncing
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Synced
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 pt-2 pb-2">
          <div className="w-full flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {powerStatus?.message || 'System status information'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={triggerManualSync}
              disabled={syncingBlockchain || !powerStatus?.powered}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Sync Now
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/votes">Manage Votes</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              Total Votes Cast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{systemOnline ? 1 : 0}</div>
              <div className="text-xs text-muted-foreground">
                System {systemOnline ? "Online" : "Offline"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {votes.length} voting sessions
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/votes">View Details</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 text-amber-500 mr-2" />
              Power Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                <span>Online {systemOnline ? "(1/1)" : "(0/1)"}</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                <span>Offline {systemOnline ? "(0/1)" : "(1/1)"}</span>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full"
                style={{ width: `${systemOnline ? 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/power-status">Monitor Power</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 text-purple-500 mr-2" />
              Voting Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="text-3xl font-bold">{roomCount}</p>
              {activeRoomCount > 0 && (
                <Badge variant="outline" className="ml-2 border-green-500 text-green-600">
                  {activeRoomCount} active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {roomCount === 0 ? "No rooms created" : `${roomCount - activeRoomCount} inactive`}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/room-management">Manage Rooms</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Vote Management</h2>
          <Badge variant="outline" className="ml-3">
            {votes.length} Total
          </Badge>
        </div>
        <Button asChild className="bg-[#008751] hover:bg-[#008751]/90">
          <Link href="/admin/votes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Vote
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="active">Active Votes</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Votes</TabsTrigger>
          <TabsTrigger value="ended">Ended Votes</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
              <div className="bg-muted rounded-full p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium">No Active Votes</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                There are no active voting sessions at the moment. Create a new vote to get started.
              </p>
              <Button className="mt-6 bg-[#008751] hover:bg-[#008751]/90" asChild>
                <Link href="/admin/votes/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Vote
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeVotes.map((vote) => (
                <Card
                  key={vote._id}
                  className="relative overflow-hidden border-2 hover:border-[#008751]/50 transition-all"
                >
                  {/* Status indicator */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#008751]" />

                  {vote.isPending && (
                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-bl-md">
                      Pending Sync
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{vote.title}</CardTitle>
                      <Badge className="bg-[#008751]">Active</Badge>
                    </div>
                    <CardDescription>
                      Created by {vote.creator?.username || vote.creator?.email || "Admin"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Ends: {new Date(vote.endTime).toLocaleDateString()}</span>
                      </div>

                      {vote.accessCode && (
                        <div className="flex items-center bg-[#008751]/10 p-2 rounded-md">
                          <Key className="h-4 w-4 mr-2 text-[#008751]" />
                          <span className="font-medium text-[#008751]">Access Code: <span className="font-mono">{vote.accessCode}</span></span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{vote.candidateCount} candidates</span>
                        </div>
                        <div className="flex items-center">
                          <Vote className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{vote.voterCount || 0} votes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/vote/edit/${vote._id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Power className="mr-2 h-4 w-4" />
                          End Vote
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>End this vote?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will end the voting session and no more votes can be cast. Results will be finalized
                            and made available.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleEndVote(vote._id)}>End Vote</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                      onClick={() => {
                        setDeleteId(vote._id)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>

                  <AlertDialog
                    open={showDeleteDialog && deleteId === vote._id}
                    onOpenChange={(open) => {
                      setShowDeleteDialog(open)
                      if (!open) setDeleteId(null)
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this vote?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the vote and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteId && handleDeleteVote(deleteId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {upcomingVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
              <div className="bg-muted rounded-full p-3 mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium">No Upcoming Votes</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                There are no scheduled upcoming voting sessions. Create a new vote with a future start date.
              </p>
              <Button className="mt-6 bg-[#008751] hover:bg-[#008751]/90" asChild>
                <Link href="/admin/votes/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Vote
                </Link>
              </Button>
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

                      {vote.accessCode && (
                        <div className="flex items-center bg-blue-100 p-2 rounded-md">
                          <Key className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium text-blue-500">Access Code: <span className="font-mono">{vote.accessCode}</span></span>
                        </div>
                      )}

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
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/vote/edit/${vote._id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                      onClick={() => {
                        setDeleteId(vote._id)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>

                  <AlertDialog
                    open={showDeleteDialog && deleteId === vote._id}
                    onOpenChange={(open) => {
                      setShowDeleteDialog(open)
                      if (!open) setDeleteId(null)
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this vote?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the vote and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteId && handleDeleteVote(deleteId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ended">
          {endedVotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
              <div className="bg-muted rounded-full p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium">No Ended Votes</h3>
              <p className="text-muted-foreground mt-2">There are no ended voting sessions at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endedVotes.map((vote) => (
                <Card key={vote._id} className="relative overflow-hidden border-2 hover:border-gray-300 transition-all">
                  {/* Status indicator */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-gray-400" />

                  {vote.isPending && (
                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-bl-md">
                      Pending Sync
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{vote.title}</CardTitle>
                      <Badge variant="outline">Ended</Badge>
                    </div>
                    <CardDescription>
                      Created by {vote.creator?.username || vote.creator?.email || "Admin"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Ended: {new Date(vote.endTime).toLocaleDateString()}</span>
                      </div>

                      {vote.accessCode && (
                        <div className="flex items-center bg-gray-100 p-2 rounded-md">
                          <Key className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium text-gray-500">Access Code: <span className="font-mono">{vote.accessCode}</span></span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{vote.candidateCount} candidates</span>
                        </div>
                        <div className="flex items-center">
                          <Vote className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{vote.voterCount || 0} votes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/vote/results/${vote._id}`}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Results
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
                      onClick={() => {
                        setDeleteId(vote._id)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>

                  <AlertDialog
                    open={showDeleteDialog && deleteId === vote._id}
                    onOpenChange={(open) => {
                      setShowDeleteDialog(open)
                      if (!open) setDeleteId(null)
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this vote?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the vote and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteId && handleDeleteVote(deleteId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Power Status Overview</h2>
          <Badge variant="outline" className="ml-3">
            {powerStatus?.length} Devices
          </Badge>
        </div>
        <Button variant="outline" asChild>
          <Link href="/power-status">View Full Details</Link>
        </Button>
      </div>

      <Card className="mb-8 border-2 shadow-md overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
        <CardHeader>
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-[#008751] mr-2" />
            <CardTitle>Power Status Summary</CardTitle>
          </div>
          <CardDescription>Overview of power status across all polling stations</CardDescription>
        </CardHeader>
        <CardContent>
          {powerStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Data Available</h3>
              <p className="text-sm text-muted-foreground mt-2">No power status data has been recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                      <span className="text-sm font-medium">Online {systemOnline ? "(1/1)" : "(0/1)"}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {systemOnline ? 1 : 0} / 1
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-3"
                      style={{ width: `${systemOnline ? 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
                      <span className="text-sm font-medium">Offline {systemOnline ? "(0/1)" : "(1/1)"}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {systemOnline ? 0 : 1} / 1
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-3"
                      style={{ width: `${systemOnline ? 0 : 100}%` }}
                    />
                  </div>
                </div>
              </div>
{/* 
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Battery Status</h4>
                <div className="space-y-3">
                  {[
                    {
                      level: "Critical (<25%)",
                      count: powerStatus?.filter((d) => (d.batteryLevel || 0) < 25).length,
                      color: "bg-red-500",
                    },
                    {
                      level: "Low (25-50%)",
                      count: powerStatus?.filter((d) => (d.batteryLevel || 0) >= 25 && (d.batteryLevel || 0) < 50)
                        .length,
                      color: "bg-orange-500",
                    },
                    {
                      level: "Medium (50-75%)",
                      count: powerStatus?.filter((d) => (d.batteryLevel || 0) >= 50 && (d.batteryLevel || 0) < 75)
                        .length,
                      color: "bg-yellow-500",
                    },
                    {
                      level: "High (75-100%)",
                      count: powerStatus?.filter((d) => (d.batteryLevel || 0) >= 75).length,
                      color: "bg-green-500",
                    },
                  ].map((item) => (
                    <div key={item.level} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                      <div className="flex justify-between w-full">
                        <span className="text-sm">{item.level}</span>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/power-status">
                <Zap className="mr-2 h-4 w-4" />
                Power Status
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleManualSync} disabled={syncingBlockchain}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncingBlockchain ? "animate-spin" : ""}`} />
              {syncingBlockchain ? "Syncing..." : "Sync Blockchain"}
            </Button>
          </div>
        </CardFooter>

        {/* Bottom flag accent */}
        <div className="absolute bottom-0 left-0 right-0 flex h-1">
          <div className="flex-1 bg-[#008751]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#008751]"></div>
        </div>
      </Card>

      {/* System status summary */}
      {/* <Card className="mb-4 border-l-4 border-l-[#008751]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-[#008751] mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Blockchain</span>
              <span className="font-medium flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                Connected
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="font-medium flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                Operational
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">API</span>
              <span className="font-medium flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                Healthy
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Last Sync</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}
