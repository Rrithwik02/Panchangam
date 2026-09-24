import { getApiConfig } from "@/lib/api-access/config";
import { buildOpenApi } from "@/lib/api-access/docs";

export async function GET() {
  return Response.json(buildOpenApi(getApiConfig()));
}
