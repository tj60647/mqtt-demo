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
let mqttBrokerHost = 'ws://mqtt.aroughidea.com:9001';
//let mqttBrokerHost = 'ws://64.23.251.180.nip.io:9001';

// Variables to compare the current and last messages sent
let message_last = "";
let message_current = "";

// Sets up the user interface and MQTT client configurations
function setup() {
    setupUserInterface();  // Initialize the user interface elements
    setupMqttClient();  // Configure and connect the MQTT client
}

// Initializes and connects the MQTT client to the broker
function setupMqttClient() {

    // Define connection options
    const options = {
        username: 'workshop-user', // Must match what you created on the server
        password: 'mqtt-fun-2026', // Must match what you created on the server
        keepalive: 60,
        protocol: 'ws',
        clean: true,
        connectTimeout: 30 * 1000
    };

    // Connect with options
    mqttClient = mqtt.connect(mqttBrokerHost, options);  // Connect WITH options

    // Handles successful connection to the broker
    mqttClient.on('connect', function () {
        isMqttConnected = true;
		displayMessage('Connected to the MQTT broker.');
        connectionStatusP.html(`Connected: Yes`);
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
        displayMessage('Connection Error:', error);
    });

    // Handles client going offline
    mqttClient.on('offline', function () {
				displayMessage('MQTT Client is offline.');
    });

    // Handles client attempting to reconnect
    mqttClient.on('reconnect', function () {
				displayMessage('Attempting to reconnect to the MQTT broker.');
    });
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
		newTopic = newTopic.replace(" ","");
		newTopic = newTopic.replace("+","");
		newTopic = newTopic.replace("#","");
	}

    topicInput.value(newTopic);  // Set the trimmed value back to the input field (UI update)

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
			displayMessage("Invalid MQTT topic. Subscription not updated.");
    } else {
        // If the topic is not valid, show an error message
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
    inputBox.style('width', '280px');
    inputBox.style('height', '30px');
    inputBox.style('background-color', '#fff'); // Sets the background color to white
    inputBox.style('border', '1px solid #ccc'); // Adds a border to the textarea
    inputBox.style('padding', '5px');
    inputBox.style('border-radius', '5px');
    inputBox.style('font-family', 'Arial, sans-serif');
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
    receivedMessageP.style('margin', '10px 0');
    receivedMessageP.style('border-radius', '5px');
    receivedMessageP.style('word-wrap', 'break-word');
    receivedMessageP.style('white-space', 'pre-wrap');

    // Connection status display to inform the user of the MQTT client's status.
    connectionStatusP = createP(`Connected: ${isMqttConnected ? 'Yes' : 'No'}`);
    connectionStatusP.parent(uiPanel);
    connectionStatusP.style('font-family', 'Arial, sans-serif');
    connectionStatusP.style('font-size', '12px');
    connectionStatusP.style('margin', '5px 0');
	
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
	
	    // Listen for changes in the topic input and update subscription
    topicInput.input(updateTopicSubscription);

		// Creates a label for host information.
  	hostLabelP = createP('Host: '+ mqttBrokerHost);
  	hostLabelP.parent(uiPanel);
  	hostLabelP.style('font-family', 'Arial, sans-serif');
  	hostLabelP.style('color', '#333');
  	hostLabelP.style('font-size', '12px');
  	hostLabelP.style('margin', '5px 0'); 
    
    // Error message display
    displayMessageP = createP('Ready'); // Placeholder text to reserve vertical space
    displayMessageP.parent(uiPanel);
    displayMessageP.style('color', 'red');
    displayMessageP.style('font-family', 'Arial, sans-serif');
    displayMessageP.style('font-size', '10px');
    displayMessageP.style('margin', '10px 0');
    displayMessageP.style('visibility', 'hidden'); // Hide it but keep the space
}

// Function to display and manage error messages in the UI.
function displayMessage(message) {
	
		// get the current time
    const timestamp = getTimestamp();
	
  	// Concatenate the timestamp with the original message
    const messageWithTimestamp = `[${timestamp}] ${message}`;
	
    console.log("displayMessage: " + messageWithTimestamp);
    displayMessageP.html(message); // Set the error message text.
    displayMessageP.style('visibility', 'visible'); // Make the error message visible.
    setTimeout(() => displayMessageP.style('visibility', 'hidden'), 4000); // Hide visibility (keep space)
}

function getTimestamp() {
    // Get the current date and timeS
		const now = new Date(); 

    // Concatenate time components into a UTC timestamp string
    const timestamp = now.toISOString();

    return timestamp;
}
