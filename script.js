/*
	MQTT Demonstration
	https://openprocessing.org/sketch/2203435

  Overview:
  This code demonstrates a simple MQTT client implementation for educational purposes, showcasing how to
  establish a connection to an MQTT broker, subscribe to topics, publish messages, and display the status
  and messages in a user-friendly interface. The script uses vanilla DOM APIs to build the interface,
  consisting of an input field, a publish button, and paragraphs to display the connection status
  and received messages.

  Key Features:
  - Connects to an MQTT broker using the MQTT.js library, allowing for real-time message exchange.
	- This example uses the MQTT broker at wss://test.mosquitto.org:8081, more information about this publicly available broker can be found here: https://test.mosquitto.org/
  - Subscribes to a predefined topic to listen for incoming messages.
  - Publishes messages to the MQTT broker on a specific topic, which can be entered through an input box.
  - Displays the connection status to the user, indicating whether the client is connected to the MQTT broker.
  - Shows messages received from the MQTT broker in real-time.
  - Designed as a demo for educational purposes, it provides a practical example of implementing MQTT in web applications.

  The code serves as a foundation for understanding the basics of MQTT communication and interaction patterns,
  illustrating the publish-subscribe model in a web context. It's suitable for learners and developers looking
  to get started with IoT applications, real-time data communication, and building connected devices using MQTT.
  
  This example does not address the following, please research these topics before use in a robust demonstration:
  - Standard practices for formatting messages, for instance JSON
  - Security and encryption.
  
  You can use another client to monitor traffic such as:
  - The HiveMQ MQTT Browser Client: https://www.hivemq.com/demos/websocket-client/
  - MQTT Explorer: https://mqtt-explorer.com/
  - Another instance of this sketch.

  MQTT Overview:
  MQTT (Message Queuing Telemetry Transport) is a lightweight, publish-subscribe network protocol
  designed for minimal bandwidth and device resource requirements. Ideal for connecting remote devices
  with a small code footprint or in situations where network bandwidth is at a premium, MQTT operates
  over TCP/IP. It is widely used in the Internet of Things (IoT), mobile applications, and home automation
  systems to send and receive messages between devices. MQTT enables efficient and reliable communication
  through its three levels of Quality of Service (QoS), offering varying degrees of message delivery
  assurance. Its simple and flexible topic-based messaging system facilitates the easy collection of device
  data and commands across various networks, ensuring a robust solution for real-time, scalable, and
  distributed messaging applications.

  You can use any topic name in MQTT, provided it follows the MQTT protocol's topic naming rules and conventions.

  Topic Naming in MQTT:
	When creating topic names for MQTT, you have the flexibility to choose any name that suits your application's
  structure and requirements, with a few important considerations to ensure compatibility and clarity:
	
  - Hierarchical Structure: Use forward slashes (/) to organize topics into a hierarchical structure, e.g., "home/kitchen/temperature".
  - Avoid Spaces: Use underscores (_) or dashes (-) instead of spaces in topic names, e.g., "home/kitchen_light/level".
  - Case Sensitivity: Topic names are case-sensitive, making "Home/Kitchen/Temperature" different from "home/kitchen/temperature".
  - Wildcard Characters: Use "+" for single-level and "#" for multi-level wildcard subscriptions. These are not used in publishing topic names but are important for subscribing to multiple topics simultaneously.
  - Reserved Characters: Avoid using the "$" character at the beginning of your topic names unless intended for specific system topics as defined by your MQTT broker.
  - Length Consideration: Keep topic names concise to reduce message overhead, though MQTT does not strictly limit the length.
  
	It's essential, especially in shared or large-scale environments, to establish a clear topic naming convention 
	to avoid conflicts and ensure subscribers can easily understand and manage the topics they are interested in.
	
	Instructions:
	- To Send a Message: Type your message in the input box labeled "Type your message here...". 
	  Click "Publish MQTT Message" or hit enter to send your message to the MQTT broker on the current topic. 
	
	- To Change and Subscribe to a New Topic: 
	  Enter a new topic in the field next to "Topic:" following MQTT naming rules (avoid spaces, +, #). 
	  The system automatically subscribes to the new topic once you change it, displaying messages received on this topic under "Last Received Message". 
	
	- Check "Connected: Yes/No" to verify connection status before sending or receiving messages.
*/

