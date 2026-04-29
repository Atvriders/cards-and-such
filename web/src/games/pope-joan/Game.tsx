import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { isTerminal, TOTAL_TURNS } from "./state.js";
import "./Game.css";

export function PubGame({ state, dispatch, onGameOver }: GameProps<PubState, PubSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  return (
    <div className="pb-wrap">
      <h3 className="pb-title">Pope Joan</h3>
      <div className="pb-stats">
        <div>Turn <b>{state.turn}/{TOTAL_TURNS}</b></div>
        <div>You <b>{state.myScore}</b></div>
        <div>CPU <b>{state.cpuScore}</b></div>
      </div>
      <div className="pb-board">
        <div className="pb-result">
          {state.phase === "ready" && <div>Ready to throw</div>}
          {state.phase === "thrown" && <div>You +{state.lastMine} • CPU +{state.lastCpu}</div>}
          {state.phase === "done" && <div className="pb-final">Final: You {state.myScore} • CPU {state.cpuScore}</div>}
        </div>
      </div>
      {state.phase === "ready" && <button className="pb-btn" onClick={() => dispatch({ type:"throw" } as PubAction)}>Throw</button>}
      {state.phase === "thrown" && <button className="pb-btn alt" onClick={() => dispatch({ type:"next" } as PubAction)}>Next</button>}
    </div>
  );
}
