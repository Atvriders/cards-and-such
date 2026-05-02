import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { isTerminal, ROWS, COLS, TARGET } from "./state.js";
import "./Game.css";

export function GomokuClassicGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConnectState, ConnectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  let banner = "Your turn";
  let bannerCls = "gomoku-cl-banner";
  if (state.result === "P") { banner = "You win!"; bannerCls += " gomoku-cl-win"; }
  else if (state.result === "C") { banner = "CPU wins"; bannerCls += " gomoku-cl-loss"; }
  else if (state.result === "draw") { banner = "Draw"; bannerCls += " gomoku-cl-draw"; }
  else if (state.turn === "C") banner = "CPU thinking...";

  const winSet = new Set(state.winningLine ?? []);
  const lastBot = state.lastBotMove;

  return (
    <div className="gomoku-cl-root">
      <div className="gomoku-cl-header">
        <div className="gomoku-cl-target">{TARGET} in a row · {ROWS}×{COLS}</div>
        <div className={bannerCls}>{banner}</div>
        <div className="gomoku-cl-bot">Bot: {state.settings.botStrength}</div>
      </div>
      <div className="gomoku-cl-board" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const i = r * COLS + c;
            const v = state.board[i];
            const cls = [
              "gomoku-cl-cell",
              v === "P" ? "gomoku-cl-p" : v === "C" ? "gomoku-cl-c" : "",
              winSet.has(i) ? "gomoku-cl-win-cell" : "",
              lastBot === i ? "gomoku-cl-last" : "",
            ].filter(Boolean).join(" ");
            return (
              <button
                key={i}
                className={cls}
                data-testid={`gmkcl-${i}`}
                onClick={() => dispatch({ type: "place", row: r, col: c } as ConnectAction)}
                disabled={v !== null || state.phase === "done" || state.turn !== "P"}
                aria-label={`r${r}c${c}`}
              />
            );
          })
        )}
      </div>
      <div className="gomoku-cl-foot">Stones: {state.pieces}</div>
    </div>
  );
}
