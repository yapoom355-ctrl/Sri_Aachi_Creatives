const query = `query { categories { id title } products { id title categories { id title } } }`;
fetch('https://gubera-2-0-backend-fastapi-graphql.vercel.app/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': '4c7b9c85-0963-49ba-bd2f-7776a0be4b71'
  },
  body: JSON.stringify({query})
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2)));
