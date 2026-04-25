import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IntelligenceState, IntelligenceAction, IntelligenceSettings } from "./state.js";
import "./Intelligence.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

type Sel = { kind: "fan"; idx: number } | { kind: "spare"; idx: number } | null;

export function Intelligence({
  state,
  dispatch,
  onGameOver,
}: GameProps<IntelligenceState, IntelligenceSettings>): JSX.Element {
  const [sel, setSel] = useState<Sel>(null);

  const handleFoundationClick = useCallback((fi: number) => {
    if (!sel) return;
    if (sel.kind === "fan") {
      dispatch({ type: "move-to-foundation", fromType: "fan", fromIdx: sel.idx, foundIdx: fi } as IntelligenceAction);
    } else {
      dispatch({ type: "move-to-foundation", fromType: "spare", fromIdx: sel.idx, foundIdx: fi } as IntelligenceAction);
    }
    setSel(null);
  }, [sel, dispatch]);

  const handleFanClick = useCallback((fi: number) => {
    const fan = state.fans[fi]!;
    if (fan.length === 0) {
      // Fill from spare
      if (sel?.kind === "spare") {
        dispatch({ type: "fill-empty-fan", spareIdx: sel.idx, fanIdx: fi } as IntelligenceAction);
        setSel(null);
      }
      return;
    }
    if (!sel) { setSel({ kind: "fan", idx: fi }); return; }
    if (sel.kind === "fan") {
      if (sel.idx === fi) { setSel(null); return; }
      dispatch({ type: "move-fan-to-fan", fromFan: sel.idx, toFan: fi } as IntelligenceAction);
      setSel(null);
    } else {
      setSel({ kind: "fan", idx: fi });
    }
  }, [sel, dispatch, state.fans]);

  const handleSpareClick = useCallback((si: number) => {
    if (sel?.kind === "spare" && sel.idx === si) { setSel(null); return; }
    setSel({ kind: "spare", idx: si });
  }, [sel]);

  if (state.won) onGameOver(state.score);

  return (
    <div className="intelligence">
      <div className="intelligence-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/104</span>
      </div>

      <div>
        <div className="intel-section-label">Foundations (A→K by suit)</div>
        <div className="intel-foundations">
          {state.foundations.map((f, fi) => {
            const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
            return (
              <div
                key={fi}
                className={`intel-card ${top && isRed(top.suit) ? "red" : "black"}`}
                style={{ opacity: top ? 1 : 0.5, borderColor: sel ? "#4af" : undefined }}
                onClick={() => handleFoundationClick(fi)}
              >
                {top ? `${rl(top.rank)}${top.suit}` : `${f.suit}A`}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="intel-section-label">Fans ({state.fans.length} fans)</div>
        <div className="intel-fans">
          {state.fans.map((fan, fi) => {
            const top = fan.length > 0 ? fan[fan.length - 1]! : null;
            const isSel = sel?.kind === "fan" && sel.idx === fi;
            return (
              <div key={fi} className="intel-fan">
                {fan.length > 1 && fan.slice(0, -1).map((c, ci) => (
                  <div key={ci} className="intel-card facedown">--</div>
                ))}
                {top ? (
                  <div
                    className={`intel-card ${isRed(top.suit) ? "red" : "black"}${isSel ? " selected" : ""}`}
                    onClick={() => handleFanClick(fi)}
                  >
                    {rl(top.rank)}{top.suit}
                  </div>
                ) : (
                  <div className="intel-empty" onClick={() => handleFanClick(fi)}>
                    empty
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {state.spares.length > 0 && (
        <div>
          <div className="intel-section-label">Spares ({state.spares.length})</div>
          <div className="intel-spares">
            {state.spares.map((c, si) => (
              <div
                key={si}
                className={`intel-card ${isRed(c.suit) ? "red" : "black"}${sel?.kind === "spare" && sel.idx === si ? " selected" : ""}`}
                onClick={() => handleSpareClick(si)}
              >
                {rl(c.rank)}{c.suit}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
