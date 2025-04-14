"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Zap, ZapOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PowerStatus {
  id: string;
  deviceId: string;
  location: string;
  status: "online" | "offline";
  lastUpdated: string;
  batteryLevel: number;
}

export default function PowerStatusPage() {
  const { user, isAdmin } = useAuth();
  const [powerStatus, setPowerStatus] = useState<PowerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New status form
  const [newStatus, setNewStatus] = useState({
    deviceId: "",
    location: "",
    status: "online",
    batteryLevel: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      toast.message("Access Denied", {
        description: "You don't have permission to access this page",
      });
      return;
    }

    fetchPowerStatus();
  }, [isAdmin, toast]);

  const fetchPowerStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/power-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPowerStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch power status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load power status data",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPowerStatus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStatus((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewStatus((prev) => ({
      ...prev,
      [name]: name === "batteryLevel" ? Number.parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/power-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStatus),
      });

      if (response.ok) {
        const data = await response.json();
        setPowerStatus((prev) => [...prev, data]);
        setNewStatus({
          deviceId: "",
          location: "",
          status: "online",
          batteryLevel: 100,
        });
        toast({
          title: "Status updated",
          description: "Power status has been updated successfully",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message || "Failed to update power status",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating power status",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const onlineDevices = powerStatus.filter(
    (device) => device.status === "online"
  );
  const offlineDevices = powerStatus.filter(
    (device) => device.status === "offline"
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Power Status Monitoring</h1>

        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{powerStatus.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Online</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Zap className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-3xl font-bold">{onlineDevices.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Offline</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <ZapOff className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-3xl font-bold">{offlineDevices.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Update Power Status</CardTitle>
            <CardDescription>
              Record the current power status of a polling device
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  name="deviceId"
                  placeholder="Enter device ID"
                  value={newStatus.deviceId}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter device location"
                  value={newStatus.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Power Status</Label>
                  <Select
                    value={newStatus.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batteryLevel">Battery Level (%)</Label>
                  <Select
                    value={newStatus.batteryLevel.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("batteryLevel", value)
                    }
                  >
                    <SelectTrigger id="batteryLevel">
                      <SelectValue placeholder="Select battery level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="0">0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Summary</CardTitle>
            <CardDescription>
              Overview of power status across all polling stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {powerStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Data Available</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  No power status data has been recorded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Online Devices</span>
                  <span className="text-sm font-medium">
                    {onlineDevices.length} / {powerStatus.length}
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-2"
                    style={{
                      width: `${
                        (onlineDevices.length /
                          Math.max(powerStatus.length, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium">Offline Devices</span>
                  <span className="text-sm font-medium">
                    {offlineDevices.length} / {powerStatus.length}
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-2"
                    style={{
                      width: `${
                        (offlineDevices.length /
                          Math.max(powerStatus.length, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Battery Status</h4>
                  <div className="space-y-2">
                    {[
                      {
                        level: "Critical (<25%)",
                        count: powerStatus.filter((d) => d.batteryLevel < 25)
                          .length,
                      },
                      {
                        level: "Low (25-50%)",
                        count: powerStatus.filter(
                          (d) => d.batteryLevel >= 25 && d.batteryLevel < 50
                        ).length,
                      },
                      {
                        level: "Medium (50-75%)",
                        count: powerStatus.filter(
                          (d) => d.batteryLevel >= 50 && d.batteryLevel < 75
                        ).length,
                      },
                      {
                        level: "High (75-100%)",
                        count: powerStatus.filter((d) => d.batteryLevel >= 75)
                          .length,
                      },
                    ].map((item) => (
                      <div
                        key={item.level}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.level}
                        </span>
                        <span>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Devices</TabsTrigger>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DeviceList devices={powerStatus} />
        </TabsContent>

        <TabsContent value="online">
          <DeviceList devices={onlineDevices} />
        </TabsContent>

        <TabsContent value="offline">
          <DeviceList devices={offlineDevices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeviceList({ devices }: { devices: PowerStatus[] }) {
  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No Devices Found</h3>
        <p className="text-muted-foreground mt-2">
          No devices match the selected filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => (
        <Card key={device.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{device.deviceId}</CardTitle>
              <Badge
                variant={device.status === "online" ? "default" : "destructive"}
              >
                {device.status === "online" ? (
                  <Zap className="h-3 w-3 mr-1" />
                ) : (
                  <ZapOff className="h-3 w-3 mr-1" />
                )}
                {device.status}
              </Badge>
            </div>
            <CardDescription>{device.location}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{new Date(device.lastUpdated).toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Battery Level:</span>
                  <span>{device.batteryLevel}%</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 ${
                      device.batteryLevel > 70
                        ? "bg-green-500"
                        : device.batteryLevel > 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${device.batteryLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
