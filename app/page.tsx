import Link from "next/link"
import { UserAuthForm } from "@/components/user-auth-form"

export default function Home() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M4.5 16.5c-1.5 0-3-1.5-3-3 0-1.5 1.5-3 3-3m15-3c1.5 0 3 1.5 3 3 0 1.5-1.5 3-3 3" />
            <path d="M12 8.5V4.5" />
            <path d="M5 4.5h14v7.9a5.5 5.5 0 0 1-5.5 5.5h-3a5.5 5.5 0 0 1-5.5-5.5V4.5Z" />
            <path d="M8 19.5v-4" />
            <path d="M16 19.5v-4" />
          </svg>
          Gas Agency Booking System
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Book your gas cylinders online with ease. No more waiting on phone calls or long queues.
            </p>
            <footer className="text-sm">Gas Agency System</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to Gas Agency System</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account or register to get started</p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
