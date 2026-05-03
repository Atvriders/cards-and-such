import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveCardStudClassicState, FiveCardStudClassicAction } from "./state.js";
import { isTerminal, cardName, isRed } from "./state.js";
import "./Game.css";

export function FiveCardStudClassicGame({ state, dispatch, onGameOver }: GameProps<FiveCardStudClassicState, { rounds: "10" }>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="g-wrap thm5StudCl"><h2>Game Over</h2><p className="g-final">Final Score: {state.score}</p></div>
  );

  return (
    <div className="g-wrap thm5StudCl">
      <div className="g-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="g-score">Score: {state.score}</span>
      </div>
      {state.hand.length > 0 && (
        <div className="g-dice">
          {state.hand.map((c, i) => <span key={i} className={"g-card " + (isRed(c) ? "red" : "")}>{cardName(c)}</span>)}
        </div>
      )}
      {state.phase === "dealt" && <div className="g-gain">+{state.lastGain} this hand</div>}
      <div className="g-controls">
        {state.phase === "ready" && <button data-testid="hint-target-five-card-stud-classic-deal" className="g-btn" onClick={() => dispatch({ type: "deal" } as FiveCardStudClassicAction)}>Deal Hand</button>}
        {state.phase === "dealt" && <button data-testid="hint-target-five-card-stud-classic-next" className="g-btn" onClick={() => dispatch({ type: "next" } as FiveCardStudClassicAction)}>Next Round</button>}
      </div>
    </div>
  );
}
