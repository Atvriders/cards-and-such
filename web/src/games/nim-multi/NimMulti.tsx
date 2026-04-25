import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NimMultiState, NimMultiSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./NimMulti.css";

export function NimMulti({ state, dispatch, onGameOver }: GameProps<NimMultiState, NimMultiSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "player" && !state.gameOver;

  let statusText = isPlayerTurn ? "Your turn" : "Bot is thinking...";
  let statusClass = "";
  if (state.gameOver) {
    statusText = state.winner === "player" ? "You win!" : "Bot wins!";
    statusClass = state.winner === "player" ? "win" : "loss";
  }

  function adjust(pile: number, delta: number) {
    const cur = state.selected?.pile === pile ? state.selected.count : 0;
    dispatch({ type: "select", pile, count: cur + delta });
  }

  return (
    <div className="nim-multi">
      <div className={`nim-multi-status ${statusClass}`}>{statusText}</div>

      <div className="nim-multi-piles">
        {state.piles.map((count, i) => {
          const selCount = state.selected?.pile === i ? state.selected.count : 0;
          return (
            <div key={i} className={`nim-multi-pile ${state.selected?.pile === i ? "selected-pile" : ""}`}>
              <div className="nim-multi-pile-label">Pile {i + 1} ({count})</div>
              <div className="nim-multi-stones">
                {Array.from({ length: count }, (_, j) => (
                  <div key={j} className="nim-multi-stone" />
                ))}
              </div>
              <div className="nim-multi-pile-controls">
                <button disabled={!isPlayerTurn || count === 0 || selCount <= 0} onClick={() => adjust(i, -1)}>−</button>
                <span className="pile-sel-count">{selCount}</span>
                <button disabled={!isPlayerTurn || count === 0 || selCount >= count} onClick={() => adjust(i, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="nim-multi-take-btn"
        disabled={!isPlayerTurn || !state.selected || state.selected.count === 0}
        onClick={() => dispatch({ type: "take" })}
      >
        Take
      </button>

      {state.lastMove && (
        <div className="nim-multi-last-move">
          Bot took {state.lastMove.count} from pile {state.lastMove.pile + 1}
        </div>
      )}

      {state.gameOver && (
        <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
