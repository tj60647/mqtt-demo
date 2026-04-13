# MQTT Demo

This project is a simple MQTT client demonstration using **mqtt.js** and vanilla DOM APIs.

## Live Demo

Hosted on GitHub Pages: **https://tj60647.github.io/mqtt-demo/**

## Files
- `index.html`: The main web page. It loads the required libraries.
- `script.js`: The application logic (vanilla DOM UI + MQTT client).
- `style.css`: Page layout styles.
- `ROADMAP.md`: Planned next steps for TLS, security, and reliability.

## How to Run

1.  **GitHub Pages**: Visit https://tj60647.github.io/mqtt-demo/ — no install needed.

2.  **Fast Way (Windows)**:
    *   Double-click `run_demo.bat`. This will start a local server and open your browser automatically.

3.  **Recommended (VS Code)**: Use a local development server.
    *   If you are using VS Code, install the "Live Server" extension.
    *   Right-click on `index.html` and select "**Open with Live Server**".

4.  **Alternative**: Direct file open.
    *   You can try opening `index.html` directly in your browser by double-clicking it. Note that some browsers might restrict certain features when using `file://` protocol, but this demo mainly uses WebSockets which should work.

## Features
- Connects to `wss://test.mosquitto.org:8081` by default (no credentials required).
- Allows you to subscribe to a topic.
- Allows you to publish messages to that topic.
- Allows you to switch broker host at runtime with presets (`Workshop`, `Mosquitto`, `Local`) and reconnect.
- Displays connection status and incoming messages.

## Usage
1.  Open the web page.
2.  Wait for "Connected: Yes".
3.  Type a message and click "Publish MQTT Message".
4.  You should see your message appear in "Last Received Message".
5.  To switch brokers, choose one of the full host URLs in the broker dropdown. The app reconnects automatically.

## Broker Presets and Credentials

| Preset | URL | Credentials |
|--------|-----|-------------|
| Workshop (WSS) | `wss://mqtt.aroughidea.com:9001` | workshop-user / mqtt-fun-2026 |
| Workshop (WS) | `ws://mqtt.aroughidea.com:9001` | same — **HTTP only, blocked on Pages** |
| Mosquitto *(default)* | `wss://test.mosquitto.org:8081` | none (public) |
| Local (WS) | `ws://localhost:9001` | none — **HTTP only, blocked on Pages** |
| Local (WSS) | `wss://localhost:9001` | none |

> **Workshop credentials** (`workshop-user` / `mqtt-fun-2026`) are intentionally hardcoded
> for convenience during in-person workshops with a semi-public broker. Because this is a
> static web page, any credentials placed here are visible to anyone via "View Source" —
> there is no way to hide them in a browser-only application.
>
> **Do not reuse this pattern for production.** For production systems, connect the browser
> to your own backend, which then connects to MQTT server-side (keeping real credentials
> out of client code). Alternatively, have a backend issue short-lived auth tokens.

## Security

- **Content Security Policy**: `default-src 'none'` with an explicit allow-list. The `script-src`
  directive uses the SHA-384 SRI hash of `mqtt.min.js` so no other third-party script can be
  injected — not even another file from the same CDN.
- **Subresource Integrity (SRI)**: `mqtt@5.10.4` is loaded with an `integrity` hash. The browser
  will refuse to execute the file if its content has changed.
- **XSS**: All MQTT payload content is inserted via `textContent`; no `innerHTML` is used.
