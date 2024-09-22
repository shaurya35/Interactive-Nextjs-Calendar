import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email, password, name } = await request.json();
  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return NextResponse.json(
      { message: "User created!", user, token, userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Something is up with our server!", error },
      { status: 400 }
    );
  }
}
