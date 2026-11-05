import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/activity";

/**
 * Anonymised recent orders for the storefront popup.
 *
 * Cached at the edge: identical for every visitor, and the sheet should not be
 * read once per page view. Two minutes keeps "ordered 20 minutes ago" honest
 * without hammering the Google API.
 */
export async function GET() {
  try {
    return NextResponse.json(
      { items: await getRecentActivity() },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch (err) {
    console.error("Could not build the activity feed:", err);
    // An empty feed hides the popup, which beats showing an error to a shopper.
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
