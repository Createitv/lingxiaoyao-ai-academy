import { Prisma } from "@prisma/client";

function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1001" || error.code === "P1002";
  }

  if (error instanceof Error) {
    return /can't reach database server|econnrefused|timeout|p1001|p1002/i.test(
      error.message,
    );
  }

  return false;
}

export async function withDatabaseFallback<T>(
  query: () => Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[db:fallback] ${context}: ${message}`);
    return fallback;
  }
}