// Initial variable declarations for the MQTT setup and UI management
let mqttClient;           // Instance for MQTT client operations
let receivedMessageText = "Waiting for MQTT messages...";  // Default text before any messages are received
let isMqttConnected = false;  // Tracks the connection status of the MQTT client

const defaultTopicName = 'wildlytransparent/mqtt';  // Default MQTT topic for initial subscription
let topicName = defaultTopicName;  // Variable to store the current topic name

//let mqttBrokerHost = 'wss://test.mosquitto.org:8081';  // MQTT broker URL and port
let mqttBrokerHost = 'wss://mqtt.aroughidea.com:9001';
//let mqttBrokerHost = 'ws://64.23.251.180.nip.io:9001';

// UI element references (populated by setupUserInterface)
let inputBox;
let receivedMessageP;
let connectionStatusP;
let displayMessageP;
let topicInput;

// Variables to compare the current and last messages sent
let message_last = "";

/* 
  SECURITY WARNING:
  -----------------
  Hardcoding credentials in client-side JavaScript is NOT secure for production.
  Anyone who can view this web page can see these credentials ("View Source").
  
  Best Practices:
  1. Use a public broker or specific "anonymous" topics for public demos.
  2. For production, the browser should connect to your own backend server, 
     which then connects to MQTT (hiding the credentials).
  3. Or, use short-lived authentication tokens generated by your backend.

  These are kept here for the simplicity of this specific educational workshop.
*/
let mqttUsername = 'workshop-user';
let mqttPassword = 'mqtt-fun-2026';
let brokerPresetSelect;
let selectedBrokerKey = 'mosquitto';
const mqttKeepaliveSeconds = 60;
let lastMqttActivityMs = null;
let connectionStatusTimerId = null;
let displayTimestampP;
let messageFadeTimer;
let tsModalOverlay;

const tsClientCodeExample = `/**
 * MQTT TypeScript Beginner Example
 * --------------------------------
 * 1) Connect to a broker over WebSocket
 * 2) Subscribe to a topic
 * 3) Print incoming messages
 * 4) Publish a test message
 *
 * Install:
 *   npm install mqtt
 */

import mqtt, { MqttClient } from 'mqtt';

// Use one of your demo hosts from the UI
const brokerUrl = 'wss://test.mosquitto.org:8081';

// Pick any topic string that your app will use
const topic = 'wildlytransparent/mqtt';

// Create and connect the client
const client: MqttClient = mqtt.connect(brokerUrl, {
    connectTimeout: 30_000,
    clean: true,

    // For private brokers, replace placeholders with real values
    // (Do not commit real credentials to source control)
    username: '<USERNAME>',
    password: '<PASSWORD>'
});

// Fires once connection is successful
client.on('connect', () => {
    console.log('Connected to broker');

    // Subscribe so we can receive messages on this topic
    client.subscribe(topic, (error) => {
        if (error) {
            console.error('Subscribe failed:', error.message);
            return;
        }

        console.log('Subscribed to:', topic);

        // Publish a starter message after subscribing
        client.publish(topic, 'Hello from TypeScript!');
    });
});

// Fires whenever a message arrives on subscribed topics
client.on('message', (incomingTopic, payload) => {
    console.log('Message received');
    console.log('Topic:', incomingTopic);
    console.log('Payload:', payload.toString());
});

// Fires on network/protocol/auth errors
client.on('error', (error) => {
    console.error('MQTT error:', error.message);
});`;

const brokerPresets = {
    workshop: {
        url: 'wss://mqtt.aroughidea.com:9001',
        username: 'workshop-user',
        password: 'mqtt-fun-2026'
    },
    workshop_ws: {
        url: 'ws://mqtt.aroughidea.com:9001',
        username: 'workshop-user',
        password: 'mqtt-fun-2026'
    },
    mosquitto: {
        url: 'wss://test.mosquitto.org:8081',
        username: null,
        password: null
    },
    local: {
        url: 'ws://localhost:9001',
        username: null,
        password: null
    },
    local_wss: {
        url: 'wss://localhost:9001',
        username: null,
        password: null
    }
};

