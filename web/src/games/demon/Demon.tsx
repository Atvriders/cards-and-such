import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DemonState, DemonAction, DemonSettings } from "./state.js";
import "./Demon.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

type Sel = { kind: "tableau"; col: number } | { kind: "waste" } | { kind: "reserve" } | null;

export function Demon({
  state,
  dispatch,
  onGameOver,
}: GameProps<DemonState, DemonSettings>): JSX.Element {
  const [sel, setSel] = useState<Sel>(null);

  const handleFoundClick = useCallback((fi: number) => {
    if (!sel) return;
    if (sel.kind === "tableau") {
      dispatch({ type: "move-to-foundation", fromType: "tableau", fromIdx: sel.col, foundIdx: fi } as DemonAction);
    } else if (sel.kind === "waste") {
      dispatch({ type: "move-to-foundation", fromType: "waste", fromIdx: 0, foundIdx: fi } as DemonAction);
    } else {
      dispatch({ type: "move-to-foundation", fromType: "reserve", fromIdx: 0, foundIdx: fi } as DemonAction);
    }
    setSel(null);
  }, [sel, dispatch]);

  const handleTabClick = useCallback((ci: number) => {
    if (!sel) { setSel({ kind: "tableau", col: ci }); return; }
    if (sel.kind === "tableau") {
      if (sel.col === ci) { setSel(null); return; }
      dispatch({ type: "move-tableau", fromCol: sel.col, toCol: ci, count: 1 } as DemonAction);
      setSel(null);
    } else if (sel.kind === "waste") {
      dispatch({ type: "move-waste-to-tableau", toCol: ci } as DemonAction);
      setSel(null);
    } else if (sel.kind === "reserve") {
      dispatch({ type: "move-reserve-to-tableau", toCol: ci } as DemonAction);
      setSel(null);
    }
  }, [sel, dispatch]);

  if (state.won) onGameOver(state.score);

  const reserveTop = state.reserve.length > 0 ? state.reserve[state.reserve.length - 1]! : null;
  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  return (
    <div className="demon">
      <div className="demon-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Base rank: {RANK_NAMES[state.foundations[0]!.baseRank] ?? state.foundations[0]!.baseRank}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/52</span>
      </div>

      <div className="demon-top">
        <div>
          <div className="demon-label">Foundations</div>
          <div className="demon-foundations">
            {state.foundations.map((f, fi) => {
              const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
              return (
                <div
                  key={fi}
                  className={`demon-card ${top && isRed(top.suit) ? "red" : "black"}`}
                  style={{ opacity: top ? 1 : 0.5, borderColor: sel ? "#4af" : undefined }}
                  onClick={() => handleFoundClick(fi)}
                >
                  {top ? `${rl(top.rank)}${top.suit}` : `${f.suit}${rl(f.baseRank)}`}
                </div>
              );
            })}
          </div>
        </div>

        <div className="demon-stock-area">
          <button
            className="demon-btn"
            disabled={state.stock.length === 0}
            onClick={() => dispatch({ type: "draw" } as DemonAction)}
          >
            Draw 3 ({state.stock.length})
          </button>
          <button
            className="demon-btn"
            disabled={state.stock.length > 0}
            onClick={() => dispatch({ type: "recycle" } as DemonAction)}
          >
            Recycle
          </button>
          {wasteTop && (
            <div
              className={`demon-card ${isRed(wasteTop.suit) ? "red" : "black"}${sel?.kind === "waste" ? " selected" : ""}`}
              onClick={() => { if (sel?.kind === "waste") setSel(null); else setSel({ kind: "waste" }); }}
            >
              {rl(wasteTop.rank)}{wasteTop.suit}
            </div>
          )}
        </div>

        <div className="demon-reserve-area">
          <div className="demon-label">Reserve ({state.reserve.length})</div>
          {reserveTop ? (
            <div
              className={`demon-card ${isRed(reserveTop.suit) ? "red" : "black"}${sel?.kind === "reserve" ? " selected" : ""}`}
              onClick={() => { if (sel?.kind === "reserve") setSel(null); else setSel({ kind: "reserve" }); }}
            >
              {rl(reserveTop.rank)}{reserveTop.suit}
            </div>
          ) : (
            <div className="demon-empty">empty</div>
          )}
        </div>
      </div>

      <div>
        <div className="demon-label">Tableau</div>
        <div className="demon-tableau">
          {state.tableau.map((col, ci) => {
            const isSel = sel?.kind === "tableau" && sel.col === ci;
            return (
              <div key={ci} className="demon-col">
                {col.length === 0 ? (
                  <div className="demon-empty" onClick={() => handleTabClick(ci)}>empty</div>
                ) : (
                  col.map((card, ri) => {
                    const isTop = ri === col.length - 1;
                    return (
                      <div
                        key={card.id}
                        className={`demon-card ${isRed(card.suit) ? "red" : "black"}${isTop && isSel ? " selected" : ""}`}
                        onClick={isTop ? () => handleTabClick(ci) : undefined}
                        style={{ marginTop: ri > 0 ? -60 : 0, zIndex: ri }}
                      >
                        {rl(card.rank)}{card.suit}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
