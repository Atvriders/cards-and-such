import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MichiganNewmarketState, MichiganNewmarketAction, MichiganNewmarketSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function MichiganNewmarketGame({ state, dispatch, onGameOver }: GameProps<MichiganNewmarketState, MichiganNewmarketSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="michigan-newmarket-wrap mnm-shed"><div className="michigan-newmarket-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="michigan-newmarket-final">{state.score} pts</div></div></div>;
  return (
    <div className="michigan-newmarket-wrap mnm-shed">
      <div className="michigan-newmarket-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="michigan-newmarket-score">{state.score} pts</div>
      <div className="michigan-newmarket-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-michigan-newmarket-primary" className="michigan-newmarket-btn" onClick={() => dispatch({ type: "play" } as MichiganNewmarketAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="michigan-newmarket-result">{state.result}</div>
        <button data-testid="hint-target-michigan-newmarket-next" className="michigan-newmarket-btn alt" onClick={() => dispatch({ type: "next" } as MichiganNewmarketAction)}>Next</button>
      </>}
    </div>
  );
}