// Entry point — initializes the UI and connects to the MQTT broker once the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setupUserInterface();
    setupMqttClient();
});

// Initializes and connects the MQTT client to the broker
function setupMqttClient() {
    const selectedPreset = brokerPresets[selectedBrokerKey] || brokerPresets.workshop;
    mqttBrokerHost = selectedPreset.url;
    mqttUsername = selectedPreset.username;
    mqttPassword = selectedPreset.password;

    const protocol = mqttBrokerHost.toLowerCase().startsWith('ws://') ? 'ws' : 'wss';

    displayMessage('Connecting to broker...');

    // Define connection options
    const options = {
        keepalive: mqttKeepaliveSeconds,
        protocol,
        clean: true,
        connectTimeout: 30 * 1000
    };

    if (mqttUsername && mqttPassword) {
        options.username = mqttUsername;
        options.password = mqttPassword;
    }

    // Connect with options
    mqttClient = mqtt.connect(mqttBrokerHost, options);  // Connect WITH options

    // Track MQTT traffic so the keepalive timer reflects real activity.
    mqttClient.on('packetsend', function () {
        noteMqttActivity();
    });

    mqttClient.on('packetreceive', function () {
        noteMqttActivity();
    });

    // Handles successful connection to the broker
    mqttClient.on('connect', function () {
        isMqttConnected = true;
		displayMessage('Connected to broker.');
        startConnectionStatusTimer();
        noteMqttActivity();
        displayMessage('Connected to MQTT broker, subscribing to: ' + topicName);
        mqttClient.subscribe(topicName, function (err) {
            if (err) displayMessage('Initial subscription error:', err);
            else displayMessage('Initially subscribed to: ' + topicName);
        });
    });

    // Handles incoming messages and updates the UI
    mqttClient.on('message', function (topic, message) {
        receivedMessageText = message.toString();
        displayMessage(`Received message on topic '${topic}': ${receivedMessageText}`);
        receivedMessageP.style.color = receivedMessageText === message_last ? '#F32C54' : '#0412E3';
        receivedMessageP.textContent = receivedMessageText;
    });

    // Handles MQTT client errors
    mqttClient.on('error', function (error) {
        isMqttConnected = false;
        stopConnectionStatusTimer();
        displayMessage('Connection Error:', error);
    });

    // Handles client going offline
    mqttClient.on('offline', function () {
                isMqttConnected = false;
				stopConnectionStatusTimer();
				displayMessage('MQTT Client is offline.');
    });

    // Handles client attempting to reconnect
    mqttClient.on('reconnect', function () {
        isMqttConnected = false;
				stopConnectionStatusTimer();
				displayMessage('Attempting to reconnect to broker...');
    });

    mqttClient.on('close', function () {
        isMqttConnected = false;
        stopConnectionStatusTimer();
        displayMessage('MQTT connection closed.');
    });
}

