"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  userId: string
  userName: string
  userAddress: string
  userPhone: string
  createdAt: any
  status: "pending" | "approved" | "rejected" | "delivered"
  paymentMethod: string
  additionalNotes?: string
}

export default function AdminBookings() {
  const { user, userRole } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user || userRole !== "admin") {
      router.push("/dashboard")
      return
    }

    const fetchBookings = async () => {
      try {
        const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"))

        const bookingsSnapshot = await getDocs(bookingsQuery)
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[]

        setBookings(bookingsList)
      } catch (error) {
        console.error("Error fetching bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, userRole, router])

  const handleStatusUpdate = async (bookingId: string, userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
      })

      // If rejected, give back the cylinder to the user
      if (newStatus === "rejected") {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          await updateDoc(doc(db, "users", userId), {
            cylindersRemaining: userData.cylindersRemaining + 1,
          })
        }
      }

      // Update local state
      setBookings(
        bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus as any } : booking)),
      )

      toast({
        title: "Status Updated",
        description: `Booking status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "delivered":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Bookings</h1>
        <p className="text-muted-foreground">Review and manage all customer gas cylinder bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>Approve or reject customer booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id.slice(0, 6)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-xs text-muted-foreground">{booking.userPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{booking.createdAt?.toDate().toLocaleDateString() || "N/A"}</TableCell>
                    <TableCell className="capitalize">
                      {booking.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : booking.paymentMethod === "paytm"
                          ? "Paytm QR"
                          : booking.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                            onClick={() => handleStatusUpdate(booking.id, booking.userId, "approved")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                            onClick={() => handleStatusUpdate(booking.id, booking.userId, "rejected")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
