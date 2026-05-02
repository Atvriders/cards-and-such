// Shared poker table renderer for heads-up community-card variants.
import { useEffect, useState } from "react";
import type { Card as CardT } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import type { PGState } from "./poker-game.js";

export interface PokerTableProps<S> {
  prefix: string;
  state: PGState<S>;
  totalHands: number;
  smallBlind: number;
  maxCommunity?: number | undefined;
  showCpuHole?: boolean | undefined;
  playerHandLabel?: string | undefined;
  cpuHandLabel?: string | undefined;
  onDeal: () => void;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onDiscard?: ((index: number) => void) | undefined;
  /** show "discard" prompt? */
  discardPrompt?: string | undefined;
}

export function PokerTable<S>(p: PokerTableProps<S>): JSX.Element {
  const { prefix, state, totalHands, smallBlind, maxCommunity = 5 } = p;
  const bb = smallBlind * 2;
  const minRaise = bb;
  const maxRaise = Math.max(minRaise, Math.min(state.player.stack, state.pot * 2 + bb));
  const [raiseAmt, setRaiseAmt] = useState<number>(minRaise);

  const toCall = Math.max(0, state.cpu.bet - state.player.bet);
  const inHand = state.phase !== "showdown" && state.phase !== "done" && state.player.hole.length > 0;
  const canAct = state.toAct === "player" && inHand && !state.pendingDiscard;
  const canCheck = canAct && toCall === 0;
  const canCall = canAct && toCall > 0;
  const canRaise = canAct && state.player.stack > toCall;

  const cls = (suffix: string): string => `${prefix}${suffix}`;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const dealable = (state.phase === "preflop" && state.player.hole.length === 0) || state.phase === "showdown";
      if (dealable && (e.key === "d" || e.key === "D" || e.key === "Enter")) {
        e.preventDefault();
        p.onDeal();
        return;
      }
      if (!canAct) return;
      if (e.key === "f" || e.key === "F") { e.preventDefault(); p.onFold(); }
      else if ((e.key === "c" || e.key === "C") && canCheck) { e.preventDefault(); p.onCheck(); }
      else if ((e.key === "c" || e.key === "C") && canCall) { e.preventDefault(); p.onCall(); }
      else if ((e.key === "r" || e.key === "R") && canRaise) { e.preventDefault(); p.onRaise(Math.min(Math.max(raiseAmt, minRaise), maxRaise)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.player.hole.length, canAct, canCheck, canCall, canRaise, raiseAmt, minRaise, maxRaise, p]);

  return (
    <div className={cls("felt")}>
      <div className={cls("hud")}>
        <span className={cls("stat")}>Hand {Math.min(state.handsPlayed + 1, totalHands)}/{totalHands}</span>
        <span className={cls("stat")}>Phase: {state.phase}</span>
        <span className={cls("stat")}>Pot: ${state.pot}</span>
      </div>

      <div className={`${cls("seat")} ${cls("cpu")}`}>
        <div className={cls("name")}>
          CPU <span className={cls("stack")}>${state.cpu.stack}</span>
          {state.cpu.bet > 0 && <span className={cls("bet")}>bet ${state.cpu.bet}</span>}
        </div>
        <div className={cls("cards")}>
          {state.cpu.hole.map((c: CardT, i: number) => (
            <Card key={i} card={c} faceDown={!(state.showdownReveal || p.showCpuHole)} />
          ))}
        </div>
        {p.cpuHandLabel && <div className={cls("handname")}>{p.cpuHandLabel}</div>}
      </div>

      <div className={cls("board")}>
        <div className={cls("pot")}>Pot ${state.pot}</div>
        <div className={cls("cards")}>
          {state.community.map((c: CardT, i: number) => <Card key={i} card={c} />)}
          {Array.from({ length: Math.max(0, maxCommunity - state.community.length) }).map((_, i) => (
            <div key={`ph${i}`} className={cls("placeholder")} />
          ))}
        </div>
        <div className={cls("msg")}>{state.message}</div>
      </div>

      <div className={`${cls("seat")} ${cls("player")}`}>
        <div className={cls("name")}>
          You <span className={cls("stack")}>${state.player.stack}</span>
          {state.player.bet > 0 && <span className={cls("bet")}>bet ${state.player.bet}</span>}
        </div>
        <div className={cls("cards")}>
          {state.player.hole.map((c: CardT, i: number) => {
            const clickProp = state.pendingDiscard && p.onDiscard
              ? { onClick: () => p.onDiscard!(i) }
              : {};
            return (
              <Card
                key={i}
                card={c}
                {...clickProp}
                className={state.pendingDiscard ? cls("discardable") : ""}
              />
            );
          })}
        </div>
        {p.playerHandLabel && <div className={cls("handname")}>{p.playerHandLabel}</div>}
      </div>

      <div className={cls("actions")}>
        {((state.phase === "preflop" && state.player.hole.length === 0) || state.phase === "showdown") ? (
          <button data-testid={`hint-target-${prefix.replace(/-$/, "")}-deal`} className={`${cls("btn")} ${cls("deal")}`} onClick={p.onDeal}>
            {state.handsPlayed === 0 ? "Deal" : "Next Hand"}
          </button>
        ) : state.pendingDiscard ? (
          <div className={cls("discardprompt")}>
            {p.discardPrompt ?? "Tap a hole card to discard."}
          </div>
        ) : (
          <>
            <button data-testid={`hint-target-${prefix.replace(/-$/, "")}-fold`} className={`${cls("btn")} ${cls("fold")}`} aria-label="Fold (F)" onClick={p.onFold} disabled={!canAct}>Fold</button>
            <button data-testid={`hint-target-${prefix.replace(/-$/, "")}-check`} className={cls("btn")} aria-label="Check (C)" onClick={p.onCheck} disabled={!canCheck}>Check</button>
            <button data-testid={`hint-target-${prefix.replace(/-$/, "")}-call`} className={cls("btn")} aria-label={`Call ${toCall > 0 ? `$${toCall}` : ""} (C)`} onClick={p.onCall} disabled={!canCall}>
              Call {toCall > 0 ? `$${toCall}` : ""}
            </button>
            <div className={cls("raise")}>
              <input
                type="range"
                min={minRaise}
                max={maxRaise}
                step={smallBlind}
                value={Math.min(Math.max(raiseAmt, minRaise), maxRaise)}
                onChange={(e) => setRaiseAmt(parseInt(e.target.value, 10))}
                disabled={!canRaise}
              />
              <button data-testid={`hint-target-${prefix.replace(/-$/, "")}-raise`} className={`${cls("btn")} ${cls("raisebtn")}`} aria-label={`Raise $${raiseAmt} (R)`} onClick={() => p.onRaise(raiseAmt)} disabled={!canRaise}>
                Raise ${raiseAmt}
              </button>
            </div>
          </>
        )}
      </div>

      {state.phase === "done" && (
        <div className={cls("gameover")}>Final Stack: ${state.player.stack}</div>
      )}
    </div>
  );
}
