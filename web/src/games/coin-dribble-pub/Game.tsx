import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoinDribbleState, CoinDribbleAction, CoinDribbleSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS, MAX_THROW } from "./state.js";
import "./Game.css";

export function CoinDribbleGame({ state, dispatch, onGameOver }: GameProps<CoinDribbleState, CoinDribbleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="pb-wrap">
      <h3 className="pb-title">Coin Dribble</h3>
      <div className="pb-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>Score <b>{state.score}</b></div>
        {state.lastPts > 0 && <div className="pb-pts">+{state.lastPts}!</div>}
      </div>
      <div className="pb-board">
        <div className="pb-target">
          <div className="pb-bullseye">{state.lastPts >= MAX_THROW ? "BULLSEYE!" : state.phase === "ready" ? "DRIBBLE" : state.lastPts > 0 ? "+" + state.lastPts : "MISS"}</div>
        </div>
      </div>
      {state.phase === "ready" && <button className="pb-btn" onClick={() => dispatch({ type: "throw" } as CoinDribbleAction)}>Dribble</button>}
      {state.phase === "thrown" && <button className="pb-btn alt" onClick={() => dispatch({ type: "next" } as CoinDribbleAction)}>Next</button>}
      {state.phase === "done" && <div className="pb-done"><h3>Final: {state.score} pts</h3></div>}
    </div>
  );
}
