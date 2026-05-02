import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { Card as CardView } from "../../engines/deck/Card.js";
import type { AccordionSolitaireState, AccordionSolitaireAction, AccordionSolitaireSettings } from "./state.js";
import "./Game.css";

export function AccordionSolitaireGame(
  { state, dispatch, onGameOver }: GameProps<AccordionSolitaireState, AccordionSolitaireSettings>,
): JSX.Element {
  const [sel, setSel] = useState<number | null>(null);
  if (state.won) onGameOver(state.score);
  const live = state.cards.filter((c) => c !== null);
  const click = useCallback((idx: number) => {
    if (sel === null) {
      setSel(idx);
      return;
    }
    if (sel === idx) {
      setSel(null);
      return;
    }
    dispatch({ type: "collapse", from: sel, to: idx } as AccordionSolitaireAction);
    setSel(null);
  }, [sel, dispatch]);
  return (
    <div className="accordion-solitaire-root">
      <div className="accordion-solitaire-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Cards: {live.length}</span>
      </div>
      <div className="accordion-solitaire-row">
        {live.map((card, i) => (
          <div
            key={i}
            className={"accordion-solitaire-cell" + (sel === i ? " selected" : "")}
            data-testid={`hint-target-accordion-solitaire-${i}`}
            onClick={() => click(i)}
          >
            <CardView card={card!} />
          </div>
        ))}
      </div>
    </div>
  );
}
