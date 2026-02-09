import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/*
 * @param request - The incoming NextRequest object
 * @returns A NextResponse containing messages or an error message
 *
 * Handles GET requests for channels
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: `Failed to authenticate` },
        { status: 401 },
      );
    }
    const res = new URL(req.url);

    const serverId = res.searchParams.get("serverId");

    if (!serverId) {
      return NextResponse.json({ error: `Missing serverId` }, { status: 400 });
    }

    const channels = await prisma.channel.findMany({
      where: { serverId },
      orderBy: { name: "desc" },
    });
    return NextResponse.json(channels, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
