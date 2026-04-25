import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenUpState, SevenUpAction } from "./state.js";
import "./SevenUp.css";

const RL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank, onClick, dim }: { suit: string; rank: number; onClick?: () => void; dim?: boolean }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`su-card ${red ? "red" : "black"} ${dim ? "dim" : ""}`} onClick={onClick}>
      <span>{RL[rank]}</span><span>{suit}</span>
    </div>
  );
}

function FaceDown() {
  return <div className="su-card su-back">🂠</div>;
}

function EmptySlot({ label }: { label: string }) {
  return <div className="su-card su-empty">{label}</div>;
}

export function SevenUp({
  state,
  dispatch,
  onGameOver,
}: GameProps<SevenUpState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : undefined;

  const handleColClick = useCallback(
    (colIndex: number) => {
      const col = state.tableau[colIndex]!;
      if (col.length === 0) return;
      const card = col[col.length - 1]!;
      // Try foundation
      for (let fi = 0; fi < 4; fi++) {
        const f = state.foundations[fi]!;
        if (f.length === 0 ? card.rank === 7 : (() => {
          const top = f[f.length - 1]!;
          const order = [7,8,9,10,11,12,13,1,2,3,4,5,6];
          const cur = order.indexOf(top.rank as number);
          return top.suit === card.suit && order[(cur + 1) % 13] === (card.rank as number);
        })()) {
          dispatch({ type: "move-to-foundation", fromPile: `t${colIndex}`, foundIndex: fi } as SevenUpAction);
          return;
        }
      }
    },
    [state, dispatch],
  );

  const handleWasteClick = useCallback(() => {
    if (!wasteTop) return;
    const order = [7,8,9,10,11,12,13,1,2,3,4,5,6];
    for (let fi = 0; fi < 4; fi++) {
      const f = state.foundations[fi]!;
      const fits = f.length === 0 ? wasteTop.rank === 7 : (() => {
        const top = f[f.length - 1]!;
        const cur = order.indexOf(top.rank as number);
        return top.suit === wasteTop.suit && order[(cur + 1) % 13] === (wasteTop.rank as number);
      })();
      if (fits) {
        dispatch({ type: "move-to-foundation", fromPile: "waste", foundIndex: fi } as SevenUpAction);
        return;
      }
    }
  }, [wasteTop, state.foundations, dispatch]);

  const handleStockClick = useCallback(() => {
    if (state.stock.length === 0) {
      dispatch({ type: "recycle" } as SevenUpAction);
    } else {
      dispatch({ type: "draw" } as SevenUpAction);
    }
  }, [state.stock.length, dispatch]);

  return (
    <div className="seven-up">
      <div className="su-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="su-top">
        <div className="su-stock-area">
          <div className="su-stock" onClick={handleStockClick} title={state.stock.length > 0 ? "Draw" : "Recycle waste"}>
            {state.stock.length > 0 ? (
              <div className="su-card su-back">▶</div>
            ) : state.waste.length > 0 ? (
              <div className="su-card su-recycle">↺</div>
            ) : (
              <EmptySlot label="—" />
            )}
          </div>
          {wasteTop ? (
            <CardFace suit={wasteTop.suit} rank={wasteTop.rank} onClick={handleWasteClick} />
          ) : (
            <EmptySlot label="—" />
          )}
        </div>

        <div className="su-foundations">
          <span className="su-label">Foundations (start 7)</span>
          <div className="su-found-row">
            {state.foundations.map((f: Card[], fi: number) => {
              const tc = f[f.length - 1];
              return tc ? (
                <CardFace key={fi} suit={tc.suit} rank={tc.rank} />
              ) : (
                <EmptySlot key={fi} label="7" />
              );
            })}
          </div>
        </div>
      </div>

      <div className="su-tableau">
        {state.tableau.map((col: Card[], ci: number) => (
          <div key={ci} className="su-col">
            {col.length === 0 ? (
              <EmptySlot label="" />
            ) : (
              col.map((c: Card, idx: number) => (
                <div key={c.id} className="su-col-card" style={{ top: idx * 18, zIndex: idx }}
                  onClick={idx === col.length - 1 ? () => handleColClick(ci) : undefined}
                >
                  {idx < col.length - 1 ? <FaceDown /> : <CardFace suit={c.suit} rank={c.rank} />}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
