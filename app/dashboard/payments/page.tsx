"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, QrCode } from "lucide-react"

interface Payment {
  id: string
  bookingId: string
  amount: number
  status: "pending" | "completed" | "failed"
  method: string
  createdAt: any
}

export default function Payments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchPayments = async () => {
      try {
        const paymentsQuery = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const paymentsSnapshot = await getDocs(paymentsQuery)
        const paymentsList = paymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[]

        setPayments(paymentsList)
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [user])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Manage your payments and view payment history</p>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="paytm">Paytm QR</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>A list of all your payments for gas cylinder bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">#{payment.id.slice(0, 6)}</TableCell>
                        <TableCell>#{payment.bookingId.slice(0, 6)}</TableCell>
                        <TableCell>{payment.createdAt?.toDate().toLocaleDateString() || "N/A"}</TableCell>
                        <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">
                          {payment.method === "cod"
                            ? "Cash on Delivery"
                            : payment.method === "paytm"
                              ? "Paytm QR"
                              : payment.method}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payment history found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paytm">
          <Card>
            <CardHeader>
              <CardTitle>Paytm QR Payment</CardTitle>
              <CardDescription>Scan the QR code below to make a payment via Paytm</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-white p-4 rounded-lg border mb-4">
                <QrCode className="h-48 w-48" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                After scanning and making the payment, please take a screenshot of the payment confirmation and upload
                it in your booking details for verification.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
