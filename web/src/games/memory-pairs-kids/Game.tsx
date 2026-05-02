import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MemoryState, MemorySettings } from "./state.js";
import type { MemoryAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MemoryPairsKids({ state, dispatch, onGameOver }: GameProps<MemoryState, MemorySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const cols = state.totalPairs <= 6 ? 4 : 4;
  const gridStyle = { gridTemplateColumns: `repeat(${cols}, 70px)` };

  return (
    <div className="mp-game">
      <div className={`mp-status ${terminal ? "win" : ""}`}>{state.message}</div>
      <div className="mp-info">Pairs: {state.matchedPairs}/{state.totalPairs} | Moves: {state.moves}</div>

      <div className="mp-grid" style={gridStyle}>
        {state.cards.map((card, i) => {
          const cls = card.matched ? "mp-card matched" : card.faceUp ? "mp-card face-up" : "mp-card hidden";
          return (
            <div
              key={card.id}
              data-testid={`hint-target-memory-pairs-kids-${i}`}
              className={cls}
              onClick={() => !card.matched && !card.faceUp && dispatch({ type: "flip", index: i } satisfies MemoryAction)}
            >
              {card.faceUp || card.matched ? card.symbol : "?"}
            </div>
          );
        })}
      </div>

      {state.locked && (
        <button className="mp-clear-btn" onClick={() => dispatch({ type: "clear" } satisfies MemoryAction)}>
          Flip Back
        </button>
      )}
    </div>
  );
}
