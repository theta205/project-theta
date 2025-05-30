"use client"

declare const ICAL: any; // Declare ICAL as it's loaded via CDN

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Download, 
  Plus, 
  Upload, 
  Zap,
  BookOpen,
  Brain,
  FileText,
  Users,
  Clock
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'

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
  dateObj: Date
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
  
  return (
    <div
      className={`p-2 rounded-lg text-white text-sm mb-2 bg-gradient-to-r ${event.color} hover:opacity-90 transition-colors shadow-sm cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm truncate">
          {event.title}
        </h4>
        {event.course && (
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
            {event.course}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ScheduleContent() {
  const [currentView, setCurrentView] = useState<"week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isImporting, setIsImporting] = useState(false)
  const [icalUrl, setIcalUrl] = useState("")
  const [calendarName, setCalendarName] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([])

  // Format month and year
  const formatMonthYear = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  // Handle navigation
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  }

  // Generate days for the current view (week or month)
  const getViewDays = () => {
    if (currentView === 'week') {
      return getWeekDays();
    } else {
      return getMonthDays();
    }
  }

  // Generate week days starting from Monday
  const getWeekDays = () => {
    const weekStart = new Date(currentDate);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(weekStart.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return createDayData(date);
    });
  }

  // Generate month days in a 6x7 grid (including previous/next month days)
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from previous month's last Monday
    const dayOfWeek = firstDay.getDay() || 7; // Convert Sunday (0) to 7
    const startDay = new Date(firstDay);
    startDay.setDate(1 - (dayOfWeek - 1));
    
    // Generate 6 weeks (42 days) to fill the calendar grid
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + i);
      days.push(createDayData(date));
    }
    
    return days;
  }
  
  // Helper to create day data object
  const createDayData = (date: Date) => {
    const today = new Date();
    return {
      date: date.getDate(),
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
      isToday: date.toDateString() === today.toDateString(),
      dateObj: new Date(date),
      isCurrentMonth: date.getMonth() === currentDate.getMonth()
    };
  }

  // Check if an event occurs on a specific day
  const isEventOnDay = (event: ScheduleEvent, day: Date) => {
    return event.dateObj.toDateString() === day.toDateString();
  }

  // Parse iCal data with timezone handling
  const parseICal = (data: string) => {
    try {
      const jcalData = ICAL.parse(data)
      const comp = new ICAL.Component(jcalData)
      const vevents = comp.getAllSubcomponents('vevent')
      
      return vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent)
        const startDate = event.startDate.toJSDate()
        const endDate = event.endDate.toJSDate()
        
        // Handle all-day events (which are often stored as UTC midnight)
        const isAllDay = event.startDate.isDate || 
                       (startDate.getHours() === 0 && 
                        startDate.getMinutes() === 0 &&
                        event.startDate.timezone === 'UTC')
        
        // For all-day events, use local date without timezone conversion
        const start = isAllDay ? new Date(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate()
        ) : startDate
        
        const end = isAllDay ? new Date(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate() - 1 // Adjust end date for all-day events (exclusive)
        ) : endDate
        
        return {
          start,
          end,
          summary: event.summary,
          description: event.description,
          categories: event.categories,
          isAllDay
        }
      })
    } catch (error) {
      console.error('Error parsing iCal data:', error)
      throw new Error('Invalid iCal format')
    }
  }

  // Fetch iCal data from URL
  const fetchICalData = async (url: string) => {
    if (!url || !calendarName) return
    
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
        // Clone dates to avoid modifying originals
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)
        
        // For all-day events, use the date directly without time
        const dayOfWeek = event.isAllDay 
          ? startDate.getDay() 
          : startDate.getDay()
        
        const calendarDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        
        return {
          id: Date.now() + index,
          title: event.summary || 'Imported Event',
          type: event.categories?.[0]?.toLowerCase() || 'lecture',
          time: event.isAllDay ? 'All day' : formatTime(startDate),
          duration: event.isAllDay ? '' : calculateDuration(startDate, endDate),
          course: calendarName,
          day: calendarDayIndex,
          color: getRandomGradient(),
          description: event.description || '',
          dateObj: startDate,
          isAllDay: event.isAllDay || false
        } as ScheduleEvent
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

  // Handle input changes
  const handleIcalUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIcalUrl(e.target.value)
  }
  
  const handleCalendarNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalendarName(e.target.value)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (icalUrl && calendarName) {
      fetchICalData(icalUrl)
    } else {
      alert('Please provide both a calendar URL and a name for the calendar')
    }
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

      {/* Calendar Import Form */}
      {showUrlInput && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter calendar name"
              value={calendarName}
              onChange={handleCalendarNameChange}
              className="flex-1"
              required
            />
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
          </div>
          <p className="text-xs text-muted-foreground">
            Give your calendar a name (e.g., 'Work', 'School', 'Personal')
          </p>
        </form>
      )}

      {/* Calendar View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {formatMonthYear(currentDate)}
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('next')}
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
        
        {getViewDays().map((day, index) => (
          <div 
            key={index} 
            className={`min-h-32 p-2 border rounded-lg ${
              day.isToday ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-border'
            } ${!day.isCurrentMonth ? 'opacity-50' : ''}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${
                day.isToday 
                  ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                  : ''
              }`}>
                {day.date}
              </span>
              {!day.isCurrentMonth && (
                <span className="text-xs text-muted-foreground">
                  {day.dateObj.toLocaleString('default', { month: 'short' })}
                </span>
              )}
            </div>
            
            {/* Events for this day */}
            <div className="space-y-1 mt-1">
              {scheduleEvents
                .filter(event => isEventOnDay(event, day.dateObj))
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
