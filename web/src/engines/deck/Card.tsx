import type { Card as CardType } from "./index.js";
import { isRed, rankLabel } from "./index.js";
import "./Card.css";

interface Props {
  card?: CardType;
  faceDown?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
}

export function Card({ card, faceDown, onClick, draggable, onDragStart, className = "" }: Props): JSX.Element {
  if (faceDown || !card) {
    return <div className={`card face-down ${className}`} onClick={onClick} aria-label="face-down card" />;
  }
  const color = isRed(card.suit) ? "red" : "black";
  return (
    <div
      className={`card face-up ${color} ${className}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
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
