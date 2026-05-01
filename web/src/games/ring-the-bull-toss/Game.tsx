import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RingTheBullTossState, RingTheBullTossAction, RingTheBullTossSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function RingTheBullTossGame({ state, dispatch, onGameOver }: GameProps<RingTheBullTossState, RingTheBullTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="rithbuto-wrap">
        <div className="rithbuto-done">
          <h2>Round</h2>
          <div className="rithbuto-final">{Math.max(0, state.score)} pts</div>
          
          <div className="rithbuto-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="rithbuto-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="rithbuto-wrap">
      <div className="rithbuto-head">
        <span className="rithbuto-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="rithbuto-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="rithbuto-dice-row">
          {state.dice.map((d, i) => <div key={i} className="rithbuto-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="rithbuto-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="rithbuto-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="rithbuto-log">{line}</div>)}
      </div>
      <div className="rithbuto-actions">
        {state.phase === "rolling" && (
          <button className="rithbuto-btn primary" onClick={() => dispatch({ type: "roll" } as RingTheBullTossAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="rithbuto-btn alt" onClick={() => dispatch({ type: "next" } as RingTheBullTossAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
