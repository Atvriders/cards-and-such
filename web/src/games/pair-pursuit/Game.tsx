import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PairPursuitState, PairPursuitAction, PairPursuitSettings } from "./state.js";
import { isTerminal, bestMatch, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PairPursuitGame({ state, dispatch, onGameOver }: GameProps<PairPursuitState, PairPursuitSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap pair-pursuit-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap pair-pursuit-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice.length > 0 && (
        <div className="dm-row">{state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}</div>
      )}
      {state.phase === "ready" && <button className="dm-btn" data-testid="hint-target-pair-pursuit-roll" onClick={() => dispatch({ type:"roll" } as PairPursuitAction)}>Roll 4</button>}
      {state.phase === "rolled" && (
        <>
          <div className="dm-result">{bestMatch(state.dice).label}</div>
          <button className="dm-btn alt" data-testid="hint-target-pair-pursuit-next" onClick={() => dispatch({ type:"next" } as PairPursuitAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
