import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SockTossState, SockTossAction, SockTossSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SockToss({ state, dispatch, onGameOver }: GameProps<SockTossState, SockTossSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "tossing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SockTossAction), 60);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="sock-wrap"><div className="sock-done"><h2>All Tosses!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#16a085" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="sock-wrap">
      <div className="sock-header"><span>Toss {state.tosses + 1} / {state.maxTosses}</span><span className="sock-score">{state.score} pts</span></div>
      <div className="sock-lane">
        <div className="sock-basket" style={{ bottom: `${state.basket}%`, height: "16%" }} />
        <div className="sock-ball" style={{ bottom: `${state.height}%` }}>🧦</div>
      </div>
      {state.phase === "result" && (
        <div className={`sock-feedback ${state.lastLanded}`}>
          {state.lastLanded === "basket" ? `Basket! +${state.lastPoints}` : state.lastLanded === "rim" ? `Rim! +${state.lastPoints}` : "Floor miss!"}
        </div>
      )}
      {state.phase === "tossing" && <button data-testid="hint-target-sock-toss-action" className="sock-btn" onClick={() => dispatch({ type: "release" } as SockTossAction)}>TOSS!</button>}
      {state.phase === "result" && <button className="sock-btn next" onClick={() => dispatch({ type: "next" } as SockTossAction)}>Next Toss</button>}
      <p className="sock-hint">Release when the sock reaches the basket zone!</p>
    </div>
  );
}
