import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlokusTrigonMiniState, BlokusTrigonMiniAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BlokusTrigonMini({ state, dispatch, onGameOver }: GameProps<BlokusTrigonMiniState, { mode: "easy" }>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover" && state.result) return (
    <div className="g-wrap">
      <h2>Game Over</h2>
      <p className="g-final">You: {state.result.player} — CPU: {state.result.cpu}</p>
      <p>{state.result.player > state.result.cpu ? "You win!" : state.result.player < state.result.cpu ? "CPU wins" : "Tie"}</p>
    </div>
  );

  return (
    <div className="g-wrap">
      <p>You are X. Click an empty cell.</p>
      <div className="g-grid">
        {state.board.map((c, i) => (
          <div
            key={i}
            className={"g-cell " + (c === "X" ? "x" : c === "O" ? "o" : "")}
            onClick={() => c === "" && dispatch({ type: "play", index: i } as BlokusTrigonMiniAction)}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
