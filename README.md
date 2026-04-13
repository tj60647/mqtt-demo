<p align="center">
  <img src="mqtt-icon.svg" alt="MQTT Demo" width="120"/>
</p>

# MQTT Workshop

Welcome! In this workshop you will send and receive messages in real time using a technology called **MQTT**. No coding or installation required — just a web browser.

---

## What You Will Do

- Open a live web app in your browser
- Connect to a shared message server
- Send a message that others can instantly see
- Watch messages from other participants appear on your screen

---

## Step 1 — Open the App

Open your browser and go to:

👉 **https://tj60647.github.io/mqtt-demo/**

The app will load and immediately try to connect to a message server.

---

## Step 2 — Wait for "Connected: Yes"

Look at the top of the page for the connection status. Wait for it to say **Connected: Yes**. This usually takes just a second or two.

> If it stays on "Connected: No", wait a moment and refresh the page.

---

## Step 3 — Switch to the Workshop Server

Find the **broker dropdown** near the top of the app and select **Workshop (WSS)**. The app will reconnect automatically.

> This puts you on the shared workshop server so you can exchange messages with everyone in the room.

---

## Step 4 — Choose a Topic

A **topic** works like a channel — everyone subscribed to the same topic will see each other's messages.

The default topic is `wildlytransparent/mqtt`. You can leave it as-is to share a channel with the whole room, or type your own topic name (for example `workshop/yourname`) to create a personal channel.

> Topics are case-sensitive and should not contain spaces.

---

## Step 5 — Send a Message

1. Click inside the **message box**.
2. Type anything you like.
3. Click **Publish MQTT Message** (or press Enter).

Your message is sent to the broker and should appear under **Last Received Message** within moments — even on other participants' screens.

---

## Step 6 — See Messages From Others

If someone else is on the same topic, their messages will appear under **Last Received Message** as they arrive. Try coordinating with a neighbour and watch the messages flow!

---

## Broker Options

The broker dropdown lets you switch between message servers.

| Preset | Server | Credentials |
|--------|--------|-------------|
| **Workshop (WSS)** | `wss://mqtt.aroughidea.com:9001` | `workshop-user` / `mqtt-fun-2026` |
| Workshop (WS) | `ws://mqtt.aroughidea.com:9001` | same — *HTTP only, blocked on GitHub Pages* |
| **Mosquitto** *(default)* | `wss://test.mosquitto.org:8081` | none — public server |
| Local (WS) | `ws://localhost:9001` | none — *HTTP only, blocked on GitHub Pages* |
| Local (WSS) | `wss://localhost:9001` | none |

> **About the workshop credentials** — `workshop-user` / `mqtt-fun-2026` are intentionally shared for this workshop. Because this is a plain web page, any credentials written here are visible to anyone who views the page source. This is fine for a workshop demo on a semi-public broker, but should never be done for a real production system.

---

## Running It Locally (Optional)

If you want to run the app on your own computer instead of using GitHub Pages, you have a few options:

- **Windows shortcut**: Double-click `run_demo.bat`. It starts a local server and opens your browser automatically.
- **VS Code**: Install the "Live Server" extension, right-click `index.html`, and choose **Open with Live Server**.
- **Direct open**: Double-click `index.html` to open it in your browser (most features will still work).

---

## Glossary

**MQTT** — A lightweight messaging protocol designed for sending small messages between devices and applications over the internet. It is widely used in smart home and IoT (Internet of Things) devices.

**Broker** — The central server that receives messages and delivers them to the right recipients. Think of it like a post office: you don't send a letter directly to each person — you hand it to the post office, which handles delivery.

**Topic** — A label attached to every message that acts like a channel or address. Subscribers tell the broker which topics they want to receive messages on.

**Publish** — Sending a message to the broker on a specific topic so that subscribers can receive it.

**Subscribe** — Registering with the broker to receive messages on a specific topic.

**Client** — Any app or device that connects to the broker. In this workshop, your web browser is the client.

**Payload** — The actual content of a message — the text or data you send.

**WebSocket (WS / WSS)** — A technology that allows a web browser to keep a live, two-way connection open with a server. MQTT uses WebSockets to work inside a browser. WSS is the encrypted (secure) version.

**QoS (Quality of Service)** — A setting that controls how reliably a message is delivered. QoS 0 = send once and forget; QoS 1 = deliver at least once; QoS 2 = deliver exactly once.

**TLS / SSL** — Encryption technology that scrambles data while it travels over the internet so nobody can read it in transit. The "S" in WSS means TLS is active.

**SRI (Subresource Integrity)** — A browser security feature that checks a downloaded file matches an expected fingerprint, so a tampered file cannot run in your browser.

**CSP (Content Security Policy)** — A browser security header that restricts which scripts and resources a web page is allowed to load, reducing the risk of malicious code being injected.
