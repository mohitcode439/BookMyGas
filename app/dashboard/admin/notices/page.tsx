"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Notice {
  id: string
  title: string
  message: string
  createdAt: any
}

const noticeFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  message: z.string().min(5, { message: "Message must be at least 5 characters" }),
})

type NoticeFormValues = z.infer<typeof noticeFormSchema>

export default function AdminNotices() {
  const { user, userRole } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  })

  useEffect(() => {
    if (!user || userRole !== "admin") {
      router.push("/dashboard")
      return
    }

    const fetchNotices = async () => {
      try {
        const noticesQuery = query(collection(db, "notices"), orderBy("createdAt", "desc"))

        const noticesSnapshot = await getDocs(noticesQuery)
        const noticesList = noticesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notice[]

        setNotices(noticesList)
      } catch (error) {
        console.error("Error fetching notices:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [user, userRole, router])

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      await deleteDoc(doc(db, "notices", noticeId))

      // Update local state
      setNotices(notices.filter((notice) => notice.id !== noticeId))

      toast({
        title: "Notice Deleted",
        description: "The notice has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting notice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete notice",
      })
    }
  }

  const onSubmit = async (values: NoticeFormValues) => {
    try {
      const noticeRef = await addDoc(collection(db, "notices"), {
        title: values.title,
        message: values.message,
        createdAt: serverTimestamp(),
      })

      // Add to local state
      setNotices([
        {
          id: noticeRef.id,
          title: values.title,
          message: values.message,
          createdAt: new Date(),
        },
        ...notices,
      ])

      form.reset()
      setIsDialogOpen(false)

      toast({
        title: "Notice Created",
        description: "The notice has been created successfully",
      })
    } catch (error) {
      console.error("Error creating notice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create notice",
      })
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Notices</h1>
          <p className="text-muted-foreground">Create and manage notices for all users</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
              <DialogDescription>Create a new notice that will be visible to all users</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Notice Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notice message..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Notice</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <Card key={notice.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{notice.title}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteNotice(notice.id)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <CardDescription>{notice.createdAt?.toDate().toLocaleDateString() || "N/A"}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{notice.message}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No notices found. Create a new notice to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
