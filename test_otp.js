const https = require('https');

function req(body) {
  return new Promise((res) => {
    const bodyStr = JSON.stringify(body);
    const r = https.request({
      hostname: 'sriaachicreatives.udayamarketing.in',
      path: '/graphql/',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), 'x-tenant-id': '4c7b9c85-0963-49ba-bd2f-7776a0be4b71' }
    }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => { console.log(JSON.stringify(JSON.parse(d), null, 2)); res(); });
    });
    r.write(bodyStr);
    r.end();
  });
}

// Test 1: sendOtp
req({
  query: `mutation SendOtp($mobilenumber: String!) { sendOtp(mobilenumber: $mobilenumber) { success message otp } }`,
  variables: { mobilenumber: '+919876543210' }
}).then(() => {
  // Test 2: loginWithOtp (with a fake OTP to see the error structure)
  return req({
    query: `mutation LoginWithOtp($mobilenumber: String!, $otp: String!) { loginWithOtp(mobilenumber: $mobilenumber, otp: $otp) { tokens { accessToken refreshToken } user { id name email mobilenumber } } }`,
    variables: { mobilenumber: '+919876543210', otp: '123456' }
  });
}).catch(console.error);
