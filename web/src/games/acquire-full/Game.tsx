import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  AcquireFullState,
  AcquireFullAction,
  AcquireFullSettings,
  ChainId,
} from "./state.js";
import {
  isTerminal,
  classifyPlacement,
  BOARD_COLS,
  BOARD_ROWS,
  CHAIN_IDS,
  CHAIN_DISPLAY,
  CHAIN_COLOR,
  CHAIN_TIER,
  CHAIN_SHARES,
  SAFE_THRESHOLD,
  END_THRESHOLD,
  chainPrice,
  majorityBonus,
  minorityBonus,
  inactiveChains,
  activeChains,
  netWorth,
  tileLabel,
  tileIdx as toTileIdx,
  tileColRow,
} from "./state.js";
import "./Game.css";

export function AcquireFullGame(
  { state, dispatch, onGameOver }: GameProps<AcquireFullState, AcquireFullSettings>,
): JSX.Element {
  // End-of-game wiring (single-fire).
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Merger sell/trade inputs.
  const [mergeSell, setMergeSell] = useState<string>("");
  const [mergeTrade, setMergeTrade] = useState<string>("");

  useEffect(() => {
    if (state.phase === "merge-resolve" && state.merger) {
      const acting = state.merger.pendingPlayers[0];
      if (acting !== undefined) {
        const has = state.players[acting]?.shares[state.merger.folded[0]!] ?? 0;
        setMergeSell(String(has));
        setMergeTrade("0");
      }
    }
  }, [state.phase, state.merger, state.players]);

  // Auto-tick CPU turns once per phase change.
  const cpuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (cpuTimer.current) {
      clearTimeout(cpuTimer.current);
      cpuTimer.current = null;
    }
    const cur = state.players[state.current];
    const cpuActive =
      state.phase !== "done" &&
      cur?.isCPU &&
      (state.phase === "cpu-turn" || state.phase === "buy" || state.phase === "merge-resolve" || state.phase === "play-tile" || state.phase === "choose-found");
    if (cpuActive) {
      cpuTimer.current = setTimeout(() => {
        dispatch({ type: "cpu-step" } as AcquireFullAction);
      }, 350);
    }
    return () => {
      if (cpuTimer.current) clearTimeout(cpuTimer.current);
    };
  }, [state, dispatch]);

  const you = state.players[0]!;
  const actives = useMemo(() => activeChains(state), [state]);
  const inactives = useMemo(() => inactiveChains(state), [state]);

  // Build placeable-classification map for the current player's hand tiles.
  const handClassification = useMemo(() => {
    const out: Record<number, "lone" | "found" | "grow" | "merge" | "illegal"> = {};
    if (state.phase !== "play-tile") return out;
    for (const t of you.hand) {
      const c = classifyPlacement(state, t);
      out[t] = c === "illegal" ? "illegal" : c.kind;
    }
    return out;
  }, [state, you.hand]);

  const isYourTurn = state.current === 0 && !you.isCPU;

  return (
    <div className="acquirefull-wrap fade-in">
      {/* Header */}
      <div className="acquirefull-header">
        <h2 className="acquirefull-title">ACQUIRE <span>full rulebook</span></h2>
        <div className="acquirefull-stats">
          <div className="acquirefull-stat">
            <span className="acquirefull-stat-label">Turn</span>
            <span className="acquirefull-stat-value">{state.turn}</span>
          </div>
          <div className="acquirefull-stat acquirefull-stat-you">
            <span className="acquirefull-stat-label">You</span>
            <span className="acquirefull-stat-value pulse">${you.cash.toLocaleString()}</span>
            <span className="acquirefull-stat-sub">Net ${netWorth(state, 0).toLocaleString()}</span>
          </div>
          {state.players.slice(1).map((p, i) => (
            <div key={p.id} className={`acquirefull-stat acquirefull-stat-cpu${state.current === i + 1 ? " is-active" : ""}`}>
              <span className="acquirefull-stat-label">P{p.id + 1} (CPU)</span>
              <span className="acquirefull-stat-value">${p.cash.toLocaleString()}</span>
              <span className="acquirefull-stat-sub">Net ${netWorth(state, i + 1).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div
        className="acquirefull-board"
        role="grid"
        aria-label={`Acquire board ${BOARD_COLS}x${BOARD_ROWS}`}
        style={{
          gridTemplateColumns: `auto repeat(${BOARD_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${BOARD_ROWS}, minmax(0, 1fr))`,
        }}
      >
        {/* corner */}
        <div className="acquirefull-corner" />
        {/* column labels A..L */}
        {Array.from({ length: BOARD_COLS }, (_, c) => (
          <div key={`col-${c}`} className="acquirefull-axis-label">
            {String.fromCharCode("A".charCodeAt(0) + c)}
          </div>
        ))}
        {/* rows */}
        {Array.from({ length: BOARD_ROWS }, (_, r) => (
          <Fragmentish key={`row-${r}`}>
            <div className="acquirefull-axis-label">{r + 1}</div>
            {Array.from({ length: BOARD_COLS }, (_, c) => {
              const idx = toTileIdx(c, r);
              const s = state.board[idx];
              const inYourHand = isYourTurn && state.phase === "play-tile" && you.hand.includes(idx);
              const cls =
                s === "empty" ? "acquirefull-cell-empty"
                : s === "lone" ? "acquirefull-cell-lone"
                : `acquirefull-cell-chain`;
              const color =
                s !== "empty" && s !== "lone" ? CHAIN_COLOR[s as ChainId] : undefined;
              return (
                <div
                  key={`cell-${idx}`}
                  className={`acquirefull-cell ${cls}${inYourHand ? " in-hand" : ""}`}
                  role="gridcell"
                  aria-label={`${tileLabel(idx)}${
                    s === "empty" ? "" :
                    s === "lone" ? " (loose)" :
                    " (" + CHAIN_DISPLAY[s as ChainId] + ")"
                  }`}
                  style={color ? { background: color, color: "#fff" } : undefined}
                  title={
                    s === "empty" ? tileLabel(idx) :
                    s === "lone" ? `${tileLabel(idx)} (loose)` :
                    `${tileLabel(idx)} — ${CHAIN_DISPLAY[s as ChainId]}`
                  }
                >
                  {s === "lone" && <span className="acquirefull-lone-dot" />}
                  {inYourHand && <span className="acquirefull-hand-mark">✱</span>}
                </div>
              );
            })}
          </Fragmentish>
        ))}
      </div>

      {/* Chains panel */}
      <div className="acquirefull-chains" aria-label="Hotel chains">
        {CHAIN_IDS.map((c) => {
          const sz = state.chainSize[c];
          const px = sz >= 2 ? chainPrice(sz, c) : 0;
          const bank = state.bankShares[c];
          const yours = you.shares[c];
          const tierLabel = CHAIN_TIER[c] === 0 ? "T1" : CHAIN_TIER[c] === 1 ? "T2" : "T3";
          return (
            <div key={c} className={`acquirefull-chain chain-${c}${sz === 0 ? " is-inactive" : ""}`} style={{ borderColor: CHAIN_COLOR[c] }}>
              <div className="acquirefull-chain-head" style={{ background: CHAIN_COLOR[c] }}>
                <span className="acquirefull-chain-name">{CHAIN_DISPLAY[c]}</span>
                <span className="acquirefull-chain-tier" title={`Price tier ${tierLabel}`}>{tierLabel}</span>
              </div>
              <div className="acquirefull-chain-body">
                <div className="acquirefull-chain-row">
                  <span>Size</span>
                  <span>{sz} {sz >= END_THRESHOLD ? "🏁" : sz >= SAFE_THRESHOLD ? "🛡" : ""}</span>
                </div>
                <div className="acquirefull-chain-row">
                  <span>Price</span>
                  <span>{sz >= 2 ? `$${px}` : "—"}</span>
                </div>
                <div className="acquirefull-chain-row">
                  <span>Bank</span>
                  <span>{bank}/{CHAIN_SHARES}</span>
                </div>
                <div className="acquirefull-chain-row">
                  <span>You</span>
                  <span>{yours}</span>
                </div>
                {sz >= 2 && (
                  <div className="acquirefull-chain-bonuses" title="Majority / minority bonus">
                    M ${majorityBonus(sz, c).toLocaleString()} / m ${minorityBonus(sz, c).toLocaleString()}
                  </div>
                )}
              </div>
              {state.phase === "buy" && isYourTurn && sz >= 2 && bank > 0 && (
                <button
                  className="acquirefull-buy-btn"
                  data-testid={`acquirefull-buy-${c}`}
                  onClick={() => dispatch({ type: "buy", chain: c } as AcquireFullAction)}
                  disabled={you.cash < px || state.buysLeft <= 0}
                  title={you.cash < px ? `Need $${px}` : `Buy 1 ${CHAIN_DISPLAY[c]} for $${px}`}
                >
                  Buy ${px}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Message */}
      <div className="acquirefull-message" aria-live="polite">{state.message}</div>

      {/* Action panel */}
      <div className="acquirefull-actions">
        {state.phase === "play-tile" && isYourTurn && (
          <div className="acquirefull-hand">
            <div className="acquirefull-hand-label">Your tiles (click to play):</div>
            <div className="acquirefull-hand-tiles">
              {you.hand.map((t, i) => {
                const klass = handClassification[t] ?? "lone";
                const disabled = klass === "illegal";
                return (
                  <button
                    key={t}
                    className={`acquirefull-tile acquirefull-tile-${klass}`}
                    data-testid={i === 0 ? "acquirefull-tile" : `acquirefull-tile-${i}`}
                    onClick={() => dispatch({ type: "play-tile", tileIdx: t } as AcquireFullAction)}
                    disabled={disabled}
                    title={
                      klass === "illegal" ? `${tileLabel(t)} — illegal (would merge two safe chains, or no chain to found)` :
                      klass === "grow"    ? `${tileLabel(t)} — grow existing chain` :
                      klass === "found"   ? `${tileLabel(t)} — found a new chain` :
                      klass === "merge"   ? `${tileLabel(t)} — trigger merger` :
                                            `${tileLabel(t)} — lone placement`
                    }
                  >
                    <span className="acquirefull-tile-label">{tileLabel(t)}</span>
                    <span className="acquirefull-tile-hint">{klass}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {state.phase === "choose-found" && isYourTurn && (
          <div className="acquirefull-found">
            <div className="acquirefull-found-label">Pick a chain to found:</div>
            <div className="acquirefull-found-options">
              {inactives.map((c, i) => (
                <button
                  key={c}
                  className="acquirefull-found-btn"
                  data-testid={i === 0 ? "acquirefull-found" : `acquirefull-found-${c}`}
                  onClick={() => dispatch({ type: "choose-found", chain: c } as AcquireFullAction)}
                  style={{ borderColor: CHAIN_COLOR[c], background: CHAIN_COLOR[c] }}
                  title={`Found ${CHAIN_DISPLAY[c]} (tier ${CHAIN_TIER[c] + 1})`}
                >
                  {CHAIN_DISPLAY[c]}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.phase === "merge-resolve" && state.merger && state.merger.pendingPlayers[0] === 0 && (
          <MergerDialog
            state={state}
            mergeSell={mergeSell}
            mergeTrade={mergeTrade}
            setMergeSell={setMergeSell}
            setMergeTrade={setMergeTrade}
            onConfirm={(sell, trade) =>
              dispatch({ type: "merge-sell", sell, trade } as AcquireFullAction)
            }
          />
        )}

        {state.phase === "buy" && isYourTurn && (
          <div className="acquirefull-buy-bar">
            <span className="acquirefull-buy-label">Buys left: <strong>{state.buysLeft}</strong></span>
            <button
              className="acquirefull-btn acquirefull-btn-primary"
              data-testid="acquirefull-endbuy"
              onClick={() => dispatch({ type: "end-buy" } as AcquireFullAction)}
              title="End your turn"
            >
              End Turn
            </button>
          </div>
        )}

        {(state.players[state.current]?.isCPU ?? false) && state.phase !== "done" && (
          <button
            className="acquirefull-btn acquirefull-btn-cpu"
            data-testid="acquirefull-cpustep"
            onClick={() => dispatch({ type: "cpu-step" } as AcquireFullAction)}
            title="Advance CPU turn one step"
          >
            CPU step →
          </button>
        )}

        {state.phase === "done" && (
          <div className="acquirefull-done bounce-in">
            <div className="acquirefull-done-msg">{state.message}</div>
            {state.finalScores && (
              <div className="acquirefull-done-scores">
                {state.finalScores.map((sc, i) => (
                  <div key={i} className={i === state.winner ? "winner" : ""}>
                    P{i + 1}{i === 0 ? " (You)" : " (CPU)"}: ${sc.toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log */}
      <div className="acquirefull-log" aria-label="Recent events">
        {state.log.slice(-6).map((line, i) => (
          <div key={state.log.length - 6 + i} className="acquirefull-log-line">{line}</div>
        ))}
      </div>
    </div>
  );
}

// React Fragment helper named so it works in older lints.
function Fragmentish({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}

// ─── Merger dialog ──────────────────────────────────────────────────────
interface MergerDialogProps {
  state: AcquireFullState;
  mergeSell: string;
  mergeTrade: string;
  setMergeSell: (s: string) => void;
  setMergeTrade: (s: string) => void;
  onConfirm: (sell: number, trade: number) => void;
}

function MergerDialog({ state, mergeSell, mergeTrade, setMergeSell, setMergeTrade, onConfirm }: MergerDialogProps): JSX.Element {
  const mg = state.merger!;
  const folding = mg.folded[0]!;
  const survivor = mg.survivor;
  const has = state.players[0]?.shares[folding] ?? 0;
  const sellN = Math.max(0, Math.min(Number(mergeSell) || 0, has));
  let tradeN = Math.max(0, Math.min(Number(mergeTrade) || 0, has - sellN));
  if (tradeN % 2 === 1) tradeN -= 1;
  if (tradeN < 0) tradeN = 0;
  const keepN = has - sellN - tradeN;
  const price = chainPrice(state.chainSize[folding], folding);
  const cashFromSell = sellN * price;
  const survivorGain = tradeN / 2;

  return (
    <div className="acquirefull-merge">
      <div className="acquirefull-merge-title">
        Merger: {CHAIN_DISPLAY[folding]} folds into {CHAIN_DISPLAY[survivor]}
      </div>
      <div className="acquirefull-merge-row">
        You hold <strong>{has}</strong> {CHAIN_DISPLAY[folding]} share{has === 1 ? "" : "s"} (current price ${price}).
      </div>
      <div className="acquirefull-merge-inputs">
        <label>
          Sell
          <input
            type="number"
            min={0}
            max={has}
            value={mergeSell}
            onChange={(e) => setMergeSell(e.target.value)}
            aria-label={`Number of ${CHAIN_DISPLAY[folding]} shares to sell`}
          />
          <span>(@ ${price} each → ${cashFromSell})</span>
        </label>
        <label>
          Trade (2-for-1)
          <input
            type="number"
            min={0}
            max={has - sellN}
            step={2}
            value={mergeTrade}
            onChange={(e) => setMergeTrade(e.target.value)}
            aria-label={`Number of ${CHAIN_DISPLAY[folding]} shares to trade`}
          />
          <span>(→ {survivorGain} {CHAIN_DISPLAY[survivor]})</span>
        </label>
        <div className="acquirefull-merge-keep">
          Keep: <strong>{keepN}</strong> {CHAIN_DISPLAY[folding]} (will convert to survivor when chain disappears — held until next merger).
        </div>
      </div>
      <button
        className="acquirefull-btn acquirefull-btn-primary"
        data-testid="acquirefull-merge-confirm"
        onClick={() => onConfirm(sellN, tradeN)}
        title="Confirm your merger choice"
      >
        Confirm
      </button>
    </div>
  );
}

// Reference unused imports to keep them in scope for future use.
void tileColRow;
