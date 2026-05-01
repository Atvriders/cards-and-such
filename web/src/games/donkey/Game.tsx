import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DonkeyState, DonkeyAction, DonkeySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DonkeyGame({ state, dispatch, onGameOver }: GameProps<DonkeyState, DonkeySettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="donkey-wrap dk-shed"><div className="donkey-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="donkey-final">{state.score} pts</div></div></div>;
  return (
    <div className="donkey-wrap dk-shed">
      <div className="donkey-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="donkey-score">{state.score} pts</div>
      <div className="donkey-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="donkey-btn" onClick={() => dispatch({ type: "play" } as DonkeyAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="donkey-result">{state.result}</div>
        <button className="donkey-btn alt" onClick={() => dispatch({ type: "next" } as DonkeyAction)}>Next</button>
      </>}
    </div>
  );
}
