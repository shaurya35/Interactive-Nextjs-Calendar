import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils";

export async function GET(req, { params }) {
  const { userId, eventId } = params;
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT route to update an existing event for the user
export async function PUT(req, { params }) {
  const { userId, eventId } = params;
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, startDate, endDate } = await req.json();

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields (title, startDate, endDate)" },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        title,
        description,
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
