import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, BookOpen, Clock, FileText, Brain, MessageSquare, Calendar, Plus } from "lucide-react"

export function CoursesContent() {
  const courses = [
    {
      code: "ECON210",
      title: "Microeconomics",
      instructor: "Dr. Sarah Johnson",
      credits: 3,
      progress: 75,
      lectures: 24,
      flashcards: 156,
      assignments: 8,
      color: "from-blue-500 to-cyan-500",
      status: "active",
    },
    {
      code: "BIO301",
      title: "Cell Biology",
      instructor: "Prof. Michael Chen",
      credits: 4,
      progress: 60,
      lectures: 18,
      flashcards: 203,
      assignments: 6,
      color: "from-green-500 to-emerald-500",
      status: "active",
    },
    {
      code: "MATH102",
      title: "Calculus II",
      instructor: "Dr. Emily Rodriguez",
      credits: 4,
      progress: 85,
      lectures: 32,
      flashcards: 89,
      assignments: 12,
      color: "from-purple-500 to-violet-500",
      status: "active",
    },
    {
      code: "HIST205",
      title: "Modern European History",
      instructor: "Prof. David Wilson",
      credits: 3,
      progress: 45,
      lectures: 16,
      flashcards: 67,
      assignments: 4,
      color: "from-orange-500 to-red-500",
      status: "active",
    },
    {
      code: "PHYS101",
      title: "Introduction to Physics",
      instructor: "Dr. Lisa Park",
      credits: 4,
      progress: 100,
      lectures: 28,
      flashcards: 145,
      assignments: 10,
      color: "from-gray-500 to-slate-500",
      status: "completed",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-muted-foreground">Manage your enrolled courses and track progress</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-violet-200/50 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search courses..."
                className="pl-10 bg-white/50 border-violet-200 focus:border-violet-400 dark:bg-gray-800/50 dark:border-gray-700"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">660</p>
                <p className="text-sm text-muted-foreground">Flashcards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">40</p>
                <p className="text-sm text-muted-foreground">Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card
            key={course.code}
            className="hover:shadow-lg transition-all duration-200 border-violet-200/50 dark:border-gray-800"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{course.code}</CardTitle>
                    <Badge variant={course.status === "completed" ? "secondary" : "default"}>{course.status}</Badge>
                  </div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.instructor}</p>
                  <p className="text-xs text-muted-foreground">{course.credits} credits</p>
                </div>
                <div className={`h-4 w-4 rounded-full bg-gradient-to-r ${course.color}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Course Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{course.lectures}</p>
                  <p className="text-xs text-muted-foreground">Lectures</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{course.flashcards}</p>
                  <p className="text-xs text-muted-foreground">Flashcards</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{course.assignments}</p>
                  <p className="text-xs text-muted-foreground">Assignments</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <FileText className="h-3 w-3" />
                  Summary
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Brain className="h-3 w-3" />
                  Flashcards
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Calendar className="h-3 w-3" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
