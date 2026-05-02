import "./Badge.css";

/**
 * Tile-decoration badge variants. Each maps to a coloured pill used in
 * the lobby (and elsewhere) to advertise game metadata at a glance.
 *  - new         : added recently — mint
 *  - popular     : highly rated   — amber
 *  - quick       : short play     — cyan
 *  - challenging : high difficulty — violet
 *  - editors-pick: hand-picked    — gradient (uses popular/amber base)
 */
export type BadgeKind =
  | "new"
  | "popular"
  | "quick"
  | "challenging"
  | "editors-pick";

const LABELS: Record<BadgeKind, string> = {
  "new": "NEW",
  "popular": "POPULAR",
  "quick": "QUICK",
  "challenging": "CHALLENGING",
  "editors-pick": "EDITOR'S PICK",
};

/**
 * Compact rounded-pill badge. Renders as a span so it can sit inline
 * inside a tile header, or absolutely-positioned (top-right of a tile)
 * when the consumer applies a wrapping class.
 */
export function Badge({
  kind,
  label,
  testId,
}: {
  kind: BadgeKind;
  label?: string;
  testId?: string;
}): JSX.Element {
  return (
    <span
      className={`badge badge--${kind}`}
      data-testid={testId}
      aria-label={label ?? LABELS[kind]}
    >
      {label ?? LABELS[kind]}
    </span>
  );
}
