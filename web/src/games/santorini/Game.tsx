import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SantoriniState, SantoriniSettings } from "./state.js";
import { type SantoriniAction, isTerminal, posToCoord, coordToPos } from "./state.js";
import "./Game.css";

const SIZE = 5;

const HEIGHT_COLORS = ["#d4c080", "#e8e8e8", "#f0f0f0", "#ffffff", "#aaddff"];
const HEIGHT_LABELS = ["", "▪", "▪▪", "▪▪▪", "⬡"];

export function Santorini({
  state,
  dispatch,
  onGameOver,
}: GameProps<SantoriniState, SantoriniSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.phase === "play" && state.winner === null;
  const isPlacing = state.phase === "place0";

  function handleCellClick(row: number, col: number) {
    const pos = coordToPos(row, col);
    if (state.phase === "place0") {
      dispatch({ type: "placeWorker", pos } satisfies SantoriniAction);
      return;
    }
    if (!isHumanTurn) return;
    if (state.playStep === "move") {
      dispatch({ type: "moveWorker", pos } satisfies SantoriniAction);
    } else if (state.playStep === "build") {
      dispatch({ type: "build", pos } satisfies SantoriniAction);
    }
  }

  function handleWorkerClick(workerIdx: number) {
    if (!isHumanTurn || state.playStep !== "select") return;
    dispatch({ type: "selectWorker", workerIdx } satisfies SantoriniAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.phase === "place0") statusText = `Place your workers (${state.workers.filter((w) => w >= 0 && state.workers.indexOf(w) < 2).length}/2 placed)`;
  else if (state.turn === 1) statusText = "Bot thinking...";
  else if (state.playStep === "select") statusText = "Select one of your workers (blue).";
  else if (state.playStep === "move") statusText = "Click a highlighted cell to move.";
  else if (state.playStep === "build") statusText = "Click a highlighted cell to build.";

  return (
    <div className="santorini">
      <div className={`santorini-status ${statusClass}`}>{statusText}</div>
      <div className="santorini-board">
        {Array.from({ length: SIZE }, (_, row) =>
          Array.from({ length: SIZE }, (_, col) => {
            const pos = coordToPos(row, col);
            const h = state.heights[pos]!;
            const workerHere = state.workers.findIndex((w) => w === pos);
            const isHumanWorker = workerHere === 0 || workerHere === 1;
            const isBotWorker = workerHere === 2 || workerHere === 3;
            const isSelected = workerHere === state.selectedWorker;

            // Highlight logic
            let isHighlighted = false;
            if (isPlacing && workerHere === -1) {
              isHighlighted = true;
            } else if (isHumanTurn && state.playStep === "move" && state.selectedWorker !== null) {
              // Show legal moves
              const from = state.workers[state.selectedWorker]!;
              const curH = state.heights[from]!;
              if (
                workerHere === -1 &&
                h < 4 &&
                h <= curH + 1 &&
                Math.abs(row - Math.floor(from / SIZE)) <= 1 &&
                Math.abs(col - (from % SIZE)) <= 1 &&
                pos !== from
              ) {
                isHighlighted = true;
              }
            } else if (isHumanTurn && state.playStep === "build" && state.movedTo !== null) {
              const mr = Math.floor(state.movedTo / SIZE);
              const mc = state.movedTo % SIZE;
              if (workerHere === -1 && h < 4 && Math.abs(row - mr) <= 1 && Math.abs(col - mc) <= 1 && pos !== state.movedTo) {
                isHighlighted = true;
              }
            }

            return (
              <div
                key={pos}
                className={`santorini-cell h${h} ${isHighlighted ? "highlighted" : ""} ${isSelected ? "selected" : ""}`}
                style={{ background: HEIGHT_COLORS[h] }}
                onClick={() => handleCellClick(row, col)}
                data-testid={`sant-${row}-${col}`}
                role="button"
              >
                <span className="sant-height">{HEIGHT_LABELS[h]}</span>
                {isHumanWorker && (
                  <div
                    className={`sant-worker human ${isSelected ? "selected" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleWorkerClick(workerHere); }}
                    title={`Your worker ${workerHere + 1}`}
                  >
                    {workerHere + 1}
                  </div>
                )}
                {isBotWorker && (
                  <div className="sant-worker bot" title={`Bot worker ${workerHere - 1}`}>
                    {workerHere - 1}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="santorini-legend">
        <span className="sant-leg human-leg">■ You (blue)</span>
        <span className="sant-leg bot-leg">■ Bot (red)</span>
        <span className="sant-leg">Heights: 0→1→2→3→dome</span>
      </div>
    </div>
  );
}
