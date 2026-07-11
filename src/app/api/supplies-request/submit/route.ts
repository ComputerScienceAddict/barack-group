import { NextResponse } from "next/server";
import { sendSuppliesRequestEmail } from "@/lib/supplies-request/sendSuppliesRequestEmail";

export const runtime = "nodejs";

type SubmitBody = {
  name?: string;
  location?: string;
  supplies?: string[];
};

function normalizeSupplies(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value ?? "").trim()).filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;
    const name = String(body.name ?? "").trim();
    const location = String(body.location ?? "").trim();
    const supplies = normalizeSupplies(body.supplies);

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({ error: "Location is required." }, { status: 400 });
    }

    if (supplies.length === 0) {
      return NextResponse.json({ error: "Add at least one supply." }, { status: 400 });
    }

    await sendSuppliesRequestEmail({ name, location, supplies });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Supplies request email failed:", error);
    const message = error instanceof Error ? error.message : "Could not send supplies request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
