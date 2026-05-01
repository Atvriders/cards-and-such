import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceKenoState, DiceKenoAction, DiceKenoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, PICK_COUNT } from "./state.js";
import "./Game.css";

export function DiceKenoGame({ state, dispatch, onGameOver }: GameProps<DiceKenoState, DiceKenoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-keno-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-keno-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Pick {PICK_COUNT} faces</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">
        {[1,2,3,4,5,6].map(face => (
          <div key={face} className="dm-pickbox">
            <div className="dm-pickface">{face}</div>
            <div className="dm-pickcount">x{state.picks[face-1]}</div>
            {state.phase === "picking" && (
              <div className="dm-row">
                <button className="dm-btn small" disabled={state.picksTotal >= PICK_COUNT} onClick={() => dispatch({ type:"pick", face } as DiceKenoAction)}>+</button>
                <button className="dm-btn small alt" disabled={(state.picks[face-1] || 0) <= 0} onClick={() => dispatch({ type:"unpick", face } as DiceKenoAction)}>-</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {state.rolls && (
        <div className="dm-row">
          {state.rolls.map((r, i) => <div key={i} className="dm-die">{r}</div>)}
        </div>
      )}
      {state.phase === "picking" && (
        <button className="dm-btn" disabled={state.picksTotal !== PICK_COUNT} onClick={() => dispatch({ type:"roll" } as DiceKenoAction)}>Roll Dice</button>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">Matches: {state.matches}/{PICK_COUNT} — +{state.lastPts}{state.jackpot ? " (JACKPOT!)" : ""}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceKenoAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
