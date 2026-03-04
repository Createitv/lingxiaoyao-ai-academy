import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const docs = await prisma.doc.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: {
      slug: true,
      title: true,
      description: true,
      category: true,
      sortOrder: true,
    },
  });

  return NextResponse.json({ success: true, data: docs });
}
