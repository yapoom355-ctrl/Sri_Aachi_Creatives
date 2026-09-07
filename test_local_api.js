const http = require('http');

const data = JSON.stringify({ phone: '9876543210' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/otp/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response Body:", d);
  });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
