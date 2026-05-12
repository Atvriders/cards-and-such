import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NimState, NimSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./Nim.css";

export function Nim({ state, dispatch, onGameOver }: GameProps<NimState, NimSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<{ pile: number; count: number } | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "player" && !state.gameOver;

  function adjustCount(pile: number, delta: number) {
    const cur = selected?.pile === pile ? selected.count : 0;
    const next = Math.max(1, Math.min(state.piles[pile]!, cur + delta));
    setSelected({ pile, count: next });
  }

  function takeStones() {
    if (!selected) return;
    dispatch({ type: "remove", pile: selected.pile, count: selected.count });
    setSelected(null);
  }

  let statusText = isPlayerTurn ? "Your turn — remove stones from one pile" : "Bot thinking...";
  let statusClass = "";
  if (state.gameOver) {
    if (state.winner === "player") { statusText = "You win!"; statusClass = "win"; }
    else { statusText = "Bot wins!"; statusClass = "loss"; }
  }

  return (
    <div className="nim">
      <div className={`nim-status ${statusClass}`}>{statusText}</div>
      <div className="nim-info">
        Rule: {state.settings.rule === "misere" ? "Misère (last stone = lose)" : "Standard (last stone = win)"}
      </div>

      <div className="nim-piles">
        {state.piles.map((count, i) => (
          <div className="nim-pile" key={i} data-testid={`nim-pile-${i}`}>
            <div className="nim-stones">
              {Array.from({ length: count }, (_, j) => (
                <div key={j} className="nim-stone" />
              ))}
            </div>
            <div className="nim-pile-controls">
              <button
                className="nim-pile-btn"
                title="Take one fewer stone"
                disabled={!isPlayerTurn || count === 0}
                onClick={() => adjustCount(i, -1)}
              >−</button>
              <span className="nim-pile-count">
                {selected?.pile === i ? selected.count : 0}
              </span>
              <button
                className="nim-pile-btn"
                title="Take one more stone"
                disabled={!isPlayerTurn || (selected?.pile === i ? selected.count >= count : count === 0)}
                onClick={() => adjustCount(i, 1)}
              >+</button>
            </div>
            <div className="nim-pile-label">Pile {i + 1} ({count})</div>
          </div>
        ))}
      </div>

      {selected && selected.count > 0 && (
        <button className="nim-take-btn" onClick={takeStones} disabled={!isPlayerTurn}>
          Take {selected.count} from Pile {selected.pile + 1}
        </button>
      )}

      {state.gameOver && (
        <button className="nim-restart" onClick={() => dispatch({ type: "restart" })}>
          Play Again
        </button>
      )}
    </div>
  );
}
