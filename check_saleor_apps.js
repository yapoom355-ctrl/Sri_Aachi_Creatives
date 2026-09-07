const https = require('https');

const data = JSON.stringify({
  query: `
    query {
      apps(first: 10) {
        edges {
          node {
            id
            name
            isActive
            aboutApp
          }
        }
      }
    }
  `
});

async function main() {
  const loginRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`
    })
  });
  const token = (await loginRes.json()).data?.tokenCreate?.token;

  const res = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${token}`
    },
    body: JSON.stringify({
      query: `query {
        app(id: "QXBwOjE=") {
          id
          name
          isActive
          appUrl
          configurationUrl
          manifestUrl
          metadata { key value }
          privateMetadata { key value }
        }
      }`
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}
main().catch(console.error);
return;
