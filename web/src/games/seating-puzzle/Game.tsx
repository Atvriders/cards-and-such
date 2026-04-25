import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeatingState, SeatingSettings } from "./state.js";
import { type SeatingAction, isTerminal } from "./state.js";
import "./Game.css";

export function SeatingPuzzleGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SeatingState, SeatingSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, assignment, selected, won } = state;
  const seated = new Set(assignment.filter(Boolean) as string[]);
  const unplaced = puzzle.people.filter((p) => !seated.has(p));

  return (
    <div className="seating">
      <div className="seating-title">{puzzle.title}</div>
      {won && <div className="seating-won">Solved! Score: {terminal?.score}</div>}

      <div className="seating-clues">
        <div className="seating-clues-title">Clues</div>
        <ul className="seating-clue-list">
          {puzzle.clues.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>

      <div className="seating-bench">
        <div className="seating-bench-title">
          {selected ? `Placing: ${selected} — click a seat` : "Click a person, then a seat"}
        </div>
        <div className="seating-people">
          {unplaced.map((p) => (
            <button
              key={p}
              className={`seating-person ${selected === p ? "selected" : ""}`}
              onClick={() => dispatch({ type: "selectPerson", person: selected === p ? null : p } satisfies SeatingAction)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="seating-seats">
        {Array.from({ length: puzzle.seats }, (_, i) => {
          const person = assignment[i];
          return (
            <div key={i} className="seating-seat-col">
              <div className="seating-seat-num">Seat {i + 1}</div>
              <button
                className={`seating-seat ${person ? "occupied" : "empty"} ${selected ? "droppable" : ""}`}
                onClick={() => {
                  if (selected) {
                    dispatch({ type: "placePerson", seat: i } satisfies SeatingAction);
                  } else if (person) {
                    dispatch({ type: "selectPerson", person } satisfies SeatingAction);
                  }
                }}
              >
                {person ?? "·"}
              </button>
              {person && !won && (
                <button
                  className="seating-remove-btn"
                  onClick={() => dispatch({ type: "removePerson", seat: i } satisfies SeatingAction)}
                  aria-label={`Remove ${person}`}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="seating-reset-btn"
        onClick={() => dispatch({ type: "reset" } satisfies SeatingAction)}
      >
        Reset
      </button>
    </div>
  );
}
