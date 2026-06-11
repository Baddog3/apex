export interface GeocodeResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  timezone: string;
  subtitle?: string;
}

export interface GeocodeSearchResponse {
  results: GeocodeResult[];
}
