import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PentagoMiniState, PentagoMiniAction, PentagoMiniSettings } from "./state.js";
import { isTerminal, SIZE, TARGET, rcToPos } from "./state.js";
import "./Game.css";

const QUADRANT_NAMES = ["TL", "TR", "BL", "BR"] as const;

export function PentagoMiniGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PentagoMiniState, PentagoMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  let banner = "Place a marble";
  let bannerCls = "pentago-banner";
  if (state.winner === 0) { banner = "You win!"; bannerCls += " pentago-win"; }
  else if (state.winner === 1) { banner = "Bot wins"; bannerCls += " pentago-loss"; }
  else if (state.winner === "draw") { banner = "Draw"; bannerCls += " pentago-draw"; }
  else if (state.turn === 1) banner = "Bot thinking...";
  else if (state.phase === "rotate") banner = "Now rotate any quadrant";

  return (
    <div className="pentago-root">
      <div className="pentago-header">
        <div className="pentago-target">{TARGET} in a row · {SIZE}×{SIZE}</div>
        <div className={bannerCls}>{banner}</div>
        <div className="pentago-bot">Bot: {state.settings.botStrength}</div>
      </div>
      <div className="pentago-board" style={{ gridTemplateColumns: `repeat(${SIZE},1fr)` }}>
        {Array.from({ length: SIZE }).map((_, r) =>
          Array.from({ length: SIZE }).map((__, c) => {
            const i = rcToPos(r, c);
            const v = state.board[i];
            const q = (Math.floor(r / 2) * 2 + Math.floor(c / 2)) as 0 | 1 | 2 | 3;
            const cls = [
              "pentago-cell",
              v === 0 ? "pentago-p0" : v === 1 ? "pentago-p1" : "",
              state.lastPlaced === i ? "pentago-last" : "",
              `pentago-q${q}`,
            ].filter(Boolean).join(" ");
            return (
              <button
                key={i}
                className={cls}
                onClick={() => dispatch({ type: "place", pos: i } as PentagoMiniAction)}
                disabled={v !== null || state.phase !== "place" || state.turn !== 0}
                aria-label={`pos-${i}`}
              />
            );
          })
        )}
      </div>
      {state.phase === "rotate" && state.turn === 0 && state.winner === null && (
        <div className="pentago-rotate-controls">
          <div className="pentago-rotate-label">Rotate a quadrant 90°:</div>
          <div className="pentago-rotate-grid">
            {([0, 1, 2, 3] as const).map((q) => (
              <div key={q} className="pentago-rotate-cell">
                <div className="pentago-q-label">{QUADRANT_NAMES[q]}</div>
                <button
                  type="button"
                  title="Rotate counter-clockwise"
                  className="pentago-rotate-btn"
                  onClick={() => dispatch({ type: "rotate", quadrant: q, dir: "ccw" } as PentagoMiniAction)}
                >
                  ↺ CCW
                </button>
                <button
                  type="button"
                  title="Rotate clockwise"
                  className="pentago-rotate-btn"
                  onClick={() => dispatch({ type: "rotate", quadrant: q, dir: "cw" } as PentagoMiniAction)}
                >
                  ↻ CW
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="pentago-foot">Moves: {state.movesMade}</div>
    </div>
  );
}
