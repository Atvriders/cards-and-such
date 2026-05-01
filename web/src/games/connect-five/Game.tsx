import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectFiveState, ConnectFiveAction, ConnectFiveSettings } from "./state.js";
import { isTerminal, ROWS, COLS, TARGET, topRow } from "./state.js";
import "./Game.css";

export function ConnectFiveGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConnectFiveState, ConnectFiveSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  let banner = "Your turn";
  let bannerCls = "c5-banner";
  if (state.result === "P") { banner = "You win!"; bannerCls += " c5-win"; }
  else if (state.result === "C") { banner = "Bot wins"; bannerCls += " c5-loss"; }
  else if (state.result === "draw") { banner = "Draw"; bannerCls += " c5-draw"; }
  else if (state.turn === "C") banner = "Bot thinking...";

  const winSet = new Set(state.winningLine ?? []);

  return (
    <div className="c5-root">
      <div className="c5-header">
        <div className="c5-target">Connect {TARGET} · {COLS}×{ROWS}</div>
        <div className={bannerCls}>{banner}</div>
        <div className="c5-bot">Bot: {state.settings.botStrength}</div>
      </div>
      <div className="c5-cols" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
        {Array.from({ length: COLS }).map((_, c) => {
          const tr = topRow(state.board, c);
          const disabled = tr < 0 || state.phase === "done" || state.turn !== "P";
          return (
            <button
              key={c}
              className="c5-col-btn"
              type="button"
              onClick={() => dispatch({ type: "drop", col: c } as ConnectFiveAction)}
              onMouseEnter={() => setHoverCol(c)}
              onMouseLeave={() => setHoverCol(null)}
              disabled={disabled}
              aria-label={`drop col ${c}`}
            >
              ▼
            </button>
          );
        })}
      </div>
      <div className="c5-board" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const i = r * COLS + c;
            const v = state.board[i];
            const isHover = hoverCol === c && r === topRow(state.board, c) && state.turn === "P" && state.phase !== "done";
            const cls = [
              "c5-cell",
              v === "P" ? "c5-p" : v === "C" ? "c5-c" : "",
              winSet.has(i) ? "c5-win-cell" : "",
              isHover ? "c5-hover" : "",
            ].filter(Boolean).join(" ");
            return <div key={i} className={cls} />;
          })
        )}
      </div>
      <div className="c5-foot">Pieces: {state.pieces}</div>
    </div>
  );
}
