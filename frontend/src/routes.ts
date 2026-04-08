/**
 * Canonical URL paths. Use with `Route` `path`, `Link` `to`, `navigate()`, etc.
 * (TypeScript `enum` is avoided here because `erasableSyntaxOnly` is enabled.)
 */
export const AppRoute = {
  Root: "/",
  Login: "/login",
  Customers: "/customers",
  Vehicles: "/vehicles",
  Bookings: "/bookings",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

/** Nested `<Route path>` under `AppRoute.Root` layout (no leading slash). */
export function appRouteLayoutSegment(route: AppRoute): string {
  if (route === AppRoute.Root || route === AppRoute.Login) {
    throw new Error(`No layout segment for ${route}`);
  }
  return route.slice(1);
}
