import { useRef } from "react";
import type { Card as CardType } from "./index.js";
import { isRed, rankLabel } from "./index.js";
import "./Card.css";

interface Props {
  card?: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;
  /** Inline style — used for per-card CSS vars (e.g. `--card-stagger-delay`). */
  style?: React.CSSProperties;
}

/** Threshold for treating a pointer down/up pair as a click rather than a drag. */
const CLICK_PIXEL_TOLERANCE = 6;
const CLICK_TIME_TOLERANCE_MS = 500;

export function Card({ card, faceDown, onClick, draggable, onDragStart, onDragEnd, className = "", style }: Props): JSX.Element {
  const downRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent): void => {
    downRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  const handlePointerUp = (e: React.PointerEvent): void => {
    const start = downRef.current;
    downRef.current = null;
    if (!start || !onClick) return;
    const dx = Math.abs(e.clientX - start.x);
    const dy = Math.abs(e.clientY - start.y);
    const dt = performance.now() - start.t;
    if (dx < CLICK_PIXEL_TOLERANCE && dy < CLICK_PIXEL_TOLERANCE && dt < CLICK_TIME_TOLERANCE_MS) {
      onClick();
    }
  };

  const handlePointerCancel = (): void => {
    downRef.current = null;
  };

  if (faceDown || !card) {
    // Face-down is not draggable, so the browser's click is reliable. Keep onClick.
    return <div className={`card face-down ${className}`} onClick={onClick} aria-label="face-down card" style={style} />;
  }

  const color = isRed(card.suit) ? "red" : "black";
  // For face-up cards we use pointer events for click detection so draggable doesn't swallow clicks.
  return (
    <div
      className={`card face-up ${color} ${className}`}
      style={style}
      {...(onClick
        ? {
            onPointerDown: handlePointerDown,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerCancel,
          }
        : {})}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
    >
      <div className="corner top-left">
        <div className="rank">{rankLabel(card.rank)}</div>
        <div className="suit">{card.suit}</div>
      </div>
      <div className="center-suit">{card.suit}</div>
      <div className="corner bottom-right">
        <div className="rank">{rankLabel(card.rank)}</div>
        <div className="suit">{card.suit}</div>
      </div>
    </div>
  );
}
