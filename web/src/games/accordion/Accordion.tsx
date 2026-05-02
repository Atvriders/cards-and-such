import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AccordionState, AccordionAction } from "./state.js";
import { legalMoves } from "./state.js";
import type { accordionSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import { Card } from "../../engines/deck/Card.js";
import "./Accordion.css";

type AccordionSettings = SettingsOf<typeof accordionSettings>;

export function Accordion({
  state,
  dispatch,
  onGameOver,
}: GameProps<AccordionState, AccordionSettings>): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null);

  if (state.won) onGameOver(state.score);

  const legal = legalMoves(state.piles, state.settings.allowJump3);
  const legalFromSelected = selected !== null
    ? new Set(legal.filter((m) => m.from === selected).map((m) => m.to))
    : new Set<number>();
  const anyLegalFrom = new Set(legal.map((m) => m.from));

  const handlePileClick = useCallback(
    (idx: number) => {
      if (selected === null) {
        if (anyLegalFrom.has(idx)) setSelected(idx);
      } else {
        if (legalFromSelected.has(idx)) {
          dispatch({ type: "move", fromIndex: selected, toIndex: idx } as AccordionAction);
          setSelected(null);
        } else if (idx === selected) {
          setSelected(null);
        } else if (anyLegalFrom.has(idx)) {
          setSelected(idx);
        } else {
          setSelected(null);
        }
      }
    },
    [selected, anyLegalFrom, legalFromSelected, dispatch],
  );

  return (
    <div className="accordion">
      <div className="accordion-info">
        <span>Piles: {state.piles.length}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>
      <div className="accordion-row">
        {state.piles.map((pile, i) => {
          const topCard = pile[pile.length - 1]!;
          const isSelected = selected === i;
          const isTarget = legalFromSelected.has(i);
          return (
            <div
              key={i}
              className={`accordion-pile${isSelected ? " selected" : ""}${isTarget ? " legal-target" : ""}`}
              data-testid={`hint-target-accordion-${i}`}
              onClick={() => handlePileClick(i)}
            >
              <Card card={topCard} faceDown={false} />
              {pile.length > 1 && (
                <div className="accordion-pile-count">×{pile.length}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
