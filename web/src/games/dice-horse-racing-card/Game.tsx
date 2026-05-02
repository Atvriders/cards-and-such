import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHorseRacingCardState, DiceHorseRacingCardAction, DiceHorseRacingCardSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceHorseRacingCardGame({ state, dispatch, onGameOver }: GameProps<DiceHorseRacingCardState, DiceHorseRacingCardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="dihoraca-wrap">
        <div className="dihoraca-done">
          <h2>Lap</h2>
          <div className="dihoraca-final">{Math.max(0, state.score)} pts</div>
          
          <div className="dihoraca-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="dihoraca-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dihoraca-wrap">
      <div className="dihoraca-head">
        <span className="dihoraca-round">Lap {state.round} / {TOTAL_ROUNDS}</span>
        <span className="dihoraca-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="dihoraca-dice-row">
          {state.dice.map((d, i) => <div key={i} className="dihoraca-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="dihoraca-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="dihoraca-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="dihoraca-log">{line}</div>)}
      </div>
      <div className="dihoraca-actions">
        {state.phase === "rolling" && (
          <button className="dihoraca-btn primary" data-testid="hint-target-dice-horse-racing-card-roll" onClick={() => dispatch({ type: "roll" } as DiceHorseRacingCardAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="dihoraca-btn alt" data-testid="hint-target-dice-horse-racing-card-next" onClick={() => dispatch({ type: "next" } as DiceHorseRacingCardAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
