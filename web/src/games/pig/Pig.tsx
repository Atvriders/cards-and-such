import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PigState, PigAction } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Pig.css";

type PigSettings = PigState["settings"];

export function Pig({
  state,
  dispatch,
  onGameOver,
}: GameProps<PigState, PigSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const { scores, turn, turnScore, lastRoll, winner, botMessage, targetScore } = state;

  const humanProgress = Math.min(100, (scores[0] / targetScore) * 100);
  const botProgress = Math.min(100, (scores[1] / targetScore) * 100);

  const isHumanTurn = turn === 0 && winner === null;
  const canBank = isHumanTurn && turnScore > 0;
  const canRoll = isHumanTurn;

  function handleRoll() {
    dispatch({ type: "roll" } as PigAction);
  }

  function handleBank() {
    dispatch({ type: "bank" } as PigAction);
  }

  return (
    <div className="pig">
      <div className="pig-scoreboard">
        <span className="pig-human-score">
          You: {scores[0]}
          <span className="pig-target"> / {targetScore}</span>
        </span>
        <span className="pig-bot-score">
          Bot: {scores[1]}
          <span className="pig-target"> / {targetScore}</span>
        </span>
      </div>

      <div className="pig-progress">
        <div className="pig-progress-row">
          <span className="pig-progress-label">You</span>
          <div className="pig-progress-bar-bg">
            <div
              className="pig-progress-bar-fill"
              style={{ width: `${humanProgress}%` }}
            />
          </div>
        </div>
        <div className="pig-progress-row">
          <span className="pig-progress-label">Bot</span>
          <div className="pig-progress-bar-bg">
            <div
              className="pig-progress-bar-fill bot"
              style={{ width: `${botProgress}%` }}
            />
          </div>
        </div>
      </div>

      {winner === null && (
        <div className="pig-turn-info">
          {turn === 0
            ? <>Your turn — turn score: <span className="pig-turn-score">{turnScore}</span></>
            : "Bot's turn…"
          }
        </div>
      )}

      <div className="pig-die-area">
        {lastRoll !== null && (
          <Die value={lastRoll as 1 | 2 | 3 | 4 | 5 | 6} kept={false} />
        )}
      </div>

      {winner === 0 && (
        <div className="pig-message won">
          You win! Reached {scores[0]}!
        </div>
      )}

      {winner === 1 && (
        <div className="pig-message">
          Bot wins with {scores[1]}! You had {scores[0]}.
        </div>
      )}

      {winner === null && lastRoll === 1 && (
        <div className="pig-message">
          You rolled a 1! Turn lost.
        </div>
      )}

      {botMessage && winner !== 0 && (
        <div className="pig-message bot-msg">{botMessage}</div>
      )}

      {winner === null && (
        <div className="pig-controls">
          <button onClick={handleRoll} disabled={!canRoll}>
            Roll
          </button>
          <button className="bank-btn" onClick={handleBank} disabled={!canBank}>
            Bank {turnScore > 0 ? turnScore : ""}
          </button>
        </div>
      )}
    </div>
  );
}
