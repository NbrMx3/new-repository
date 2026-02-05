const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const apiUrl = `http://${localIP}:5000/api`;

console.log('API Link for Android:', apiUrl);
console.log('Use this URL in your Android app to connect to the backend.');