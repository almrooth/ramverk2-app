/**
 * Websocket chat server
 */

'use strict';

const WebSocket = require('ws');

const server = (httpServer) => {
    const wss = new WebSocket.Server({
        server: httpServer,
        clientTracking: true,
        handleProtocols: handleProtocols
    });

    var clientList = [];


    /**
     * Select subprotocol for connection
     *
     * @param {array} protocols subprotocols to choose from, sent by client
     *
     * @return {void}
     */
    function handleProtocols(protocols) {
        log('Protocol request ' + protocols);
        for (let i=0; i < protocols.length; i++) {
            if (protocols[i] === 'json') {
                return 'json';
            }
        }
        return false;
    }

    /**
     * Set connection alive
     *
     * @return void
     */
    function heartbeat() {
        this.isAlive = true;
    }


    wss.on('connection', ws => {
        log('Connection received. Adding client.');

        ws.isAlive = true;
        ws.on('pong', heartbeat);

        ws.on('message', message => {
            log('Received message: ' + message);

            if (isCommand(message)) {
                log('message is command');
                handleCommands(ws, message);
            } else {
                let username = clientList.filter(client => client.ws === ws)[0].username;
                let data = {
                    'type': 'message',
                    'username': username,
                    'message': message
                };

                broadcastExcept(ws, JSON.stringify(data));
            }
        });

        ws.on('error', error => {
            log('Error: ' + error);
        });

        ws.on('close', (code, reason) => {
            log(`Closing connection: ${code} ${reason}`);
            let username = clientList.filter(client => client.ws === ws)[0].username;
            let data = {
                'type': 'message',
                'username': 'Server',
                'message': username + ' lämnade'
            };

            clientList.splice(clientList.findIndex( client => client.ws === ws ), 1);

            broadcastExcept(ws, JSON.stringify(data));
        });
    });


    setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                return ws.terminate();
            }

            ws.isAlive = false;
            ws.ping('', false, true);
        });
    }, 5000);


    /**
     * Check if message is command
     *
     * @param {string} message to check for command
     */
    function isCommand(message) {
        log(message.split());
        return message.split('')[0] === '/';
    }


    /**
     * Handle commands
     *
     * @param {string} message to parse for command
     */
    function handleCommands(ws, message) {
        let cmd = message.split(' ')[0];
        let args = message.split(' ').slice(1);

        if (cmd === '/join') {
            let username = args.join();

            let client = {
                'ws': ws,
                'username': username
            };
            let data = {
                'type': 'message',
                'username': 'Server',
                'message': username + ' gick med i chatten'
            };

            clientList.push(client);
            log(`User ${username} added to client list.`);
            broadcastExcept(ws, JSON.stringify(data));
        } else if (cmd === '/clients') {
            let clients = clientList.map(client => {
                return client.username;
            });
            let data = {
                'type': 'message',
                'username': 'Server',
                'message': 'Anslutna klienter - ' + clients.join(', ')
            };

            ws.send(JSON.stringify(data));
        } else if (cmd === '/help') {
            let data = {
                'type': 'message',
                'username': 'Server',
                'message': 'kommandon: clients - show client list, help - show this help'
            };

            ws.send(JSON.stringify(data));
        }
    }


    /**
     * Broadcast data to everyone except current websocket
     *
     * @param {WebSocket} ws current websocket
     * @param {*} data to send
     *
     * @return void
     */
    function broadcastExcept(ws, data) {
        let clients = 0;

        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                clients++;
                if (ws.protocol === 'json') {
                    client.send(data);
                } else {
                    client.send(data);
                }
            }
        });
        console.log(`Broadcasted data to ${clients} (${wss.clients.size}).`);
    }


    /**
     * Logs output to console
     *
     * @param {string} msg to log
     */
    function log(msg) {
        console.log('Chat server: ' + msg);
    }
};


// Export server
module.exports = server;
