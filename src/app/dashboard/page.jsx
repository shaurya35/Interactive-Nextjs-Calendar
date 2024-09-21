"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // Fetch events for the logged-in user
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setEvents(data.events);
    };
    fetchEvents();
  }, []);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    // Filter events for the selected date
    const event = events.find(
      (e) => new Date(e.startDate).toDateString() === selectedDate.toDateString()
    );
    setSelectedEvent(event || null);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Your Calendar</h1>
      <Calendar onChange={handleDateChange} value={date} />
      {selectedEvent ? (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Event Details</h2>
          <p><strong>Title:</strong> {selectedEvent.title}</p>
          <p><strong>Description:</strong> {selectedEvent.description}</p>
          <p><strong>Start:</strong> {new Date(selectedEvent.startDate).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(selectedEvent.endDate).toLocaleString()}</p>
          <button className="bg-red-500 text-white px-4 py-2 rounded mt-4">
            Delete Event
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <h2>No events for this date</h2>
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-4">
            Add New Event
          </button>
        </div>
      )}
    </div>
  );
}
