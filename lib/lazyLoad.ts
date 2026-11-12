import { ComponentType, lazy } from 'react';

// Parts that are only needed after a tap (a mini game, the cookbook, What's
// New …) are separate downloads, so both apps start faster. After a new
// deploy the old file names are gone, so a page that was open before the
// deploy can't fetch them anymore: then it reloads once and gets the new build.
const RELOADED = 'rm-chunk-reload';

export function reloadForNewBuild(): void {
  try {
    const last = Number(sessionStorage.getItem(RELOADED) || 0);
    if (Date.now() - last < 60_000) return; // just reloaded: don't loop
    sessionStorage.setItem(RELOADED, String(Date.now()));
  } catch {
    return;
  }
  location.reload();
}

/** React.lazy for a named export: `lazyLoad(() => import('./X').then((m) => m.X))`. */
export function lazyLoad<P extends object>(load: () => Promise<ComponentType<P>>) {
  return lazy(() =>
    load().then(
      (component) => ({ default: component }),
      (err) => {
        reloadForNewBuild();
        throw err;
      }
    )
  );
}

/** A plain module loaded later; reloads once when its file is gone after a deploy. */
export function loadLater<T>(load: () => Promise<T>): Promise<T> {
  return load().catch((err) => {
    reloadForNewBuild();
    throw err;
  });
}
