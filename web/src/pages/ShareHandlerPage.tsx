import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { decodeChallenge } from "../platform/friendCode.js";

/**
 * Web Share Target handler. The PWA manifest's `share_target.action`
 * points here, so when a user shares text/url/title from another app
 * the OS opens this route with the payload in the query string.
 *
 * If the shared text is a recognisable 6-character friend code we
 * forward straight to the game in friend-mode. Otherwise we render a
 * friendly fallback that surfaces whatever was shared — a URL, a card
 * SVG name, an arbitrary note — and points the user back to the lobby.
 */

/** Quick syntactic gate before the more expensive decode. */
const FRIEND_CODE_REGEX = /^[0-9A-Za-z]{6}$/;

interface SharedPayload {
  title: string;
  text: string;
  url: string;
}

function readPayload(search: string): SharedPayload {
  const params = new URLSearchParams(search);
  return {
    title: params.get("title") ?? "",
    text: params.get("text") ?? "",
    url: params.get("url") ?? "",
  };
}

/** Pull the first whitespace-delimited token that looks like a friend code. */
function extractFriendCodeCandidate(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (FRIEND_CODE_REGEX.test(trimmed)) return trimmed;
  // Some share sources prepend boilerplate ("Play with me: ABC123"). Scan
  // tokens for a 6-char base32-ish run.
  for (const tok of trimmed.split(/\s+/)) {
    if (FRIEND_CODE_REGEX.test(tok)) return tok;
  }
  return null;
}

export default function ShareHandlerPage(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const payload = useMemo(() => readPayload(location.search), [location.search]);

  // Try the text field first (the canonical Web Share Target body), then
  // the URL field (some Android apps send the entire share via `url=`).
  const decoded = useMemo(() => {
    const candidates = [payload.text, payload.url, payload.title];
    for (const c of candidates) {
      const tok = extractFriendCodeCandidate(c);
      if (!tok) continue;
      const result = decodeChallenge(tok);
      if (result) return result;
    }
    return null;
  }, [payload.text, payload.url, payload.title]);

  useEffect(() => {
    if (decoded) {
      navigate(
        `/play/${decoded.gameId}?seed=${decoded.seed}&friend=1`,
        { replace: true },
      );
    }
  }, [decoded, navigate]);

  // While the redirect is in-flight, render nothing visible — but keep
  // the page mounted so route transition / scroll logic doesn't flicker.
  if (decoded) {
    return (
      <div data-testid="share-handler-page" aria-hidden="true">
        <PageHead title="Opening shared challenge…" />
      </div>
    );
  }

  const displayText =
    payload.text.trim() ||
    payload.url.trim() ||
    payload.title.trim() ||
    "";

  return (
    <div className="share-handler-page" data-testid="share-handler-page">
      <PageHead title="Cards & Such — Shared" />
      <header>
        <h1>Cards &amp; Such — Shared</h1>
        <p>Someone sent this to the app:</p>
      </header>
      {displayText ? (
        <pre data-testid="share-handler-text">{displayText}</pre>
      ) : (
        <p data-testid="share-handler-text">
          (Nothing readable was shared.)
        </p>
      )}
      <p>
        <Link to="/" data-testid="share-handler-go">
          Back to lobby
        </Link>
      </p>
    </div>
  );
}
