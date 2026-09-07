const https = require('https');

const data = JSON.stringify({
  query: `
    mutation OtpRequest($phone: String!) {
      otpRequest(phone: $phone) {
        success
        errors {
          field
          message
        }
      }
    }
  `,
  variables: { phone: "+919876543210" }
});

const options = {
  hostname: 'sriaachicreatives.udayamarketing.in',
  path: '/graphql/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': '5758f5a0-bb40-4ed7-9ccd-9398c84121dc',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, res => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(d), null, 2));
  });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
