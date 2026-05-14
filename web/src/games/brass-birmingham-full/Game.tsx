import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  BrassBirminghamFullState,
  BrassBirminghamFullAction,
  BrassBirminghamFullSettings,
  IndustryKind,
} from "./state.js";
import {
  isTerminal,
  CITIES,
  affordableBuilds,
  isHumanTurn,
  HUMAN_SEAT,
  TURNS_PER_ERA,
  LOAN_AMOUNT,
} from "./state.js";
import "./Game.css";

const INDUSTRY_LABELS: Record<IndustryKind, string> = {
  coal: "Coal Mine",
  iron: "Iron Works",
  cotton: "Cotton Mill",
  manufactured: "Manufacturer",
  brewery: "Brewery",
};

export function BrassBirminghamFullGame({ state, dispatch, onGameOver }: GameProps<BrassBirminghamFullState, BrassBirminghamFullSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Auto-step CPUs after a short delay for animation feel.
  useEffect(() => {
    if (state.phase === "playing" && state.players[state.currentSeat]?.isCpu) {
      const timer = setTimeout(() => dispatch({ type: "cpu-step" } as BrassBirminghamFullAction), 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, dispatch]);

  const [selectedKind, setSelectedKind] = useState<IndustryKind>("cotton");
  const [selectedCity, setSelectedCity] = useState<number>(0);
  const [selectedTile, setSelectedTile] = useState<string>("");
  const [linkA, setLinkA] = useState<number>(0);
  const [linkB, setLinkB] = useState<number>(1);

  const t = isTerminal(state);
  const human = state.players[HUMAN_SEAT]!;
  const builds = useMemo(() => affordableBuilds(state, HUMAN_SEAT), [state]);
  const sellable = useMemo(
    () => human.tiles.filter((tt) => tt.city !== null && !tt.flipped && (tt.kind === "cotton" || tt.kind === "manufactured")),
    [human.tiles],
  );

  const winner = useMemo(() => {
    const max = Math.max(...state.players.map((p) => p.vp));
    return state.players.find((p) => p.vp === max);
  }, [state.players]);

  return (
    <div className="bz-bbf-wrap gs-fade-in">
      <h3 className="bz-bbf-title">Brass Birmingham</h3>
      <div className="bz-bbf-era">
        Era {state.era === "canal" ? "I (Canals)" : "II (Rails)"}
        {" · "}Turn {state.turn}/{TURNS_PER_ERA}
        {" · "}Phase: {state.phase}
      </div>

      <div className="bz-bbf-players">
        {state.players.map((p) => (
          <div
            key={p.seat}
            className={"bz-bbf-player" + (p.seat === state.currentSeat && state.phase === "playing" ? " bz-bbf-active" : "")}
          >
            <div className="bz-bbf-pname">{p.name}{p.seat === 0 ? " (you)" : ""}</div>
            <div className="bz-bbf-prow">
              <span title="Victory Points" className="gs-pulse">VP <b>{p.vp}</b></span>
              <span title="Cash">$ <b>{p.cash}</b></span>
              <span title="Income">Inc <b>{p.income}</b></span>
              <span title="Industry tiles on the board">Tiles <b>{p.tiles.filter((tt) => tt.city !== null).length}</b></span>
              <span title="Links built">Links <b>{p.links.length}</b></span>
            </div>
          </div>
        ))}
      </div>

      <div className="bz-bbf-market">
        <span title="Coal in the market">Coal Market: <b>{state.coalMarket}</b></span>
        <span title="Iron in the market">Iron Market: <b>{state.ironMarket}</b></span>
        <span title="Cities you may currently build in">
          Allowed Builds: <b>{state.allowedCities.map((i) => CITIES[i]?.name ?? `#${i}`).join(", ")}</b>
        </span>
      </div>

      {state.phase === "era-scoring" && (
        <div className="bz-bbf-scoring">
          <h4>Era {state.era === "canal" ? "I" : "II"} Scoring</h4>
          <p>Links scored. {state.era === "canal" ? "Level-1 tiles removed." : "Game ending."}</p>
          <button
            data-testid="bbf-advance-era"
            title={state.era === "canal" ? "Begin Era II (Rails)" : "Finish the game"}
            onClick={() => dispatch({ type: "advance-era" } as BrassBirminghamFullAction)}
          >
            {state.era === "canal" ? "Begin Era II" : "Finish Game"}
          </button>
        </div>
      )}

      {state.phase === "playing" && !isHumanTurn(state) && (
        <div className="bz-bbf-cpu">
          <span>Waiting for {state.players[state.currentSeat]?.name}…</span>
          <button
            data-testid="bbf-cpu-step"
            title="Advance the current CPU player by one action"
            onClick={() => dispatch({ type: "cpu-step" } as BrassBirminghamFullAction)}
          >
            Step CPU
          </button>
        </div>
      )}

      {state.phase === "playing" && isHumanTurn(state) && (
        <div className="bz-bbf-controls">
          <div className="bz-bbf-actions-left">Actions left this turn: <b>{state.actionsLeft}</b></div>

          <div className="bz-bbf-section">
            <div className="bz-bbf-section-title">Build Industry</div>
            <div className="bz-bbf-row">
              <label>
                <span>Kind</span>
                <select
                  title="Choose an industry kind to build"
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value as IndustryKind)}
                >
                  {(["coal", "iron", "cotton", "manufactured", "brewery"] as IndustryKind[]).map((k) => (
                    <option key={k} value={k}>
                      {INDUSTRY_LABELS[k]}{builds.includes(k) ? "" : " (unavailable)"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>City</span>
                <select
                  title="Choose a city to build in"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(parseInt(e.target.value, 10))}
                >
                  {CITIES.map((c, i) => {
                    const allowed = state.allowedCities.includes(i) || human.presence.includes(i);
                    return (
                      <option key={i} value={i} disabled={!allowed}>
                        {c.name}{allowed ? "" : " (locked)"}
                      </option>
                    );
                  })}
                </select>
              </label>
              <button
                data-testid="bbf-build-cotton"
                title="Build the selected industry in the selected city"
                onClick={() => dispatch({ type: "build", kind: selectedKind, city: selectedCity } as BrassBirminghamFullAction)}
              >
                Build
              </button>
            </div>
          </div>

          <div className="bz-bbf-section">
            <div className="bz-bbf-section-title">Sell Goods</div>
            <div className="bz-bbf-row">
              <select
                title="Choose a cotton or manufactured tile to flip"
                value={selectedTile}
                onChange={(e) => setSelectedTile(e.target.value)}
              >
                <option value="">— pick a tile —</option>
                {sellable.map((tt) => (
                  <option key={tt.id} value={tt.id}>
                    {INDUSTRY_LABELS[tt.kind]} L{tt.level} at {CITIES[tt.city!]?.name} (+{tt.vp} VP)
                  </option>
                ))}
              </select>
              <button
                title="Flip the selected tile to score its VP and gain income"
                disabled={!selectedTile}
                onClick={() => dispatch({ type: "sell", tileId: selectedTile } as BrassBirminghamFullAction)}
              >
                Sell
              </button>
            </div>
          </div>

          <div className="bz-bbf-section">
            <div className="bz-bbf-section-title">Build Link</div>
            <div className="bz-bbf-row">
              <label>
                <span>From</span>
                <select
                  title="Pick the first city for the link"
                  value={linkA}
                  onChange={(e) => setLinkA(parseInt(e.target.value, 10))}
                >
                  {CITIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                </select>
              </label>
              <label>
                <span>To</span>
                <select
                  title="Pick the second city for the link"
                  value={linkB}
                  onChange={(e) => setLinkB(parseInt(e.target.value, 10))}
                >
                  {CITIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
                </select>
              </label>
              <button
                title={state.era === "canal" ? "Build a canal ($3) between the two cities" : "Build a rail ($5 + 1 coal) between the two cities"}
                onClick={() => dispatch({ type: "link", a: linkA, b: linkB } as BrassBirminghamFullAction)}
              >
                {state.era === "canal" ? "Canal" : "Rail"}
              </button>
            </div>
          </div>

          <div className="bz-bbf-section">
            <div className="bz-bbf-section-title">Other Actions</div>
            <div className="bz-bbf-row">
              <button
                title="Take a $30 loan (-3 income)"
                onClick={() => dispatch({ type: "loan" } as BrassBirminghamFullAction)}
              >
                Loan +${LOAN_AMOUNT}
              </button>
              <button
                title="Remove the lowest-level tile from your supply"
                onClick={() => dispatch({ type: "develop" } as BrassBirminghamFullAction)}
              >
                Develop
              </button>
              <button
                title="Refresh allowed build cities (card-hand approximation)"
                onClick={() => dispatch({ type: "scout" } as BrassBirminghamFullAction)}
              >
                Scout
              </button>
              <button
                title="End your turn (skip remaining actions)"
                onClick={() => dispatch({ type: "pass" } as BrassBirminghamFullAction)}
              >
                End Turn
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bz-bbf-log" aria-label="Game log">
        {state.log.slice(-6).map((line, i) => <div key={i}>{line}</div>)}
      </div>

      {t && (
        <div className="bz-bbf-done gs-bounce-in">
          <h3>Game Over</h3>
          <p>Winner: <b>{winner?.name ?? "—"}</b> with {winner?.vp ?? 0} VP.</p>
          <p>Your final VP: <b>{human.vp}</b>. Score: <b>{t.score}</b></p>
        </div>
      )}
    </div>
  );
}
