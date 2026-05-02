import "./Skeleton.css";

export type SkeletonVariant = "rect" | "circle" | "text-line";

interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Width — number is treated as px, string passed through. */
  width?: number | string;
  /** Height — number is treated as px, string passed through. */
  height?: number | string;
  className?: string;
  /** Optional aria-label override; defaults to "Loading". */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/**
 * Base shimmer skeleton component.
 *
 * Variants:
 *   - rect:      rounded rectangle block (default sizing inherited from parent).
 *   - circle:    a circular blob — useful for avatars / icon placeholders.
 *   - text-line: a thin pill that mimics a line of body text.
 *
 * Animation is a 1.5s infinite shimmer driven by a moving gradient. When the
 * user has `prefers-reduced-motion: reduce` enabled, the animation is
 * disabled and the placeholder renders as a static muted block — see the
 * matching CSS for the media query.
 */
export function Skeleton({
  variant = "rect",
  width,
  height,
  className,
  ariaLabel = "Loading",
  style,
}: SkeletonProps): JSX.Element {
  const dim = (v: number | string | undefined): string | undefined => {
    if (v == null) return undefined;
    return typeof v === "number" ? `${v}px` : v;
  };
  const composedStyle: React.CSSProperties = {
    width: dim(width),
    height: dim(height),
    ...style,
  };
  const cls = ["skeleton", `skeleton--${variant}`, className].filter(Boolean).join(" ");
  return (
    <span
      className={cls}
      style={composedStyle}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      data-testid="skeleton"
    />
  );
}

export default Skeleton;
