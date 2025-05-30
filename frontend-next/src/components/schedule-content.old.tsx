"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Zap,
  BookOpen,
  Brain,
  FileText,
  Users,
} from "lucide-react"

interface ScheduleEvent {
  id: number
  title: string
  type: string
  time: string
  duration: string
  course: string
  day: number
  color: string
  description?: string
}

interface EventItemProps {
  event: ScheduleEvent
}

// Helper function to generate random gradients
const getRandomGradient = (): string => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500',
    'from-yellow-500 to-amber-500',
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

// Define icon components with proper types
const EventIcons = {
  lecture: BookOpen,
  class: BookOpen,
  study: Brain,
  review: Brain,
  assignment: FileText,
  homework: FileText,
  due: FileText,
  exam: FileText,
  quiz: FileText,
  test: FileText,
  meeting: Users,
  group: Users,
  default: Clock
} as const

type EventIconType = keyof typeof EventIcons

const EventItem = ({ event }: EventItemProps) => {
  const IconComponent = EventIcons[event.type as EventIconType] || EventIcons.default;
  const isAllDay = event.time === 'All Day' || event.time === '';
  
  // Format time for display (e.g., "9:00 AM - 10:30 AM")
  const formatTimeDisplay = (timeStr: string) => {
    if (isAllDay) return 'All Day'
    
    // If the time includes a dash, it's already a range
    if (timeStr.includes('-')) {
      return timeStr
    }
    
    // If we have duration, show both start time and end time
    if (event.duration) {
      return `${timeStr} - ${event.duration}`
    }
    
    return timeStr || 'All Day'
  }

  return (
    <div
      className={`p-3 rounded-lg text-white text-sm mb-2 bg-gradient-to-r ${event.color} hover:opacity-90 transition-colors shadow-sm cursor-pointer`}
    >
      <div className="flex flex-col h-full">
        {/* Time and title row */}
    </div>
  )
}

