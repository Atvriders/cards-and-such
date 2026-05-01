import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBaseballHighlightsState, DiceBaseballHighlightsAction, DiceBaseballHighlightsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBaseballHighlightsGame({ state, dispatch, onGameOver }: GameProps<DiceBaseballHighlightsState, DiceBaseballHighlightsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dibahi-wrap">
        <div className="dibahi-done">
          <h2>Inning</h2>
          <div className="dibahi-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dibahi-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dibahi-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dibahi-wrap">
      <div className="dibahi-head">
        <span className="dibahi-round">Inning {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dibahi-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dibahi-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dibahi-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dibahi-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dibahi-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dibahi-log">{line}</div>)}
      </div>
      <div className="dibahi-actions">
        {state.phase === "rolling" && (
          <button className="dibahi-btn primary" onClick={() => dispatch({ type: "roll" } as DiceBaseballHighlightsAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dibahi-btn alt" onClick={() => dispatch({ type: "next" } as DiceBaseballHighlightsAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
