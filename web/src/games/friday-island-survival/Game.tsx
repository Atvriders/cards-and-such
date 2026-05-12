import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FridayIslandSurvivalState, FridayIslandSurvivalAction, FridayIslandSurvivalSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, DECK } from "./state.js";
import "./Game.css";
export function FridayIslandSurvivalGame({ state, dispatch, onGameOver }: GameProps<FridayIslandSurvivalState, FridayIslandSurvivalSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done bounce-in"><h2>🏝️ Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap fade-in">
      <div className="cm-info">🏝️ Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score pulse">{state.score} pts</div>
      {state.you.length > 0 && (
        <>
          <div className="cm-label">You</div>
          <div className="cm-row">{state.you.map((i, k) => <div key={k} className="cm-card you">{DECK[i]?.name} ({DECK[i]?.value})</div>)}</div>
          <div className="cm-label">Foe</div>
          <div className="cm-row">{state.foe.map((i, k) => <div key={k} className="cm-card foe">{DECK[i]?.name} ({DECK[i]?.value})</div>)}</div>
        </>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-friday-island-survival-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as FridayIslandSurvivalAction)}>Draw</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">+{state.lastPts} pts</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as FridayIslandSurvivalAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
