'use client'

import * as React from 'react'
import { addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO, getWeek } from 'date-fns'
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Event = {
  id: string
  name: string
  description: string
  date: Date
  startTime: string
  endTime: string
  color: string
}

export default function EventCalendar() {
  const [events, setEvents] = React.useState<Event[]>([])
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [newEvent, setNewEvent] = React.useState<Partial<Event>>({
    color: 'blue'
  })
  const [view, setView] = React.useState<'day' | 'week' | 'month'>('month')
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

  const handleAddEvent = () => {
    if (newEvent.name && newEvent.date && newEvent.startTime && newEvent.endTime) {
      setEvents(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name: newEvent.name,
        description: newEvent.description || '',
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        color: newEvent.color || 'blue'
      }])
      setIsAddEventOpen(false)
      setNewEvent({ color: 'blue' })
    }
  }

  const timeSlots = Array.from({ length: 24 }, (_, i) => 
    format(new Date().setHours(i, 0, 0, 0), 'HH:mm')
  )

  const renderDayView = () => (
    <div className="grid grid-cols-[100px_1fr] gap-4">
      <div className="space-y-8">
        {timeSlots.map(time => (
          <div key={time} className="text-sm text-muted-foreground">
            {time}
          </div>
        ))}
      </div>
      <div className="relative border rounded-lg border-border">
        {timeSlots.map((time, i) => (
          <div
            key={time}
            className={cn(
              "absolute w-full border-t border-border",
              "hover:bg-muted/50 transition-colors",
              "cursor-pointer group"
            )}
            style={{ top: `${(i * 100) / 24}%`, height: `${100 / 24}%` }}
            onClick={() => {
              setNewEvent(prev => ({
                ...prev,
                startTime: time,
                endTime: format(addDays(new Date().setHours(i, 0, 0, 0), 0), 'HH:mm'),
                date: selectedDate
              }))
              setIsAddEventOpen(true)
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              className="absolute inset-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Add Event
            </Button>
          </div>
        ))}
        {events
          .filter(event => isSameDay(event.date, selectedDate))
          .map(event => (
            <div
              key={event.id}
              className={cn(
                "absolute left-2 right-2 rounded-md p-2 text-sm",
                event.color === 'blue' && "bg-blue-500/10 text-blue-700",
                event.color === 'red' && "bg-red-500/10 text-red-700",
                event.color === 'green' && "bg-green-500/10 text-green-700",
                event.color === 'yellow' && "bg-yellow-500/10 text-yellow-700"
              )}
              style={{
                top: `${(parseInt(event.startTime.split(':')[0]) * 100) / 24}%`,
                height: `${((parseInt(event.endTime.split(':')[0]) - parseInt(event.startTime.split(':')[0])) * 100) / 24}%`
              }}
            >
              <div className="font-medium">{event.name}</div>
              <div className="text-xs opacity-75">{event.description}</div>
            </div>
          ))}
      </div>
    </div>
  )

  const renderWeekView = () => {
    const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weekNumber = getWeek(selectedDate)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-border">
          <div className="p-2 text-sm font-medium">Week {weekNumber}</div>
          {days.map(day => (
            <div key={day.toString()} className="p-2 text-center">
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div className="text-sm text-muted-foreground">{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-[1px] bg-border">
          {timeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="bg-background p-2 text-sm text-muted-foreground">
                {time}
              </div>
              {days.map(day => (
                <div
                  key={day.toString()}
                  className="relative bg-background p-2 min-h-[60px] group"
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {isSameDay(hoveredDate || new Date(), day) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute inset-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setNewEvent(prev => ({
                          ...prev,
                          date: day,
                          startTime: time,
                          endTime: format(addDays(new Date().setHours(parseInt(time) + 1, 0, 0, 0), 0), 'HH:mm'),
                        }))
                        setIsAddEventOpen(true)
                      }}
                    >
                      Add Event
                    </Button>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const startDate = startOfMonth(selectedDate)
    const endDate = endOfMonth(selectedDate)
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const startingDayOfWeek = startDate.getDay()
    const daysFromPrevMonth = Array.from({ length: (startingDayOfWeek + 6) % 7 }, (_, i) =>
      addDays(startDate, -((startingDayOfWeek + 6) % 7) + i)
    )
    const daysFromNextMonth = Array.from(
      { length: 42 - days.length - daysFromPrevMonth.length },
      (_, i) => addDays(endDate, i + 1)
    )
    const allDays = [...daysFromPrevMonth, ...days, ...daysFromNextMonth]

    return (
      <div className="grid grid-cols-7 gap-[1px] bg-border rounded-lg overflow-hidden">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="bg-background p-4 text-center font-medium">
            {day}
          </div>
        ))}
        {allDays.map((day, index) => (
          <div
            key={day.toString()}
            className={cn(
              "bg-background p-4 min-h-[120px] relative group",
              !isSameMonth(day, selectedDate) && "text-muted-foreground"
            )}
            onMouseEnter={() => setHoveredDate(day)}
            onMouseLeave={() => setHoveredDate(null)}
          >
            <span className="text-sm">{format(day, 'd')}</span>
            {isSameDay(hoveredDate || new Date(), day) && (
              <Button
                size="sm"
                variant="ghost"
                className="absolute inset-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setNewEvent(prev => ({
                    ...prev,
                    date: day,
                    startTime: '09:00',
                    endTime: '10:00',
                  }))
                  setIsAddEventOpen(true)
                }}
              >
                Add Event
              </Button>
            )}
            <div className="mt-2 space-y-1">
              {events
                .filter(event => isSameDay(event.date, day))
                .map(event => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded-sm truncate",
                      event.color === 'blue' && "bg-blue-500/10 text-blue-700",
                      event.color === 'red' && "bg-red-500/10 text-red-700",
                      event.color === 'green' && "bg-green-500/10 text-green-700",
                      event.color === 'yellow' && "bg-yellow-500/10 text-yellow-700"
                    )}
                  >
                    {event.name}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            onClick={() => setView('day')}
            size="sm"
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
            size="sm"
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
            size="sm"
          >
            Month
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(prev => {
            switch (view) {
              case 'day': return addDays(prev, -1)
              case 'week': return addWeeks(prev, -1)
              case 'month': return addMonths(prev, -1)
            }
          })}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {view === 'month' ? format(selectedDate, 'MMMM yyyy') : 
             view === 'week' ? `Week ${getWeek(selectedDate)}` :
             format(selectedDate, 'MMMM d, yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(prev => {
            switch (view) {
              case 'day': return addDays(prev, 1)
              case 'week': return addWeeks(prev, 1)
              case 'month': return addMonths(prev, 1)
            }
          })}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" onClick={() => setIsAddEventOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Create a new event in your calendar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                placeholder="Enter event name"
                value={newEvent.name || ''}
                onChange={e => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                value={newEvent.description || ''}
                onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEvent.date ? format(newEvent.date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newEvent.date}
                    onSelect={date => setNewEvent(prev => ({ ...prev, date: date || new Date() }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Start Time</Label>
              <Select
                value={newEvent.startTime}
                onValueChange={value => setNewEvent(prev => ({ ...prev, startTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>End Time</Label>
              <Select
                value={newEvent.endTime}
                onValueChange={value => setNewEvent(prev => ({ ...prev, endTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <Select
                value={newEvent.color}
                onValueChange={value => setNewEvent(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2" />
                      Blue
                    </div>
                  </SelectItem>
                  <SelectItem value="red">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-500 mr-2" />
                      Red
                    </div>
                  </SelectItem>
                  <SelectItem value="green">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2" />
                      Green
                    </div>
                  </SelectItem>
                  <SelectItem value="yellow">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2" />
                      Yellow
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Save Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}