import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WelcomeToDungeonState, WelcomeToDungeonAction, WelcomeToDungeonSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, DECK } from "./state.js";
import "./Game.css";
export function WelcomeToDungeonGame({ state, dispatch, onGameOver }: GameProps<WelcomeToDungeonState, WelcomeToDungeonSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="wtd-wrap"><div className="wtd-done"><h2>Done!</h2><div className="wtd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="wtd-wrap">
      <div className="wtd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="wtd-score">{state.score} pts</div>
      {state.you.length > 0 && (
        <>
          <div className="wtd-label">You</div>
          <div className="wtd-row">{state.you.map((i, k) => <div key={k} className="wtd-card you">{DECK[i]?.name} ({DECK[i]?.value})</div>)}</div>
          <div className="wtd-label">Foe</div>
          <div className="wtd-row">{state.foe.map((i, k) => <div key={k} className="wtd-card foe">{DECK[i]?.name} ({DECK[i]?.value})</div>)}</div>
        </>
      )}
      {state.phase === "drawing" && (
        <button className="wtd-btn" onClick={() => dispatch({ type:"draw" } as WelcomeToDungeonAction)}>Draw</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="wtd-result">+{state.lastPts} pts</div>
          <button className="wtd-btn alt" onClick={() => dispatch({ type:"next" } as WelcomeToDungeonAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
