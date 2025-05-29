import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BookOpen,
  Brain,
  Calendar,
  MessageSquare,
  Upload,
  FolderSyncIcon as Sync,
  Clock,
  PlayCircle,
  FileText,
  Zap,
} from "lucide-react"

export function DashboardContent() {
  const courses = [
    {
      code: "ECON210",
      title: "Microeconomics",
      instructor: "Dr. Sarah Johnson",
      progress: 75,
      color: "from-blue-500 to-cyan-500",
    },
    {
      code: "BIO301",
      title: "Cell Biology",
      instructor: "Prof. Michael Chen",
      progress: 60,
      color: "from-green-500 to-emerald-500",
    },
    {
      code: "MATH102",
      title: "Calculus II",
      instructor: "Dr. Emily Rodriguez",
      progress: 85,
      color: "from-purple-500 to-violet-500",
    },
    {
      code: "HIST205",
      title: "Modern European History",
      instructor: "Prof. David Wilson",
      progress: 45,
      color: "from-orange-500 to-red-500",
    },
  ]

  const todaysTasks = [
    {
      time: "9:00 AM",
      task: "Review ECON210 flashcards",
      type: "flashcard",
      completed: false,
      icon: Brain,
    },
    {
      time: "11:30 AM",
      task: "Summarize BIO301 lecture",
      type: "lecture",
      completed: true,
      icon: FileText,
    },
    {
      time: "2:00 PM",
      task: "MATH102 problem set due",
      type: "assignment",
      completed: false,
      icon: Clock,
    },
    {
      time: "4:00 PM",
      task: "Study session: HIST205",
      type: "study",
      completed: false,
      icon: PlayCircle,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, Alex! 👋</h1>
              <p className="text-violet-100 mb-4">Ready to tackle your studies? Let's make today productive.</p>
              <Button className="bg-white text-violet-600 hover:bg-violet-50 font-medium">
                <Zap className="mr-2 h-4 w-4" />
                Start My Study Session
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Overview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Card
                key={course.code}
                className="hover:shadow-lg transition-all duration-200 border-violet-200/50 dark:border-gray-800"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                      <p className="text-sm text-muted-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{course.instructor}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${course.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      View Summary
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      Flashcards
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Schedule</h2>
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardContent className="p-4 space-y-3">
              {todaysTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Checkbox
                    checked={task.completed}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-cyan-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <task.icon className="h-4 w-4 text-violet-500" />
                      <span className="text-xs text-muted-foreground">{task.time}</span>
                    </div>
                    <p
                      className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-gray-900 dark:text-white"}`}
                    >
                      {task.task}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <Sync className="h-5 w-5" />
              <span className="text-xs">Sync Canvas</span>
            </Button>
            <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload Lecture</span>
            </Button>
            <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">Study Plan</span>
            </Button>
            <Button className="h-16 flex-col gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs">Ask Agent</span>
            </Button>
          </CardContent>
        </Card>

        {/* Agent Activity */}
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Recent Agent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-violet-50 dark:bg-gray-800/50">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Generated 15 flashcards for ECON210</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-gray-800/50">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Summarized BIO301 lecture notes</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-800/50">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Created study schedule for this week</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
