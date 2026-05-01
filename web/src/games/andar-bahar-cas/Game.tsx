import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AndarBaharCasState, AndarBaharCasAction, AndarBaharCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function AndarBaharCasGame({ state, dispatch, onGameOver }: GameProps<AndarBaharCasState, AndarBaharCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="abh-c-wrap"><div className="abh-c-done"><h2>Done!</h2><div className="abh-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="abh-c-wrap">
      <div className="abh-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="abh-c-score">{state.score} pts</div>
      {state.joker !== null && <div className="abh-c-row"><div className={`abh-c-card ${isRed(state.joker) ? "red" : "black"}`}>{cardName(state.joker)}</div></div>}
      {state.phase === "bet" && <>
        <div className="abh-c-info">Choose where the match will appear:</div>
        <div className="abh-c-row">
          <button className="abh-c-btn" onClick={() => dispatch({ type: "bet", side: "andar" } as AndarBaharCasAction)}>Andar</button>
          <button className="abh-c-btn alt" onClick={() => dispatch({ type: "bet", side: "bahar" } as AndarBaharCasAction)}>Bahar</button>
        </div>
      </>}
      {state.phase === "scored" && <>
        <div className="abh-c-result">{state.result}</div>
        <button className="abh-c-btn alt" onClick={() => dispatch({ type: "next" } as AndarBaharCasAction)}>Next</button>
      </>}
    </div>
  );
}
