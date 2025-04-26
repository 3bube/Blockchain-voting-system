"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  FileText,
  User,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"
import newRequest from "@/utils/newRequest"
import { cn } from "@/lib/utils"

interface Candidate {
  id: string
  name: string
  party: string
  description: string
}

export default function CreateVotePage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: crypto.randomUUID(), name: "", party: "", description: "" },
    { id: crypto.randomUUID(), name: "", party: "", description: "" },
  ])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleCandidateChange = (id: string, field: keyof Candidate, value: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === id ? { ...candidate, [field]: value } : candidate)),
    )

    // Clear candidate errors when edited
    if (formErrors[`candidate-${id}-${field}`]) {
      setFormErrors((prev) => ({ ...prev, [`candidate-${id}-${field}`]: "" }))
    }
  }

  const addCandidate = () => {
    setCandidates((prev) => [...prev, { id: crypto.randomUUID(), name: "", party: "", description: "" }])
  }

  const removeCandidate = (id: string) => {
    if (candidates.length <= 2) {
      toast.error("A vote must have at least 2 candidates")
      return
    }

    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validate main form fields
    if (!formData.title.trim()) errors.title = "Title is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (!formData.startDate) errors.startDate = "Start date is required"
    if (!formData.endDate) errors.endDate = "End date is required"

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const now = new Date()

      if (start < now) errors.startDate = "Start date cannot be in the past"
      if (end <= start) errors.endDate = "End date must be after start date"
    }

    // Validate candidates
    candidates.forEach((candidate, index) => {
      if (!candidate.name.trim()) {
        errors[`candidate-${candidate.id}-name`] = `Candidate ${index + 1} name is required`
      }
      if (!candidate.party.trim()) {
        errors[`candidate-${candidate.id}-party`] = `Candidate ${index + 1} party is required`
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setLoading(true)

    try {
      // Format candidates as options for the backend
      const options = candidates.map((candidate) => ({
        name: `${candidate.name} (${candidate.party})`,
        description: candidate.description || "",
      }))

      // Create payload matching backend expectations
      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startDate).toISOString(),
        endTime: new Date(formData.endDate).toISOString(),
        options: options,
        maxParticipants: 1000, // Default value
        roomName: formData.title.replace(/\s+/g, "-").toLowerCase(), // Generate room name from title
        accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate random access code
      }

      const response = await newRequest.post("/vote/create", payload)

      if (response.data.success) {
        toast.success("Vote created successfully" + (response.data.voteId ? ` (ID: ${response.data.voteId})` : ""))

        if (response.data.message?.includes("Power outage")) {
          toast.message("Power Outage Mode", {
            description: "Vote saved to database and will sync to blockchain when power is restored",
          })
        }

        router.push("/admin/dashboard")
      } else {
        toast.error(response.data.error || "Failed to create vote")
      }
    } catch (error: any) {
      console.error("Error creating vote:", error)
      toast.error(error.response?.data?.error || error.message || "An error occurred while creating the vote")
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    router.push("/dashboard")
    return null
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

      <Button variant="ghost" className="mb-6 hover:bg-[#008751]/10" onClick={() => router.push("/admin/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="border-2 shadow-md overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#008751] via-white to-[#008751]"></div>
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center mb-2">
            <div className="bg-[#008751]/10 p-2 rounded-full mr-3">
              <FileText className="h-6 w-6 text-[#008751]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create New Vote</CardTitle>
              <CardDescription>Set up a new voting session with candidates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center text-sm font-medium">
                    Vote Title <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter vote title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className={cn("pl-10", formErrors.title && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </div>
                  {formErrors.title && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="flex items-center text-sm font-medium">
                        Start Date <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="startDate"
                          name="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                          className={cn("pl-10", formErrors.startDate && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </div>
                      {formErrors.startDate && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.startDate}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="flex items-center text-sm font-medium">
                        End Date <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="endDate"
                          name="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                          className={cn("pl-10", formErrors.endDate && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </div>
                      {formErrors.endDate && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {formErrors.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center text-sm font-medium">
                  Description <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter vote description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className={cn(formErrors.description && "border-red-500 focus-visible:ring-red-500")}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formErrors.description}
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#008751] mr-2" />
                    <Label className="text-lg font-medium">Candidates</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCandidate}
                    className="border-[#008751] text-[#008751] hover:bg-[#008751]/10 hover:text-[#008751]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {candidates.map((candidate, index) => (
                    <Card
                      key={candidate.id}
                      className={cn(
                        "border-2 relative overflow-hidden transition-all",
                        index % 2 === 0 ? "bg-[#008751]/5" : "bg-white",
                      )}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#008751]" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="bg-[#008751]/10 p-1.5 rounded-full mr-2">
                              <User className="h-4 w-4 text-[#008751]" />
                            </div>
                            <CardTitle className="text-base">Candidate {index + 1}</CardTitle>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCandidate(candidate.id)}
                            className="h-8 w-8 rounded-full hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`candidate-name-${candidate.id}`}
                              className="flex items-center text-sm font-medium"
                            >
                              Name <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id={`candidate-name-${candidate.id}`}
                                placeholder="Enter candidate name"
                                value={candidate.name}
                                onChange={(e) => handleCandidateChange(candidate.id, "name", e.target.value)}
                                required
                                className={cn(
                                  "pl-10",
                                  formErrors[`candidate-${candidate.id}-name`] &&
                                    "border-red-500 focus-visible:ring-red-500",
                                )}
                              />
                            </div>
                            {formErrors[`candidate-${candidate.id}-name`] && (
                              <p className="text-sm text-red-500 flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {formErrors[`candidate-${candidate.id}-name`]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`candidate-party-${candidate.id}`}
                              className="flex items-center text-sm font-medium"
                            >
                              Party <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id={`candidate-party-${candidate.id}`}
                                placeholder="Enter party name"
                                value={candidate.party}
                                onChange={(e) => handleCandidateChange(candidate.id, "party", e.target.value)}
                                required
                                className={cn(
                                  "pl-10",
                                  formErrors[`candidate-${candidate.id}-party`] &&
                                    "border-red-500 focus-visible:ring-red-500",
                                )}
                              />
                            </div>
                            {formErrors[`candidate-${candidate.id}-party`] && (
                              <p className="text-sm text-red-500 flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {formErrors[`candidate-${candidate.id}-party`]}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`candidate-description-${candidate.id}`} className="text-sm font-medium">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id={`candidate-description-${candidate.id}`}
                            placeholder="Enter candidate description"
                            value={candidate.description}
                            onChange={(e) => handleCandidateChange(candidate.id, "description", e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6 mt-6">
            <div className="flex items-center justify-center w-full text-sm text-muted-foreground mb-2">
              <CheckCircle className="h-4 w-4 mr-2 text-[#008751]" />
              All votes are securely recorded on the blockchain
            </div>
            <Button
              type="submit"
              className="w-full bg-[#008751] hover:bg-[#008751]/90 text-white"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Vote...
                </>
              ) : (
                "Create Vote"
              )}
            </Button>
          </CardFooter>

          {/* Bottom flag accent */}
          <div className="absolute bottom-0 left-0 right-0 flex h-1">
            <div className="flex-1 bg-[#008751]"></div>
            <div className="flex-1 bg-white"></div>
            <div className="flex-1 bg-[#008751]"></div>
          </div>
        </form>
      </Card>
    </div>
  )
}
