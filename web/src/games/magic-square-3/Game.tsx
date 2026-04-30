import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagicSquare3State, MagicSquare3Action, MagicSquare3Settings } from "./state.js";
import { isTerminal, TARGET, rowsCols } from "./state.js";
import "./Game.css";

export function MagicSquare3Game({ state, dispatch, onGameOver }: GameProps<MagicSquare3State, MagicSquare3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ms3-wrap">
        <div className="ms3-banner">
          <h2 className="ms3-title">Magic!</h2>
          <div className="ms3-stat">Moves: <b>{state.moves}</b></div>
          <div className="ms3-final">{t?.score} pts</div>
          <button className="ms3-btn primary" onClick={() => dispatch({ type: "reset" } as MagicSquare3Action)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const { rows, cols, diags } = rowsCols(state.cells);
  const sumOf = (line: number[]) => line.reduce((a, b) => a + b, 0);
  const tag = (s: number, full: boolean) => {
    if (!full) return "ms3-sum";
    return `ms3-sum ${s === TARGET ? "ok" : "bad"}`;
  };
  const rowSums = rows.map((r) => ({ s: sumOf(r), full: r.every((v) => v !== 0) }));
  const colSums = cols.map((c) => ({ s: sumOf(c), full: c.every((v) => v !== 0) }));
  const diagSums = diags.map((d) => ({ s: sumOf(d), full: d.every((v) => v !== 0) }));

  return (
    <div className="ms3-wrap">
      <div className="ms3-info">Place 1–9 so every row, column & diagonal sums to {TARGET}.</div>
      <div className="ms3-stat">Moves: <b>{state.moves}</b></div>
      <div className="ms3-board">
        <div className="ms3-corner" />
        {colSums.map((cs, i) => (
          <div key={`csum${i}`} className={tag(cs.s, cs.full)}>{cs.s}</div>
        ))}
        <div className="ms3-corner small">{diagSums[1]!.s}</div>

        {[0, 1, 2].map((r) => {
          const rs = rowSums[r]!;
          const dr = r === 0 ? diagSums[0] : null;
          return (
            <>
              <div key={`rsum${r}`} className={tag(rs.s, rs.full)}>{rs.s}</div>
              {[0, 1, 2].map((c) => {
                const i = r * 3 + c;
                const v = state.cells[i] || 0;
                return (
                  <button
                    key={i}
                    className={`ms3-cell${v ? " filled" : ""}`}
                    onClick={() =>
                      v
                        ? dispatch({ type: "remove", index: i } as MagicSquare3Action)
                        : dispatch({ type: "place", index: i } as MagicSquare3Action)
                    }
                  >
                    {v ? <span className="ms3-num">{v}</span> : null}
                  </button>
                );
              })}
              {r === 0
                ? <div key={`drT`} className={tag(dr!.s, dr!.full)}>{dr!.s}</div>
                : <div key={`pad${r}`} className="ms3-corner" />}
            </>
          );
        })}
      </div>
      <div className="ms3-pool">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => {
          const used = !state.pool.includes(v);
          return (
            <button
              key={v}
              className={`ms3-pool-btn${state.selected === v ? " sel" : ""}${used ? " used" : ""}`}
              disabled={used}
              onClick={() => dispatch({ type: "pick", value: v } as MagicSquare3Action)}
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="ms3-hint">Pick a number, then click a square to place it. Click a placed number to remove it.</div>
    </div>
  );
}