function formatCountdown(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function noteMqttActivity() {
    if (!isMqttConnected) {
        return;
    }

    lastMqttActivityMs = Date.now();
    updateConnectionStatusDisplay();
}

function updateConnectionStatusDisplay() {
    if (!connectionStatusP) {
        return;
    }

    if (!isMqttConnected || lastMqttActivityMs === null) {
        connectionStatusP.textContent = 'Connected: No';
        return;
    }

    const elapsedSinceActivity = Math.floor((Date.now() - lastMqttActivityMs) / 1000);
    const keepaliveRemaining = Math.max(0, mqttKeepaliveSeconds - elapsedSinceActivity);
    const countdownLabel = formatCountdown(keepaliveRemaining);
    connectionStatusP.textContent = `Connected: Yes (KA ${countdownLabel}/${mqttKeepaliveSeconds}s)`;
}

function startConnectionStatusTimer() {
    lastMqttActivityMs = Date.now();
    if (connectionStatusTimerId) {
        clearInterval(connectionStatusTimerId);
    }
    updateConnectionStatusDisplay();
    connectionStatusTimerId = setInterval(updateConnectionStatusDisplay, 1000);
}

function stopConnectionStatusTimer() {
    lastMqttActivityMs = null;
    if (connectionStatusTimerId) {
        clearInterval(connectionStatusTimerId);
        connectionStatusTimerId = null;
    }
    updateConnectionStatusDisplay();
}

function reconnectToBroker() {
    const selectedPreset = brokerPresets[selectedBrokerKey] || brokerPresets.workshop;
    mqttBrokerHost = selectedPreset.url;
    isMqttConnected = false;
    stopConnectionStatusTimer();

    if (mqttClient) {
        mqttClient.end(true);
    }

    displayMessage('Reconnecting to broker...');
    setupMqttClient();
}

function onBrokerPresetChanged() {
    const nextBrokerKey = brokerPresetSelect.value;
    if (brokerPresets[nextBrokerKey]) {
        selectedBrokerKey = nextBrokerKey;
        displayMessage('Broker selected.');
        reconnectToBroker();
    }
}

// Validates the MQTT topic format
function isValidTopic(topic) {
    if (!topic || topic.includes('+') || topic.includes('#') || topic.includes(' ')) {
        displayMessage("Invalid topic: Ensure it is non-empty and does not contain '+', '#', or spaces.");
        return false;
    }
    return true;
}

// Updates the MQTT subscription if the topic changes
function updateTopicSubscription() {
    let newTopic = topicInput.value;

    // if the topic name is invalid, display naming rules and eliminate the error-causing characters
    if (!isValidTopic(newTopic)) {
        displayMessage("Topic cannot contain '+', '#', or spaces.");
        newTopic = newTopic.replace(/[ +#]/g, "");
    }

    topicInput.value = newTopic;  // Set the sanitized value back to the input field (UI update)

    // Stop early if still invalid after sanitization (e.g., empty)
    if (!isValidTopic(newTopic)) {
        displayMessage("Invalid MQTT topic. Subscription not updated.");
        return;
    }

    // Proceed only if the new topic is different from the current
    if (newTopic !== topicName) {
        if (mqttClient.connected) {
            // If client is connected, first unsubscribe from the current topic
            mqttClient.unsubscribe(topicName, function(err) {
                if (err) {
                    displayMessage('Unsubscribe error:', err);
                } else {
                    displayMessage('Unsubscribed from:', topicName);
                    topicName = newTopic;  // Update the global topicName with the new valid topic
                    // Subscribe to the new topic
                    mqttClient.subscribe(topicName, function(err) {
                        if (err) {
                            displayMessage('Subscription error:', err);
                        } else {
                            displayMessage('Subscribed to:', topicName);
                        }
                    });
                }
            });
        } else {
            // If not connected, store the new topic name for use upon reconnection
            displayMessage("Client not connected. Cannot update subscription until reconnected.");
            topicName = newTopic;
        }
    } else {
        displayMessage("New topic is the same as the current topic. No update needed.");
    }
}


// Publishes a message to a specific topic
function publishMessage(topic, message) {
    // First check if the client is connected
    if (!mqttClient || !mqttClient.connected) {
        displayMessage("Cannot publish: MQTT client is not connected.");
        return; // Exit the function early if not connected
    }

    // Then check if the message is not empty
    if (message.trim() === '') {
        displayMessage("Cannot publish: The message is empty.");
        return; // Exit the function early if the message is empty
    }

    // If both checks pass, publish the message
    message_last = message; // Store the last message published for reference
    mqttClient.publish(topic, message);
    displayMessage(`Published message to topic '${topic}': ${message}`);
}


// Handles publish button click event
function publishButton_handler() {
    const messageContent = inputBox.value;
    const currentTopic = topicInput.value;
    publishMessage(currentTopic, messageContent);
    inputBox.value = '';  // Clear the input box after publishing
}

//********************************
// Code to build the UI
//********************************
function setupUserInterface() {
    // Main panel
    const uiPanel = document.createElement('div');
    Object.assign(uiPanel.style, {
        padding: '15px',
        textAlign: 'center',
        width: '300px',
        height: '540px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid #ccc',
        borderRadius: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#f5f5f5'
    });
    document.body.appendChild(uiPanel);

    // Header with icon and title
    const headerDiv = document.createElement('div');
    Object.assign(headerDiv.style, {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15px'
    });
    uiPanel.appendChild(headerDiv);

    const iconImg = document.createElement('img');
    iconImg.src = 'mqtt-icon.svg';
    iconImg.alt = 'MQTT Icon';
    Object.assign(iconImg.style, {
        width: '64px',
        height: '64px',
        marginBottom: '10px'
    });
    headerDiv.appendChild(iconImg);

    const titleHeader = document.createElement('h3');
    titleHeader.textContent = 'MQTT Demo';
    Object.assign(titleHeader.style, {
        margin: '0',
        color: '#333'
    });
    headerDiv.appendChild(titleHeader);

    // Intro paragraph
    const instructionsParagraph = document.createElement('p');
    instructionsParagraph.textContent = 'This is an MQTT publish/subscribe demo for browser-based learning and testing.';
    Object.assign(instructionsParagraph.style, {
        color: '#333',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        margin: '10px 0'
    });
    uiPanel.appendChild(instructionsParagraph);

    // Info button
    const tsCodeButton = document.createElement('button');
    tsCodeButton.textContent = 'i';
    tsCodeButton.setAttribute('title', 'View TypeScript client example');
    tsCodeButton.addEventListener('click', openTsCodeModal);
    Object.assign(tsCodeButton.style, {
        display: 'block',
        margin: '0 auto 0px auto',
        width: '16px',
        height: '16px',
        lineHeight: '14px',
        padding: '0',
        borderRadius: '50%',
        fontSize: '10px',
        fontWeight: 'bold',
        cursor: 'pointer'
    });
    uiPanel.appendChild(tsCodeButton);

    // Message textarea
    inputBox = document.createElement('textarea');
    inputBox.setAttribute('placeholder', 'Type your message here...');
    Object.assign(inputBox.style, {
        margin: '10px 0',
        width: '100%',
        height: '48px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '5px',
        boxSizing: 'border-box',
        borderRadius: '5px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '16px',
        overflowY: 'auto',
        overflowX: 'hidden',
        resize: 'none'
    });
    // Enter key submits; Shift+Enter allows a newline
    inputBox.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            publishButton_handler();
        }
    });
    uiPanel.appendChild(inputBox);

    // Publish button
    const publishButton = document.createElement('button');
    publishButton.textContent = 'Publish MQTT Message';
    publishButton.addEventListener('click', publishButton_handler);
    uiPanel.appendChild(publishButton);

    // Received message label
    const receivedMessageLabel = document.createElement('p');
    receivedMessageLabel.textContent = 'Last Received Message:';
    Object.assign(receivedMessageLabel.style, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        margin: '10px 0',
        color: '#333'
    });
    uiPanel.appendChild(receivedMessageLabel);

    // Received message display
    receivedMessageP = document.createElement('p');
    receivedMessageP.textContent = receivedMessageText;
    Object.assign(receivedMessageP.style, {
        backgroundColor: '#fff',
        color: '#AAAAAA',
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '16px',
        margin: '10px 0',
        borderRadius: '5px',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        height: '48px',
        overflowY: 'auto',
        overflowX: 'hidden'
    });
    uiPanel.appendChild(receivedMessageP);

    // Topic row
    const topicContainer = document.createElement('div');
    Object.assign(topicContainer.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    });
    uiPanel.appendChild(topicContainer);

    const topicLabel = document.createElement('p');
    topicLabel.textContent = 'Topic:';
    Object.assign(topicLabel.style, {
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        fontSize: '12px',
        margin: '0 5px 0 0'
    });
    topicContainer.appendChild(topicLabel);

    topicInput = document.createElement('input');
    topicInput.type = 'text';
    topicInput.value = defaultTopicName;
    Object.assign(topicInput.style, {
        flex: '1',
        padding: '2px 3px',
        fontSize: '12px'
    });
    // Listen for committed changes (blur/enter) to avoid rapid resubscribe while typing
    topicInput.addEventListener('change', updateTopicSubscription);
    topicContainer.appendChild(topicInput);

    // Broker row
    const brokerContainer = document.createElement('div');
    Object.assign(brokerContainer.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px'
    });
    uiPanel.appendChild(brokerContainer);

    const brokerLabel = document.createElement('p');
    brokerLabel.textContent = 'Host:';
    Object.assign(brokerLabel.style, {
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        fontSize: '12px',
        margin: '0 5px 0 0'
    });
    brokerContainer.appendChild(brokerLabel);

    brokerPresetSelect = document.createElement('select');
    [
        ['wss://mqtt.aroughidea.com:9001', 'workshop'],
        ['ws://mqtt.aroughidea.com:9001',  'workshop_ws'],
        ['wss://test.mosquitto.org:8081',  'mosquitto'],
        ['ws://localhost:9001',            'local'],
        ['wss://localhost:9001',           'local_wss']
    ].forEach(function ([label, value]) {
        const opt = document.createElement('option');
        opt.textContent = label;
        opt.value = value;
        brokerPresetSelect.appendChild(opt);
    });
    brokerPresetSelect.value = selectedBrokerKey;
    Object.assign(brokerPresetSelect.style, {
        fontSize: '12px',
        flex: '1'
    });
    brokerPresetSelect.addEventListener('change', onBrokerPresetChanged);
    brokerContainer.appendChild(brokerPresetSelect);

    // Connection status display
    connectionStatusP = document.createElement('p');
    connectionStatusP.textContent = 'Connected: No';
    Object.assign(connectionStatusP.style, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        margin: '5px 0'
    });
    uiPanel.appendChild(connectionStatusP);
    updateConnectionStatusDisplay();

    // Status log area (timestamp + message)
    const statusContainer = document.createElement('div');
    Object.assign(statusContainer.style, {
        height: '80px',
        maxHeight: '80px',
        overflow: 'hidden',
        textAlign: 'center'
    });
    uiPanel.appendChild(statusContainer);

    displayTimestampP = document.createElement('p');
    Object.assign(displayTimestampP.style, {
        color: '#D11A2A',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        lineHeight: '16px',
        height: '16px',
        margin: '0 0 2px 0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transition: 'color 4s ease'
    });
    statusContainer.appendChild(displayTimestampP);

    displayMessageP = document.createElement('p');
    displayMessageP.textContent = 'Ready';
    Object.assign(displayMessageP.style, {
        color: '#D11A2A',
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        lineHeight: '16px',
        height: '64px',
        margin: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        transition: 'color 4s ease'
    });
    displayMessageP.style.display = '-webkit-box';
    displayMessageP.style['-webkit-line-clamp'] = '4';
    displayMessageP.style['-webkit-box-orient'] = 'vertical';
    statusContainer.appendChild(displayMessageP);

    createTsCodeModal();
}

