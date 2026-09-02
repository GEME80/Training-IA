import { NextRequest, NextResponse } from "next/server";
import { GET as geminiModelsGet } from "../gemini/models/route";

export async function GET(req: NextRequest) {
  return geminiModelsGet(req);
}
