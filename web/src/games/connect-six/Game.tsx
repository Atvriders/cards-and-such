import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectSixState, ConnectSixAction, ConnectSixSettings } from "./state.js";
import { isTerminal, ROWS, COLS, TARGET, topRow } from "./state.js";
import "./Game.css";

export function ConnectSixGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConnectSixState, ConnectSixSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  let banner = "Your turn";
  let bannerCls = "c6-banner";
  if (state.result === "P") { banner = "You win!"; bannerCls += " c6-win"; }
  else if (state.result === "C") { banner = "Bot wins"; bannerCls += " c6-loss"; }
  else if (state.result === "draw") { banner = "Draw"; bannerCls += " c6-draw"; }
  else if (state.turn === "C") banner = "Bot thinking...";

  const winSet = new Set(state.winningLine ?? []);

  return (
    <div className="c6-root">
      <div className="c6-header">
        <div className="c6-target">Connect {TARGET} · {COLS}×{ROWS}</div>
        <div className={bannerCls}>{banner}</div>
        <div className="c6-bot">Bot: {state.settings.botStrength}</div>
      </div>
      <div className="c6-cols" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
        {Array.from({ length: COLS }).map((_, c) => {
          const tr = topRow(state.board, c);
          const disabled = tr < 0 || state.phase === "done" || state.turn !== "P";
          return (
            <button
              key={c}
              className="c6-col-btn"
              type="button"
              onClick={() => dispatch({ type: "drop", col: c } as ConnectSixAction)}
              onMouseEnter={() => setHoverCol(c)}
              onMouseLeave={() => setHoverCol(null)}
              disabled={disabled}
              aria-label={`drop col ${c}`}
            data-tooltip="Move down">
              ▼
            </button>
          );
        })}
      </div>
      <div className="c6-board" style={{ gridTemplateColumns: `repeat(${COLS},1fr)` }}>
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((__, c) => {
            const i = r * COLS + c;
            const v = state.board[i];
            const isHover = hoverCol === c && r === topRow(state.board, c) && state.turn === "P" && state.phase !== "done";
            const cls = [
              "c6-cell",
              v === "P" ? "c6-p" : v === "C" ? "c6-c" : "",
              winSet.has(i) ? "c6-win-cell" : "",
              isHover ? "c6-hover" : "",
            ].filter(Boolean).join(" ");
            return <div key={i} className={cls} />;
          })
        )}
      </div>
      <div className="c6-foot">Pieces: {state.pieces}</div>
    </div>
  );
}
