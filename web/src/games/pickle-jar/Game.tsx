import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PickleJarState, PickleJarAction, PickleJarSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PickleJar({ state, dispatch, onGameOver }: GameProps<PickleJarState, PickleJarSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "opening") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PickleJarAction), 60);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="pj-wrap"><div className="pj-done"><h2>All Jars Opened!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#2ecc71" }}>{state.score} pts</p>
    </div></div>
  );

  if (state.phase === "opened") return (
    <div className="pj-wrap"><div className="pj-done">
      <h2>Jar {state.jar - 1} Opened!</h2>
      <p>{state.score} pts so far</p>
      <button data-testid="hint-target-pickle-jar-action" className="pj-btn" onClick={() => dispatch({ type: "next" } as PickleJarAction)}>Next Jar</button>
    </div></div>
  );

  return (
    <div className="pj-wrap">
      <div className="pj-header"><span>Jar {state.jar} / {state.maxJars}</span><span className="pj-score">{state.score} pts</span></div>
      <div className="pj-progress">{Array.from({ length: 5 }, (_, i) => <span key={i} className={`pj-pip ${i < state.openProgress ? "done" : ""}`} />)}</div>
      <div className="pj-bar">
        <div className="pj-zone" />
        <div className="pj-meter" style={{ left: `${state.meter}%` }} />
      </div>
      {state.lastClick && <div className={`pj-feedback ${state.lastClick}`}>{state.lastClick === "good" ? "Good click! +20" : "Too off-center! -progress"}</div>}
      <button className="pj-btn" onClick={() => dispatch({ type: "click" } as PickleJarAction)}>TWIST!</button>
      <p className="pj-hint">Click when the meter is in the center zone (35–65). 5 good clicks to open!</p>
    </div>
  );
}
