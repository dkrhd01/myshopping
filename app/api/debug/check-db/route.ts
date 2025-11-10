import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    // Check if users table exists
    const { error: usersTableError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    // Check if cart_items table exists
    const { error: cartItemsTableError } = await supabase
      .from("cart_items")
      .select("id")
      .limit(1);

    // Check if current user exists in DB
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    return NextResponse.json({
      usersTableExists: !usersTableError,
      cartItemsTableExists: !cartItemsTableError,
      currentUserExists: !!currentUser && !currentUserError,
      supabaseUserId: currentUser?.id || null,
      errors: {
        usersTable: usersTableError?.message || null,
        cartItemsTable: cartItemsTableError?.message || null,
        currentUser: currentUserError?.message || null,
      },
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

