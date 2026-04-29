import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevensFanTanState, SevensFanTanAction, SevensFanTanSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function SevensFanTanGame({ state, dispatch, onGameOver }: GameProps<SevensFanTanState, SevensFanTanSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sevens-fan-tan-wrap"><div className="sevens-fan-tan-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="sevens-fan-tan-final">{state.score} pts</div></div></div>;
  return (
    <div className="sevens-fan-tan-wrap">
      <div className="sevens-fan-tan-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="sevens-fan-tan-score">{state.score} pts</div>
      <div className="sevens-fan-tan-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="sevens-fan-tan-btn" onClick={() => dispatch({ type: "play" } as SevensFanTanAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="sevens-fan-tan-result">{state.result}</div>
        <button className="sevens-fan-tan-btn alt" onClick={() => dispatch({ type: "next" } as SevensFanTanAction)}>Next</button>
      </>}
    </div>
  );
}
