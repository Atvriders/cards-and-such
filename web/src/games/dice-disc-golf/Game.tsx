import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDiscGolfState, DiceDiscGolfAction, DiceDiscGolfSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceDiscGolfGame({ state, dispatch, onGameOver }: GameProps<DiceDiscGolfState, DiceDiscGolfSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="didigo-wrap">
        <div className="didigo-done">
          <h2>Hole</h2>
          <div className="didigo-final">{Math.max(0, state.score)} pts</div>
          
          <div className="didigo-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="didigo-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="didigo-wrap">
      <div className="didigo-head">
        <span className="didigo-round">Hole {state.round} / {TOTAL_ROUNDS}</span>
        <span className="didigo-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="didigo-dice-row">
          {state.dice.map((d, i) => <div key={i} className="didigo-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="didigo-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="didigo-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="didigo-log">{line}</div>)}
      </div>
      <div className="didigo-actions">
        {state.phase === "rolling" && (
          <button className="didigo-btn primary" data-testid="hint-target-dice-disc-golf-roll" onClick={() => dispatch({ type: "roll" } as DiceDiscGolfAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="didigo-btn alt" data-testid="hint-target-dice-disc-golf-next" onClick={() => dispatch({ type: "next" } as DiceDiscGolfAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
