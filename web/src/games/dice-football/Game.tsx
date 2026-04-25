import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFootballState, DiceFootballSettings } from "./state.js";
import type { DiceFootballAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceFootball({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceFootballState, DiceFootballSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.phase === "gameOver";
  const yourTurn = state.possession === "player" && !isOver;
  const ballPct = `${state.fieldPosition}%`;

  const statusClass = isOver
    ? state.playerScore > state.aiScore ? " win"
    : state.playerScore < state.aiScore ? " lose" : ""
    : "";

  return (
    <div className="dice-football">
      <div className="dice-football-scoreboard">
        <span>You: {state.playerScore}</span>
        <span>Q{state.quarter}/{state.totalQuarters}</span>
        <span>AI: {state.aiScore}</span>
      </div>

      <div className="dice-football-field">
        <div className="dice-football-yard-line">
          <div className="dice-football-ball" style={{ left: ballPct }} />
        </div>
      </div>

      <div className="dice-football-info">
        {!isOver && (
          <span>
            {state.possession === "player" ? "Your ball" : "AI ball"} — Down {state.down}, {state.yardsToGo} yds to go | Pos: {state.fieldPosition} yd line
          </span>
        )}
      </div>

      <div className="dice-football-last-play">{state.lastPlay}</div>

      {state.lastDice.length > 0 && (
        <div className="dice-football-dice">
          {state.lastDice.map((d, i) => (
            <span key={i}>{DICE_FACES[d] ?? d}</span>
          ))}
        </div>
      )}

      <div className={`dice-football-status${statusClass}`}>
        {isOver
          ? state.playerScore > state.aiScore ? "You win!"
          : state.playerScore < state.aiScore ? "AI wins!"
          : "Tie game!"
          : yourTurn ? "Your turn — call a play" : "AI is playing..."}
      </div>

      <div className="dice-football-controls">
        {!isOver && yourTurn && (
          <>
            <button
              className="run"
              onClick={() => dispatch({ type: "play", playType: "run" } as DiceFootballAction)}
            >
              Run
            </button>
            <button
              className="pass"
              onClick={() => dispatch({ type: "play", playType: "pass" } as DiceFootballAction)}
            >
              Pass
            </button>
            <button
              className="kick"
              onClick={() => dispatch({ type: "play", playType: "kick" } as DiceFootballAction)}
              disabled={state.fieldPosition < 30}
            >
              Field Goal {state.fieldPosition < 30 ? "(too far)" : ""}
            </button>
          </>
        )}
        {!isOver && !yourTurn && (
          <button
            className="pass"
            onClick={() => dispatch({ type: "play", playType: "run" } as DiceFootballAction)}
          >
            Continue (AI plays)
          </button>
        )}
      </div>
    </div>
  );
}
