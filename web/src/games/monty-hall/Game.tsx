import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MontyHallState, MontyHallSettings } from "./state.js";
import { type MontyHallAction, isTerminal } from "./state.js";
import "./Game.css";

const DOOR_LABELS = ["Door 1", "Door 2", "Door 3"];

export function MontyHallGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<MontyHallState, MontyHallSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, initialPick, revealedDoor, finalPick, carDoor, won, rounds, wins, switched, stayWins, switchWins } = state;

  function doorClass(d: number): string {
    const parts: string[] = ["mh-door"];
    if (phase === "pick" || phase === "reveal") {
      if (d === initialPick) parts.push("door-picked");
    }
    if (phase === "reveal" || phase === "result") {
      if (d === revealedDoor) parts.push("door-goat");
    }
    if (phase === "result") {
      if (d === finalPick && won) parts.push("door-win");
      if (d === finalPick && !won) parts.push("door-lose");
      if (d === carDoor) parts.push("door-car");
    }
    return parts.join(" ");
  }

  function doorLabel(d: number): string {
    if (phase === "reveal" && d === revealedDoor) return "🐐 Goat!";
    if (phase === "result") {
      if (d === carDoor) return "🚗 Car!";
      return "🐐 Goat";
    }
    return "?";
  }

  return (
    <div className="monty-hall">
      <div className="mh-title">Monty Hall Problem</div>

      <div className="mh-phase-label">
        {phase === "pick" && "Step 1: Pick a door"}
        {phase === "reveal" && "Step 2: Monty reveals a goat — Switch or Stay?"}
        {phase === "result" && (won ? "You won the Car!" : "You got a Goat!")}
      </div>

      <div className="mh-doors">
        {[0, 1, 2].map((d) => (
          <div key={d} className={doorClass(d)}>
            <div className="mh-door-label">{DOOR_LABELS[d]}</div>
            <div className="mh-door-icon">{doorLabel(d)}</div>
            {phase === "pick" && (
              <button
                className="mh-pick-btn"
                onClick={() => dispatch({ type: "pickDoor", door: d } satisfies MontyHallAction)}
              >
                Pick
              </button>
            )}
          </div>
        ))}
      </div>

      {phase === "reveal" && (
        <div className="mh-decision">
          <div className="mh-decision-info">
            You picked <strong>{DOOR_LABELS[initialPick]!}</strong>. Monty opened{" "}
            <strong>{DOOR_LABELS[revealedDoor]!}</strong> (a goat). Do you switch?
          </div>
          <div className="mh-decision-btns">
            <button
              className="mh-btn switch"
              onClick={() => dispatch({ type: "decide", switchDoor: true } satisfies MontyHallAction)}
            >
              Switch!
            </button>
            <button
              className="mh-btn stay"
              onClick={() => dispatch({ type: "decide", switchDoor: false } satisfies MontyHallAction)}
            >
              Stay
            </button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="mh-result-row">
          <button
            className="mh-btn next"
            onClick={() => dispatch({ type: "next" } satisfies MontyHallAction)}
          >
            Play Again
          </button>
        </div>
      )}

      {rounds > 0 && (
        <div className="mh-stats">
          <div className="mh-stats-title">Statistics ({rounds} round{rounds !== 1 ? "s" : ""})</div>
          <div className="mh-stats-row">
            <span>Overall wins:</span><span>{wins}/{rounds} ({Math.round(wins / rounds * 100)}%)</span>
          </div>
          <div className="mh-stats-row">
            <span>Stay wins:</span><span>{stayWins}/{rounds - switched}</span>
          </div>
          <div className="mh-stats-row">
            <span>Switch wins:</span><span>{switchWins}/{switched}</span>
          </div>
        </div>
      )}
    </div>
  );
}
