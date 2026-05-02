import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorClashState, ColorClashAction, ColorClashSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function ColorClashGame({ state, dispatch, onGameOver }: GameProps<ColorClashState, ColorClashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "predict" && (
        <div className="cm-row">
          <button data-testid="hint-target-color-clash-primary" className="cm-btn" style={{ background:"#c0392b" }} onClick={() => dispatch({ type:"predict", choice:"red" } as ColorClashAction)}>Red Wins</button>
          <button className="cm-btn alt" style={{ background:"#2c3e50" }} onClick={() => dispatch({ type:"predict", choice:"black" } as ColorClashAction)}>Black Wins</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">Red: {state.redCount}, Black: {5 - state.redCount} — {state.lastWin ? `+${state.bonus ? 50 : 30}` : "0"}{state.bonus ? " (sweep bonus!)" : ""}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as ColorClashAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
