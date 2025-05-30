"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavigation } from "@/components/top-navigation"
import { DashboardContent } from "@/components/dashboard-content"
import { CoursesContent } from "@/components/courses-content"
import { FlashcardsContent } from "@/components/flashcards-content"
import { ScheduleContent } from "@/components/schedule-content"
import { ChatContent } from "@/components/chat-content"
import { SettingsContent } from "@/components/settings-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"

export type NavigationItem = "dashboard" | "courses" | "flashcards" | "schedule" | "chat" | "settings"

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState<NavigationItem>("dashboard")

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardContent />
      case "courses":
        return <CoursesContent />
      case "flashcards":
        return <FlashcardsContent />
      case "schedule":
        return <ScheduleContent />
      case "chat":
        return <ChatContent />
      case "settings":
        return <SettingsContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <SidebarInset className="flex-1">
            <TopNavigation currentPage={currentPage} />
            <main className="flex-1 p-6">{renderContent()}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
