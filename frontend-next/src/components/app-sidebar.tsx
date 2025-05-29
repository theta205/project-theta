"use client"

import { LayoutDashboard, BookOpen, Brain, Calendar, MessageSquare, Settings, GraduationCap } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { NavigationItem } from "@/app/page"

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard" as NavigationItem,
  },
  {
    title: "My Courses",
    icon: BookOpen,
    id: "courses" as NavigationItem,
  },
  {
    title: "Flashcards",
    icon: Brain,
    id: "flashcards" as NavigationItem,
  },
  {
    title: "Smart Schedule",
    icon: Calendar,
    id: "schedule" as NavigationItem,
  },
  {
    title: "Agent Chat",
    icon: MessageSquare,
    id: "chat" as NavigationItem,
  },
  {
    title: "Settings",
    icon: Settings,
    id: "settings" as NavigationItem,
  },
]

interface AppSidebarProps {
  currentPage: NavigationItem
  onNavigate: (page: NavigationItem) => void
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-violet-200/50 dark:border-gray-800">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
              Project Theta
            </h1>
            <p className="text-xs text-muted-foreground">AI Course Assistant</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onNavigate(item.id)}
                isActive={currentPage === item.id}
                className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-violet-100 dark:hover:bg-gray-800 data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-500 data-[active=true]:to-cyan-500 data-[active=true]:text-white data-[active=true]:shadow-lg"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
