"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
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
import { Loader2, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
}

interface VoteDetails {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: "active" | "ended";
  candidates: Candidate[];
}

export default function EditVotePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voteDetails, setVoteDetails] = useState<VoteDetails | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    endDate: "",
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const voteId = params.id as string;

  useEffect(() => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this page",
      });
      router.push("/dashboard");
      return;
    }

    const fetchVoteDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/vote/${voteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVoteDetails(data);
          setFormData({
            title: data.title,
            description: data.description,
            endDate: new Date(data.endDate).toISOString().slice(0, 16),
          });
          setCandidates(data.candidates);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load vote details",
          });
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch vote details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while loading vote details",
        });
        router.push("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetails();
  }, [voteId, router, toast, isAdmin]);

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
      toast({
        variant: "destructive",
        title: "Error",
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
      !formData.endDate
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Validate candidates
    const invalidCandidates = candidates.some(
      (candidate) => !candidate.name.trim() || !candidate.party.trim()
    );

    if (invalidCandidates) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all candidate names and parties",
      });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/vote/update/${voteId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          candidates,
        }),
      });

      if (response.ok) {
        toast({
          title: "Vote updated",
          description: "The vote has been updated successfully",
        });
        router.push("/admin/dashboard");
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message || "Failed to update vote",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the vote",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin || !voteDetails) {
    return null;
  }

  // If vote is ended, don't allow editing
  if (voteDetails.status === "ended") {
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
            <CardTitle className="text-2xl">Vote Ended</CardTitle>
            <CardDescription>
              This vote has ended and cannot be edited
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The vote "{voteDetails.title}" has ended and is now in read-only
              mode.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/admin/votes/${voteId}`)}
            >
              View Results
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
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
          <CardTitle className="text-2xl">Edit Vote</CardTitle>
          <CardDescription>
            Update the voting session details and candidates
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
                <Card key={candidate.id}>
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
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
