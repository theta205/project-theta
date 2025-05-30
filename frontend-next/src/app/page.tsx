"\"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, ArrowRight } from "lucide-react"
import Link from "next/link"

export type NavigationItem = "dashboard" | "courses" | "flashcards" | "schedule" | "chat" | "settings"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-violet-200/50 dark:border-gray-800 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                Project Theta
              </h1>
              <p className="text-sm text-muted-foreground">AI Course Assistant</p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Choose your experience: explore our landing page or dive into the dashboard demo.
          </p>

          <div className="space-y-4">
            <Link href="/landing" className="block">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 gap-2">
                View Landing Page
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full gap-2">
                Try Dashboard Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
