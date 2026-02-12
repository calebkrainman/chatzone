import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const PostSchema = z.object({
  content: z.string().min(1, "Content cannot be empty"),
  channelId: z.string().min(1, "Channel ID is required"),
});
/**
 *
 * @param request - The incoming NextRequest object
 * @returns A NextResponse containing messages or an error message
 *
 * Handles GET and POST requests for messages
 * For GET requests, it fetches messages for a specified channelId
 * For POST requests, it creates a new message in the specified channel
 * Validates input and handles authentication
 * Returns appropriate HTTP status codes and error messages
 * @throws Will return a 401 status if authentication fails, 400 for bad requests, and 200 or 201 for successful operations
 * @throws Will throw an error if the message fetching or creation fails
 * @throws Will throw an error if required fields are missing
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: `Failed to authenticate` },
      { status: 401 },
    );
  }
  const channelId = request.nextUrl.searchParams.get("channelId");
  if (!channelId) {
    return NextResponse.json({ error: `Missing ChannelID` }, { status: 401 });
  }

  try {
    const messages = await prisma.post.findMany({
      where: { channelId },
      orderBy: { postedDate: "asc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? `An error has occured: ${error}`
        : `An unknown error has occured!`;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 *
 * @param request - The incoming NextRequest object
 * Handles POST requests to create a new message
 * @returns A NextResponse containing the new message or an error message
 * Authenticates the user session and validates the request body
 * Creates a new message in the database if validation passes
 * Catches and handles any errors that occur during the process
 * @throws Will return a 401 status if authentication fails, 400 for bad requests, and 201 for successful creation
 * @throws Will throw an error if the message creation fails
 * @throws Will throw an error if required fields are missing
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: `Failed to authenticate` },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parseResult = PostSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: `Missing Fields ${parseResult.error}` },
      { status: 400 },
    );
  }

  const profanityCheck = await fetch("https://vector.profanity.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `${parseResult.data.content} filler` }),
  });

  try {
    if (!profanityCheck.ok) {
      throw new Error(`Failed to check message for profanity`);
    }

    const profanityResult = await profanityCheck.json();

    if (profanityResult.isProfanity === false) {
      const newMessage = await prisma.post.create({
        data: {
          content: `${parseResult.data.content}`,
          channelId: `${parseResult.data.channelId}`,
          authorId: `${session.user.id}`,
          authorName: `${session.user.name}` || `Anonymous User`,
        },
      });

      return NextResponse.json(newMessage, { status: 201 });
    } else {
      throw new Error("Message contains profanity and cannot be posted.");
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `An unknown error has occured!`;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
