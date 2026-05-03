import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PhutballState, PhutballSettings } from "./state.js";
import { isTerminal, canJump } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Phutball.css";

const DIRS8: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

const DIR_LABELS: Record<string, string> = {
  "-1,-1": "↖", "-1,0": "↑", "-1,1": "↗",
  "0,-1": "←",               "0,1": "→",
  "1,-1": "↙",  "1,0": "↓",  "1,1": "↘",
};

export function Phutball({ state, dispatch, onGameOver }: GameProps<PhutballState, PhutballSettings>): JSX.Element {
  const term = isTerminal(state);
  useEffect(() => { if (term) onGameOver(term.score); }, [term, onGameOver]);

  const isPlayerTurn = state.settings.opponent === "hot-seat" || state.turn === "W";

  function handleClick(c: Coord) {
    if (term || !isPlayerTurn) return;
    if (state.jumpInProgress) return; // must use jump buttons or endJump
    dispatch({ type: "placeman", at: c });
  }

  const availableJumps = DIRS8.filter(([dr, dc]) => canJump(state.grid, state.ballPos, dr, dc));

  const turnLabel = state.settings.opponent === "hot-seat"
    ? (state.turn === "W" ? "White's turn" : "Black's turn")
    : (state.turn === "W" ? "Your turn (White — reach top row!)" : "Bot thinking…");

  const statusText = term
    ? (state.winner === "W" ? "You win! Ball reached top!" : "Bot wins!")
    : turnLabel;

  return (
    <div className="phutball-board">
      <div className="phutball-status">{statusText}</div>
      <div className="phutball-info">
        {state.jumpInProgress ? "Jump in progress — pick a direction or End Jump" : "Click empty cell to place man, or jump ball"}
      </div>
      <div className="phutball-grid">
        {[...state.grid.coords()].map(c => {
          const k = `${c.row},${c.col}`;
          const cell = state.grid.get(c);
          const isGoalW = c.row === 0;
          const isGoalB = c.row === state.grid.rows - 1;
          return (
            <div
              key={k}
              className={`phutball-cell${isGoalW ? " goal-w" : ""}${isGoalB ? " goal-b" : ""}`}
              onClick={() => handleClick(c)}
              data-testid={`cell-${c.row}-${c.col}`}
            >
              {cell === "ball" ? "🏈" : cell === "man" ? "🔵" : null}
            </div>
          );
        })}
      </div>
      {!term && isPlayerTurn && (
        <div className="phutball-actions">
          {availableJumps.map(([dr, dc]) => (
            <button
              key={`${dr},${dc}`}
              onClick={() => dispatch({ type: "jump", direction: [dr, dc] })}
            >
              Jump {DIR_LABELS[`${dr},${dc}`] ?? "?"}
            </button>
          ))}
          {state.jumpInProgress && (
            <button data-testid="hint-target-phutball-action" onClick={() => dispatch({ type: "endJump" })}>End Jump</button>
          )}
        </div>
      )}
      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        White (you) aims for row 0. Black (bot) aims for row 6.
      </div>
    </div>
  );
}
