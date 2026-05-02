import { useEffect, useRef, useState } from "react";
import type { Pile as PileType } from "./types.js";
import { Card } from "../deck/Card.js";
import { playSound } from "../../platform/sounds.js";
import "./Pile.css";

interface Props {
  pile: PileType;
  onCardDragStart?: (pileId: string, indexFromTop: number) => (e: React.DragEvent) => void;
  onCardDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (pileId: string) => (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (pileId: string) => (e: React.DragEvent) => void;
  onDragLeave?: (pileId: string) => (e: React.DragEvent) => void;
  onTopClick?: () => void;
  onCardClick?: (pileId: string, indexFromTop: number) => void;
  /** Extra className to merge in (e.g. "drag-over valid"). */
  className?: string;
  /** Allow keyboard activation (Enter/Space) on the pile itself. */
  onKeyActivate?: () => void;
  isSelected?: boolean;
}

export function Pile({
  pile,
  onCardDragStart,
  onCardDragEnd,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onTopClick,
  onCardClick,
  className = "",
  onKeyActivate,
  isSelected,
}: Props): JSX.Element {
  const faceUpCount = pile.faceUpCount ?? (pile.kind === "tableau" ? 0 : pile.cards.length);

  // Track which card IDs were face-down on the previous render so we can apply
  // a one-shot reveal flip when a tableau cascade auto-exposes a card.
  const prevFaceDownIds = useRef<Set<string>>(new Set());
  const prevWasteTopId = useRef<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [pickupId, setPickupId] = useState<string | null>(null);

  // First-render flag: only emit the deal-in animation + card-deal sound on
  // the initial mount of this pile so subsequent re-renders (drag, drop,
  // shuffle) don't keep restarting the animation.
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (!isFirstRenderRef.current) return;
    isFirstRenderRef.current = false;
    if (pile.cards.length > 0) {
      playSound("card-deal");
    }
    // We intentionally only run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Compute newly-revealed cards (were face-down last render, now face-up).
    const nextFaceDown = new Set<string>();
    const newlyRevealed: string[] = [];
    pile.cards.forEach((card, i) => {
      const isFaceUp = pile.kind !== "tableau" || i >= pile.cards.length - faceUpCount;
      if (!isFaceUp) {
        nextFaceDown.add(card.id);
      } else if (prevFaceDownIds.current.has(card.id)) {
        newlyRevealed.push(card.id);
      }
    });
    prevFaceDownIds.current = nextFaceDown;

    if (newlyRevealed.length > 0) {
      // Light snap on each face-up reveal — one tone per cascade burst so a
      // big chain doesn't sound like a machine gun.
      playSound("card-flip");
      setRevealedIds((prev) => {
        const next = new Set(prev);
        for (const id of newlyRevealed) next.add(id);
        return next;
      });
      // Clear after the animation has run so subsequent drag-shifts aren't
      // affected by transform overrides.
      const t = window.setTimeout(() => {
        setRevealedIds((prev) => {
          if (prev.size === 0) return prev;
          const next = new Set(prev);
          for (const id of newlyRevealed) next.delete(id);
          return next;
        });
      }, 240);
      return () => window.clearTimeout(t);
    }
    return;
  }, [pile.cards, pile.kind, faceUpCount]);

  // Auto-flip-on-pickup: when the waste pile reveals a new top card (after a
  // stock draw), play a quick flip-in animation.
  useEffect(() => {
    if (pile.kind !== "waste") return;
    const top = pile.cards[pile.cards.length - 1];
    const topId = top?.id ?? null;
    if (topId && topId !== prevWasteTopId.current) {
      setPickupId(topId);
      const t = window.setTimeout(() => {
        setPickupId((cur) => (cur === topId ? null : cur));
      }, 260);
      prevWasteTopId.current = topId;
      return () => window.clearTimeout(t);
    }
    prevWasteTopId.current = topId;
    return;
  }, [pile.cards, pile.kind]);

  const fullClass = [
    "pile",
    `pile-${pile.kind}`,
    isSelected ? "is-selected" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const keyHandler = onKeyActivate
    ? (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onKeyActivate();
        }
      }
    : undefined;

  return (
    <div
      className={fullClass}
      data-testid={`pile-${pile.id}`}
      onDragOver={onDragOver}
      onDrop={onDrop?.(pile.id)}
      {...(onDragEnter ? { onDragEnter: onDragEnter(pile.id) } : {})}
      {...(onDragLeave ? { onDragLeave: onDragLeave(pile.id) } : {})}
      {...(onKeyActivate
        ? { tabIndex: 0, role: "button", onKeyDown: keyHandler }
        : {})}
    >
      {pile.cards.length === 0 && <div className="pile-empty" />}
      {pile.cards.map((card, i) => {
        const indexFromTop = pile.cards.length - 1 - i;
        const isFaceUp = pile.kind !== "tableau" || i >= pile.cards.length - faceUpCount;
        const isTop = i === pile.cards.length - 1;
        // Only apply deal-in on the very first render of the pile so cards
        // don't keep re-animating on drag / drop / reveal re-renders.
        const isInitialDeal = isFirstRenderRef.current;
        const cardClasses = [
          isFaceUp && onCardClick ? "clickable" : "",
          revealedIds.has(card.id) ? "card-reveal" : "",
          pickupId === card.id ? "flip-pickup" : "",
          isInitialDeal ? "deal-in" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const cardStyle = isInitialDeal
          ? ({ "--card-stagger-delay": `${i * 30}ms` } as React.CSSProperties)
          : undefined;
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
              {...(onCardDragEnd ? { onDragEnd: onCardDragEnd } : {})}
              {...(isFaceUp && onCardClick
                ? { onClick: () => onCardClick(pile.id, indexFromTop) }
                : isTop && onTopClick
                  ? { onClick: onTopClick }
                  : {})}
              className={cardClasses}
              {...(cardStyle ? { style: cardStyle } : {})}
            />
          </div>
        );
      })}
    </div>
  );
}
