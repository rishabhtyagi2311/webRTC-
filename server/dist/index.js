"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 5000 });
console.log("backend on");
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    console.log("ws connection on");
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        if (message.type === 'sender') {
            senderSocket = ws;
        }
        else if (message.type === 'receiver') {
            receiverSocket = ws;
        }
        else if (message.type === 'createOffer') {
            if (ws !== senderSocket) {
                return;
            }
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'createOffer', sdp: message.sdp }));
            console.log("offer created ");
        }
        else if (message.type === 'createAnswer') {
            if (ws !== receiverSocket) {
                return;
            }
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'createAnswer', sdp: message.sdp }));
            console.log("answer created");
        }
        else if (message.type === 'iceCandidate') {
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            }
            else if (ws === receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'iceCandidate', candidate: message.candidate }));
            }
        }
    });
});
