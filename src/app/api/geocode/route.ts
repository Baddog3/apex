import { NextResponse } from "next/server";

import {
  normalizeGeocodeQuery,
  searchCities,
  validateGeocodeQuery,
} from "@/lib/geocoding";
import { t } from "@/lib/i18n";

interface GeocodeRequestBody {
  query?: string;
}

export async function POST(request: Request) {
  const strings = t();

  let body: GeocodeRequestBody;
  try {
    body = (await request.json()) as GeocodeRequestBody;
  } catch {
    return NextResponse.json(
      { error: strings.geocoding.invalidRequest },
      { status: 400 },
    );
  }

  const query = normalizeGeocodeQuery(body.query ?? "");
  const validationError = validateGeocodeQuery(query);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const results = await searchCities(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: strings.geocoding.searchFailed },
      { status: 502 },
    );
  }
}
