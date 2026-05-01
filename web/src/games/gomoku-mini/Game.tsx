import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GomokuMiniState, GomokuMiniAction, GomokuMiniSettings } from "./state.js";
import { isTerminal, SIZE, TARGET } from "./state.js";
import "./Game.css";

export function GomokuMini({
  state,
  dispatch,
  onGameOver,
}: GameProps<GomokuMiniState, GomokuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  let banner = "Your turn (X)";
  let bannerCls = "gomoku-mini-banner";
  if (state.winner === "X") { banner = "You win!"; bannerCls += " gomoku-mini-win"; }
  else if (state.winner === "O") { banner = "Bot wins"; bannerCls += " gomoku-mini-loss"; }
  else if (state.winner === "draw") { banner = "Draw"; bannerCls += " gomoku-mini-draw"; }

  const winSet = new Set(state.winningLine ?? []);

  return (
    <div className="gomoku-mini-root">
      <div className="gomoku-mini-header">
        <div className="gomoku-mini-target">{TARGET} in a row · {SIZE}×{SIZE}</div>
        <div className={bannerCls}>{banner}</div>
        <div className="gomoku-mini-bot">Bot: {state.settings.aiStrength}</div>
      </div>
      <div
        className="gomoku-mini-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {state.board.map((cell, i) => {
          const cls = [
            "gomoku-mini-cell",
            cell === "X" ? "gomoku-mini-x" : cell === "O" ? "gomoku-mini-o" : "",
            winSet.has(i) ? "gomoku-mini-win-cell" : "",
            state.lastBotMove === i ? "gomoku-mini-last" : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              key={i}
              className={cls}
              onClick={() => dispatch({ type: "move", index: i } as GomokuMiniAction)}
              disabled={!!cell || state.phase === "gameover"}
              aria-label={`cell-${i}`}
            />
          );
        })}
      </div>
      {state.phase === "gameover" && (
        <button
          className="gomoku-mini-reset"
          type="button"
          onClick={() => dispatch({ type: "reset" } as GomokuMiniAction)}
        >
          New game
        </button>
      )}
      <div className="gomoku-mini-foot">Stones: {state.pieces}</div>
    </div>
  );
}
