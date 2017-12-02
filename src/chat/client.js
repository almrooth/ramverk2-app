(function () {
    'use strict';

    let websocket;
    let username    = document.getElementById('username');
    let url         = 'ws://localhost:1337/';
    let protocol    = 'json';
    let connect     = document.getElementById('connect');
    let sendMessage = document.getElementById('send_message');
    let message     = document.getElementById('message');
    // let disconnect  = document.getElementById('disconnect');
    let output      = document.getElementById('output');
    let signIn     = document.getElementById('sign-in');
    let signedIn     = document.getElementById('signed-in');


    /**
     * Log output to browser
     *
     * @param {string} message to output in the browser
     *
     * @return {void}
     */
    function outputLog(message) {
        let now         = new Date();
        let timestamp   = now.toLocaleTimeString();

        output.innerHTML +=  `${timestamp} ${message}<br>`;
        output.scrollTop = output.scrollHeight;
    }


    /**
     * Connect to socket sever and config websocket
     */
    connect.addEventListener('click', () =>  {
        if (!username.value) {
            console.log('No username selected.');
            username.classList.add('is-danger');
            username.nextElementSibling.style.display = 'block';
            return false;
        }
        console.log('Connecting to chat server...');
        websocket = new WebSocket(url, protocol);

        websocket.onopen = () => {
            console.log('Websocket is connected to server.');
            // console.log(websocket);
            outputLog('Ansluten till chatten.');
            let command = '/join ' + username.value;

            websocket.send(command);

            signIn.style.display = 'none';
            signedIn.style.display = 'block';
        };

        websocket.onmessage = event => {
            console.log('Receiving message: ' + event.data);
            // console.log(event);
            // console.log(websocket);

            let data = JSON.parse(event.data);

            outputLog(`${data.username}: ${data.message}`);
        };

        websocket.onclose = () => {
            console.log('Websocket connection closed.');
            // console.log(websocket);
            outputLog('Anslutning till chatten avslutad.');
        };
    });


    /**
     * Send message
     */
    sendMessage.addEventListener('click', e => {
        e.preventDefault();
        let messageText = message.value;

        if (!websocket || websocket.readyState === 3) {
            console.log('No websocket connection.');
        } else {
            websocket.send(messageText);
            console.log('Sending message: ' + messageText);
            outputLog('Du sa: ' + messageText);
        }
        message.value = '';
    });


    // disconnect.addEventListener('click', () => {
    //     console.log('Closing connection to chat server...');
    //     websocket.send('Client closing connection by intention');
    //     websocket.close();
    //     // console.log(websocket);
    //     outputLog('Avslutar anslutning till chatten.');
    // });
})();
