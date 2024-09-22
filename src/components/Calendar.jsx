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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/users/';

const Calendar = ({ userId }) => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${userId}/events`);
      const data = await res.json();
      const events = data.events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        description: event.description,
      }));
      setCurrentEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const handleDateClick = (selected) => {
    setSelectedDate(selected);
    setIsDialogOpen(true);
  };

  const handleEventClick = async (selected) => {
    const eventId = selected.event.id;
    if (
      window.confirm(
        `Are you sure you want to delete the event "${selected.event.title}"?`
      )
    ) {
      try {
        await fetch(`${API_BASE_URL}${userId}/events/${eventId}`, {
          method: "DELETE",
        });
        await fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewEventTitle("");
    setNewEventDescription("");
    setStartTime("");
    setEndTime("");
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (newEventTitle && newEventDescription && selectedDate) {
      const startDateTime = new Date(selectedDate.start);
      const endDateTime = new Date(selectedDate.start);
      const [startHour, startMinute] = startTime.split(":");
      const [endHour, endMinute] = endTime.split(":");

      startDateTime.setHours(startHour, startMinute);
      endDateTime.setHours(endHour, endMinute);

      const newEvent = {
        title: newEventTitle,
        description: newEventDescription,
        startDate: startDateTime,
        endDate: endDateTime,
      };

      try {
        const res = await fetch(`${API_BASE_URL}${userId}/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        });
        if (res.ok) {
          await fetchEvents();
          handleCloseDialog();
        }
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  const handleEventChange = async (changeInfo) => {
    const event = changeInfo.event;
    const updatedEvent = {
      title: event.title,
      startDate: event.start,
      endDate: event.end,
      description: event.extendedProps.description,
    };

    try {
      await fetch(`${API_BASE_URL}${userId}/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        <div className="w-3/12">
          <div className="py-10 text-2xl font-extrabold px-7">
            Calendar Events
          </div>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            <ul className="space-y-4">
              {currentEvents.length <= 0 && (
                <div className="italic text-center text-gray-400">
                  No Events Present
                </div>
              )}
              {currentEvents.map((event) => (
                <li
                  className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                  key={event.id}
                >
                  {event.title}
                  <br />
                  <label className="text-slate-950">
                    {new Date(event.start).toLocaleString()}
                  </label>
                </li>
              ))}
            </ul>
          )}
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
            eventChange={handleEventChange}
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event Details</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col" onSubmit={handleAddEvent}>
            <input
              type="text"
              placeholder="Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <input
              type="text"
              placeholder="Description"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <input
              type="time"
              placeholder="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <input
              type="time"
              placeholder="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="border border-gray-200 p-3 rounded-md text-lg"
            />
            <button
              className="bg-green-500 text-white p-3 mt-5 rounded-md"
              type="submit"
            >
              Add
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;