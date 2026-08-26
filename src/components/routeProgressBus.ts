/**
 * A one-line pub/sub so programmatic navigations can raise the loading
 * indicator too.
 *
 * RouteProgress catches link clicks, which covers every anchor on the site. It
 * cannot see `router.push()` — the command palette navigates that way, and
 * without this those jumps would show no feedback at all.
 *
 * Deliberately not React context: the emitter is called from event handlers and
 * effects that are not always inside the provider tree, and a module-level Set
 * is both smaller and easier to reason about than threading a context through.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

/** Raise the indicator. Safe to call during SSR — it simply does nothing. */
export function startRouteProgress() {
  for (const listener of listeners) listener();
}

/** Subscribe. Returns the unsubscribe function. */
export function onRouteProgressStart(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
