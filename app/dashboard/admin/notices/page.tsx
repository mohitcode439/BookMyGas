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
import { Timestamp } from "firebase/firestore"

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

export default function NoticesPage() {
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gas-blue-light/10 to-white dark:from-gas-blue-dark/10 dark:to-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-gas-blue" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 bg-gradient-to-b from-gas-blue-light/5 to-white dark:from-gas-blue-dark/5 dark:to-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gas-blue-dark dark:text-gas-blue-light">Notices</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gas-blue hover:bg-gas-blue-dark text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gas-blue-dark dark:text-gas-blue-light">Add New Notice</DialogTitle>
              <DialogDescription className="text-gas-gray">
                Create a new notice to be displayed to all users.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gas-blue-dark dark:text-gas-blue-light">Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter notice title" 
                          {...field} 
                          className="border-gas-blue-light focus:ring-gas-blue"
                        />
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
                      <FormLabel className="text-gas-blue-dark dark:text-gas-blue-light">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter notice message"
                          className="min-h-[100px] border-gas-blue-light focus:ring-gas-blue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                    className="bg-gas-blue hover:bg-gas-blue-dark text-white"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Notice"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {notices.map((notice) => (
          <Card 
            key={notice.id}
            className="bg-white dark:bg-gray-800 border-gas-blue-light/20 hover:border-gas-blue-light/40 transition-colors"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-gas-blue-dark dark:text-gas-blue-light">{notice.title}</CardTitle>
                  <CardDescription className="text-gas-gray">
                    {notice.createdAt instanceof Timestamp 
                      ? notice.createdAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="text-gas-orange hover:text-gas-orange-dark hover:bg-gas-orange/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gas-gray-dark dark:text-gas-gray-light">{notice.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
