import { useEffect, useState } from "react";
import { formatAmount, truncateId } from "@neobank-stellar/shared";
import type { Finding, Msg, ScanState } from "@/lib/messaging";
import { PORT_NAME } from "@/lib/messaging";

const EMPTY: ScanState = { scanning: false, clicked: 0, queued: 0, findings: [] };

function send(msg: Msg): void {
  void chrome.runtime.sendMessage(msg).catch(() => {});
}

export function Popup() {
  const [state, setState] = useState<ScanState>(EMPTY);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: PORT_NAME });
    port.onMessage.addListener((snap: ScanState) => setState(snap));
    return () => port.disconnect();
  }, []);

  const paid = state.findings.length;

  return (
    <div className="app">
      <header className="head">
        <span className="logo">◆ PHOTON</span>
        <span className="sub">x402 paywall scanner</span>
      </header>

      <div className="actions">
        <button className="btn ghost" onClick={() => send({ type: "scan:reset" })}>
          Reset
        </button>
      </div>

      <p className="hint">
        Browse the page normally. PHOTON watches the network and lists any request that
        returns <strong>402</strong> — including the ones behind a wallet-gated button,
        the moment you trigger them.
      </p>

      <div className="count">
        <span className="num">{paid}</span> endpoint{paid === 1 ? "" : "s"} returned{" "}
        <span className="badge">402</span>
      </div>

      {paid === 0 ? (
        <div className="empty">No 402 responses captured yet.</div>
      ) : (
        <ul className="list">
          {state.findings.map((f) => (
            <FindingRow key={f.url} finding={f} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const req = finding.challenge?.accepts?.[0];
  return (
    <li className="row">
      <div className="row-top">
        <span className="method">{finding.method ?? "GET"}</span>
        <span className="url" title={finding.url}>
          {finding.url}
        </span>
      </div>
      {req ? (
        <dl className="terms">
          <div>
            <dt>amount</dt>
            <dd className="accent">
              {formatAmount(req.amount)} {req.extra?.symbol ? String(req.extra.symbol) : "USDC"}
            </dd>
          </div>
          <div>
            <dt>network</dt>
            <dd>{req.network}</dd>
          </div>
          <div>
            <dt>asset</dt>
            <dd className="mono">{truncateId(req.asset)}</dd>
          </div>
          <div>
            <dt>payTo</dt>
            <dd className="mono">{truncateId(req.payTo)}</dd>
          </div>
          {req.extra?.areFeesSponsored ? (
            <div>
              <dt>fees</dt>
              <dd>sponsored</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <div className="terms-pending">402 seen — open/trigger it to decode the terms</div>
      )}
    </li>
  );
}
