import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NinepinsClassicState, NinepinsClassicAction, NinepinsClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function NinepinsClassicGame({ state, dispatch, onGameOver }: GameProps<NinepinsClassicState, NinepinsClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="nincla-wrap">
        <div className="nincla-done">
          <h2>Frame</h2>
          <div className="nincla-final">{Math.max(0, state.score)} pts</div>
          
          <div className="nincla-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="nincla-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="nincla-wrap">
      <div className="nincla-head">
        <span className="nincla-round">Frame {state.round} / {TOTAL_ROUNDS}</span>
        <span className="nincla-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="nincla-dice-row">
          {state.dice.map((d, i) => <div key={i} className="nincla-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="nincla-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="nincla-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="nincla-log">{line}</div>)}
      </div>
      <div className="nincla-actions">
        {state.phase === "rolling" && (
          <button className="nincla-btn primary" onClick={() => dispatch({ type: "roll" } as NinepinsClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="nincla-btn alt" onClick={() => dispatch({ type: "next" } as NinepinsClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
