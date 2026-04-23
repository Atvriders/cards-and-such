import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PokerSolitaireState, PokerSolitaireAction, PokerSolitaireSettings } from "./state.js";
import { classifyHand, HAND_SCORES } from "./state.js";
import type { Card } from "../../engines/deck/index.js";
import { Card as CardComponent } from "../../engines/deck/Card.js";
import "./PokerSolitaire.css";

function handLabel(cards: (Card | null)[]): string {
  const full = cards.filter((c): c is Card => c !== null);
  if (full.length < 5) return "";
  const hand = classifyHand(full);
  const score = HAND_SCORES[hand] ?? 0;
  return `${hand.replace(/-/g, " ")} (${score})`;
}

export function PokerSolitaire({ state, dispatch, onGameOver }: GameProps<PokerSolitaireState, PokerSolitaireSettings>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const send = (action: PokerSolitaireAction) => dispatch(action);

  const colCards = (colIdx: number): (Card | null)[] =>
    state.grid.map((row) => row[colIdx] ?? null);

  return (
    <div className="poker-sol">
      <div className="poker-info">
        <span>Cards placed: {state.movesMade}/25</span>
        {state.won && <span>Total score: {state.score}</span>}
      </div>

      <div className="poker-layout">
        <div>
          <div className="poker-grid-wrap">
            {state.grid.map((row, rIdx) => (
              <div key={rIdx} className="poker-grid-row">
                {row.map((cell, cIdx) => (
                  <div
                    key={cIdx}
                    className={`poker-grid-cell${cell ? " has-card" : ""}`}
                    onClick={() => !cell && state.currentCard && send({ type: "place", row: rIdx, col: cIdx })}
                  >
                    {cell ? <CardComponent card={cell} /> : null}
                  </div>
                ))}
                <div className="poker-row-score">{handLabel(row)}</div>
              </div>
            ))}
            <div className="poker-col-scores">
              {[0, 1, 2, 3, 4].map((cIdx) => (
                <div key={cIdx} className="poker-col-score">{handLabel(colCards(cIdx))}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="poker-current">
          <div className="poker-current-label">Current card — click a cell to place</div>
          {state.currentCard ? (
            <CardComponent card={state.currentCard} />
          ) : (
            <div className="poker-placeholder">{state.won ? "Done!" : "Empty"}</div>
          )}
          <div className="poker-current-label">Remaining in draw: {state.drawPile.length}</div>
        </div>
      </div>
    </div>
  );
}
