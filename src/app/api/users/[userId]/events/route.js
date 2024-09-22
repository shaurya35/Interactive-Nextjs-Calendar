import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils"; 

export async function GET(req, { params }) {
  const { userId } = params;
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

export async function POST(req, { params }) {
  const { userId } = params;
  const token = req.headers.get("authorization")?.split(" ")[1];

  // Token verification
  if (!token || !verifyToken(token, userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title,description, startDate, endDate } = await req.json();

    // Validate incoming data
    if (!title ||!description || !startDate || !endDate) {
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
        description,
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

