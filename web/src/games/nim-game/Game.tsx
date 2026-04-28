import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NimGameState, NimGameAction, NimGameSettings } from "./state.js";
import { isTerminal, START_STICKS } from "./state.js";
import "./Game.css";

export function NimGameGame({ state, dispatch, onGameOver }: GameProps<NimGameState, NimGameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : "CPU wins.";
    return <div className="nim-wrap"><div className="nim-done"><h2>{msg}</h2><div className="nim-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="nim-wrap">
      <div className="nim-info">Take 1-3 sticks. Don't take the last one. (Started: {START_STICKS})</div>
      <div className="nim-score">Sticks: {state.sticks}</div>
      <div className="nim-sticks">{Array.from({ length: state.sticks }).map((_, i) => <span key={i} className="nim-stick">|</span>)}</div>
      <div className="nim-row">
        {[1,2,3].map(n => <button key={n} className="nim-btn" disabled={n > state.sticks} onClick={() => dispatch({ type:"take", n } as NimGameAction)}>Take {n}</button>)}
      </div>
    </div>
  );
}
