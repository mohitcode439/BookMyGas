"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Minus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
  cylindersAllocated: number
  cylindersRemaining: number
  createdAt: any
}

export default function AdminUsers() {
  const { user, userRole } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!user || userRole !== "admin") {
      router.push("/dashboard")
      return
    }

    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))

        const usersSnapshot = await getDocs(usersQuery)
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]

        setUsers(usersList)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, userRole, router])

  const handleCylinderUpdate = async (userId: string, action: "add" | "remove") => {
    try {
      const userToUpdate = users.find((u) => u.id === userId)
      if (!userToUpdate) return

      const newAllocated =
        action === "add" ? userToUpdate.cylindersAllocated + 1 : Math.max(0, userToUpdate.cylindersAllocated - 1)

      const newRemaining =
        action === "add" ? userToUpdate.cylindersRemaining + 1 : Math.max(0, userToUpdate.cylindersRemaining - 1)

      await updateDoc(doc(db, "users", userId), {
        cylindersAllocated: newAllocated,
        cylindersRemaining: newRemaining,
      })

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, cylindersAllocated: newAllocated, cylindersRemaining: newRemaining } : u,
        ),
      )

      toast({
        title: "Cylinders Updated",
        description: `User's cylinder allocation has been updated`,
      })
    } catch (error) {
      console.error("Error updating cylinders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cylinder allocation",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm),
  )

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
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and cylinder allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cylinders Allocated</TableHead>
                  <TableHead>Cylinders Remaining</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.cylindersAllocated}</TableCell>
                    <TableCell>{user.cylindersRemaining}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleCylinderUpdate(user.id, "add")}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCylinderUpdate(user.id, "remove")}
                          disabled={user.cylindersAllocated <= 0}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
