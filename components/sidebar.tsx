"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, ShoppingCart, History, CreditCard, User, LogOut, Users, Bell, Settings } from "lucide-react"

interface SidebarLinkProps {
  href: string
  icon: React.ReactNode
  title: string
}

function SidebarLink({ href, icon, title }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive ? "bg-muted font-medium text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      {title}
    </Link>
  )
}

export function Sidebar() {
  const { userRole } = useAuth()
  const isAdmin = userRole === "admin"

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M4.5 16.5c-1.5 0-3-1.5-3-3 0-1.5 1.5-3 3-3m15-3c1.5 0 3 1.5 3 3 0 1.5-1.5 3-3 3" />
              <path d="M12 8.5V4.5" />
              <path d="M5 4.5h14v7.9a5.5 5.5 0 0 1-5.5 5.5h-3a5.5 5.5 0 0 1-5.5-5.5V4.5Z" />
              <path d="M8 19.5v-4" />
              <path d="M16 19.5v-4" />
            </svg>
            BookMyGas
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <SidebarLink href="/dashboard" icon={<Home className="h-4 w-4" />} title="Dashboard" />
            <SidebarLink href="/dashboard/book" icon={<ShoppingCart className="h-4 w-4" />} title="Book Cylinder" />
            <SidebarLink href="/dashboard/history" icon={<History className="h-4 w-4" />} title="Booking History" />
            <SidebarLink href="/dashboard/payments" icon={<CreditCard className="h-4 w-4" />} title="Payments" />
            <SidebarLink href="/dashboard/profile" icon={<User className="h-4 w-4" />} title="Profile" />

            {isAdmin && (
              <>
                <div className="my-2 border-t pt-2">
                  <h4 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">Admin</h4>
                </div>
                <SidebarLink href="/dashboard/admin/users" icon={<Users className="h-4 w-4" />} title="Manage Users" />
                <SidebarLink
                  href="/dashboard/admin/bookings"
                  icon={<ShoppingCart className="h-4 w-4" />}
                  title="Manage Bookings"
                />
                <SidebarLink
                  href="/dashboard/admin/notices"
                  icon={<Bell className="h-4 w-4" />}
                  title="Manage Notices"
                />
                <SidebarLink
                  href="/dashboard/admin/settings"
                  icon={<Settings className="h-4 w-4" />}
                  title="Settings"
                />
              </>
            )}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  )
}
