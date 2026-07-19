type Coordinate = { lng: number; lat: number };

export function buildTransportRequestBody(origin: Coordinate, destination: Coordinate, city: string) {
  return {
    origin: { lng: origin.lng, lat: origin.lat },
    destination: { lng: destination.lng, lat: destination.lat },
    city: city.trim(),
  };
}
