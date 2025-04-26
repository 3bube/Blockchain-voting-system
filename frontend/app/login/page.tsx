"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react"
// import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  // const router = useRouter()
  const [password, setPassword] = useState("")
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(email, password)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] relative overflow-hidden bg-gradient-to-b from-background to-background/80">
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
        <CardHeader className="space-y-1">
          <div className="mx-auto bg-[#008751]/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
            <User className="h-6 w-6 text-[#008751]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 transition-all border-muted focus:border-[#008751]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-[#008751] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 transition-all border-muted focus:border-[#008751]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full bg-[#008751] hover:bg-[#008751]/90 text-white transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#008751] font-medium hover:underline transition-colors">
                Register
              </Link>
            </div>
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
