import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardLighthouseState, CardLighthouseAction, CardLighthouseSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const SUIT_NAMES = ["Spades","Hearts","Diamonds","Clubs"];
export function CardLighthouseGame({ state, dispatch, onGameOver }: GameProps<CardLighthouseState, CardLighthouseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-hint">Card Lighthouse</div>
      <div className="cm-target">Target suit: {SUIT_NAMES[state.target]}</div>
      <div className="cm-row">
        {state.cards.map((c, i) => (
          <button key={i}
            className={`cm-card ${isRed(c) ? "red" : "black"} ${state.picked === c ? "picked" : ""}`}
            disabled={state.phase !== "picking"}
            onClick={() => dispatch({ type:"pick", index:i } as CardLighthouseAction)}>{cardName(c)}</button>
        ))}
      </div>
      {state.phase === "scored" && (
        <>
          <div className="cm-result">Picked: {cardName(state.picked!)} — {state.lastPts > 0 ? `+${state.lastPts}` : "0"}</div>
          <button data-testid="hint-target-card-lighthouse-primary" className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardLighthouseAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
