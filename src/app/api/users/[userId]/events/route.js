import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils"; 

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

export async function POST(req, { params }) {
  const { userId } = params;
  try {
    const { title,description, startDate, endDate } = await req.json();
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

