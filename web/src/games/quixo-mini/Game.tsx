import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuixoMiniState, QuixoMiniAction, QuixoMiniSettings } from "./state.js";
import { isTerminal, edgeCells, validDirs, canSelect, SIZE, TARGET } from "./state.js";
import "./Game.css";

const DIR_LABEL: Record<string, string> = {
  up: "↑ Up",
  down: "↓ Down",
  left: "← Left",
  right: "→ Right",
};

export function QuixoMiniGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<QuixoMiniState, QuixoMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  let banner = "Pick an edge cube";
  let bannerCls = "quixo-banner";
  if (state.winner === "X") { banner = "You win!"; bannerCls += " quixo-win"; }
  else if (state.winner === "O") { banner = "Bot wins"; bannerCls += " quixo-loss"; }
  else if (state.turn === "O") banner = "Bot thinking...";
  else if (state.selected !== null) banner = "Choose a direction to push";

  const winSet = new Set(state.winningLine ?? []);
  const edgeSet = new Set(edgeCells());

  return (
    <div className="quixo-root">
      <div className="quixo-header">
        <div className="quixo-title">Quixo · {SIZE}×{SIZE} · {TARGET}-line</div>
        <div className={bannerCls}>{banner}</div>
        <div className="quixo-bot">Bot: {state.settings.botStrength}</div>
      </div>
      <div className="quixo-board" style={{ gridTemplateColumns: `repeat(${SIZE},1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.grid[i];
          const onEdge = edgeSet.has(i);
          const selectable =
            state.turn === "X" && !state.gameOver && onEdge && canSelect(state.grid, i, "X");
          const isSelected = state.selected === i;
          const cls = [
            "quixo-cell",
            v === "X" ? "quixo-x" : v === "O" ? "quixo-o" : "",
            onEdge ? "quixo-edge" : "",
            isSelected ? "quixo-selected" : "",
            winSet.has(i) ? "quixo-win-cell" : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              key={i}
              className={cls}
              onClick={() => dispatch({ type: "select", idx: i } as QuixoMiniAction)}
              disabled={!selectable && state.selected !== i}
              aria-label={`cell-${i}`}
            >
              {v ?? ""}
            </button>
          );
        })}
      </div>
      {state.selected !== null && state.turn === "X" && !state.gameOver && (
        <div className="quixo-dirs">
          {validDirs(state.selected).map((d) => (
            <button
              key={d}
              className="quixo-dir-btn"
              onClick={() => dispatch({ type: "push", dir: d } as QuixoMiniAction)}
            >
              {DIR_LABEL[d]}
            </button>
          ))}
        </div>
      )}
      {state.gameOver && (
        <button className="quixo-restart" onClick={() => dispatch({ type: "restart" } as QuixoMiniAction)}>
          New game
        </button>
      )}
    </div>
  );
}
