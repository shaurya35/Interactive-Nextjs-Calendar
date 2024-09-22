import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email, password } = await request.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ error: "User not found!" }, { status: 401 });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json({ error: "Invalid password!" }, { status: 401 });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return NextResponse.json({ token, userId: user.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something is up with our server!" },
      { status: 500 }
    );
  }
}