export function ScheduleContent() {
  const [currentView, setCurrentView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isImporting, setIsImporting] = useState(false)
  const [icalUrl, setIcalUrl] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([])

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  // Generate days for the current view (week or month)
  const getViewDays = () => {
    const currentDate = new Date(currentDateRef.current)
    
    if (currentView === 'week') {
      const currentDay = new Date().getDay()
      const currentDateNum = new Date().getDate()
      
      return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date()
        const dayOffset = i - (currentDay === 0 ? 6 : currentDay - 1)
        date.setDate(currentDateNum + dayOffset)
        
        return {
          date: date.getDate(),
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
          isToday: date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth(),
          dateObj: date,
          isCurrentMonth: date.getMonth() === new Date().getMonth()
        }
      })
    } else {
      // Month view
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const startDay = firstDay.getDay()
      const daysInMonth = lastDay.getDate()
      const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
      
      const days = []
      
      // Previous month days
      for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(currentDate)
        date.setDate(-i)
        days.push({
          date: daysInPrevMonth - i,
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
          isToday: false,
          dateObj: date,
          isCurrentMonth: false
        })
      }
      
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate)
        date.setDate(i)
        days.push({
          date: i,
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
          isToday: i === new Date().getDate() && date.getMonth() === new Date().getMonth(),
          dateObj: date,
          isCurrentMonth: true
        })
      }
      
      // Next month days
      const remainingDays = 42 - days.length // 6 rows x 7 days
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentDate)
        date.setMonth(date.getMonth() + 1, i)
        days.push({
          date: i,
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
          isToday: false,
          dateObj: date,
          isCurrentMonth: false
        })
      }
      
      return days
    }
  }

  // Parse iCal data
  const parseICal = (data: string) => {
    try {
      console.log('Parsing iCal data...')
      // @ts-ignore - ical.js will be loaded from CDN
      const jcalData = ICAL.parse(data)
      const comp = new ICAL.Component(jcalData)
      const vevents = comp.getAllSubcomponents('vevent')
      
      return vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent)
        return {
          summary: event.summary,
          start: event.startDate.toString(),
          end: event.endDate.toString(),
          description: event.description,
          location: event.location,
          categories: event.categories || []
        }
      })
    } catch (error) {
      console.error('Error parsing iCal data:', error)
      throw error
    }
  }

  // Fetch iCal data from URL
  const fetchICalData = async (url: string) => {
    if (!url) return
    
    setIsImporting(true)
    
    try {
      const response = await fetch('/api/fetch-ical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch iCal data')
      }
      
      const data = await response.json()
      const events = parseICal(data.data)
      
      // Process events and update state
      const newEvents = events.map((event: any, index: number) => {
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)
        const dayOfWeek = startDate.getDay()
        const calendarDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        
        return {
          id: Date.now() + index,
          title: event.summary || 'Imported Event',
          type: event.categories?.[0]?.toLowerCase() || 'lecture',
          time: formatTime(startDate),
          duration: calculateDuration(startDate, endDate),
          course: event.categories?.[0] || 'Imported',
          day: calendarDayIndex,
          color: getRandomGradient(),
          description: event.description || ''
        }
      })
      
      setScheduleEvents(prev => [...prev, ...newEvents])
      setIcalUrl('')
      setShowUrlInput(false)
      
    } catch (error) {
      console.error('Error importing calendar:', error)
      alert('Failed to import calendar. Please check the URL and try again.')
    } finally {
      setIsImporting(false)
    }
  }

  // Format time to string
  const formatTime = (date: Date | null | undefined): string => {
    if (!date) return 'All Day'
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }).format(date)
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Error'
    }
  }

  // Calculate duration between two dates
  const calculateDuration = (start: Date | null | undefined, end: Date | null | undefined): string => {
    try {
      if (!start || !end) return ''
      
      const diffMs = end.getTime() - start.getTime()
      const diffMins = Math.round(diffMs / 60000)
      
      if (diffMins < 60) {
        return `${diffMins}m`
      }
      
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      
      return mins ? `${hours}h ${mins}m` : `${hours}h`
    } catch (error) {
      console.error('Error calculating duration:', error)
      return ''
    }
  }

  // Use a ref to track the current date to avoid dependency issues
  const currentDateRef = useRef(new Date())
  
  // Handle navigation between weeks/months
  const handlePrevious = () => {
    const newDate = new Date(currentDateRef.current)
    if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    currentDateRef.current = newDate
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDateRef.current)
    if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    currentDateRef.current = newDate
    setCurrentDate(newDate)
  }

  // Load ical.js from CDN
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ical.js/1.4.0/ical.min.js'
    script.async = true
    script.onload = () => {
      // @ts-ignore
      window.ICAL = ICAL
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Get days for current view
  const viewDays = getViewDays()
  
  // Handle form submission for iCal import
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (icalUrl) {
      fetchICalData(icalUrl)
    }
  }
  
  // Handle iCal URL input change
  const handleIcalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIcalUrl(e.target.value)
  }

  // Get events for a specific day
  const getEventsForDay = (dayDate: Date) => {
    if (!dayDate) return []
    
    return scheduleEvents.filter(event => {
      if (!event.time) return false
      const eventDate = new Date(event.time)
      return (
        eventDate.getDate() === dayDate.getDate() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getFullYear() === dayDate.getFullYear()
      )
    })
  }

  // Calendar day cell
  const renderDayCell = (day: any, index: number) => {
    if (!day || !day.dateObj) return null
    
    const dayEvents = getEventsForDay(day.dateObj)
    
    return (
      <div 
        key={index} 
        className={`min-h-24 p-1 border rounded-lg ${
          day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        } ${!day.isCurrentMonth ? 'opacity-50' : ''} transition-colors`}
      >
        <div className="flex justify-between items-center mb-1 px-1">
          <span className={`text-xs font-medium ${
            day.isToday ? 'text-blue-600 dark:text-blue-400' : ''
          }`}>
            {day.date}
          </span>
          {day.isToday && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          )}
        </div>
        <div className="space-y-0.5 overflow-y-auto max-h-20">
          {dayEvents.map((event, i) => (
            <EventItem key={`${event.id}-${i}`} event={event} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
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
          <Button onClick={() => setShowUrlInput(!showUrlInput)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Calendar
          </Button>
        </div>
      </div>

      {/* iCal URL Input */}
      {showUrlInput && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter iCal URL"
            value={icalUrl}
            onChange={handleIcalUrlChange}
            className="flex-1"
            required
          />
          <Button 
            type="submit"
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </form>
      )}

      {/* Calendar View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {formatMonthYear(currentDate)}
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentView === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('week')}
          >
            Week
          </Button>
          <Button
            variant={currentView === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium text-sm py-2">
            {day}
          </div>
        ))}
        
        {viewDays.map((day, index) => (
          renderDayCell(day, index)
              {scheduleEvents
                .filter(event => event.day === index)
                .map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Event Button */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full w-14 h-14 p-0">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
