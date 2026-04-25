import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UrState, UrSettings } from "./state.js";
import { type UrAction, getLegalMoveIndices, isTerminal, ROSETTES, PIECES_PER_PLAYER } from "./state.js";
import "./Game.css";

// Visual board: 3 rows, 8 columns
// Row 0 (P private):  pos 3,2,1,0 [col0-3], blank [col4-5], pos 12,13 [col6-7]  (reversed)
// Row 1 (shared):     pos 4,5,6,7,8,9,10,11
// Row 2 (B private):  pos 3,2,1,0 [col0-3], blank [col4-5], pos 12,13 [col6-7]

// Simplified linear display — just show the 14-step path for each player

export function Ur({
  state,
  dispatch,
  onGameOver,
}: GameProps<UrState, UrSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "P" && state.winner === null;
  const legalPieceIndices = (!state.mustRoll && isPlayerTurn)
    ? getLegalMoveIndices(state.pPieces, state.bPieces, state.roll, true)
    : [];

  let statusText = "";
  let statusClass = "";
  if (state.winner === "P") { statusText = "You win! All pieces escaped!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isPlayerTurn) statusText = "Bot is moving…";
  else if (state.mustRoll) statusText = "Your turn — click Roll to throw dice.";
  else if (state.roll === 0) statusText = "Rolled 0 — no moves, turn passes.";
  else statusText = `Rolled ${state.lastRoll}. Click a piece to move it.`;

  // Build path board for display: 14 cells for player path
  // shared zone 4-11 can have both players
  function pieceAtPath(pos: number): { owner: "P" | "B" | null; pIdx: number } {
    const pIdx = state.pPieces.findIndex((p) => p === pos);
    if (pIdx >= 0) return { owner: "P", pIdx };
    if (state.bPieces.some((p) => p === pos)) return { owner: "B", pIdx: -1 };
    return { owner: null, pIdx: -1 };
  }

  const pWaiting = state.pPieces.filter((p) => p === -1).length;
  const bWaiting = state.bPieces.filter((p) => p === -1).length;
  const pEscaped = state.pPieces.filter((p) => p === 14).length;
  const bEscaped = state.bPieces.filter((p) => p === 14).length;

  return (
    <div className="ur">
      <div className={`ur-status ${statusClass}`}>{statusText}</div>

      <div className="ur-escaped">
        You: {pEscaped}/{PIECES_PER_PLAYER} escaped | Bot: {bEscaped}/{PIECES_PER_PLAYER} escaped
      </div>

      {isPlayerTurn && state.mustRoll && (
        <button className="ur-roll-btn" onClick={() => dispatch({ type: "roll" } satisfies UrAction)}>
          Roll Dice
        </button>
      )}

      {/* Waiting pieces */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ fontSize: "0.85rem", color: "#666" }}>
          Waiting: You×{pWaiting} | Bot×{bWaiting}
        </div>
        {/* Waiting player pieces as clickable if roll > 0 */}
        {legalPieceIndices.map((i) => {
          if (state.pPieces[i] !== -1) return null;
          return (
            <div
              key={i}
              className="ur-piece P selectable"
              onClick={() => dispatch({ type: "move", pieceIdx: i } satisfies UrAction)}
              title="Enter board"
            >
              YOU
            </div>
          );
        })}
      </div>

      {/* Path board */}
      <div className="ur-board">
        <div className="ur-row">
          {Array.from({ length: 14 }, (_, pos) => {
            const { owner, pIdx } = pieceAtPath(pos);
            const isRosette = ROSETTES.has(pos);
            const isShared = pos >= 4 && pos <= 11;
            const canMove = owner === "P" && legalPieceIndices.includes(pIdx);
            return (
              <div
                key={pos}
                className={`ur-cell${isRosette ? " rosette" : ""}${isShared ? " shared" : ""}`}
                title={`Step ${pos + 1}${isRosette ? " ★ Rosette" : ""}${isShared ? " (shared)" : ""}`}
              >
                {owner === "P" && (
                  <div
                    className={`ur-piece P${canMove ? " selectable" : ""}`}
                    onClick={canMove ? () => dispatch({ type: "move", pieceIdx: pIdx } satisfies UrAction) : undefined}
                  >
                    YOU
                  </div>
                )}
                {owner === "B" && <div className="ur-piece B">BOT</div>}
                {owner === null && isRosette && <span>★</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ur-legend">
        ★ Rosette (steps 4, 8, 14) = extra turn · Shared zone (steps 5-12) = capture zone
      </div>
    </div>
  );
}
