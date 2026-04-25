import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PeekState, PeekAction } from "./state.js";
import "./Peek.css";

const RL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank, onClick, highlight }: { suit: string; rank: number; onClick?: () => void; highlight?: boolean }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`peek-card ${red ? "red" : "black"} ${highlight ? "highlight" : ""}`} onClick={onClick}>
      <span>{RL[rank]}</span><span>{suit}</span>
    </div>
  );
}

function EmptyPile() {
  return <div className="peek-card peek-empty" />;
}

export function Peek({
  state,
  dispatch,
  onGameOver,
}: GameProps<PeekState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const handleColClick = useCallback(
    (colIndex: number) => {
      const col = state.tableau[colIndex]!;
      if (col.length === 0) return;
      const card = col[col.length - 1]!;
      // Try foundation
      for (let fi = 0; fi < 4; fi++) {
        const f = state.foundations[fi]!;
        if (f.length === 0 ? card.rank === 1 : (f[f.length - 1]!.suit === card.suit && (f[f.length - 1]!.rank as number) + 1 === (card.rank as number))) {
          dispatch({ type: "move-to-foundation", colIndex, foundIndex: fi } as PeekAction);
          return;
        }
      }
      // Try tableau
      for (let ti = 0; ti < state.tableau.length; ti++) {
        if (ti === colIndex) continue;
        const to = state.tableau[ti]!;
        if (to.length > 0 && (to[to.length - 1]!.rank as number) === (card.rank as number) + 1) {
          dispatch({ type: "move-col", fromCol: colIndex, toCol: ti } as PeekAction);
          return;
        }
      }
    },
    [state, dispatch],
  );

  const handleDeal = useCallback(() => {
    dispatch({ type: "deal-round" } as PeekAction);
  }, [dispatch]);

  const roundsLeft = state.stock.length - state.stockRound;

  return (
    <div className="peek">
      <div className="peek-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Rounds left: {roundsLeft}</span>
      </div>

      <div className="peek-foundations">
        {state.foundations.map((f: Card[], fi: number) => {
          const tc = f[f.length - 1];
          return tc ? (
            <CardFace key={fi} suit={tc.suit} rank={tc.rank} />
          ) : (
            <EmptyPile key={fi} />
          );
        })}
      </div>

      <div className="peek-tableau">
        {state.tableau.map((col: Card[], ci: number) => (
          <div key={ci} className="peek-col" onClick={() => handleColClick(ci)}>
            {col.length === 0 ? (
              <EmptyPile />
            ) : (
              col.map((c: Card, idx: number) => (
                <div key={c.id} className="peek-col-card" style={{ top: idx * 16, zIndex: idx }}>
                  {idx === col.length - 1 ? (
                    <CardFace suit={c.suit} rank={c.rank} highlight />
                  ) : (
                    <CardFace suit={c.suit} rank={c.rank} />
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      <button className="peek-deal-btn" onClick={handleDeal} disabled={roundsLeft === 0}>
        Deal next round ({roundsLeft})
      </button>
    </div>
  );
}
