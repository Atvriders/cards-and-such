import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SenetState, SenetSettings } from "./state.js";
import { type SenetAction, getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

const SPECIAL_LABELS: Record<number, string> = {
  14: "☥",  // House of Rebirth (sq 15)
  25: "𓂀",  // sq 26 – House of Happiness
  26: "🌊",  // sq 27 – House of Water (danger)
  27: "𓃭",  // sq 28
  28: "𓃰",  // sq 29
  29: "🏁",  // sq 30 – exit
};

// Board layout: row0 = sq 1-10 left-to-right, row1 = sq 11-20 right-to-left, row2 = sq 21-30 left-to-right
function getRows(): number[][] {
  return [
    [0,1,2,3,4,5,6,7,8,9],
    [19,18,17,16,15,14,13,12,11,10],
    [20,21,22,23,24,25,26,27,28,29],
  ];
}

export function Senet({
  state,
  dispatch,
  onGameOver,
}: GameProps<SenetState, SenetSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "P" && state.winner === null;
  const legalMoves = (!state.mustRoll && isPlayerTurn)
    ? getLegalMoves(state.board, state.escapedP, state.escapedB, "P", state.roll)
    : [];

  let statusText = "";
  let statusClass = "";
  if (state.winner === "P") { statusText = "You win! All your pieces escaped!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isPlayerTurn) statusText = "Bot is moving…";
  else if (state.mustRoll) statusText = "Your turn — click Roll to throw sticks.";
  else statusText = `You rolled ${state.lastRoll}. Click a piece to move.`;

  const rows = getRows();

  function handleCellClick(idx: number) {
    if (!isPlayerTurn || state.mustRoll) return;
    if (!legalMoves.includes(idx)) return;
    dispatch({ type: "move", from: idx } satisfies SenetAction);
  }

  function handleRoll() {
    if (!isPlayerTurn || !state.mustRoll) return;
    dispatch({ type: "roll" } satisfies SenetAction);
  }

  return (
    <div className="senet">
      <div className={`senet-status ${statusClass}`}>{statusText}</div>

      <div className="senet-escaped">
        <span>Your escaped: {state.escapedP}/5</span>
        <span>Bot escaped: {state.escapedB}/5</span>
      </div>

      {isPlayerTurn && state.mustRoll && (
        <button className="senet-roll-btn" onClick={handleRoll}>Roll Sticks</button>
      )}
      {!state.mustRoll && state.turn === "P" && (
        <div className="senet-info">Roll: {state.lastRoll}</div>
      )}

      <div className="senet-board">
        {rows.map((row, ri) => (
          <div key={ri} className="senet-row">
            {row.map((idx) => {
              const cell = state.board[idx];
              const isSpecial = SPECIAL_LABELS[idx] !== undefined;
              const isSelectable = legalMoves.includes(idx);
              return (
                <div
                  key={idx}
                  className={`senet-cell${isSpecial ? " special" : ""}${isSelectable ? " selectable" : ""}`}
                  onClick={() => handleCellClick(idx)}
                  title={`Square ${idx + 1}${isSpecial ? " " + SPECIAL_LABELS[idx] : ""}`}
                >
                  {cell === "P" && <div className="senet-piece-P">YOU</div>}
                  {cell === "B" && <div className="senet-piece-B">BOT</div>}
                  {cell === null && isSpecial && (
                    <span style={{ fontSize: "1rem" }}>{SPECIAL_LABELS[idx]}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="senet-info" style={{ fontSize: "0.75rem", color: "#888" }}>
        Sq 15: Rebirth · Sq 27: Water (back to 15) · Roll 1/4/5 = extra turn
      </div>
    </div>
  );
}
