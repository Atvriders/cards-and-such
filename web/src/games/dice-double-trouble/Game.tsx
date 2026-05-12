import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDoubleTroubleState, DiceDoubleTroubleAction, DiceDoubleTroubleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PIPS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceDoubleTrouble({ state, dispatch, onGameOver }: GameProps<DiceDoubleTroubleState, DiceDoubleTroubleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="dice-wrap"><h2>Game Over!</h2><p>Total Score: <strong>{state.totalScore}</strong></p></div>;
  }

  const isResult = state.phase === "result";

  return (
    <div className="dice-wrap fade-in">
      <div className="dice-header"><span>Round {state.round}/{state.maxRounds}</span><span>{state.totalScore} pts</span></div>
      {isResult && (
        <>
          <div className="dice-row">
            <span className={`die${state.isDouble ? " die-double" : ""}`}>{PIPS[state.dice[0]]}</span>
            <span className={`die${state.isDouble ? " die-double" : ""}`}>{PIPS[state.dice[1]]}</span>
          </div>
          {state.isDouble && state.rerollDice && (
            <>
              <p style={{ fontSize: "0.85rem", color: "#f39c12", fontWeight: 700 }}>Double! Roll again:</p>
              <div className="dice-row">
                <span className={`die${state.isDoubleDouble ? " die-double" : ""}`}>{PIPS[state.rerollDice[0]]}</span>
                <span className={`die${state.isDoubleDouble ? " die-double" : ""}`}>{PIPS[state.rerollDice[1]]}</span>
              </div>
            </>
          )}
          {state.isDoubleDouble && <p style={{ color: "#e74c3c", fontWeight: 900 }}>DOUBLE DOUBLE! +50 bonus!</p>}
          <p className="dice-msg" style={{ color: "#27ae60" }}>Round score: +{state.roundScore}</p>
          <button data-testid="hint-target-dice-double-trouble-next" className="dice-btn" onClick={() => dispatch({ type: "next" } as DiceDoubleTroubleAction)}>Next</button>
        </>
      )}
      {!isResult && (
        <>
          <p style={{ color: "#555", fontSize: "0.95rem" }}>Roll 2 dice. Doubles = free extra roll! Double-double = +50 bonus!</p>
          <button data-testid="hint-target-dice-double-trouble-roll" className="dice-btn bank" onClick={() => dispatch({ type: "roll" } as DiceDoubleTroubleAction)}>Roll!</button>
        </>
      )}
    </div>
  );
}
