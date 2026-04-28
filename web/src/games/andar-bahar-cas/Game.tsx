import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AndarBaharCasState, AndarBaharCasAction, AndarBaharCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function AndarBaharCasGame({ state, dispatch, onGameOver }: GameProps<AndarBaharCasState, AndarBaharCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.joker !== null && <div className="dm-row"><div className={`dm-card ${isRed(state.joker) ? "red" : "black"}`}>{cardName(state.joker)}</div></div>}
      {state.phase === "bet" && <>
        <div className="dm-info">Choose where the match will appear:</div>
        <div className="dm-row">
          <button className="dm-btn" onClick={() => dispatch({ type: "bet", side: "andar" } as AndarBaharCasAction)}>Andar</button>
          <button className="dm-btn alt" onClick={() => dispatch({ type: "bet", side: "bahar" } as AndarBaharCasAction)}>Bahar</button>
        </div>
      </>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as AndarBaharCasAction)}>Next</button>
      </>}
    </div>
  );
}
