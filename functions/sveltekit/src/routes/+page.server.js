export function load() {
  return {
    renderedAt: new Date().toISOString(),
    // Not awaited: SvelteKit sends the page right away and streams this value in when it resolves.
    slow: new Promise((resolve) =>
      setTimeout(() => resolve({ resolvedAt: new Date().toISOString() }), 2000),
    ),
  };
}
