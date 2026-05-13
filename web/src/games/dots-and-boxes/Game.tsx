import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DotsAndBoxesState, DotsAndBoxesSettings } from "./state.js";
import { type DotsAndBoxesAction, isTerminal, hIdx, vIdx } from "./state.js";
import "./Game.css";

export function DotsAndBoxes({
  state,
  dispatch,
  onGameOver,
}: GameProps<DotsAndBoxesState, DotsAndBoxesSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const { rows, cols } = state;

  function handleHEdge(row: number, col: number) {
    if (!isMyTurn) return;
    if (state.hEdges[hIdx(state, row, col)]) return;
    dispatch({ type: "drawEdge", edge: "h", row, col } satisfies DotsAndBoxesAction);
  }

  function handleVEdge(row: number, col: number) {
    if (!isMyTurn) return;
    if (state.vEdges[vIdx(state, row, col)]) return;
    dispatch({ type: "drawEdge", edge: "v", row, col } satisfies DotsAndBoxesAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; }
  else if (!isMyTurn) statusText = "Bot thinking...";
  else statusText = "Your turn — draw a line segment between two dots.";

  return (
    <div className="dab fade-in">
      <div className={`dab-status ${statusClass}`}>{statusText}</div>
      <div className="dab-scores">
        <span style={{ color: "#2060c0" }}>You: {state.scores[0]}</span>
        <span style={{ color: "#c02020" }}>Bot: {state.scores[1]}</span>
      </div>
      <div className="dab-board">
        {Array.from({ length: rows + 1 }, (_, dotRow) => (
          <div key={dotRow}>
            {/* Row of dots and horizontal edges */}
            <div className="dab-row">
              {Array.from({ length: cols + 1 }, (_, dotCol) => (
                <div key={dotCol} style={{ display: "flex", alignItems: "center" }}>
                  <div className="dab-dot" />
                  {dotCol < cols && (() => {
                    const drawn = state.hEdges[hIdx(state, dotRow, dotCol)];
                    // We can't know if it was drawn by player or bot without tracking, so use turn heuristic
                    return (
                      <div
                        className={`dab-h-edge ${drawn ? "drawn" : ""}`}
                        onClick={() => handleHEdge(dotRow, dotCol)}
                        data-testid={`h-${dotRow}-${dotCol}`}
                        role="button"
                        aria-label={`horizontal edge row ${dotRow} col ${dotCol}`}
                      >
                        <div className="dab-h-edge-line" />
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
            {/* Row of vertical edges and boxes */}
            {dotRow < rows && (
              <div className="dab-box-row">
                {Array.from({ length: cols + 1 }, (_, vCol) => (
                  <div key={vCol} style={{ display: "flex" }}>
                    <div
                      className={`dab-v-edge ${state.vEdges[vIdx(state, dotRow, vCol)] ? "drawn" : ""}`}
                      onClick={() => handleVEdge(dotRow, vCol)}
                      data-testid={`v-${dotRow}-${vCol}`}
                      role="button"
                      aria-label={`vertical edge row ${dotRow} col ${vCol}`}
                    >
                      <div className="dab-v-edge-line" />
                    </div>
                    {vCol < cols && (() => {
                      const boxOwner = state.boxes[dotRow * cols + vCol];
                      return (
                        <div className={`dab-box ${boxOwner === 0 ? "player" : boxOwner === 1 ? "bot" : ""}`}>
                          {boxOwner === 0 ? "You" : boxOwner === 1 ? "Bot" : ""}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
