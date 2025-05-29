"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Bell,
  Palette,
  Database,
  Shield,
  HelpCircle,
  ExternalLink,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Brain,
} from "lucide-react"
import { useTheme } from "next-themes"

export function SettingsContent() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div className="flex-1">
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Johnson" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex.johnson@university.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" defaultValue="State University" />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Study Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get notified about scheduled study sessions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Due Dates</Label>
                  <p className="text-sm text-muted-foreground">Reminders for upcoming deadlines</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Receive AI-powered study recommendations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send notifications to your email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mobile Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Push notifications on mobile devices</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className="gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Use smaller spacing and components</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions and animations</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow anonymous usage analytics</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>AI Training</Label>
                  <p className="text-sm text-muted-foreground">Use my data to improve AI models</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connected Services */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connected Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    C
                  </div>
                  <div>
                    <p className="text-sm font-medium">Canvas LMS</p>
                    <Badge variant="secondary" className="text-xs">
                      Connected
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google Drive</p>
                    <Badge variant="outline" className="text-xs">
                      Not Connected
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    N
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notion</p>
                    <Badge variant="outline" className="text-xs">
                      Not Connected
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-generate Flashcards</Label>
                  <p className="text-sm text-muted-foreground">Create flashcards from lectures automatically</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Smart Scheduling</Label>
                  <p className="text-sm text-muted-foreground">Let AI optimize your study schedule</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Proactive Suggestions</Label>
                  <p className="text-sm text-muted-foreground">Receive study suggestions without asking</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <HelpCircle className="h-4 w-4" />
                Help Center
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                Contact Support
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
              <div className="pt-2 text-center">
                <p className="text-xs text-muted-foreground">Version 2.1.0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
