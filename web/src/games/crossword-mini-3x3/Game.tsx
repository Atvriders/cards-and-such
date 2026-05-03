import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrosswordMini3x3State, CrosswordMini3x3Action, CrosswordMini3x3Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export function CrosswordMini3x3Game({ state, dispatch, onGameOver }: GameProps<CrosswordMini3x3State, CrosswordMini3x3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cw3-wrap"><div className="cw3-done"><h2>Solved!</h2><div>Moves: {state.moves}</div><div className="cw3-final">{t?.score} pts</div><button className="cw3-btn" onClick={() => dispatch({ type:"reset" } as CrosswordMini3x3Action)}>Play Again</button></div></div>;
  }
  return (
    <div className="cw3-wrap">
      <div className="cw3-header">Moves: {state.moves}</div>
      <div className="cw3-grid">
        {state.cells.map((c, i) => (
          <button data-testid={`hint-target-crossword-mini-3x3-answer-${i}`} key={i} className={`cw3-cell${state.selected === i ? " sel" : ""}`} onClick={() => dispatch({ type:"select", index:i } as CrosswordMini3x3Action)}>{c}</button>
        ))}
      </div>
      <div className="cw3-clues">
        <div><b>Across</b><ol>{state.acrossClues.map((c, i) => <li key={i}>{c}</li>)}</ol></div>
        <div><b>Down</b><ol>{state.downClues.map((c, i) => <li key={i}>{c}</li>)}</ol></div>
      </div>
      <div className="cw3-keys">
        {LETTERS.map(l => <button key={l} className="cw3-key" onClick={() => dispatch({ type:"input", letter: l } as CrosswordMini3x3Action)}>{l}</button>)}
      </div>
      <button className="cw3-btn" onClick={() => dispatch({ type:"check" } as CrosswordMini3x3Action)}>Check</button>
    </div>
  );
}
