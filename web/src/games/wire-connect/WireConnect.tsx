import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WireConnectState, WireConnectSettings, WireConnectAction } from "./state.js";
import { isTerminal, getEffectiveConns } from "./state.js";
import "./WireConnect.css";

const WIRE_COLOR = "#f1c40f";
const WIRE_LIT = "#2ecc71";
const W = 64;
const HALF = W / 2;
const THICK = 8;

function WireSvg({ north, east, south, west, lit }: {
  north: boolean; east: boolean; south: boolean; west: boolean; lit: boolean;
}) {
  const color = lit ? WIRE_LIT : WIRE_COLOR;
  const paths: string[] = [];
  if (north) paths.push(`M${HALF} ${HALF} L${HALF} 0`);
  if (east) paths.push(`M${HALF} ${HALF} L${W} ${HALF}`);
  if (south) paths.push(`M${HALF} ${HALF} L${HALF} ${W}`);
  if (west) paths.push(`M${HALF} ${HALF} L0 ${HALF}`);
  return (
    <svg viewBox={`0 0 ${W} ${W}`}>
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={THICK} strokeLinecap="round" fill="none" />
      ))}
      <circle cx={HALF} cy={HALF} r={THICK / 2} fill={color} />
    </svg>
  );
}

export function WireConnect({
  state,
  dispatch,
  onGameOver,
}: GameProps<WireConnectState, WireConnectSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="wire-connect">
      <div className="wire-connect-info">
        <span>Rotations: {state.moves}</span>
        <span>Click tiles to rotate wires</span>
      </div>

      <div className={`wire-connect-status${state.won ? " win" : ""}`}>
        {state.won ? "All wires connected! Puzzle solved!" : "Rotate tiles to connect all wires to the source"}
      </div>

      <div
        className="wire-connect-grid"
        style={{ gridTemplateColumns: `repeat(${state.size}, 64px)` }}
      >
        {state.tiles.map((tile, i) => {
          const [n, e, s, w] = getEffectiveConns(tile);
          const isSource = i === state.sourceIndex;
          return (
            <div
              key={i}
              className={`wire-tile ${isSource ? "source" : ""} ${state.won ? "lit" : ""} ${tile.fixed ? "fixed" : ""}`}
              onClick={() => {
                if (!tile.fixed && !state.won) {
                  dispatch({ type: "rotate", index: i } as WireConnectAction);
                }
              }}
              style={{ transform: `rotate(0deg)` }}
              aria-label={`tile ${i}`}
            >
              <WireSvg north={n} east={e} south={s} west={w} lit={state.won || isSource} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
