"use client"

import React, { useState, useEffect } from 'react';
import { 
  format, 
  addDays, 
  addMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO
} from 'date-fns';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  title: string;
  course?: string;
  date: Date;
  color: string;
  type?: string;
  time?: string;
  duration?: string;
  description?: string;
  points?: number;
  html_url?: string;
}

const EventItem = ({ event }: { event: ScheduleEvent }) => (
  <div className={`p-2 mb-1 text-xs rounded ${event.color} text-white truncate`}>
    <div className="font-medium">{event.title}</div>
    {event.course && <div className="text-xs opacity-80">{event.course}</div>}
  </div>
);

export default function ScheduleContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'week' | 'month'>('week');
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');

  const getDays = () => {
    if (currentView === 'week') {
      const start = startOfWeek(currentDate);
      return eachDayOfInterval({
        start,
        end: addDays(start, 6)
      });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({
        start: startOfWeek(start),
        end: endOfWeek(end)
      });
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (currentView === 'week') {
        return direction === 'prev' 
          ? addDays(prev, -7) 
          : addDays(prev, 7);
      } else {
        return direction === 'prev'
          ? addMonths(prev, -1)
          : addMonths(prev, 1);
      }
    });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      // Make sure we're comparing Date objects
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };

  // Function to convert Canvas assignment to calendar event
  const canvasToEvent = (assignment: any): ScheduleEvent => {
    const dueDate = assignment.due_at ? new Date(assignment.due_at) : new Date();
    const courseName = assignment.course_name || 'Unnamed Course';
    
    return {
      id: `canvas-${assignment.id}`,
      title: assignment.name || 'Untitled Assignment',
      course: courseName,
      date: dueDate,
      color: 'bg-blue-500',
      type: 'assignment',
      time: dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '',
      description: assignment.description || '',
      points: assignment.points_possible,
      html_url: assignment.html_url
    };
  };

  const handleImport = async () => {
    try {
      if (!icalUrl) {
        console.error('No URL provided');
        return;
      }
      
      // We'll just use the iCal import for now
      const response = await fetch('/api/fetch-ical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: icalUrl }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      
      // If we get iCal data, parse it
      if (data.data) {
        // Parse iCal data and convert to events
        // This is a simplified example - you'll need to implement proper iCal parsing
        const icalEvents: ScheduleEvent[] = [
          {
            id: 'ical-1',
            title: 'iCal Event',
            course: 'Imported',
            date: new Date(),
            color: 'bg-green-500',
            type: 'event',
            time: '2:00 PM',
            duration: '1h',
            description: 'Imported from iCal'
          }
        ];
        
        setEvents(prev => [...prev, ...icalEvents]);
      } else {
        // If we get direct events array
        const parsedEvents = Array.isArray(data) 
          ? data.map((event: any) => ({
              id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
              title: event.title || 'Untitled Event',
              course: event.course || '',
              date: new Date(event.start?.dateTime || event.start?.date || new Date()),
              color: 'bg-blue-500',
              type: event.type || 'event',
              time: event.start?.time || '',
              duration: event.duration || '',
              description: event.description || ''
            }))
          : [];
        
        setEvents(prev => [...prev, ...parsedEvents]);
      }
      
      setShowImport(false);
      
    } catch (error) {
      console.error('Error importing calendar:', error);
      alert(`Failed to import calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Initialize with empty events
  useEffect(() => {
    // Add some sample events for today and the next few days
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleEvents: ScheduleEvent[] = [
      {
        id: '1',
        title: 'Welcome to Theta',
        course: 'Getting Started',
        date: today,
        color: 'bg-blue-500',
        type: 'info',
        time: '9:00 AM',
        duration: '1h',
        description: 'Welcome to your new schedule! Import your calendar to get started.'
      },
      {
        id: '2',
        title: 'Team Meeting',
        course: 'Project Theta',
        date: today,
        color: 'bg-green-500',
        type: 'meeting',
        time: '2:00 PM',
        duration: '30m',
        description: 'Weekly team sync'
      },
      {
        id: '3',
        title: 'Code Review',
        course: 'Development',
        date: tomorrow,
        color: 'bg-purple-500',
        type: 'review',
        time: '11:00 AM',
        duration: '1h',
        description: 'Code review session'
      }
    ];
    console.log('Setting sample events:', sampleEvents);
    setEvents(sampleEvents);
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={currentView === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('month')}
          >
            Month
          </Button>
          <Button
            variant={currentView === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('week')}
          >
            Week
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowImport(!showImport)}
          >
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
        </div>
      </div>

      {showImport && (
        <div className="mb-4 flex space-x-2">
          <Input
            placeholder="iCal URL"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleImport}>Import</Button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium p-2">
            {day}
          </div>
        ))}

        {getDays().map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div 
              key={i}
              className={`min-h-24 p-2 border rounded ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              } ${isSameDay(day, new Date()) ? 'border-blue-500' : ''}`}
            >
              <div className="text-right">
                <span className={`inline-block rounded-full w-6 h-6 flex items-center justify-center ${
                  isSameDay(day, new Date()) ? 'bg-blue-500 text-white' : ''
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {dayEvents.map(event => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
