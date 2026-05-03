import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BsCheatState, BsCheatAction, BsCheatSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, SCORE_WIN, SCORE_TIE, cardName, isRed, rankOf } from "./state.js";
import "./Game.css";
export function BsCheatGame({ state, dispatch, onGameOver }: GameProps<BsCheatState, BsCheatSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap bsc2-shed"><div className="dm-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses} T: {state.ties}</div><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap bsc2-shed">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses} T{state.ties}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.you !== null && state.cpu !== null && (
        <div className="dm-row">
          <div><div style={{ fontSize: "0.85rem", color: "#888" }}>You</div><div className={`dm-card ${isRed(state.you) ? "red" : "black"}`}>{cardName(state.you)}</div></div>
          <div><div style={{ fontSize: "0.85rem", color: "#888" }}>CPU</div><div className={`dm-card ${isRed(state.cpu) ? "red" : "black"}`}>{cardName(state.cpu)}</div></div>
        </div>
      )}
      {state.phase === "ready" && <button data-testid="hint-target-bs-cheat-primary" className="dm-btn" onClick={() => dispatch({ type: "play" } as BsCheatAction)}>Bluff!</button>}
      {state.phase === "result" && state.you !== null && state.cpu !== null && <>
        <div className="dm-result">{rankOf(state.you) > rankOf(state.cpu) ? `You win! +${SCORE_WIN}` : rankOf(state.you) < rankOf(state.cpu) ? "CPU wins" : `Tie +${SCORE_TIE}`}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as BsCheatAction)}>Next</button>
      </>}
    </div>
  );
}
