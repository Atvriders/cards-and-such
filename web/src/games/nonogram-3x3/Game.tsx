import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Nonogram3x3State, Nonogram3x3Action, Nonogram3x3Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function Nonogram3x3Game({ state, dispatch, onGameOver }: GameProps<Nonogram3x3State, Nonogram3x3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ng-wrap"><div className="ng-done"><h2>Picture Found!</h2><div>Moves: {state.moves}</div><div className="ng-final">{t?.score} pts</div><button className="ng-btn" onClick={() => dispatch({ type:"reset" } as Nonogram3x3Action)}>Play Again</button></div></div>;
  }
  return (
    <div className="ng-wrap">
      <div className="ng-header">Moves: {state.moves}</div>
      <div className="ng-board">
        <div className="ng-corner" />
        {state.colClues.map((c, i) => <div key={"c"+i} className="ng-clue">{c.join(",")}</div>)}
        {[0,1,2].map(r => (
          <>
            <div key={"r"+r} className="ng-clue">{state.rowClues[r]!.join(",")}</div>
            {[0,1,2].map(c => {
              const i = r*3+c;
              return <button key={i} className={`ng-cell${state.cells[i] ? " on" : ""}`} onClick={() => dispatch({ type:"toggle", index:i } as Nonogram3x3Action)} />;
            })}
          </>
        ))}
      </div>
      <button className="ng-btn" onClick={() => dispatch({ type:"check" } as Nonogram3x3Action)}>Check</button>
    </div>
  );
}
