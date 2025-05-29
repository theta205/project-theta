"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, Brain, Play, Plus, BookOpen, RotateCcw, Star, Clock, TrendingUp } from "lucide-react"

export function FlashcardsContent() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)

  const flashcardDecks = [
    {
      id: "econ210-micro",
      course: "ECON210",
      title: "Microeconomics Fundamentals",
      cardCount: 45,
      studiedToday: 12,
      accuracy: 85,
      lastStudied: "2 hours ago",
      difficulty: "Medium",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "bio301-cells",
      course: "BIO301",
      title: "Cell Structure & Function",
      cardCount: 67,
      studiedToday: 0,
      accuracy: 92,
      lastStudied: "Yesterday",
      difficulty: "Hard",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "math102-calc",
      course: "MATH102",
      title: "Calculus Integration",
      cardCount: 32,
      studiedToday: 8,
      accuracy: 78,
      lastStudied: "1 hour ago",
      difficulty: "Hard",
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "hist205-europe",
      course: "HIST205",
      title: "European Wars & Politics",
      cardCount: 28,
      studiedToday: 0,
      accuracy: 88,
      lastStudied: "3 days ago",
      difficulty: "Easy",
      color: "from-orange-500 to-red-500",
    },
  ]

  const sampleCard = {
    front: "What is the law of diminishing marginal utility?",
    back: "The law of diminishing marginal utility states that as a person increases consumption of a product, there is a decline in the marginal utility that person derives from consuming each additional unit of that product.",
  }

  if (selectedDeck) {
    return (
      <div className="space-y-6">
        {/* Study Session Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedDeck(null)} className="gap-2">
              ← Back to Decks
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Microeconomics Fundamentals</h1>
              <p className="text-muted-foreground">ECON210 • 45 cards</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Progress
            </Button>
            <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 gap-2">
              <Play className="h-4 w-4" />
              Continue Study
            </Button>
          </div>
        </div>

        {/* Study Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12/45</p>
                  <p className="text-sm text-muted-foreground">Cards Studied</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">15m</p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground">Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard Preview */}
        <Card className="max-w-2xl mx-auto border-violet-200/50 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-center">Card 13 of 45</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="min-h-[200px] p-6 bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-lg text-center font-medium">{sampleCard.front}</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="px-8">
                Show Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
          <p className="text-muted-foreground">Study with AI-generated flashcards</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
          <Plus className="mr-2 h-4 w-4" />
          Create Deck
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-violet-200/50 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search flashcard decks..."
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

      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">172</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">86%</p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/50 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard Decks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {flashcardDecks.map((deck) => (
          <Card
            key={deck.id}
            className="hover:shadow-lg transition-all duration-200 border-violet-200/50 dark:border-gray-800"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline">{deck.course}</Badge>
                    <Badge
                      variant={
                        deck.difficulty === "Hard"
                          ? "destructive"
                          : deck.difficulty === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {deck.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{deck.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {deck.cardCount} cards • Last studied {deck.lastStudied}
                  </p>
                </div>
                <div className={`h-4 w-4 rounded-full bg-gradient-to-r ${deck.color}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{deck.studiedToday}</p>
                  <p className="text-xs text-muted-foreground">Studied Today</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{deck.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{deck.cardCount}</p>
                  <p className="text-xs text-muted-foreground">Total Cards</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 gap-2"
                  onClick={() => setSelectedDeck(deck.id)}
                >
                  <Play className="h-4 w-4" />
                  Study Now
                </Button>
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Browse
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
