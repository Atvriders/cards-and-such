import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GalaxiesState, GalaxiesSettings, GalaxiesAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Galaxies.css";

const GALAXY_COLORS = [
  "#e53935", "#8e24aa", "#1e88e5", "#00897b",
  "#f4511e", "#6d4c41", "#546e7a", "#43a047",
];

export function Galaxies({ state, dispatch, onGameOver }: GameProps<GalaxiesState, GalaxiesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, assignment, selected, won } = state;
  const { size, centers } = puzzle;

  // Build center map: cellIdx -> galaxy index
  const centerMap = new Map<number, number>();
  centers.forEach((c, i) => {
    centerMap.set(c.r * size + c.c, i);
  });

  return (
    <div className="galaxies">
      <div className="galaxies-title">Galaxies</div>
      <div className={`galaxies-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — select a galaxy color, then paint cells`}
      </div>

      <div className="galaxies-palette">
        {centers.map((_, gIdx) => (
          <button
            key={gIdx}
            className={selected === gIdx ? "active" : ""}
            style={{ backgroundColor: GALAXY_COLORS[gIdx % GALAXY_COLORS.length] }}
            onClick={() => dispatch({ type: "selectGalaxy", galaxyIdx: gIdx } satisfies GalaxiesAction)}
          >
            {gIdx + 1}
          </button>
        ))}
      </div>

      <div className="galaxies-grid" style={{ gridTemplateColumns: `repeat(${size}, 52px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const galaxyIdx = assignment[idx] ?? -1;
          const isCenter = centerMap.has(idx);
          const centerGalaxyIdx = centerMap.get(idx);
          const color = galaxyIdx >= 0 ? GALAXY_COLORS[galaxyIdx % GALAXY_COLORS.length] : undefined;
          const classes = ["gal-cell", galaxyIdx < 0 ? "unassigned" : "", isCenter ? "center" : ""].filter(Boolean).join(" ");

          return (
            <div
              key={idx}
              className={classes}
              style={{ backgroundColor: color ?? undefined }}
              onClick={() => !won && dispatch({ type: "paintCell", cellIdx: idx } satisfies GalaxiesAction)}
            >
              {isCenter ? "★" : ""}
              {isCenter && centerGalaxyIdx !== undefined ? ` ${centerGalaxyIdx + 1}` : ""}
            </div>
          );
        })}
      </div>

      <div className="galaxies-btns">
        <button onClick={() => dispatch({ type: "reset" } satisfies GalaxiesAction)}>Reset</button>
      </div>
    </div>
  );
}
