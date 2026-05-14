import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarromState, CarromAction, CarromSettings } from "./state.js";
import { isTerminal, BOARD_SIZE, POCKET_RADIUS, PIECE_RADIUS, pockets } from "./state.js";
import "./Game.css";

const POCKETS = pockets();

export function CarromFullGame({ state, dispatch, onGameOver }: GameProps<CarromState, CarromSettings>): JSX.Element {
  const endedRef = useRef(false);
  const [angle, setAngle] = useState<number>(270);
  const [power, setPower] = useState<number>(5);

  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-trigger CPU shot
  useEffect(() => {
    if (state.phase === "cpu") {
      const id = setTimeout(() => {
        dispatch({ type: "cpuShoot" } as CarromAction);
      }, 700);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.phase, dispatch]);

  const t = isTerminal(state);
  const showAim = state.phase === "aim" && state.turn === "P";

  return (
    <div className="cf-wrap fade-in">
      <h3>Carrom (Full)</h3>
      <div className="cf-status pulse">
        <span className="cf-tag cf-tag-white">You (White): {state.whitePocketed}/9</span>
        <span className="cf-tag cf-tag-black">CPU (Black): {state.blackPocketed}/9</span>
        <span className={`cf-tag ${state.queenCovered ? "cf-tag-queen-locked" : "cf-tag-queen"}`}>
          Queen: {state.queenCovered
            ? `covered by ${state.queenHolder === "P" ? "You" : "CPU"}`
            : state.queenHolder
              ? `pocketed by ${state.queenHolder === "P" ? "You" : "CPU"} — needs cover`
              : "on board"}
        </span>
      </div>

      <div className="cf-board-wrap" data-testid="carrom-board">
        <svg
          viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
          className="cf-board"
          role="img"
          aria-label="Carrom board"
        >
          <rect x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} className="cf-board-bg" />
          {/* Center decoration */}
          <circle cx={BOARD_SIZE / 2} cy={BOARD_SIZE / 2} r={PIECE_RADIUS * 5} className="cf-center" />
          <circle cx={BOARD_SIZE / 2} cy={BOARD_SIZE / 2} r={PIECE_RADIUS * 2.5} className="cf-center-small" />

          {/* Pockets */}
          {POCKETS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={POCKET_RADIUS} className="cf-pocket" />
          ))}

          {/* Pieces */}
          {state.pieces.filter(pp => !pp.pocketed).map(pp => (
            <circle
              key={pp.id}
              cx={pp.x}
              cy={pp.y}
              r={PIECE_RADIUS}
              className={`cf-piece cf-piece-${pp.color}`}
            />
          ))}

          {/* Aim line */}
          {showAim ? (() => {
            const cx = BOARD_SIZE / 2;
            const cy = BOARD_SIZE - 40;
            const len = (power / 10) * BOARD_SIZE * 0.55;
            const rad = (angle * Math.PI) / 180;
            const tx = cx + Math.cos(rad) * len;
            const ty = cy + Math.sin(rad) * len;
            return (
              <g>
                <circle cx={cx} cy={cy} r={PIECE_RADIUS} className="cf-striker" />
                <line x1={cx} y1={cy} x2={tx} y2={ty} className="cf-aim-line" />
              </g>
            );
          })() : null}
        </svg>
      </div>

      {state.lastShot ? (
        <div className={`cf-last ${state.lastShot.foul ? "cf-last-foul" : ""}`}>
          <strong>{state.lastShot.by === "P" ? "You" : "CPU"}:</strong> {state.lastShot.message}
        </div>
      ) : null}

      {showAim ? (
        <div className="cf-controls" data-testid="cf-controls">
          <label className="cf-control">
            Angle: {Math.round(angle)}°
            <input
              type="range"
              min={180}
              max={360}
              step={1}
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value, 10))}
              aria-label="Shot angle in degrees"
              title="Shot angle"
              data-testid="cf-angle"
            />
          </label>
          <label className="cf-control">
            Power: {power}
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={power}
              onChange={(e) => setPower(parseInt(e.target.value, 10))}
              aria-label="Shot power 1 to 10"
              title="Shot power"
              data-testid="cf-power"
            />
          </label>
          <button
            type="button"
            className="cf-shoot"
            onClick={() => dispatch({ type: "shoot", angle, power } as CarromAction)}
            title="Flick the striker"
            data-testid="cf-shoot"
          >
            Flick striker
          </button>
        </div>
      ) : null}

      {state.phase === "cpu" ? (
        <div className="cf-cpu-turn">CPU is taking a shot…</div>
      ) : null}

      {t ? (
        <div className="cf-done bounce-in">
          <h2>{state.result === "P" ? "You win!" : state.result === "C" ? "CPU wins" : "Draw"}</h2>
          <div className="cf-final">Final score: {t.score}</div>
          <button
            type="button"
            className="cf-reset"
            onClick={() => dispatch({ type: "reset" } as CarromAction)}
            title="Play another round"
          >
            New game
          </button>
        </div>
      ) : null}
    </div>
  );
}
