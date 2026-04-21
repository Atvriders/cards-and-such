import type { Pile as PileType } from "./types.js";
import { Card } from "../deck/Card.js";
import "./Pile.css";

interface Props {
  pile: PileType;
  onCardDragStart?: (pileId: string, indexFromTop: number) => (e: React.DragEvent) => void;
  onDrop?: (pileId: string) => (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onTopClick?: () => void;
}

export function Pile({ pile, onCardDragStart, onDrop, onDragOver, onTopClick }: Props): JSX.Element {
  const faceUpCount = pile.faceUpCount ?? (pile.kind === "tableau" ? 0 : pile.cards.length);

  return (
    <div
      className={`pile pile-${pile.kind}`}
      data-testid={`pile-${pile.id}`}
      onDragOver={onDragOver}
      onDrop={onDrop?.(pile.id)}
    >
      {pile.cards.length === 0 && <div className="pile-empty" />}
      {pile.cards.map((card, i) => {
        const indexFromTop = pile.cards.length - 1 - i;
        const isFaceUp = pile.kind !== "tableau" || i >= pile.cards.length - faceUpCount;
        const isTop = i === pile.cards.length - 1;
        return (
          <div
            className={pile.kind === "tableau" ? "pile-card fanned" : "pile-card stacked"}
            style={pile.kind === "tableau" ? { top: `${i * 22}px` } : undefined}
            key={card.id}
          >
            <Card
              card={card}
              faceDown={!isFaceUp}
              draggable={isFaceUp && !!onCardDragStart}
              {...(onCardDragStart ? { onDragStart: onCardDragStart(pile.id, indexFromTop) } : {})}
              {...(isTop && onTopClick ? { onClick: onTopClick } : {})}
            />
          </div>
        );
      })}
    </div>
  );
}
