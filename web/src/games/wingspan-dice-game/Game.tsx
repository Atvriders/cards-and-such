import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WingspanDiceGameState, WingspanDiceGameAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type WingspanDiceGameSettingsT = WingspanDiceGameState["" extends "" ? "rngSeed" : never];

export function WingspanDiceGame({ state, dispatch, onGameOver }: GameProps<WingspanDiceGameState, { rounds: "10" }>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="g-wrap">
      <h2>Game Over</h2>
      <p className="g-final">Final Score: {state.score}</p>
    </div>
  );

  return (
    <div className="g-wrap">
      <div className="g-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="g-score">Score: {state.score}</span>
      </div>
      {state.lastRoll.length > 0 && (
        <div className="g-dice">
          {state.lastRoll.map((d, i) => <span key={i} className="g-die">{d}</span>)}
        </div>
      )}
      {state.phase === "rolled" && <div className="g-gain">+{state.lastGain} this roll</div>}
      <div className="g-controls">
        {state.phase === "ready" && <button className="g-btn" onClick={() => dispatch({ type: "roll" } as WingspanDiceGameAction)}>Roll 5 Dice</button>}
        {state.phase === "rolled" && <button className="g-btn" onClick={() => dispatch({ type: "next" } as WingspanDiceGameAction)}>Next Round</button>}
      </div>
    </div>
  );
}
