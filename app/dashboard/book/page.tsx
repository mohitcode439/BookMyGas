"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function BookCylinder() {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState<string>("cod")
  const [additionalNotes, setAdditionalNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleBooking = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Get user data to check remaining cylinders
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      const userData = userDoc.data()

      if (userData.cylindersRemaining <= 0) {
        throw new Error("You have no cylinders remaining for this year")
      }

      // Create booking document
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: userData.name,
        userAddress: userData.address,
        userPhone: userData.phone,
        paymentMethod,
        additionalNotes,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      // Update user's remaining cylinders
      await updateDoc(doc(db, "users", user.uid), {
        cylindersRemaining: userData.cylindersRemaining - 1,
      })

      // Send email notification (would be implemented with a Cloud Function)
      // This is a placeholder for the actual implementation

      setBookingSuccess(true)
      toast({
        title: "Booking Successful",
        description: "Your cylinder booking has been submitted successfully",
      })
    } catch (error: any) {
      setError(error.message || "Failed to book cylinder. Please try again.")
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (bookingSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Booking Successful!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your cylinder booking has been submitted successfully. You will receive an email confirmation shortly.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => setBookingSuccess(false)}>Book Another Cylinder</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Book a Gas Cylinder</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cylinder Booking</CardTitle>
          <CardDescription>Fill in the details below to book a new gas cylinder</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paytm" id="paytm" />
                <Label htmlFor="paytm">Paytm QR Code</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Additional Notes</h3>
            <Textarea
              placeholder="Any specific instructions for delivery..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBooking} disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Book Cylinder"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
