import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RingerCoinState, RingerCoinAction, RingerCoinSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = (startDeg - 90) * Math.PI / 180;
  const e = (endDeg - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
}

export function RingerCoin({ state, dispatch, onGameOver }: GameProps<RingerCoinState, RingerCoinSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "aiming") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as RingerCoinAction), 30);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="rc-wrap"><div className="rc-done"><h2>Game Over!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f39c12" }}>{state.score} pts</p>
    </div></div>
  );

  const rad = (state.aimAngle - 90) * Math.PI / 180;
  const cx = 80, cy = 80, r = 60;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <div className="rc-wrap">
      <div className="rc-header"><span>Toss {state.tosses + 1} / {state.maxTosses}</span><span className="rc-score">{state.score} pts</span></div>
      <svg width="160" height="160" className="rc-svg">
        <circle cx={cx} cy={cy} r={r} stroke="#bdc3c7" strokeWidth="3" fill="none" />
        <path d={arcPath(cx, cy, r, 80, 100)} stroke="#f39c12" strokeWidth="8" fill="none" />
        <path d={arcPath(cx, cy, r, 260, 280)} stroke="#f39c12" strokeWidth="8" fill="none" />
        <circle cx={nx} cy={ny} r={8} fill="#f39c12" />
      </svg>
      {state.phase === "result" && <div className={`rc-feedback ${state.lastResult}`}>{state.lastResult === "ring" ? `Ringer! +${state.lastPoints}` : state.lastResult === "close" ? `Close! +${state.lastPoints}` : "Miss!"}</div>}
      {state.phase === "aiming" && <button data-testid="hint-target-ringer-coin-action" className="rc-btn" onClick={() => dispatch({ type: "toss" } as RingerCoinAction)}>TOSS</button>}
      {state.phase === "result" && <button className="rc-btn next" onClick={() => dispatch({ type: "next" } as RingerCoinAction)}>Next Toss</button>}
      <p className="rc-hint">Toss when the marker hits the orange zone</p>
    </div>
  );
}
