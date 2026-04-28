import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagicSquare3State, MagicSquare3Action, MagicSquare3Settings } from "./state.js";
import { isTerminal, TARGET } from "./state.js";
import "./Game.css";
export function MagicSquare3Game({ state, dispatch, onGameOver }: GameProps<MagicSquare3State, MagicSquare3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ms-wrap"><div className="ms-done"><h2>Magic!</h2><div>Moves: {state.moves}</div><div className="ms-final">{t?.score} pts</div><button className="ms-btn" onClick={() => dispatch({ type:"reset" } as MagicSquare3Action)}>Play Again</button></div></div>;
  }
  return (
    <div className="ms-wrap">
      <div className="ms-header">Sums must equal {TARGET} — Moves: {state.moves}</div>
      <div className="ms-grid">
        {state.cells.map((v, i) => (
          <button key={i} className={`ms-cell${v ? " filled" : ""}`} onClick={() => v ? dispatch({ type:"remove", index:i } as MagicSquare3Action) : dispatch({ type:"place", index:i } as MagicSquare3Action)}>{v || ""}</button>
        ))}
      </div>
      <div className="ms-pool">
        {state.pool.map(v => (
          <button key={v} className={`ms-pool-btn${state.selected === v ? " sel" : ""}`} onClick={() => dispatch({ type:"pick", value:v } as MagicSquare3Action)}>{v}</button>
        ))}
      </div>
    </div>
  );
}
