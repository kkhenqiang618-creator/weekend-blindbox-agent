export type RouteReviewSession = {
  routeId: string;
  startedAt: number;
  viewedPoiIds: Set<string>;
  interacted: boolean;
  confirmed: boolean;
};

export function createRouteReviewSession(poiIds: string[], startedAt = Date.now()): RouteReviewSession {
  return {
    routeId: poiIds.filter(Boolean).join('|') || 'empty-route',
    startedAt,
    viewedPoiIds: new Set(),
    interacted: false,
    confirmed: false,
  };
}

export function recordPoiView(session: RouteReviewSession, poiId: string): { session: RouteReviewSession; shouldTrack: boolean } {
  if (session.viewedPoiIds.has(poiId)) return { session, shouldTrack: false };
  return {
    session: {
      ...session,
      interacted: true,
      viewedPoiIds: new Set([...session.viewedPoiIds, poiId]),
    },
    shouldTrack: true,
  };
}

export function recordRouteInteraction(session: RouteReviewSession): RouteReviewSession {
  return { ...session, interacted: true };
}

export function confirmRouteReview(session: RouteReviewSession): RouteReviewSession {
  return { ...session, interacted: true, confirmed: true };
}

export function shouldTrackRouteAbandoned(session: RouteReviewSession): boolean {
  return !session.interacted && !session.confirmed;
}
