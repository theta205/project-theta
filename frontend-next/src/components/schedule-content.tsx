"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Brain,
  BookOpen,
  FileText,
  Users,
  Zap,
} from "lucide-react"

export function ScheduleContent() {
  const [currentView, setCurrentView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const currentWeek = [
    { date: 18, day: "Mon", isToday: false },
    { date: 19, day: "Tue", isToday: false },
    { date: 20, day: "Wed", isToday: true },
    { date: 21, day: "Thu", isToday: false },
    { date: 22, day: "Fri", isToday: false },
    { date: 23, day: "Sat", isToday: false },
    { date: 24, day: "Sun", isToday: false },
  ]

  const scheduleEvents = [
    {
      id: 1,
      title: "ECON210 Lecture",
      type: "lecture",
      time: "9:00 AM",
      duration: "1h 30m",
      course: "ECON210",
      day: 0, // Monday
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Review Flashcards",
      type: "study",
      time: "11:00 AM",
      duration: "30m",
      course: "BIO301",
      day: 0,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Math Problem Set",
      type: "assignment",
      time: "2:00 PM",
      duration: "2h",
      course: "MATH102",
      day: 1, // Tuesday
      color: "from-purple-500 to-violet-500",
    },
    {
      id: 4,
      title: "BIO301 Lab",
      type: "lecture",
      time: "10:00 AM",
      duration: "3h",
      course: "BIO301",
      day: 2, // Wednesday
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 5,
      title: "Study Group",
      type: "study",
      time: "4:00 PM",
      duration: "1h 30m",
      course: "HIST205",
      day: 2,
      color: "from-orange-500 to-red-500",
    },
    {
      id: 6,
      title: "Essay Due",
      type: "assignment",
      time: "11:59 PM",
      duration: "",
      course: "HIST205",
      day: 4, // Friday
      color: "from-orange-500 to-red-500",
    },
  ]

  const aiSuggestions = [
    {
      title: "Review ECON210 concepts",
      time: "7:00 PM",
      reason: "You have 2 hours free and quiz tomorrow",
      type: "study",
    },
    {
      title: "Generate flashcards for BIO301",
      time: "8:30 PM",
      reason: "Based on today's lecture notes",
      type: "flashcard",
    },
    {
      title: "Start MATH102 homework early",
      time: "Tomorrow 3:00 PM",
      reason: "Due in 3 days, estimated 4 hours needed",
      type: "assignment",
    },
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case "lecture":
        return BookOpen
      case "study":
        return Brain
      case "assignment":
        return FileText
      default:
        return Clock
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Schedule</h1>
          <p className="text-muted-foreground">AI-powered study planning and time management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Zap className="h-4 w-4" />
            AI Optimize
          </Button>
          <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="border-violet-200/50 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">November 2024</h2>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={currentView === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("week")}
              >
                Week
              </Button>
              <Button
                variant={currentView === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentView("month")}
              >
                Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Week View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {currentWeek.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2">{day.day}</div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mx-auto ${
                        day.isToday
                          ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                          : "hover:bg-violet-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {day.date}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[400px]">
                {currentWeek.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 p-2 space-y-2"
                  >
                    {scheduleEvents
                      .filter((event) => event.day === dayIndex)
                      .map((event) => {
                        const Icon = getEventIcon(event.type)
                        return (
                          <div
                            key={event.id}
                            className={`p-2 rounded-lg bg-gradient-to-r ${event.color} text-white text-xs cursor-pointer hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Icon className="h-3 w-3" />
                              <span className="font-medium">{event.time}</span>
                            </div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs opacity-90">{event.course}</div>
                            {event.duration && <div className="text-xs opacity-75">{event.duration}</div>}
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="space-y-4">
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-violet-50 dark:bg-gray-800/50 hover:bg-violet-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                      AI
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.time}</p>
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600"
                  >
                    Add to Schedule
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Today's Focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">BIO301 Lab</span>
                </div>
                <p className="text-xs text-muted-foreground">10:00 AM - 1:00 PM</p>
                <Badge variant="secondary" className="mt-2">
                  High Priority
                </Badge>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Study Group</span>
                </div>
                <p className="text-xs text-muted-foreground">4:00 PM - 5:30 PM</p>
                <Badge variant="outline" className="mt-2">
                  Medium Priority
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
