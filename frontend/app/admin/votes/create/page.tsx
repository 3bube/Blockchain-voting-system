"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import newRequest from "@/utils/newRequest";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
}

export default function CreateVotePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: crypto.randomUUID(), name: "", party: "", description: "" },
    { id: crypto.randomUUID(), name: "", party: "", description: "" },
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCandidateChange = (
    id: string,
    field: keyof Candidate,
    value: string
  ) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === id ? { ...candidate, [field]: value } : candidate
      )
    );
  };

  const addCandidate = () => {
    setCandidates((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", party: "", description: "" },
    ]);
  };

  const removeCandidate = (id: string) => {
    if (candidates.length <= 2) {
      toast.message("Error", {
        description: "A vote must have at least 2 candidates",
      });
      return;
    }

    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.endDate ||
      !formData.startDate
    ) {
      toast.message("Validation Error", {
        description: "Please fill in all required fields",
      });
      return;
    }

    // Validate candidates
    const invalidCandidates = candidates.some(
      (candidate) => !candidate.name.trim() || !candidate.party.trim()
    );

    if (invalidCandidates) {
      toast.message("Validation Error", {
        description: "Please fill in all candidate names and parties",
      });
      return;
    }

    setLoading(true);

    try {
      // Format candidates as options for the backend
      const options = candidates.map(candidate => ({
        name: `${candidate.name} (${candidate.party})`,
        description: candidate.description || ""
      }));
      
      // Create payload matching backend expectations
      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startDate).toISOString(),
        endTime: new Date(formData.endDate).toISOString(),
        options: options,
        maxParticipants: 1000, // Default value
        roomName: formData.title.replace(/\s+/g, '-').toLowerCase(), // Generate room name from title
        accessCode: Math.random().toString(36).substring(2, 8).toUpperCase() // Generate random access code
      };

      console.log("Sending payload:", payload);
      const response = await newRequest.post("/vote/create", payload);

      if (response.data.success) {
        toast.success("Vote created successfully" + 
          (response.data.voteId ? ` (ID: ${response.data.voteId})` : ""));
          
        if (response.data.message.includes("Power outage")) {
          toast.message("Power Outage Mode", {
            description: "Vote saved to database and will sync to blockchain when power is restored"
          });
        }
        
        router.push("/admin/dashboard");
      } else {
        toast.error(response.data.error || "Failed to create vote");
      }
    } catch (error: any) {
      console.error("Error creating vote:", error);
      toast.error(
        error.response?.data?.error || 
        error.message || 
        "An error occurred while creating the vote"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/admin/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Vote</CardTitle>
          <CardDescription>
            Set up a new voting session with candidates
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Vote Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter vote title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter vote description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The vote will automatically end at this date and time
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg">Candidates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCandidate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Button>
              </div>

              {candidates.map((candidate, index) => (
                <Card key={candidate.id} className="shadow-none ">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        Candidate {index + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCandidate(candidate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`candidate-name-${candidate.id}`}>
                          Name
                        </Label>
                        <Input
                          id={`candidate-name-${candidate.id}`}
                          placeholder="Enter candidate name"
                          value={candidate.name}
                          onChange={(e) =>
                            handleCandidateChange(
                              candidate.id,
                              "name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`candidate-party-${candidate.id}`}>
                          Party
                        </Label>
                        <Input
                          id={`candidate-party-${candidate.id}`}
                          placeholder="Enter party name"
                          value={candidate.party}
                          onChange={(e) =>
                            handleCandidateChange(
                              candidate.id,
                              "party",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`candidate-description-${candidate.id}`}>
                        Description (Optional)
                      </Label>
                      <Textarea
                        id={`candidate-description-${candidate.id}`}
                        placeholder="Enter candidate description"
                        value={candidate.description}
                        onChange={(e) =>
                          handleCandidateChange(
                            candidate.id,
                            "description",
                            e.target.value
                          )
                        }
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Vote...
                </>
              ) : (
                "Create Vote"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
