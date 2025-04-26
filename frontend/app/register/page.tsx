"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock, User, CreditCard, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [nin, setNin] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const { register, loading } = useAuth()

  const validateNin = (nin: string) => {
    // NIN is typically 11 digits in Nigeria
    return /^\d{11}$/.test(nin)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (!validateNin(nin)) {
      setPasswordError("NIN must be 11 digits")
      return
    }

    setPasswordError("")
    try {
      await register(name, email, nin, password)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    const strengthMap = [
      { text: "Weak", color: "bg-red-500" },
      { text: "Fair", color: "bg-orange-500" },
      { text: "Good", color: "bg-yellow-500" },
      { text: "Strong", color: "bg-green-500" },
    ]

    return {
      strength,
      text: strengthMap[strength - 1]?.text || "",
      color: strengthMap[strength - 1]?.color || "",
    }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] py-8 relative overflow-hidden bg-gradient-to-b from-background to-background/80">
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
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Register to participate in secure blockchain voting</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 transition-all border-muted focus:border-[#008751]"
                />
              </div>
            </div>

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
              <Label htmlFor="nin" className="text-sm font-medium">
                National Identification Number (NIN)
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nin"
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  required
                  maxLength={11}
                  className="pl-10 transition-all border-muted focus:border-[#008751]"
                />
                {nin && (
                  <div className="absolute right-3 top-2.5">
                    {validateNin(nin) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Your NIN will be verified for voter eligibility</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 transition-all border-muted focus:border-[#008751]"
                />
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Password strength:</span>
                    <span className={passwordStrength.strength > 0 ? "font-medium" : "text-muted-foreground"}>
                      {passwordStrength.strength > 0 ? passwordStrength.text : "Too weak"}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength * 25}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 transition-all border-muted focus:border-[#008751]"
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-2.5">
                    {password === confirmPassword ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {passwordError}
              </div>
            )}
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
                  Registering...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#008751] font-medium hover:underline transition-colors">
                Login
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
