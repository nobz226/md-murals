import { query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Admin access is a single shared password stored as a Convex environment
// variable. Set it with: npx convex env set ADMIN_PASSWORD "<password>"
// Every mutation that changes content takes an `adminKey` argument and calls
// assertAdmin() before doing anything.

// Convex provides process.env at runtime; declared here since @types/node isn't installed
declare const process: { env: Record<string, string | undefined> };

export const adminKeyArg = { adminKey: v.string() };

function isValidKey(key: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new ConvexError(
      "ADMIN_PASSWORD is not configured. Run: npx convex env set ADMIN_PASSWORD <password>"
    );
  }
  // Constant-time comparison so response timing doesn't leak the password
  if (key.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) {
    diff |= key.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function assertAdmin(key: string) {
  if (!isValidKey(key)) {
    throw new ConvexError("Unauthorized");
  }
}

// Used by the admin login screen to verify a password
export const checkAdminKey = query({
  args: adminKeyArg,
  handler: async (_ctx, args) => {
    return isValidKey(args.adminKey);
  },
});
