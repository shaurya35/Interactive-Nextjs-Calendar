// src/app/api/events/[userId]/route.js

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils"; // You need a function to verify the token

// GET route to fetch all events for a specific user
export async function GET(req, { params }) {
  const { userId } = params;

  try {
    const events = await prisma.event.findMany({
      where: { userId: parseInt(userId) },
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST route to add an event for the user
export async function POST(req, { params }) {
  const { userId } = params;
  const token = req.headers.get("authorization")?.split(" ")[1];

  // Token verification
  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, startDate, endDate } = await req.json();

    // Validate incoming data
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields (title, startDate, endDate)" },
        { status: 400 }
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Create new event
    const event = await prisma.event.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: parseInt(userId),
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT route to update an existing event for the user
export async function PUT(req, { params }) {
  const { userId, eventId } = params; // Expect eventId in the URL
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, startDate, endDate } = await req.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields (title, startDate, endDate)" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE route to delete an event for the user
export async function DELETE(req, { params }) {
  const { userId, eventId } = params;
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.event.delete({
      where: { id: parseInt(eventId) },
    });
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

