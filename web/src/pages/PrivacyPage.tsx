export default function PrivacyPage(): JSX.Element {
  return (
    <div className="settings-page" data-testid="privacy-page">
      <h1>Privacy</h1>

      <section className="settings-section">
        <p>
          Cards and Such is designed to keep your data on your device. The short version:
        </p>
        <ul>
          <li><strong>localStorage only.</strong> Preferences, scores, and saved-game state live in your browser's localStorage. Clearing site data wipes everything.</li>
          <li><strong>No analytics, no tracking.</strong> We do not run Google Analytics, Plausible, Sentry, or any other telemetry SDK.</li>
          <li><strong>No advertising networks.</strong> No ad scripts, no fingerprinting, no behavioral profiling.</li>
          <li><strong>No third-party services</strong> apart from the <strong>Google Fonts CDN</strong>, which serves the Inter and JetBrains Mono web fonts. Google may log standard request metadata (IP, user-agent) for those font requests; see Google's privacy policy.</li>
          <li><strong>Optional online play.</strong> If you join an online room, your chosen username and moves are sent to the game server you connect to so other players can see them. Nothing is stored long-term beyond leaderboards you opt into.</li>
        </ul>
        <p>
          That's it. There is no account-mining business model behind this project — it exists
          to be played.
        </p>
      </section>
    </div>
  );
}
