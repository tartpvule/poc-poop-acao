poc-poop-acao - an abuse of a certain extension to use browsers as a limited HTTP proxy botnet

# Usage

1. Install NodeJS
2. Download this repository
3. npm install socket.io
4. node main.js
5. Port 80 is the port victims connect to.
6. Port 3128 is the port you use as an HTTP Proxy.

# Description

This is a proof-of-concept demonstrating the possibility to exploit installations of Firefox (or Chrome) with extensions injecting the "Access-Control-Allow-Origin : *" header into cross-domain XmlHttpRequest/fetch requests.

This repository is an HTTP Proxy Server implementation that tunnels an attacker's traffic to/from a botnet of victims connected over Socket.IO connections.

No plans to improve this thing currently exists, except to better illustrates the relevant issues.

# License

Public Domain

No credit or acknowledgement necessary

Just do not use it for evil purposes
