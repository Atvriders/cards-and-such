import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TournamentState, TournamentAction } from "./state.js";
import "./Tournament.css";

const RL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function CardFace({ suit, rank, onClick }: { suit: string; rank: number; onClick?: () => void }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div className={`tourn-card ${red ? "red" : "black"}`} onClick={onClick}>
      <span>{RL[rank]}</span><span>{suit}</span>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return <div className="tourn-card tourn-empty">{label}</div>;
}

export function Tournament({
  state,
  dispatch,
  onGameOver,
}: GameProps<TournamentState, {}>): JSX.Element {
  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : undefined;

  const tryAutoMove = useCallback(
    (source: string, card: { rank: number; suit: string }) => {
      // Try asc foundations
      for (let fi = 0; fi < 4; fi++) {
        const f = state.ascFound[fi]!;
        const ok = f.length === 0 ? card.rank === 1 : (f[f.length - 1]!.suit === card.suit && (f[f.length - 1]!.rank as number) + 1 === (card.rank as number));
        if (ok) { dispatch({ type: "move-to-asc", source, foundIndex: fi } as TournamentAction); return true; }
      }
      // Try desc foundations
      for (let fi = 0; fi < 4; fi++) {
        const f = state.descFound[fi]!;
        const ok = f.length === 0 ? card.rank === 13 : (f[f.length - 1]!.suit === card.suit && (f[f.length - 1]!.rank as number) - 1 === (card.rank as number));
        if (ok) { dispatch({ type: "move-to-desc", source, foundIndex: fi } as TournamentAction); return true; }
      }
      return false;
    },
    [state.ascFound, state.descFound, dispatch],
  );

  const handleColClick = useCallback(
    (ci: number) => {
      const col = state.tableau[ci]!;
      if (col.length === 0) return;
      const card = col[col.length - 1]!;
      if (!tryAutoMove(`t${ci}`, card)) {
        // Try reserve
        const emptySlot = state.reserve.findIndex((r) => r === null);
        if (emptySlot >= 0) {
          dispatch({ type: "move-to-reserve", source: `t${ci}`, reserveIndex: emptySlot } as TournamentAction);
        }
      }
    },
    [state.tableau, state.reserve, dispatch, tryAutoMove],
  );

  const handleWasteClick = useCallback(() => {
    if (!wasteTop) return;
    tryAutoMove("waste", wasteTop);
  }, [wasteTop, tryAutoMove]);

  const handleReserveClick = useCallback(
    (ri: number) => {
      const card = state.reserve[ri];
      if (!card) return;
      for (let fi = 0; fi < 4; fi++) {
        const f = state.ascFound[fi]!;
        const ok = f.length === 0 ? card.rank === 1 : (f[f.length - 1]!.suit === card.suit && (f[f.length - 1]!.rank as number) + 1 === (card.rank as number));
        if (ok) { dispatch({ type: "move-reserve-to-found", reserveIndex: ri, asc: true, foundIndex: fi } as TournamentAction); return; }
      }
      for (let fi = 0; fi < 4; fi++) {
        const f = state.descFound[fi]!;
        const ok = f.length === 0 ? card.rank === 13 : (f[f.length - 1]!.suit === card.suit && (f[f.length - 1]!.rank as number) - 1 === (card.rank as number));
        if (ok) { dispatch({ type: "move-reserve-to-found", reserveIndex: ri, asc: false, foundIndex: fi } as TournamentAction); return; }
      }
    },
    [state.reserve, state.ascFound, state.descFound, dispatch],
  );

  const handleDraw = useCallback(() => {
    dispatch({ type: "draw" } as TournamentAction);
  }, [dispatch]);

  return (
    <div className="tournament">
      <div className="tourn-info">
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div className="tourn-top">
        <div className="tourn-found-section">
          <div className="tourn-label">A→K</div>
          {state.ascFound.map((f: Card[], fi: number) => {
            const tc = f[f.length - 1];
            return tc ? <CardFace key={fi} suit={tc.suit} rank={tc.rank} /> : <EmptySlot key={fi} label="A" />;
          })}
        </div>
        <div className="tourn-found-section">
          <div className="tourn-label">K→A</div>
          {state.descFound.map((f: Card[], fi: number) => {
            const tc = f[f.length - 1];
            return tc ? <CardFace key={fi} suit={tc.suit} rank={tc.rank} /> : <EmptySlot key={fi} label="K" />;
          })}
        </div>

        <div className="tourn-stock-area">
          <div className="tourn-stock" onClick={handleDraw}>
            {state.stock.length > 0 ? <div className="tourn-card tourn-back">▶</div> : <EmptySlot label="—" />}
          </div>
          {wasteTop ? <CardFace suit={wasteTop.suit} rank={wasteTop.rank} onClick={handleWasteClick} /> : <EmptySlot label="—" />}
        </div>

        <div className="tourn-reserve">
          <div className="tourn-label">Reserve</div>
          {state.reserve.map((card: Card | null, ri: number) => (
            card ? <CardFace key={ri} suit={card.suit} rank={card.rank} onClick={() => handleReserveClick(ri)} />
              : <EmptySlot key={ri} label="—" />
          ))}
        </div>
      </div>

      <div className="tourn-tableau">
        {state.tableau.map((col: Card[], ci: number) => (
          <div key={ci} className="tourn-col" onClick={() => handleColClick(ci)}>
            {col.length === 0 ? <EmptySlot label="" /> : (
              col.map((c: Card, idx: number) => (
                <div key={c.id} className="tourn-stacked" style={{ top: idx * 16, zIndex: idx }}>
                  <CardFace suit={c.suit} rank={c.rank} />
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
