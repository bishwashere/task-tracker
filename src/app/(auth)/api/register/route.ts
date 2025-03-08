import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, res: NextResponse) {

  try {
    const { name, email, password } = await req.json();

    console.log(name, email, password);
    if (!name || !email || !password) {
      return NextResponse.json('All fields are required !', {status: 400,});
    }

    const existingUser = await prisma.user.findUnique({where: {email: String(email)}});
    if (existingUser) {
      return NextResponse.json('User already exists.', {status: 400,});
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    })
    return NextResponse.json('Registration Successfull !', {status: 200,})

  } catch (error) {
    console.log(error);
    return NextResponse.json('Internal Server Error', {status: 500,});
  }
}