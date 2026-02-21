/*
	MQTT Demonstration
	https://openprocessing.org/sketch/2203435

  Overview:
  This code demonstrates a simple MQTT client implementation for educational purposes, showcasing how to
  establish a connection to an MQTT broker, subscribe to topics, publish messages, and display the status
  and messages in a user-friendly interface. The script utilizes p5.js for creating a minimalistic user
  interface consisting of an input field, a publish button, and paragraphs to display the connection status
  and received messages.

  Key Features:
  - Connects to an MQTT broker using the MQTT.js library (see SKETCH>LIBRARIES>mqtt.min.js), allowing for real-time message exchange.
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
let mqttClient;  // Instance for MQTT client operations
let receivedMessageText = "Waiting for MQTT messages...";  // Default text displayed in UI before any messages are received
let isMqttConnected = false;  // Tracks the connection status of the MQTT client

const defaultTopicName = 'wildlytransparent/mqtt';  // Default MQTT topic for initial subscription
let topicName = defaultTopicName;  // Variable to store the current topic name
let topicInput;  // HTML input element for changing the MQTT topic

//let mqttBrokerHost = 'wss://test.mosquitto.org:8081';  // MQTT broker URL and port
let mqttBrokerHost = 'wss://mqtt.aroughidea.com:9001';
//let mqttBrokerHost = 'ws://64.23.251.180.nip.io:9001';

// Variables to compare the current and last messages sent
let message_last = "";
let message_current = "";

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
    }
};

// Sets up the user interface and MQTT client configurations
function setup() {
    setupUserInterface();  // Initialize the user interface elements
    setupMqttClient();  // Configure and connect the MQTT client
}

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
        receivedMessageP.style('color', receivedMessageText === message_last ? '#F32C54' : '#0412E3');
        receivedMessageP.html(receivedMessageText);
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
        connectionStatusP.html('Connected: No');
        return;
    }

    const elapsedSinceActivity = Math.floor((Date.now() - lastMqttActivityMs) / 1000);
    const keepaliveRemaining = Math.max(0, mqttKeepaliveSeconds - elapsedSinceActivity);
    const countdownLabel = formatCountdown(keepaliveRemaining);
    connectionStatusP.html(`Connected: Yes (KA ${countdownLabel}/${mqttKeepaliveSeconds}s)`);
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
    const nextBrokerKey = brokerPresetSelect.value();
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
    let newTopic = topicInput.value();
	
	// if the topic name is invalid display naming rules and eliminate the error causing characters
	if(!isValidTopic(newTopic))
	{
		displayMessage("Topic cannot contain '+', '#', or spaces.");
		newTopic = newTopic.replace(/[ +#]/g, "");
	}

    topicInput.value(newTopic);  // Set the trimmed value back to the input field (UI update)

    // Stop early if still invalid after sanitization (e.g., empty)
    if (!isValidTopic(newTopic)) {
        displayMessage("Invalid MQTT topic. Subscription not updated.");
        return;
    }

    // Proceed only if the new topic is different from the current and is valid
    if (newTopic !== topicName && isValidTopic(newTopic)) {
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
            // If not connected, log this state and still update the topicName for future reconnection
			displayMessage("Client not connected. Cannot update subscription until reconnected.");
            topicName = newTopic;  // Store the new topic name to be used upon reconnection
        }
    } else if (newTopic === topicName) {
			displayMessage("New topic is the same as the current topic. No update needed.");
    } else {
        // If the topic is not valid, show an error message
        displayMessage("Invalid MQTT topic. Subscription not updated.");
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
    const messageContent = inputBox.value();
    const currentTopic = topicInput.value();
    publishMessage(currentTopic, messageContent);
    inputBox.value('');  // Clear the input box after publishing
}

//********************************
// Code to build the UI
//********************************
function setupUserInterface() {
    noCanvas(); // Disables the p5.js canvas since we are focusing on HTML elements for the UI.
    
    // Main panel for UI elements, styled for a clean and approachable appearance.
    let uiPanel = createDiv('');
    uiPanel.style('padding', '15px');
    uiPanel.style('text-align', 'center');
    uiPanel.style('width', '300px');
    uiPanel.style('height', '540px');
    uiPanel.style('box-sizing', 'border-box');
    uiPanel.style('overflow', 'hidden');
    uiPanel.style('position', 'relative');
    uiPanel.style('border', '1px solid #ccc');
    uiPanel.style('border-radius', '15px');
    uiPanel.style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
    uiPanel.style('background-color', '#f5f5f5');
    // uiPanel.position(windowWidth / 2 - 150, windowHeight / 2 - 100); // Center the panel.

    // Header with Icon and Title
    let headerDiv = createDiv('');
    headerDiv.parent(uiPanel);
    headerDiv.style('display', 'flex');
    headerDiv.style('flex-direction', 'column');
    headerDiv.style('align-items', 'center');
    headerDiv.style('justify-content', 'center');
    headerDiv.style('margin-bottom', '15px');

    let iconImg = createImg('mqtt-icon.svg', 'MQTT Icon');
    iconImg.parent(headerDiv);
    iconImg.style('width', '64px');
    iconImg.style('height', '64px');
    iconImg.style('margin-bottom', '10px');

    let titleHeader = createElement('h3', 'MQTT Demo');
    titleHeader.parent(headerDiv);
    titleHeader.style('margin', '0');
    titleHeader.style('color', '#333');

    // Instructions paragraph explaining how to use the interface.
    let instructionsParagraph = createP('Please type a message in the input box and click "Publish MQTT Message" or hit enter to send your message via MQTT.');
    instructionsParagraph.parent(uiPanel);
    instructionsParagraph.style('color', '#333');
    instructionsParagraph.style('font-size', '14px');
    instructionsParagraph.style('font-family', 'Arial, sans-serif');
    instructionsParagraph.style('margin', '10px 0');
    
    // Input box for message entry, designed to be intuitive and user-friendly.
    inputBox = createElement('textarea', '');
    inputBox.attribute('placeholder', 'Type your message here...');
    inputBox.style('margin', '10px 0');
    inputBox.style('width', '100%');
    inputBox.style('height', '48px');
    inputBox.style('background-color', '#fff'); // Sets the background color to white
    inputBox.style('border', '1px solid #ccc'); // Adds a border to the textarea
    inputBox.style('padding', '5px');
    inputBox.style('box-sizing', 'border-box');
    inputBox.style('border-radius', '5px');
    inputBox.style('font-family', 'Arial, sans-serif');
    inputBox.style('line-height', '16px');
    inputBox.style('overflow-y', 'auto');
    inputBox.style('overflow-x', 'hidden');
    inputBox.style('resize', 'none'); // Disables resizing of the textarea
    inputBox.parent(uiPanel);
	
		// Event listener for capturing Enter key press in the textarea
		inputBox.elt.addEventListener('keydown', function(event) {
    	// Check if the Enter key is pressed
    	if (event.key === "Enter" && !event.shiftKey) {  // The shiftKey check allows multi-line input if Shift+Enter is pressed
        event.preventDefault();  // Prevent the default action to stop from inserting a new line
        publishButton_handler();  // Call the function that handles publishing
    	}
		});

    // Publish button to send messages.
    let publishButton = createButton('Publish MQTT Message');
    publishButton.mousePressed(publishButton_handler);
    publishButton.parent(uiPanel);

    let tsCodeButton = createButton('i');
    tsCodeButton.mousePressed(openTsCodeModal);
    tsCodeButton.parent(uiPanel);
    tsCodeButton.attribute('title', 'View TypeScript client example');
    tsCodeButton.style('position', 'absolute');
    tsCodeButton.style('left', '50%');
    tsCodeButton.style('bottom', '10px');
    tsCodeButton.style('transform', 'translateX(-50%)');
    tsCodeButton.style('width', '16px');
    tsCodeButton.style('height', '16px');
    tsCodeButton.style('line-height', '14px');
    tsCodeButton.style('padding', '0');
    tsCodeButton.style('border-radius', '50%');
    tsCodeButton.style('font-size', '10px');
    tsCodeButton.style('font-weight', 'bold');
    tsCodeButton.style('cursor', 'pointer');
    
    // Label and paragraph for displaying received messages.
    let receivedMessageLabel = createP('Last Received Message:');
    receivedMessageLabel.parent(uiPanel);
    receivedMessageLabel.style('font-family', 'Arial, sans-serif');
    receivedMessageLabel.style('font-size', '12px');
    receivedMessageLabel.style('margin', '10px 0');
    receivedMessageLabel.style('color', '#333');
    
    // Display for received messages, initially set to show a waiting message.
    receivedMessageP = createP(receivedMessageText);
    receivedMessageP.parent(uiPanel);
    receivedMessageP.style('background-color', '#fff');
    receivedMessageP.style('color', '#AAAAAA');
    receivedMessageP.style('font-size', '12px');
    receivedMessageP.style('font-family', 'Arial, sans-serif');
    receivedMessageP.style('line-height', '16px');
    receivedMessageP.style('margin', '10px 0');
    receivedMessageP.style('border-radius', '5px');
    receivedMessageP.style('word-wrap', 'break-word');
    receivedMessageP.style('white-space', 'pre-wrap');
    receivedMessageP.style('height', '48px');
    receivedMessageP.style('overflow-y', 'auto');
    receivedMessageP.style('overflow-x', 'hidden');

    // Create and style the container for the editable topic information
    let topicContainer = createDiv('');
    topicContainer.parent(uiPanel);
    topicContainer.style('display', 'flex');
    topicContainer.style('justify-content', 'space-between');
    topicContainer.style('align-items', 'center');
    topicContainer.style('margin-bottom', '10px');

    // Add label and input for the MQTT topic within the container
    let topicLabel = createP('Topic:');
    topicLabel.parent(topicContainer);
    topicLabel.style('font-family', 'Arial, sans-serif');
    topicLabel.style('color', '#333');
    topicLabel.style('font-size', '12px');
    topicLabel.style('margin', '0 5px 0 0'); // Right margin for spacing

    topicInput = createInput(defaultTopicName); // Create an input field initialized with the current topic name
    topicInput.parent(topicContainer);
    topicInput.style('flex', '1'); // Allows the input to expand and fill the space
    topicInput.style('padding', '2px 3px');
    topicInput.style('font-size', '12px');
	
	    // Listen for committed changes (blur/enter) to avoid rapid resubscribe while typing
    topicInput.changed(updateTopicSubscription);

    // Broker configuration controls
    let brokerContainer = createDiv('');
    brokerContainer.parent(uiPanel);
    brokerContainer.style('display', 'flex');
    brokerContainer.style('justify-content', 'space-between');
    brokerContainer.style('align-items', 'center');
    brokerContainer.style('gap', '6px');
    brokerContainer.style('margin-bottom', '10px');

    let brokerLabel = createP('Host:');
    brokerLabel.parent(brokerContainer);
    brokerLabel.style('font-family', 'Arial, sans-serif');
    brokerLabel.style('color', '#333');
    brokerLabel.style('font-size', '12px');
    brokerLabel.style('margin', '0 5px 0 0');

    brokerPresetSelect = createSelect();
    brokerPresetSelect.parent(brokerContainer);
    brokerPresetSelect.option('wss://mqtt.aroughidea.com:9001', 'workshop');
    brokerPresetSelect.option('ws://mqtt.aroughidea.com:9001', 'workshop_ws');
    brokerPresetSelect.option('wss://test.mosquitto.org:8081', 'mosquitto');
    brokerPresetSelect.option('ws://localhost:9001', 'local');
    brokerPresetSelect.style('font-size', '12px');
    brokerPresetSelect.style('flex', '1');
        brokerPresetSelect.selected(selectedBrokerKey);
    brokerPresetSelect.changed(onBrokerPresetChanged);

    // Connection status display to inform the user of the MQTT client's status.
    connectionStatusP = createP('Connected: No');
    connectionStatusP.parent(uiPanel);
    connectionStatusP.style('font-family', 'Arial, sans-serif');
    connectionStatusP.style('font-size', '12px');
    connectionStatusP.style('margin', '5px 0');
    updateConnectionStatusDisplay();

    // Connection message display with timestamp on a separate line.
    let statusContainer = createDiv('');
    statusContainer.parent(uiPanel);
    statusContainer.style('height', '80px');
    statusContainer.style('max-height', '80px');
    statusContainer.style('overflow', 'hidden');
    statusContainer.style('text-align', 'center');

    displayTimestampP = createP('');
    displayTimestampP.parent(statusContainer);
    displayTimestampP.style('color', '#D11A2A');
    displayTimestampP.style('font-family', 'Arial, sans-serif');
    displayTimestampP.style('font-size', '10px');
    displayTimestampP.style('line-height', '16px');
    displayTimestampP.style('height', '16px');
    displayTimestampP.style('margin', '0 0 2px 0');
    displayTimestampP.style('white-space', 'nowrap');
    displayTimestampP.style('overflow', 'hidden');
    displayTimestampP.style('text-overflow', 'ellipsis');
    displayTimestampP.style('transition', 'color 4s ease');

    displayMessageP = createP('Ready'); // Placeholder text to reserve vertical space
    displayMessageP.parent(statusContainer);
    displayMessageP.style('color', '#D11A2A');
    displayMessageP.style('font-family', 'Arial, sans-serif');
    displayMessageP.style('font-size', '10px');
    displayMessageP.style('line-height', '16px');
    displayMessageP.style('height', '64px');
    displayMessageP.style('margin', '0');
    displayMessageP.style('overflow', 'hidden');
    displayMessageP.style('text-overflow', 'ellipsis');
    displayMessageP.style('display', '-webkit-box');
    displayMessageP.style('-webkit-line-clamp', '4');
    displayMessageP.style('-webkit-box-orient', 'vertical');
    displayMessageP.style('word-break', 'break-word');
    displayMessageP.style('transition', 'color 4s ease');

    createTsCodeModal();
}

function createTsCodeModal() {
    if (tsModalOverlay) {
        return;
    }

    tsModalOverlay = createDiv('');
    tsModalOverlay.style('position', 'fixed');
    tsModalOverlay.style('top', '0');
    tsModalOverlay.style('left', '0');
    tsModalOverlay.style('width', '100vw');
    tsModalOverlay.style('height', '100vh');
    tsModalOverlay.style('background-color', 'rgba(0,0,0,0.45)');
    tsModalOverlay.style('display', 'none');
    tsModalOverlay.style('align-items', 'center');
    tsModalOverlay.style('justify-content', 'center');
    tsModalOverlay.style('z-index', '9999');

    const modalCard = createDiv('');
    modalCard.parent(tsModalOverlay);
    modalCard.style('width', 'min(760px, 92vw)');
    modalCard.style('max-height', '80vh');
    modalCard.style('background-color', '#ffffff');
    modalCard.style('border-radius', '10px');
    modalCard.style('padding', '12px');
    modalCard.style('box-sizing', 'border-box');
    modalCard.style('display', 'flex');
    modalCard.style('flex-direction', 'column');
    modalCard.style('gap', '8px');

    const modalHeader = createDiv('');
    modalHeader.parent(modalCard);
    modalHeader.style('display', 'flex');
    modalHeader.style('justify-content', 'space-between');
    modalHeader.style('align-items', 'center');

    const modalTitle = createElement('h4', 'TypeScript MQTT Client Example');
    modalTitle.parent(modalHeader);
    modalTitle.style('margin', '0');

    const closeButton = createButton('Close');
    closeButton.parent(modalHeader);
    closeButton.mousePressed(closeTsCodeModal);

    const modalNote = createP('Uses placeholder credentials only. Replace <USERNAME>/<PASSWORD> for private brokers.');
    modalNote.parent(modalCard);
    modalNote.style('margin', '0');
    modalNote.style('font-size', '12px');

    const codePre = createElement('pre', '');
    codePre.parent(modalCard);
    codePre.style('margin', '0');
    codePre.style('padding', '10px');
    codePre.style('background-color', '#f5f5f5');
    codePre.style('border', '1px solid #ddd');
    codePre.style('border-radius', '8px');
    codePre.style('overflow', 'auto');
    codePre.style('font-size', '12px');
    codePre.style('line-height', '1.4');
    codePre.style('max-height', '60vh');
    codePre.html(escapeHtml(tsClientCodeExample));

    tsModalOverlay.mousePressed(function() {
        closeTsCodeModal();
    });

    modalCard.mousePressed(function(event) {
        event.stopPropagation();
    });

    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeTsCodeModal();
        }
    });
}

function openTsCodeModal() {
    if (!tsModalOverlay) {
        return;
    }
    tsModalOverlay.style('display', 'flex');
}

function closeTsCodeModal() {
    if (!tsModalOverlay) {
        return;
    }
    tsModalOverlay.style('display', 'none');
}

// Function to display and manage error messages in the UI.
function displayMessage(message, details) {
	
		// get the current time
    const timestamp = getTimestamp();

    const detailsText = formatDetailsText(details);
	const baseText = `${message}`;
	const messageText = detailsText ? `${baseText} ${detailsText}` : `${baseText}`;
    const isErrorMessage = baseText.toLowerCase().includes('error');

    console.log(`displayMessage: [${timestamp}] ${messageText}`);
    displayTimestampP.html(`[${timestamp}]`);
    if (detailsText && isErrorMessage) {
        displayMessageP.html(`${escapeHtml(baseText)} <span style="color:#1E5AE8;">${escapeHtml(detailsText)}</span>`);
    } else {
        displayMessageP.html(escapeHtml(messageText));
    }

    if (messageFadeTimer) {
        clearTimeout(messageFadeTimer);
    }

    displayTimestampP.style('transition', 'none');
    displayTimestampP.style('color', '#D11A2A');
    displayMessageP.style('transition', 'none');
    displayMessageP.style('color', '#D11A2A');
    void displayMessageP.elt.offsetWidth;
    displayTimestampP.style('transition', 'color 4s ease');
    displayMessageP.style('transition', 'color 4s ease');
    messageFadeTimer = setTimeout(() => {
        displayTimestampP.style('color', '#666666');
        displayMessageP.style('color', '#4A4A4A');
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
    // Get the current date and timeS
		const now = new Date(); 

    // Concatenate time components into a UTC timestamp string
    const timestamp = now.toISOString();

    return timestamp;
}
