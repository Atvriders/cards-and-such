import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTwinBetState, DiceTwinBetAction, DiceTwinBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PIPS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceTwinBet({ state, dispatch, onGameOver }: GameProps<DiceTwinBetState, DiceTwinBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="dice-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const isReveal = state.phase === "reveal";

  return (
    <div className="dice-wrap">
      <div className="dice-header"><span>Round {state.round}/{state.maxRounds}</span><span>{state.score} pts</span></div>
      {isReveal && state.dice && (
        <div className="dice-row">
          <span className={`die${state.dice[0] === state.dice[1] ? " die-double" : ""}`}>{PIPS[state.dice[0]]}</span>
          <span className={`die${state.dice[0] === state.dice[1] ? " die-double" : ""}`}>{PIPS[state.dice[1]]}</span>
        </div>
      )}
      {!isReveal && <p style={{ fontSize: "1rem", color: "#555" }}>Will the two dice show the same number?</p>}
      {isReveal && (
        <p className="dice-msg" style={{ color: state.result === "correct" ? "#27ae60" : "#e74c3c" }}>
          {state.dice![0] === state.dice![1] ? "Twins!" : "No match."} {state.result === "correct" ? `+${state.dice![0] === state.dice![1] ? 50 : 15} pts` : "No points"}
        </p>
      )}
      {!isReveal && (
        <div className="dice-actions">
          <button className="dice-btn bank" onClick={() => dispatch({ type: "bet", call: "match" } as DiceTwinBetAction)}>MATCH! (+50)</button>
          <button className="dice-btn" onClick={() => dispatch({ type: "bet", call: "nomatch" } as DiceTwinBetAction)}>No Match (+15)</button>
        </div>
      )}
      {isReveal && <button className="dice-btn" onClick={() => dispatch({ type: "next" } as DiceTwinBetAction)}>Next</button>}
    </div>
  );
}
