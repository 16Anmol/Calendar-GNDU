'use client'

import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, List, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const COLLEGE = ["GURU NANAK DEV UNIVERSITY AMRITSAR" , "GURU NANAK DEV UNIVERSITY VERKA" , "GURU NANAK DEV UNIVERSITY JALANDHAR"]

const DOMAINS = ['Technical', 'Creative', 'Cultural', 'Trips', 'Sports', 'Placement', 'Others']

interface Event {
  id: string;
  title: string;
  community: string;
  organizer: string;
  college: string;
  domain: string;
  startTime: string;
  startPeriod: 'AM' | 'PM';
  endTime: string;
  endPeriod: 'AM' | 'PM';
  startDate?: string;
  endDate?: string;
  description: string;
}

export default function Component() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [events, setEvents] = useState<Record<string, Event[]>>({})
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [selectedCollege, setSelectedCollege] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [securityCode, setSecurityCode] = useState('')

  useEffect(() => {
    const loadEvents = () => {
      const storedEvents = localStorage.getItem('events')
      if (storedEvents) {
        try {
          const parsedEvents = JSON.parse(storedEvents)
          console.log('Loaded events from localStorage:', parsedEvents)
          setEvents(parsedEvents)
        } catch (error) {
          console.error('Error parsing stored events:', error)
          setEvents({})
        }
      }
    }

    loadEvents()
    window.addEventListener('storage', loadEvents)

    return () => {
      window.removeEventListener('storage', loadEvents)
    }
  }, [])

  useEffect(() => {
    setShowEventDetails(false)
  }, [selectedYear, selectedMonth])

  const saveEvents = (updatedEvents: Record<string, Event[]>) => {
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    setEvents(updatedEvents)
  }

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    setSelectedDate(date)
    setShowEventDetails(true)
  }

  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (securityCode !== 'RIFASUM9121') {
      toast({
        title: "Error",
        description: "Invalid security code",
        variant: "destructive",
      })
      return
    }
    const formData = new FormData(event.currentTarget)
    const newEvent = Object.fromEntries(formData.entries()) as unknown as Event
    
    newEvent.id = Date.now().toString()
    const updatedEvents = {
      ...events,
      [selectedDate!]: [...(events[selectedDate!] || []), newEvent].sort((a, b) => 
        a.startTime.localeCompare(b.startTime) || 
        (a.startPeriod === 'AM' && b.startPeriod === 'PM' ? -1 : 1)
      )
    }
    saveEvents(updatedEvents)
    setIsDialogOpen(false)
    setSecurityCode('')
    event.currentTarget.reset()
    toast({
      title: "Success",
      description: "Event added successfully",
    })
  }

  const handleEditEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (securityCode !== 'RIFASUM9121') {
      toast({
        title: "Error",
        description: "Invalid security code",
        variant: "destructive",
      })
      return
    }
    const formData = new FormData(event.currentTarget)
    const updatedEvent = Object.fromEntries(formData.entries()) as unknown as Event
    
    const updatedEvents = {
      ...events,
      [selectedDate!]: events[selectedDate!].map(e => e.id === editingEvent!.id ? {...updatedEvent, id: e.id} : e)
        .sort((a, b) => 
          a.startTime.localeCompare(b.startTime) || 
          (a.startPeriod === 'AM' && b.startPeriod === 'PM' ? -1 : 1)
        )
    }
    saveEvents(updatedEvents)
    setEditingEvent(null)
    setIsDialogOpen(false)
    setSecurityCode('')
    toast({
      title: "Success",
      description: "Event updated successfully",
    })
  }

  const handleDeleteEvent = () => {
    if (securityCode !== 'RIFASUM9121') {
      toast({
        title: "Error",
        description: "Invalid security code",
        variant: "destructive",
      })
      return
    }
    if (!selectedDate || !eventToDelete) {
      console.log('No event selected for deletion')
      toast({
        title: "Error",
        description: "No event selected for deletion",
        variant: "destructive",
      })
      return
    }
  
    const updatedEvents = {...events}
    if (updatedEvents[selectedDate]) {
      updatedEvents[selectedDate] = updatedEvents[selectedDate].filter(e => e.id !== eventToDelete.id)
      if (updatedEvents[selectedDate].length === 0) {
        delete updatedEvents[selectedDate]
      }
    }
    saveEvents(updatedEvents)
  
    console.log('Event deleted successfully')
    setIsDeleteDialogOpen(false)
    setEventToDelete(null)
    setShowEventDetails(false)
    setSecurityCode('')
  
    toast({
      title: "Success",
      description: "Event deleted successfully",
    })
  }

  const filteredEvents = Object.entries(events).flatMap(([date, eventList]) => 
    eventList.map(event => ({ ...event, date }))
  ).filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.community?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
  ).sort((a, b) => 
    a.date.localeCompare(b.date) || 
    a.startTime.localeCompare(b.startTime) || 
    (a.startPeriod === 'AM' && b.startPeriod === 'PM' ? -1 : 1)
  )

  const formatTime = (time: string, period: 'AM' | 'PM') => {
    const [hours, minutes] = time.split(':')
    return `${hours}:${minutes} ${period}`
  }

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 flex flex-col">
      <div className="bg-blue-800 text-white p-4 flex items-center">
        <div className="w-16 h-16 bg-white rounded-full mr-4"></div>
        <h1 className="text-4xl font-bold">Musafir Calendar</h1>
      </div>
      <div className="flex justify-between items-center p-4 bg-blue-100">
        <div className="flex space-x-2">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} onClick={() => setViewMode('calendar')}>
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
          <Input 
            type="text" 
            placeholder="Search events..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-grow p-4 overflow-auto">
        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-7 gap-1 h-full">
            {DAYS.map(day => (
              <div key={day} className="text-center font-bold p-2 bg-blue-200">{day}</div>
            ))}
            {Array.from({length: getFirstDayOfMonth(selectedYear, selectedMonth)}, (_, i) => (
              <div key={`empty-${i}`} className="p-2 bg-blue-100"></div>
            ))}
            {Array.from({length: getDaysInMonth(selectedYear, selectedMonth)}, (_, i) => i + 1).map(day => (
              <div
                key={day}
                className={`p-2 border border-blue-200 cursor-pointer hover:bg-blue-100 ${
                  selectedDate === `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` ? 'bg-blue-300' : 'bg-white'
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="font-semibold">{day}</div>
                {events[`${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`]?.map((event, index) => (
                  <div key={event.id} className="text-xs truncate">{event.title}</div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-lg">{event.date}</h3>
                  <div className="mt-2">
                    <p className="font-semibold text-lg">{event.title}</p>
                    <p className="text-blue-700">{event.community}</p>
                    <p>{formatTime(event.startTime, event.startPeriod)} - {formatTime(event.endTime, event.endPeriod)}</p>
                    {event.domain === 'Trips' && <p>{event.startDate} - {event.endDate}</p>}
                    <p className="mt-2 text-sm">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <form onSubmit={editingEvent ? handleEditEvent : handleAddEvent} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" defaultValue={editingEvent?.title || ''} required />
              </div>
              <div>
                <Label htmlFor="community">Community Name</Label>
                <Input id="community" name="community" defaultValue={editingEvent?.community || ''} required />
              </div>
              <div>
                <Label htmlFor="organizer">Organizer Name</Label>
                <Input id="organizer" name="organizer" defaultValue={editingEvent?.organizer || ''} required />
              </div>
              <div>
                <Label htmlFor="college/">Select University</Label>
                <Select defaultValue={editingEvent?.college || selectedCollege} onValueChange={setSelectedCollege}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select University" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLEGE.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Select defaultValue={editingEvent?.domain || selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(domain => (
                      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" type="time" defaultValue={editingEvent?.startTime || ''} required />
                </div>
                <div>
                  <Label htmlFor="startPeriod">Period</Label>
                  <Select defaultValue={editingEvent?.startPeriod || 'AM'} name="startPeriod">
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" type="time" defaultValue={editingEvent?.endTime || ''} required />
                </div>
                <div>
                  <Label htmlFor="endPeriod">Period</Label>
                  <Select defaultValue={editingEvent?.endPeriod || 'AM'} name="endPeriod">
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedDomain === 'Trips' && (
                <>
                  <div>
                    <Label htmlFor="startDate">Trip Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" defaultValue={editingEvent?.startDate || ''} />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Trip End Date</Label>
                    <Input id="endDate" name="endDate" type="date" defaultValue={editingEvent?.endDate || ''} />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingEvent?.description || ''} required />
              </div>
              <div>
                <Label htmlFor="securityCode">Security Code</Label>
                <Input 
                  id="securityCode" 
                  type="password" 
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  placeholder="Enter security code" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full">
                {editingEvent ? 'Save Changes' : 'Add Event'}
              </Button>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Events on {selectedDate}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {events[selectedDate!]?.map(event => (
              <div key={event.id} className="mt-2 p-4 bg-blue-100 rounded-lg flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{event.title}</p>
                  <p className="text-blue-700">{event.community}</p>
                  <p>{formatTime(event.startTime, event.startPeriod)} - {formatTime(event.endTime, event.endPeriod)}</p>
                  {event.domain === 'Trips' && <p>{event.startDate} - {event.endDate}</p>}
                  <p>{event.organizer} - {event.college}</p>
                  <p>Domain: {event.domain}</p>
                  <p className="text-sm mt-2">{event.description}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingEvent(event)
                    setShowEventDetails(false)
                    setIsDialogOpen(true)
                  }}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => {
                    setEventToDelete(event)
                    setIsDeleteDialogOpen(true)
                  }}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {(!events[selectedDate!] || events[selectedDate!].length === 0) && (
              <p>No events for this date.</p>
            )}
          </ScrollArea>
          <Button onClick={() => {
            setEditingEvent(null)
            setShowEventDetails(false)
            setIsDialogOpen(true)
          }}>
            Add Event
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this event?</p>
          <p><strong>{eventToDelete?.title}</strong></p>
          <div>
            <Label htmlFor="deleteSecurityCode">Security Code</Label>
            <Input 
              id="deleteSecurityCode" 
              type="password" 
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Enter security code" 
              required 
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setSecurityCode('')
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}