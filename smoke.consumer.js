"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const socket_io_client_1 = require("socket.io-client");
const USERNAME = "protectify";
const PASSWORD = "adminadmin";
const HOSTNAME = "54.144.149.49";
const PORT = 1883;
const MQTT_TOPIC = "esp32";
const WEBSOCKET_SERVER_URL = "http://localhost:4000";
let socketIO;
function sendDatatoWebSocket(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (socketIO) {
                console.log('Sending data to WebSocket:', data);
                socketIO.emit('data', data);
            }
            else {
                console.error('WebSocket client is not initialized');
            }
        }
        catch (error) {
            console.error('Error sending data to WebSocket:', error.message);
        }
    });
}
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = mqtt_1.default.connect(`mqtt://${USERNAME}:${PASSWORD}@${HOSTNAME}:${PORT}`);
            client.on('connect', () => {
                console.log('Connected to MQTT broker');
                client.subscribe(MQTT_TOPIC, (err) => {
                    if (err) {
                        console.error('Error subscribing to topic:', err.message);
                    }
                });
            });
            client.on('message', (topic, message) => __awaiter(this, void 0, void 0, function* () {
                if (topic === MQTT_TOPIC) {
                    try {
                        const parsedContent = JSON.parse(message.toString());
                        console.log('Received data from MQTT:', parsedContent);
                        yield sendDatatoWebSocket(parsedContent);
                    }
                    catch (error) {
                        console.error('Error parsing MQTT message:', error.message);
                    }
                }
            }));
            socketIO = (0, socket_io_client_1.io)(WEBSOCKET_SERVER_URL, {
                transports: ['websocket'],
                path: '/socket.io'
            });
            socketIO.on('connect', () => {
                console.log('Connected to WebSocket server');
            });
            socketIO.on('connect_error', (err) => {
                console.error('WebSocket connection error:', err.message);
            });
            socketIO.on('disconnect', (reason) => {
                console.error('WebSocket disconnected:', reason);
            });
        }
        catch (err) {
            console.error('Error during connection setup:', err.message);
        }
    });
}
connect();
