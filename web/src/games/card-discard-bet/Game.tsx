import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardDiscardBetState, CardDiscardBetAction, CardDiscardBetSettings } from "./state.js";
import { cardLabel, isRed, isTerminal } from "./state.js";
import "./Game.css";

export function CardDiscardBet({ state, dispatch, onGameOver }: GameProps<CardDiscardBetState, CardDiscardBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="ctf-wrap"><div className="ctf-done"><h2>Done!</h2><p>Total: {state.coins} pts</p></div></div>;
  return (
    <div className="ctf-wrap">
      <div className="ctf-header"><span>Round {state.round} / {state.maxRounds}</span><span className="ctf-score">{state.coins} pts</span></div>
      <div className="ctf-cards">
        <div className={`ctf-card ${isRed(state.currentCard)?"red":""}`}>{cardLabel(state.currentCard)}</div>
        {state.phase === "result" && state.nextCard !== null && <div className={`ctf-card ${isRed(state.nextCard)?"red":""}`}>{cardLabel(state.nextCard)}</div>}
      </div>
      {state.phase === "result" && <p className="ctf-msg">{state.discarded ? `Discarded → next card: +${state.lastGain} pts (doubled!)` : `Kept → +${state.lastGain} pts`}</p>}
      <div className="ctf-actions">
        {state.phase === "decide" && <>
          <button data-testid="hint-target-card-discard-bet-keep" className="ctf-btn" onClick={() => dispatch({ type:"keep" } as CardDiscardBetAction)}>Keep (+rank pts)</button>
          <button data-testid="hint-target-card-discard-bet-discard" className="ctf-btn" style={{background:"#e74c3c"}} onClick={() => dispatch({ type:"discard" } as CardDiscardBetAction)}>Discard (2× next)</button>
        </>}
        {state.phase === "result" && <button data-testid="hint-target-card-discard-bet-next" className="ctf-btn" onClick={() => dispatch({ type:"next" } as CardDiscardBetAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
