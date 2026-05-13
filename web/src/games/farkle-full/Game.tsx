import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarkleFullState, FarkleFullAction, FarkleFullSettings, DieFace } from "./state.js";
import { isTerminal, scoreSelection } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

export function FarkleFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<FarkleFullState, FarkleFullSettings>): JSX.Element {
  const endedRef = useRef(false);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // CPU auto-step: when it's the CPU's turn, fire cpuStep on an interval so
  // we see the play unfold rather than running it all in one frame.
  useEffect(() => {
    if (state.phase === "gameOver") return;
    if (state.current !== 1) return;
    if (state.phase !== "cpuThinking" && state.phase !== "farkled") return;
    const id = setTimeout(() => {
      dispatch({ type: "cpuStep" } as FarkleFullAction);
    }, 650);
    return () => clearTimeout(id);
  }, [state, dispatch]);

  const target = parseInt(state.settings.target, 10);
  const terminal = isTerminal(state);

  const selectedValues = state.selected
    .map((i) => state.roll[i])
    .filter((v): v is DieFace => v !== undefined);
  const selectionScore = scoreSelection(selectedValues);
  const selectionValid = selectedValues.length > 0 && selectionScore > 0;

  const isHumanTurn = state.current === 0;

  return (
    <div className="ff-root fade-in">
      <div className="ff-scoreboard">
        <div className={`ff-player ${state.current === 0 ? "active" : ""}`}>
          <div className="ff-player-name">You</div>
          <div className="ff-player-score pulse">{state.scores[0]}</div>
        </div>
        <div className="ff-target">
          <div className="ff-target-label">Target</div>
          <div className="ff-target-value">{target}</div>
        </div>
        <div className={`ff-player ${state.current === 1 ? "active" : ""}`}>
          <div className="ff-player-name">CPU</div>
          <div className="ff-player-score pulse">{state.scores[1]}</div>
        </div>
      </div>

      <div className="ff-turnbar">
        <span className="ff-turn-label">
          {isHumanTurn ? "Your turn" : "CPU's turn"}
        </span>
        <span className="ff-turn-score" data-testid="ff-turn-score">
          Turn: {state.turnScore}
        </span>
        <span className="ff-dice-left">Dice left: {state.diceRemaining}</span>
      </div>

      <div className="ff-message">{state.message}</div>

      {state.setAside.length > 0 && (
        <div className="ff-aside-row">
          <div className="ff-aside-label">Set aside</div>
          <div className="ff-aside">
            {state.setAside.map((face, i) => (
              <Die key={`aside-${i}`} value={face} kept />
            ))}
          </div>
        </div>
      )}

      {state.roll.length > 0 && (
        <div className="ff-roll-row">
          <div className="ff-aside-label">
            Roll ({state.roll.length}){" "}
            {isHumanTurn && state.phase === "rolled" && state.selected.length > 0 && (
              <span className={selectionValid ? "ff-valid" : "ff-invalid"}>
                {selectionValid ? `+${selectionScore}` : "invalid selection"}
              </span>
            )}
          </div>
          <div className="ff-dice">
            {state.roll.map((face, i) => {
              const clickable = isHumanTurn && state.phase === "rolled";
              const dieProps = clickable
                ? {
                    value: face,
                    kept: state.selected.includes(i),
                    onClick: () =>
                      dispatch({ type: "toggleSelect", index: i } as FarkleFullAction),
                  }
                : { value: face, kept: state.selected.includes(i) };
              return (
                <span key={`roll-${i}`} data-testid={`ff-die-${i}`}>
                  <Die {...dieProps} />
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="ff-controls">
        {isHumanTurn && state.phase === "preRoll" && !terminal && (
          <button
            type="button"
            className="ff-btn ff-btn-primary"
            data-testid="ff-roll"
            onClick={() => dispatch({ type: "roll" } as FarkleFullAction)}
            title={`Roll ${state.diceRemaining} dice`}
          >
            Roll {state.diceRemaining} {state.diceRemaining === 1 ? "die" : "dice"}
          </button>
        )}

        {isHumanTurn && state.phase === "rolled" && (
          <button
            type="button"
            className="ff-btn"
            data-testid="ff-setaside"
            onClick={() => dispatch({ type: "setAside" } as FarkleFullAction)}
            disabled={!selectionValid}
            title="Lock the selected scoring dice and continue"
          >
            Set aside{selectionValid ? ` (+${selectionScore})` : ""}
          </button>
        )}

        {isHumanTurn && state.phase === "preRoll" && state.turnScore > 0 && !terminal && (
          <button
            type="button"
            className="ff-btn ff-btn-bank"
            data-testid="ff-bank"
            onClick={() => dispatch({ type: "bank" } as FarkleFullAction)}
            title={`Bank ${state.turnScore} points and end your turn`}
          >
            Bank {state.turnScore}
          </button>
        )}

        {isHumanTurn && state.phase === "farkled" && !terminal && (
          <button
            type="button"
            className="ff-btn"
            data-testid="ff-next"
            onClick={() => dispatch({ type: "nextTurn" } as FarkleFullAction)}
            title="End your turn and hand over to the CPU"
          >
            Next turn (CPU plays)
          </button>
        )}
      </div>

      {terminal && (
        <div
          className={`ff-banner bounce-in ${state.winner === 0 ? "win" : "lose"}`}
          data-testid="ff-banner"
        >
          {state.winner === 0
            ? `You win ${state.scores[0]} — ${state.scores[1]}!`
            : `CPU wins ${state.scores[1]} — ${state.scores[0]}.`}
        </div>
      )}

      <details className="ff-rules">
        <summary>Scoring quick reference</summary>
        <ul>
          <li>Single 1 = 100, single 5 = 50</li>
          <li>Three 1s = 1000; three of N (2-6) = 100xN</li>
          <li>Four/five/six of a kind: x2 / x4 / x8 the triple</li>
          <li>Straight 1-6 = 1500; three pairs = 1500; two triplets = 2500</li>
          <li>All 6 dice scored = roll all 6 again (hot dice)</li>
          <li>Roll with no scoring dice = FARKLE, turn score lost</li>
        </ul>
      </details>
    </div>
  );
}
