# MQTT Demo

This project is a simple MQTT client demonstration using **p5.js** and **mqtt.js**.

## Files
- `index.html`: The main web page. It loads the required libraries.
- `script.js`: The application logic (p5.js sketch).

## How to Run

1.  **Fast Way (Windows)**:
    *   Double-click `run_demo.bat`. This will start a local server and open your browser automatically.

2.  **Recommended (VS Code)**: Use a local development server.
    *   If you are using VS Code, install the "Live Server" extension.
    *   Right-click on `index.html` and select "**Open with Live Server**".

3.  **Alternative**: Direct file open.
    *   You can try opening `index.html` directly in your browser by double-clicking it. Note that some browsers might restrict certain features when using `file://` protocol, but this demo mainly uses WebSockets which should work.

## Features
- Connects to the broker `wss://mqtt.aroughidea.com:9001` using the workshop credentials configured in `script.js`.
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
