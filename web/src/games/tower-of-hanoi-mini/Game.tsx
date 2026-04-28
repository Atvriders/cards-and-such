import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoiMiniState, TowerOfHanoiMiniAction, TowerOfHanoiMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TowerOfHanoiMiniGame({ state, dispatch, onGameOver }: GameProps<TowerOfHanoiMiniState, TowerOfHanoiMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="hanoi-wrap">
        <div className="hanoi-done">
          <h2>Tower Built!</h2>
          <p>Moves: {state.moves} (optimal: {(1 << state.discs) - 1})</p>
          <p className="hanoi-final">{t?.score} pts</p>
          <button className="hanoi-btn" onClick={() => dispatch({ type: "reset" } as TowerOfHanoiMiniAction)}>Play Again</button>
        </div>
      </div>
    );
  }
  return (
    <div className="hanoi-wrap">
      <div className="hanoi-info">Move all discs to right peg. Smaller on bigger only. Moves: {state.moves}</div>
      <div className="hanoi-board">
        {state.pegs.map((peg, i) => (
          <div key={i} className={`hanoi-peg ${state.selected === i ? "sel" : ""}`} onClick={() => dispatch({ type: "tap", peg: i } as TowerOfHanoiMiniAction)}>
            <div className="hanoi-rod" />
            <div className="hanoi-base" />
            <div className="hanoi-discs">
              {peg.map((d, j) => (
                <div key={j} className="hanoi-disc" style={{ width: `${20 + d * 18}px` }}>{d}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
