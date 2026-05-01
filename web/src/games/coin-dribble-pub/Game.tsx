import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoinDribblePubState, CoinDribblePubAction, CoinDribblePubSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CoinDribblePubGame({ state, dispatch, onGameOver }: GameProps<CoinDribblePubState, CoinDribblePubSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="codrpu-wrap">
        <div className="codrpu-done">
          <h2>Round</h2>
          <div className="codrpu-final">{Math.max(0, state.score)} pts</div>
          
          <div className="codrpu-history">
            {state.log.slice(-8).map((line, i) => <div key={i} className="codrpu-log">{line}</div>)}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="codrpu-wrap">
      <div className="codrpu-head">
        <span className="codrpu-round">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="codrpu-score">{state.score} pts</span>
      </div>
      
      {state.dice && (
        <div className="codrpu-dice-row">
          {state.dice.map((d, i) => <div key={i} className="codrpu-die">{d}</div>)}
        </div>
      )}
      {state.lastPts !== 0 && state.phase === "rolled" && (
        <div className="codrpu-result">{state.lastPts > 0 ? "+" : ""}{state.lastPts}</div>
      )}
      <div className="codrpu-log-strip">
        {state.log.slice(-3).map((line, i) => <div key={i} className="codrpu-log">{line}</div>)}
      </div>
      <div className="codrpu-actions">
        {state.phase === "rolling" && (
          <button className="codrpu-btn primary" onClick={() => dispatch({ type: "roll" } as CoinDribblePubAction)}>Roll</button>
        )}
        {state.phase === "rolled" && (
          <button className="codrpu-btn alt" onClick={() => dispatch({ type: "next" } as CoinDribblePubAction)}>Next</button>
        )}
      </div>
    </div>
  );
}
