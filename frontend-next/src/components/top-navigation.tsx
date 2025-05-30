"use client"

import { Search, Bell, User, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import type { NavigationItem } from "@/types/navigation"

const pageNames = {
  dashboard: "Dashboard",
  courses: "My Courses",
  flashcards: "Flashcards",
  schedule: "Smart Schedule",
  chat: "Agent Chat",
  settings: "Settings",
} as const;

type PageName = keyof typeof pageNames;

interface TopNavigationProps {
  currentPage: PageName;
}

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function TopNavigation({ currentPage }: TopNavigationProps) {
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-violet-200/50 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger className="h-8 w-8" />

        <div className="flex-1 flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{pageNames[currentPage]}</h2>

          <div className="relative ml-auto max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search lectures, notes, flashcards..."
              className="pl-10 bg-white/50 border-violet-200 focus:border-violet-400 dark:bg-gray-800/50 dark:border-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-violet-500 to-cyan-500">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <DropdownMenuItem className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">New flashcards generated</p>
                  <p className="text-xs text-muted-foreground">ECON210 - Microeconomics</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Lecture summary ready</p>
                  <p className="text-xs text-muted-foreground">BIO301 - Cell Biology</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Study session reminder</p>
                  <p className="text-xs text-muted-foreground">MATH102 review in 30 minutes</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                Toggle Theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
  className="text-red-600"
  onClick={async () => {
    await signOut();
    router.push("/");
  }}
>
  Logout
</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
