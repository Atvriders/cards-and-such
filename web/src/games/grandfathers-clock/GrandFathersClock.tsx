import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GrandfathersClockState, GrandfathersClockAction, GrandfathersClockSettings } from "./state.js";
import { canBuildClock, clockTableauCanStack, CLOCK_IDS, TABLEAU_IDS } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import "./GrandFathersClock.css";

export function GrandFathersClock({
  state,
  dispatch,
  onGameOver,
}: GameProps<GrandfathersClockState, GrandfathersClockSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, _count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to } as GrandfathersClockAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile || pile.cards.length === 0) return;
      const card = pile.cards[pile.cards.length - 1]!;
      // Try foundations first
      for (const cid of CLOCK_IDS) {
        const fp = state.piles.find((p) => p.id === cid)!;
        if (canBuildClock(fp, card)) {
          dispatch({ type: "move", fromPile: pileId, toPile: cid } as GrandfathersClockAction);
          return;
        }
      }
      // Try non-empty tableau
      for (const tid of TABLEAU_IDS) {
        if (tid === pileId) continue;
        const tp = state.piles.find((p) => p.id === tid)!;
        if (tp.cards.length > 0 && clockTableauCanStack(tp, [card])) {
          dispatch({ type: "move", fromPile: pileId, toPile: tid } as GrandfathersClockAction);
          return;
        }
      }
      // Try empty tableau
      for (const tid of TABLEAU_IDS) {
        if (tid === pileId) continue;
        const tp = state.piles.find((p) => p.id === tid)!;
        if (tp.cards.length === 0) {
          dispatch({ type: "move", fromPile: pileId, toPile: tid } as GrandfathersClockAction);
          return;
        }
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const hourLabels = ["1","2","3","4","5","6","7","8","9","10","11","12"];

  return (
    <div className="grandfathers-clock">
      <div className="grandfathers-clock-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="auto-move-btn"
          type="button"
          data-testid="hint-target-grandfathers-clock-auto"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as GrandfathersClockAction)}
          title="Send any cards that can move to a foundation, automatically."
          aria-label="Auto-move cards to foundations"
          data-tooltip="Send any cards that can move to a foundation, automatically."
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          <span>Auto-move</span>
        </button>
      </div>

      <div className="grandfathers-clock-main">
        <div>
          <div className="clock-label">Clock Foundations</div>
          <div className="grandfathers-clock-clock">
            {CLOCK_IDS.map((id, i) => (
              <div key={id}>
                <div className="clock-label">{hourLabels[i]}:00</div>
                <div className="pile-wrapper">
                  <Pile
                    pile={getPile(id)}
                    onCardDragStart={onDragStart}
                    onDrop={(pileId) => onDrop(pileId, handleMove)}
                    onDragOver={onDragOver}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="clock-label">Tableau</div>
          <div className="grandfathers-clock-tableau">
            {TABLEAU_IDS.map((id) => (
              <div key={id} className="pile-wrapper">
                <Pile
                  pile={getPile(id)}
                  onCardDragStart={onDragStart}
                  onDrop={(pileId) => onDrop(pileId, handleMove)}
                  onDragOver={onDragOver}
                  onCardClick={handleCardClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