function createTsCodeModal() {
    if (tsModalOverlay) {
        return;
    }

    tsModalOverlay = document.createElement('div');
    Object.assign(tsModalOverlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999'
    });

    const modalCard = document.createElement('div');
    Object.assign(modalCard.style, {
        width: 'min(760px, 92vw)',
        maxHeight: '80vh',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    });
    tsModalOverlay.appendChild(modalCard);

    const modalHeader = document.createElement('div');
    Object.assign(modalHeader.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    });
    modalCard.appendChild(modalHeader);

    const modalTitle = document.createElement('h4');
    modalTitle.textContent = 'About This MQTT Demo + TypeScript Starter';
    modalTitle.style.margin = '0';
    modalHeader.appendChild(modalTitle);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', closeTsCodeModal);
    modalHeader.appendChild(closeButton);

    const modalIntro = document.createElement('p');
    modalIntro.textContent = 'What is this? A lightweight MQTT demo client running in your browser over WebSockets. It lets you connect, subscribe, and publish without installing a full desktop MQTT tool.';
    Object.assign(modalIntro.style, {
        margin: '0',
        fontSize: '12px',
        lineHeight: '1.45'
    });
    modalCard.appendChild(modalIntro);

    const modalUseCases = document.createElement('ul');
    Object.assign(modalUseCases.style, {
        margin: '0 0 0 18px',
        padding: '0',
        fontSize: '12px',
        lineHeight: '1.45'
    });
    [
        'Why use it: validate topic structure and payload flow quickly, with immediate feedback.',
        'Where used: IoT prototypes, workshop labs, telemetry demos, browser dashboards, and QA smoke tests.',
        'Who uses it: developers, integrators, students, trainers, and support/operations engineers.'
    ].forEach(function (text) {
        const li = document.createElement('li');
        li.textContent = text;
        modalUseCases.appendChild(li);
    });
    modalCard.appendChild(modalUseCases);

    const modalSecurity = document.createElement('p');
    modalSecurity.textContent = 'Security note: any username/password placed in browser JavaScript is visible to end users and is not a secret. Use this only for demos/public test access. For production, keep credentials server-side and issue short-lived tokens to clients.';
    Object.assign(modalSecurity.style, {
        margin: '0',
        fontSize: '12px',
        lineHeight: '1.45',
        color: '#A6131F'
    });
    modalCard.appendChild(modalSecurity);

    const modalCodeLabel = document.createElement('p');
    modalCodeLabel.textContent = 'TypeScript starter example (includes placeholder auth fields for private brokers):';
    Object.assign(modalCodeLabel.style, {
        margin: '0',
        fontSize: '12px'
    });
    modalCard.appendChild(modalCodeLabel);

    const codePre = document.createElement('pre');
    Object.assign(codePre.style, {
        margin: '0',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '12px',
        lineHeight: '1.4',
        maxHeight: '60vh'
    });
    codePre.textContent = tsClientCodeExample;
    modalCard.appendChild(codePre);

    tsModalOverlay.addEventListener('click', closeTsCodeModal);
    modalCard.addEventListener('click', function (event) {
        event.stopPropagation();
    });
    window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeTsCodeModal();
        }
    });

    document.body.appendChild(tsModalOverlay);
}

