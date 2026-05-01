import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DartsCricketClassicState, DartsCricketClassicAction, DartsCricketClassicSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DartsCricketClassicGame({ state, dispatch, onGameOver }: GameProps<DartsCricketClassicState, DartsCricketClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dacrcl-wrap">
        <div className="dacrcl-done">
          <h2>Round</h2>
          <div className="dacrcl-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dacrcl-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dacrcl-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dacrcl-wrap">
      <div className="dacrcl-head">
        <span className="dacrcl-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dacrcl-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dacrcl-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dacrcl-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dacrcl-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dacrcl-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dacrcl-log">{line}</div>)}
      </div>
      <div className="dacrcl-actions">
        {state.phase === "rolling" && (
          <button className="dacrcl-btn primary" onClick={() => dispatch({ type: "roll" } as DartsCricketClassicAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dacrcl-btn alt" onClick={() => dispatch({ type: "next" } as DartsCricketClassicAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
