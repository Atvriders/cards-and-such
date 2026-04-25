import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBasketballState, DiceBasketballSettings } from "./state.js";
import type { DiceBasketballAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceBasketball({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceBasketballState, DiceBasketballSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.phase === "gameOver";
  const statusClass = isOver
    ? state.playerScore > state.aiScore ? " win" : state.playerScore < state.aiScore ? " lose" : ""
    : "";

  return (
    <div className="dice-basketball">
      <div className="dice-basketball-scoreboard">
        <span>You: {state.playerScore}</span>
        <span>P{state.period}/{state.totalPeriods}</span>
        <span>AI: {state.aiScore}</span>
      </div>

      <div className="dice-basketball-court">🏀</div>

      <div className="dice-basketball-last-play">{state.lastPlay}</div>

      {state.lastDice.length > 0 && (
        <div className="dice-basketball-dice">
          {state.lastDice.map((d, i) => <span key={i}>{DICE_FACES[d] ?? d}</span>)}
        </div>
      )}

      <div className={`dice-basketball-status${statusClass}`}>
        {isOver
          ? state.playerScore > state.aiScore ? "You win!" : state.playerScore < state.aiScore ? "AI wins!" : "Tie!"
          : "Choose your shot"}
      </div>

      <div className="dice-basketball-controls">
        {!isOver && (
          <>
            <button className="layup" onClick={() => dispatch({ type: "shoot", shotType: "layup" } as DiceBasketballAction)}>
              Layup (2pt, easy)
            </button>
            <button className="mid" onClick={() => dispatch({ type: "shoot", shotType: "midrange" } as DiceBasketballAction)}>
              Mid-Range (2pt)
            </button>
            <button className="three" onClick={() => dispatch({ type: "shoot", shotType: "three" } as DiceBasketballAction)}>
              3-Pointer (3pt, hard)
            </button>
            <button className="ft" onClick={() => dispatch({ type: "shoot", shotType: "freethrow" } as DiceBasketballAction)}>
              Free Throws (1-2pt)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
