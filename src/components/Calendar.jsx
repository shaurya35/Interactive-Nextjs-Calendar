"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@fullcalendar/core";

const Calendar = ({ userId }) => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  // Load events from the database for the logged-in user
  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(`/api/events/${userId}`);
        if (!response.ok) {
          console.error("Failed to load events");
          return;
        }
        const data = await response.json();
        const formattedEvents = data.events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.startDate,
          end: event.endDate,
          allDay: event.allDay || false,
        }));
        setCurrentEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    }

    loadEvents();
  }, [userId]);

  // Save the newly added event to the database
  async function saveEventToDB(event) {
    const token = localStorage.getItem("token") ;
    const response = await fetch(`/api/events/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: event.event.title,
        startDate: event.event.start,
        endDate: event.event.end,
        allDay: event.event.allDay || false,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save event");
    }
  }

  const handleEventAdd = (eventInfo) => {
    saveEventToDB(eventInfo);
  };

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = (selected) => {
    if (
      window.confirm(`Are you sure you want to delete the event "${selected.event.title}"?`)
    ) {
      selected.event.remove(); // Remove event from the calendar
      // You can also delete the event from the database here
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEventTitle && selectedDate) {
      const calendarApi = selectedDate.view.calendar;
      calendarApi.unselect();

      const newEvent = {
        id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
        title: newEventTitle,
        start: selectedDate.start,
        end: selectedDate.end,
        allDay: selectedDate.allDay,
      };

      calendarApi.addEvent(newEvent);
      setCurrentEvents((prevEvents) => [...prevEvents, newEvent]);

      handleCloseDialog();
    }
  };

  return (
    <div className="flex w-full px-10 justify-start items-start gap-8">
      <div className="w-3/12">
        <div className="py-10 text-2xl font-extrabold px-7">
          Calendar Events
        </div>
        <ul className="space-y-4">
          {currentEvents.length <= 0 && (
            <div className="italic text-center text-gray-400">No Events Present</div>
          )}
          {currentEvents.length > 0 &&
            currentEvents.map((event) => (
              <li
                className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                key={event.id}
              >
                {event.title}
                <br />
                <label className="text-slate-950">
                  {formatDate(event.start, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </label>
              </li>
            ))}
        </ul>
      </div>

      <div className="w-9/12 mt-8">
        <FullCalendar
          height={"85vh"}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          events={currentEvents}
          eventAdd={handleEventAdd}
        />
      </div>

      {/* Dialog for adding new events */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <button className="bg-green-500 text-white p-3 mt-5 rounded-md" type="submit">
              Add Event
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
