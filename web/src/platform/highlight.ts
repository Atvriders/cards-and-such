import type React from "react";
import { Fragment, createElement } from "react";

/**
 * Render `text` with the first occurrence of `q` wrapped in a `<mark>`.
 * Case-insensitive; returns the plain string when there's no match or
 * when `q` is empty / whitespace.
 *
 * Shared by SearchPage (full-page search results) and LobbyPage (tile
 * titles when the lobby search input has an active query) so both call
 * sites surface match locations identically.
 */
export function highlightMatch(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const needle = q.toLowerCase();
  if (!needle) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx < 0) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + needle.length);
  const after = text.slice(idx + needle.length);
  return createElement(
    Fragment,
    null,
    before,
    createElement("mark", null, match),
    after,
  );
}
