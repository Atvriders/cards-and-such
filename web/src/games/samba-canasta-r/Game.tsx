import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SambaCanastaRState, SambaCanastaRAction, SambaCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function SambaCanastaRGame({ state, dispatch, onGameOver }: GameProps<SambaCanastaRState, SambaCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="smbr-wrap"><div className="smbr-done"><h2>Done!</h2><div className="smbr-final">{state.score} pts</div></div></div>;
  return (
    <div className="smbr-wrap">
      <div className="smbr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="smbr-score">{state.score} pts</div>
      <div className="smbr-row">{state.hand.map((c, i) => <div key={i} className={`smbr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-samba-canasta-r-play" className="smbr-btn" onClick={() => dispatch({ type: "score" } as SambaCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="smbr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-samba-canasta-r-next" className="smbr-btn alt" onClick={() => dispatch({ type: "next" } as SambaCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
