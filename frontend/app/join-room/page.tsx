"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DoorOpen, KeyRound, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import newRequest from "@/utils/newRequest"

export default function JoinRoomPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [accessCode, setAccessCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidFormat, setIsValidFormat] = useState<boolean | null>(null)

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setAccessCode(value)

    // Simple validation - check if code matches expected format (e.g., 6 alphanumeric characters)
    if (value) {
      setIsValidFormat(/^[A-Z0-9]{6}$/.test(value))
    } else {
      setIsValidFormat(null)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessCode.trim()) {
      toast.error("Please enter an access code")
      return
    }

    setLoading(true)

    try {
      // Call the backend API to find a vote by access code
      const response = await newRequest.get(`/vote/access/${accessCode}`);
      
      if (response.data.success) {
        const voteData = response.data.vote;
        toast.success(`Joining vote: ${voteData.title}`);
        router.push(`/vote/${voteData._id}`);
      } else {
        toast.error("Invalid access code");
      }
    } catch (error: unknown) {
      // Handle different error types
      const axiosError = error as { 
        response?: { 
          status: number; 
          data?: { error: string } 
        };
        request?: unknown;
        message?: string;
      };
      
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (axiosError.response.status === 404) {
          toast.error("Vote not found with this access code");
        } else {
          toast.error(axiosError.response.data?.error || "Failed to join vote");
        }
      } else if (axiosError.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(axiosError.message || "An error occurred while joining the vote");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 flex items-center justify-center min-h-[calc(100vh-3.5rem)] relative overflow-hidden">
      {/* Nigerian flag design elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#008751]" />
      <div className="absolute top-2 left-0 w-full h-2 bg-white" />
      <div className="absolute top-4 left-0 w-full h-2 bg-[#008751]" />

      {/* Decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[#008751]/5" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#008751]/5" />
      <div className="absolute top-1/4 right-10 w-32 h-32 rounded-full bg-[#008751]/5 hidden lg:block" />
      <div className="absolute bottom-1/4 left-10 w-32 h-32 rounded-full bg-[#008751]/5 hidden lg:block" />

      <Card className="w-full max-w-md relative z-10 border-2 shadow-lg mx-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
        <CardHeader className="text-center">
          <div className="mx-auto bg-[#008751]/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <DoorOpen className="h-8 w-8 text-[#008751]" />
          </div>
          <CardTitle className="text-2xl font-bold">Join a Voting Room</CardTitle>
          <CardDescription className="text-base">
            Enter the access code to join a specific voting session
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleJoinRoom}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="accessCode"
                  placeholder="Enter 6-digit code"
                  value={accessCode}
                  onChange={handleAccessCodeChange}
                  className="text-center text-xl tracking-widest font-medium h-14 pl-12 pr-12 border-2 focus:border-[#008751] transition-all"
                  maxLength={6}
                />
                {isValidFormat !== null && (
                  <div className="absolute right-4 top-4">
                    {isValidFormat ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-muted">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-[#008751]" />
                  How to get an access code
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Access codes are provided by election administrators</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Codes are typically 6 characters (letters and numbers)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Each code grants access to a specific voting session</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#008751] hover:bg-[#008751]/90 text-white h-12 text-base"
              disabled={loading || isValidFormat === false}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining Room...
                </>
              ) : (
                <>
                  Join Voting Room
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground px-6">
              By joining a room, you agree to participate in the voting process according to the electoral guidelines
            </p>
          </CardFooter>
        </form>

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
