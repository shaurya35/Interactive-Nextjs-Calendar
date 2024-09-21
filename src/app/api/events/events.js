import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1]; // Bearer token
  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = decodedToken.userId; // Get userId from the decoded token

  const events = await prisma.event.findMany({
    where: { userId },
  });

  return NextResponse.json(events);
}

export async function POST(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, startDate, endDate } = await request.json();
  const userId = decodedToken.userId;

  const event = await prisma.event.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userId,
    },
  });

  return NextResponse.json(event, { status: 201 });
}

export async function PUT(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, description, startDate, endDate } = await request.json();

  const event = await prisma.event.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  await prisma.event.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ message: "Event deleted" });
}
