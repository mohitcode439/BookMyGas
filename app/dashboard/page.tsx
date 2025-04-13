"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Cylinder, AlertCircle, Bell, ShoppingCart } from "lucide-react"
import Link from "next/link"

interface Notice {
  id: string
  title: string
  message: string
  createdAt: any
}

interface UserData {
  name: string
  cylindersAllocated: number
  cylindersRemaining: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        }

        // Fetch notices
        const noticesQuery = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(3))
        const noticesSnapshot = await getDocs(noticesQuery)
        const noticesList = noticesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notice[]
        setNotices(noticesList)

        // Fetch recent bookings
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3),
        )
        const bookingsSnapshot = await getDocs(bookingsQuery)
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentBookings(bookingsList)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userData?.name || "User"}</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/dashboard/book">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Book New Cylinder
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cylinders Allocated</CardTitle>
            <Cylinder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.cylindersAllocated || 0}</div>
            <p className="text-xs text-muted-foreground">Total cylinders allocated for the year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cylinders Remaining</CardTitle>
            <Cylinder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData?.cylindersRemaining || 0}</div>
            <p className="text-xs text-muted-foreground">Cylinders available for booking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentBookings.length}</div>
            <p className="text-xs text-muted-foreground">Recent cylinder bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your most recent gas cylinder bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">Booking #{booking.id.slice(0, 6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.createdAt?.toDate().toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent bookings found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Notices</CardTitle>
              <CardDescription>Important announcements from the gas agency</CardDescription>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {notices.length > 0 ? (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <Alert key={notice.id}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{notice.title}</AlertTitle>
                    <AlertDescription>{notice.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notices at this time.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
