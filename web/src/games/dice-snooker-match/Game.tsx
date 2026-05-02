import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSnookerMatchState, DiceSnookerMatchAction, DiceSnookerMatchSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceSnookerMatchGame({ state, dispatch, onGameOver }: GameProps<DiceSnookerMatchState, DiceSnookerMatchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="disnma-wrap">
        <div className="disnma-done">
          <h2>Shot</h2>
          <div className="disnma-final">{Math.max(0, state.score)} pts</div>
          
          <div className="disnma-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="disnma-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="disnma-wrap">
      <div className="disnma-head">
        <span className="disnma-round">Shot {state.round} / {TOTAL_ROUNDS}</span>
        <span className="disnma-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="disnma-dice-row">
          {state.dice.map((d, i) => <div key={i} className="disnma-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="disnma-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="disnma-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="disnma-log">{line}</div>)}
      </div>
      <div className="disnma-actions">
        {state.phase === "rolling" && (
          <button className="disnma-btn primary" data-testid="hint-target-dice-snooker-match-roll" onClick={() => dispatch({ type: "roll" } as DiceSnookerMatchAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="disnma-btn alt" data-testid="hint-target-dice-snooker-match-next" onClick={() => dispatch({ type: "next" } as DiceSnookerMatchAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
