const https = require('https');

function req(body) {
  return new Promise((res) => {
    const bodyStr = JSON.stringify(body);
    const r = https.request({
      hostname: 'otp-app.udayamarketing.in',
      path: '/api/request-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        try {
          console.log(JSON.stringify(JSON.parse(d), null, 2));
        } catch(e) {
          console.log("Raw Response:", d);
        }
        res();
      });
    });
    r.write(bodyStr);
    r.end();
  });
}

req({ phone: '+919876543210', domain: 'sriaachicreatives.udayamarketing.in' });