function openTsCodeModal() {
    if (!tsModalOverlay) {
        return;
    }
    tsModalOverlay.style.display = 'flex';
}

function closeTsCodeModal() {
    if (!tsModalOverlay) {
        return;
    }
    tsModalOverlay.style.display = 'none';
}


// Function to display and manage error messages in the UI.
function displayMessage(message, details) {
    // get the current time
    const timestamp = getTimestamp();

    const detailsText = formatDetailsText(details);
    const baseText = String(message);
    const messageText = detailsText ? `${baseText} ${detailsText}` : baseText;
    const isErrorMessage = baseText.toLowerCase().includes('error');

    console.log(`displayMessage: [${timestamp}] ${messageText}`);
    displayTimestampP.textContent = `[${timestamp}]`;
    if (detailsText && isErrorMessage) {
        displayMessageP.textContent = '';
        displayMessageP.appendChild(document.createTextNode(baseText + ' '));
        const detailSpan = document.createElement('span');
        detailSpan.style.color = '#1E5AE8';
        detailSpan.textContent = detailsText;
        displayMessageP.appendChild(detailSpan);
    } else {
        displayMessageP.textContent = messageText;
    }

    if (messageFadeTimer) {
        clearTimeout(messageFadeTimer);
    }

    displayTimestampP.style.transition = 'none';
    displayTimestampP.style.color = '#D11A2A';
    displayMessageP.style.transition = 'none';
    displayMessageP.style.color = '#D11A2A';
    void displayMessageP.offsetWidth;
    displayTimestampP.style.transition = 'color 4s ease';
    displayMessageP.style.transition = 'color 4s ease';
    messageFadeTimer = setTimeout(() => {
        displayTimestampP.style.color = '#666666';
        displayMessageP.style.color = '#4A4A4A';
    }, 1000);
}

function formatDetailsText(details) {
    if (details === undefined || details === null) {
        return '';
    }

    if (typeof details === 'string') {
        return details;
    }

    if (details instanceof Error) {
        return details.message;
    }

    try {
        return JSON.stringify(details);
    } catch (_error) {
        return String(details);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getTimestamp() {
    // Get the current date and time
    const now = new Date();

    // Concatenate time components into a UTC timestamp string
    const timestamp = now.toISOString();

    return timestamp;
}
