import type { PaidProduct } from "@/lib/billing/provider";

/** Reads { plan: "pro" | "api" } from a JSON body; defaults to "pro". */
export async function readRequestedProduct(request: Request): Promise<{
  product: PaidProduct;
  body: Record<string, unknown> | null;
}> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  return { product: body?.plan === "api" ? "api" : "pro", body };
}
