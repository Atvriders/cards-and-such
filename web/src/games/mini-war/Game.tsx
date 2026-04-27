import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniWarState, MiniWarAction, MiniWarSettings } from "./state.js";
import { isTerminal, TOTAL_BATTLES, cardName, isRed, rankOf } from "./state.js";
import "./Game.css";
export function MiniWarGame({ state, dispatch, onGameOver }: GameProps<MiniWarState, MiniWarSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses} T: {state.ties}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Battle {state.battle} / {TOTAL_BATTLES} — W{state.wins} L{state.losses} T{state.ties}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.you !== null && state.cpu !== null && (
        <div className="dm-row">
          <div><div style={{ fontSize:"0.85rem", color:"#888" }}>You</div><div className={`dm-card ${isRed(state.you) ? "red" : "black"}`}>{cardName(state.you)}</div></div>
          <div><div style={{ fontSize:"0.85rem", color:"#888" }}>CPU</div><div className={`dm-card ${isRed(state.cpu) ? "red" : "black"}`}>{cardName(state.cpu)}</div></div>
        </div>
      )}
      {state.phase === "ready" && <button className="dm-btn" onClick={() => dispatch({ type:"battle" } as MiniWarAction)}>Battle!</button>}
      {state.phase === "result" && state.you !== null && state.cpu !== null && <>
        <div className="dm-result">{rankOf(state.you) > rankOf(state.cpu) ? "You win! +10" : rankOf(state.you) < rankOf(state.cpu) ? "CPU wins" : "Tie +3"}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as MiniWarAction)}>Next</button>
      </>}
    </div>
  );
}
