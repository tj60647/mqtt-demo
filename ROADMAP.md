# MQTT Demo Roadmap

This roadmap captures practical next steps for evolving this demo while keeping the UI simple.

## Phase 1 — Stabilize Demo UX (Near Term)
- Keep host selection constrained to approved presets only.
- Keep status text concise and avoid duplicate host/protocol wording.
- Maintain the keepalive countdown display and verify behavior across broker switches.
- Preserve compact layout constraints (fixed panel height, bounded message areas, scroll where needed).

## Phase 2 — Local TLS Developer Experience
- Standardize local TLS workflow for `wss://localhost:9001`.
- Document dev-certificate generation (recommended: `mkcert`) and trusted CA installation steps.
- Add a quick verification checklist:
  - port reachable,
  - TLS handshake succeeds,
  - cert SAN includes `localhost` and loopback IPs.

## Phase 3 — Publicly Trusted TLS for Production-like Access
Goal: eliminate client-side CA installation requirements for internet users.

- Provision a public DNS name (example: `mqtt.yourdomain.com`).
- Issue certificates from a public CA (e.g., Let's Encrypt) via ACME.
- Expose a browser-friendly WSS endpoint (prefer `443`).
- Configure auto-renewal and service reload on cert updates.
- Validate externally:
  - full certificate chain is presented,
  - hostname matches certificate,
  - browser trust passes without manual cert import.

## Phase 4 — Security Hardening
- Remove long-lived credentials from browser-delivered source.
- Use backend-issued short-lived tokens or a broker auth gateway.
- Define topic namespace rules (read/write boundaries by role/environment).
- Add broker-side rate limits and connection limits for abuse protection.

## Phase 5 — Observability & Reliability
- Add lightweight telemetry for connect/disconnect/reconnect/error reasons.
- Track reconnect frequency and time-to-recover metrics.
- Add a test matrix for broker presets (`Mosquitto`, `Aroughidea ws/wss`, `Local ws/wss`).
- Document expected behavior under network loss and broker restarts.

## Suggested Execution Order
1. Phase 2 (local TLS workflow)
2. Phase 3 (public CA + DNS + renew)
3. Phase 4 (credential/auth hardening)
4. Phase 5 (operational telemetry)
