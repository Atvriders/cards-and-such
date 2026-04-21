import type { ShedCard } from "./types.js";
import "./Hand.css";

interface Props<C extends ShedCard> {
  cards: C[];
  renderCard: (card: C) => React.ReactNode;
  faceDown?: boolean;
  selectedId?: string | null;
  onCardClick?: (cardId: string) => void;
  ariaLabel?: string;
}

export function Hand<C extends ShedCard>({
  cards, renderCard, faceDown, selectedId, onCardClick, ariaLabel,
}: Props<C>): JSX.Element {
  return (
    <div className="shed-hand" role="group" aria-label={ariaLabel ?? "hand"}>
      {cards.map((c, i) => (
        <div
          key={c.id}
          className={`shed-hand-card ${selectedId === c.id ? "selected" : ""}`}
          style={{ marginLeft: i === 0 ? 0 : "-28px", zIndex: i }}
          onClick={() => onCardClick?.(c.id)}
          data-testid={`hand-card-${c.id}`}
        >
          {faceDown ? <div className="shed-hand-back" /> : renderCard(c)}
        </div>
      ))}
    </div>
  );
}
