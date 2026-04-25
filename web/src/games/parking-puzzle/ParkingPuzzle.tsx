import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParkingPuzzleState, ParkingPuzzleSettings, ParkingPuzzleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./ParkingPuzzle.css";

const CELL = 56;
const GAP = 2;
const PAD = 3;

function cellToPixel(idx: number): number {
  return PAD + idx * (CELL + GAP);
}

const CAR_COLORS = ["#3498db", "#2ecc71", "#9b59b6", "#f39c12", "#1abc9c", "#e67e22", "#34495e", "#16a085"];

export function ParkingPuzzle({
  state,
  dispatch,
  onGameOver,
}: GameProps<ParkingPuzzleState, ParkingPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const boardPx = PAD * 2 + state.size * CELL + (state.size - 1) * GAP;

  const targetCar = state.cars.find(c => c.isTarget)!;
  const exitY = cellToPixel(targetCar.row);

  function handleCarClick(carId: number) {
    if (state.won) return;
    dispatch({ type: "selectCar", carId } as ParkingPuzzleAction);
  }

  function handleMove(delta: number) {
    if (state.selectedCar === null || state.won) return;
    dispatch({ type: "moveCar", carId: state.selectedCar, delta } as ParkingPuzzleAction);
  }

  const selectedCarData = state.selectedCar !== null ? state.cars.find(c => c.id === state.selectedCar) : null;
  const isH = selectedCarData?.orientation === "H";

  return (
    <div className="parking-puzzle">
      <div className="parking-info">
        <span>Moves: {state.moves}</span>
        <span>Slide the red car to the exit →</span>
      </div>

      <div className={`parking-status${state.won ? " win" : ""}`}>
        {state.won ? "Red car escaped! Puzzle solved!" : "Select a car, then use the buttons to move it"}
      </div>

      <div className="parking-board-wrap">
        <div
          className="parking-board"
          style={{ width: boardPx, height: boardPx }}
        >
          {/* Background cells */}
          {Array.from({ length: state.size * state.size }, (_, i) => (
            <div key={i} className="parking-cell" />
          ))}

          {/* Cars */}
          {state.cars.map((car, idx) => {
            const carW = car.orientation === "H"
              ? car.length * CELL + (car.length - 1) * GAP
              : CELL;
            const carH = car.orientation === "V"
              ? car.length * CELL + (car.length - 1) * GAP
              : CELL;
            const carX = cellToPixel(car.col);
            const carY = cellToPixel(car.row);
            const color = car.isTarget ? "#e74c3c" : CAR_COLORS[(idx - 1) % CAR_COLORS.length]!;
            return (
              <div
                key={car.id}
                className={`parking-car ${car.isTarget ? "target" : "normal"} ${state.selectedCar === car.id ? "selected" : ""}`}
                style={{
                  position: "absolute",
                  left: carX,
                  top: carY,
                  width: carW,
                  height: carH,
                  background: color,
                  zIndex: state.selectedCar === car.id ? 5 : 2,
                }}
                onClick={() => handleCarClick(car.id)}
              >
                {car.isTarget ? "→" : ""}
              </div>
            );
          })}
        </div>

        {/* Exit arrow */}
        <div className="parking-exit" style={{ top: exitY, height: CELL, right: -24 }}>
          →
        </div>
      </div>

      {state.selectedCar !== null && (
        <div className="parking-controls">
          {isH ? (
            <>
              <button className="park-btn" onClick={() => handleMove(-1)} disabled={state.won}>◀ Left</button>
              <button className="park-btn" onClick={() => handleMove(1)} disabled={state.won}>Right ▶</button>
            </>
          ) : (
            <>
              <button className="park-btn" onClick={() => handleMove(-1)} disabled={state.won}>▲ Up</button>
              <button className="park-btn" onClick={() => handleMove(1)} disabled={state.won}>Down ▼</button>
            </>
          )}
        </div>
      )}

      <div className="parking-hint">
        {state.selectedCar === null
          ? "Click a car to select it"
          : `Moving ${selectedCarData?.isTarget ? "red target car" : `car ${state.selectedCar}`} ${isH ? "left/right" : "up/down"}`}
      </div>
    </div>
  );
}
