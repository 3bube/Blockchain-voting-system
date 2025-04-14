"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Vote,
  History,
  Users,
  DoorOpen,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      requireAuth: true,
    },
    {
      label: "Cast Vote",
      icon: Vote,
      href: "/vote",
      requireAuth: true,
    },
    {
      label: "Voting History",
      icon: History,
      href: "/history",
      requireAuth: true,
    },
    {
      label: "Join Room",
      icon: DoorOpen,
      href: "/join-room",
      requireAuth: true,
    },
    {
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      requireAuth: true,
      requireAdmin: true,
    },
    {
      label: "Room Management",
      icon: Users,
      href: "/room-management",
      requireAuth: true,
      requireAdmin: true,
    },
    {
      label: "Power Status",
      icon: Zap,
      href: "/power-status",
      requireAuth: true,
      requireAdmin: true,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="hidden border-r bg-background md:block w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => {
              if (route.requireAdmin && !isAdmin) return null;
              if (route.requireAuth && !user) return null;

              return (
                <Button
                  key={route.href}
                  variant={
                    pathname === route.href ||
                    pathname.startsWith(route.href + "/")
                      ? "secondary"
                      : "ghost"
                  }
                  className={cn(
                    "w-full justify-start",
                    pathname === route.href ||
                      pathname.startsWith(route.href + "/")
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
