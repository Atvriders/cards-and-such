import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SalicLawState, SalicLawAction } from "./state.js";
import "./SalicLaw.css";

const RL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank, small }: { suit: string; rank: number; small?: boolean }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`salic-card ${red ? "red" : "black"} ${small ? "small" : ""}`}>
      <span>{RL[rank]}</span><span>{suit}</span>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return <div className="salic-card salic-empty">{label}</div>;
}

export function SalicLaw({
  state,
  dispatch,
  onGameOver,
}: GameProps<SalicLawState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : undefined;

  const handleColClick = useCallback(
    (colIndex: number) => {
      const col = state.columns[colIndex]!;
      if (col.length === 0) return;
      const card = col[col.length - 1]!;
      if (card.rank === 13) return; // Kings immovable
      // Try foundation
      for (let fi = 0; fi < 4; fi++) {
        const f = state.foundations[fi]!;
        if (f.length === 0 ? card.rank === 1 : (f[f.length - 1]!.suit === card.suit && (f[f.length - 1]!.rank as number) + 1 === (card.rank as number))) {
          dispatch({ type: "move-col-to-foundation", colIndex, foundIndex: fi } as SalicLawAction);
          return;
        }
      }
      // Try tableau
      for (let ti = 0; ti < state.columns.length; ti++) {
        if (ti === colIndex) continue;
        const to = state.columns[ti]!;
        if (to.length > 0) {
          const top = to[to.length - 1]!;
          if (top.rank === 13 || (top.rank as number) === (card.rank as number) + 1) {
            dispatch({ type: "move-col-to-col", fromCol: colIndex, toCol: ti } as SalicLawAction);
            return;
          }
        }
      }
    },
    [state, dispatch],
  );

  const handleWasteClick = useCallback(() => {
    if (!wasteTop) return;
    for (let fi = 0; fi < 4; fi++) {
      const f = state.foundations[fi]!;
      if (f.length === 0 ? wasteTop.rank === 1 : (f[f.length - 1]!.suit === wasteTop.suit && (f[f.length - 1]!.rank as number) + 1 === (wasteTop.rank as number))) {
        dispatch({ type: "move-waste-to-foundation", foundIndex: fi } as SalicLawAction);
        return;
      }
    }
    for (let ci = 0; ci < state.columns.length; ci++) {
      const col = state.columns[ci]!;
      if (col.length === 0) continue;
      const top = col[col.length - 1]!;
      if (top.rank === 13 || (top.rank as number) === (wasteTop.rank as number) + 1) {
        dispatch({ type: "move-waste-to-col", colIndex: ci } as SalicLawAction);
        return;
      }
    }
  }, [wasteTop, state, dispatch]);

  const handleDraw = useCallback(() => {
    dispatch({ type: "draw" } as SalicLawAction);
  }, [dispatch]);

  return (
    <div className="salic-law">
      <div className="salic-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="salic-top">
        <div className="salic-foundations">
          <div className="salic-label">A→Q (Foundations)</div>
          {state.foundations.map((f: Card[], fi: number) => {
            const tc = f[f.length - 1];
            return tc ? (
              <CardFace key={fi} suit={tc.suit} rank={tc.rank} />
            ) : (
              <EmptySlot key={fi} label="A" />
            );
          })}
        </div>

        <div className="salic-stock-area">
          <div className="salic-stock" onClick={handleDraw} title="Draw from stock">
            {state.stock.length > 0 ? (
              <div className="salic-card salic-back">▶</div>
            ) : (
              <EmptySlot label="—" />
            )}
          </div>
          {wasteTop ? (
            <CardFace suit={wasteTop.suit} rank={wasteTop.rank} />
          ) : (
            <EmptySlot label="—" />
          )}
          {wasteTop && (
            <button className="salic-play-btn" onClick={handleWasteClick}>Play waste</button>
          )}
        </div>
      </div>

      <div className="salic-columns">
        {state.columns.map((col: Card[], ci: number) => (
          <div key={ci} className="salic-col" onClick={() => handleColClick(ci)}>
            {col.map((c: Card, idx: number) => (
              <div key={c.id} className="salic-stacked" style={{ top: idx * 16, zIndex: idx }}>
                <CardFace suit={c.suit} rank={c.rank} small={idx < col.length - 1} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
