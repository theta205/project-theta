"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Mic, MoreVertical, Brain, FileText, Calendar, BookOpen, Zap } from "lucide-react"

export function ChatContent() {
  const [message, setMessage] = useState("")

  const chatHistory = [
    {
      id: 1,
      type: "user",
      content: "Can you summarize today's BIO301 lecture on cell division?",
      timestamp: "2:30 PM",
    },
    {
      id: 2,
      type: "ai",
      content:
        "I've analyzed your BIO301 lecture notes from today. Here's a comprehensive summary of cell division:\n\n**Mitosis Overview:**\n- Process by which a single cell divides to produce two identical daughter cells\n- Consists of 4 main phases: Prophase, Metaphase, Anaphase, Telophase\n\n**Key Points:**\n- Prophase: Chromosomes condense and become visible\n- Metaphase: Chromosomes align at the cell's equator\n- Anaphase: Sister chromatids separate and move to opposite poles\n- Telophase: Nuclear envelopes reform around each set of chromosomes\n\nWould you like me to generate flashcards for these concepts?",
      timestamp: "2:31 PM",
      actions: ["Generate Flashcards", "Create Quiz", "Add to Schedule"],
    },
    {
      id: 3,
      type: "user",
      content: "Yes, please generate flashcards for the mitosis phases",
      timestamp: "2:32 PM",
    },
    {
      id: 4,
      type: "ai",
      content:
        "Perfect! I've created 12 flashcards covering the mitosis phases. Here's a preview:\n\n**Card 1:**\nFront: What happens during Prophase?\nBack: Chromosomes condense and become visible under a microscope. The nuclear envelope begins to break down.\n\n**Card 2:**\nFront: Describe the key characteristic of Metaphase\nBack: Chromosomes align at the cell's equator (metaphase plate) attached to spindle fibers.\n\nThe complete deck has been added to your BIO301 flashcard collection. You can start studying them right away!",
      timestamp: "2:33 PM",
      actions: ["Study Now", "View All Cards", "Share Deck"],
    },
  ]

  const quickPrompts = [
    "Summarize last lecture",
    "Create quiz for this week",
    "Generate study schedule",
    "Explain this concept",
    "Make flashcards",
    "Review my notes",
  ]

  const recentDocuments = [
    {
      name: "BIO301 - Cell Division Lecture",
      type: "lecture",
      course: "BIO301",
      date: "Today",
    },
    {
      name: "ECON210 - Market Structures Notes",
      type: "notes",
      course: "ECON210",
      date: "Yesterday",
    },
    {
      name: "MATH102 - Integration Problems",
      type: "assignment",
      course: "MATH102",
      date: "2 days ago",
    },
  ]

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header */}
      <Card className="border-violet-200/50 dark:border-gray-800 mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white font-medium">
                AI
              </div>
              <div>
                <CardTitle className="text-lg">Project Theta Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Your AI study companion</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat Messages */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 border-violet-200/50 dark:border-gray-800">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${chat.type === "user" ? "order-2" : "order-1"}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          chat.type === "user"
                            ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{chat.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                        {chat.actions && (
                          <div className="flex gap-1">
                            {chat.actions.map((action, index) => (
                              <Button key={index} size="sm" variant="outline" className="text-xs h-6">
                                {action}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {chat.type === "ai" && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium mr-3 mt-1">
                        AI
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about your courses..."
                    className="pr-20 bg-white/50 border-violet-200 focus:border-violet-400 dark:bg-gray-800/50 dark:border-gray-700"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        // Handle send message
                        setMessage("")
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Paperclip className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Mic className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Capabilities */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800 cursor-pointer">
                <Brain className="h-5 w-5 text-violet-500" />
                <div>
                  <p className="text-sm font-medium">Generate Flashcards</p>
                  <p className="text-xs text-muted-foreground">From lectures & notes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800 cursor-pointer">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Summarize Content</p>
                  <p className="text-xs text-muted-foreground">Lectures, readings, notes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800 cursor-pointer">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Smart Scheduling</p>
                  <p className="text-xs text-muted-foreground">Optimize study time</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800 cursor-pointer">
                <BookOpen className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Explain Concepts</p>
                  <p className="text-xs text-muted-foreground">Break down complex topics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card className="border-violet-200/50 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Recent Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {doc.course}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{doc.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
