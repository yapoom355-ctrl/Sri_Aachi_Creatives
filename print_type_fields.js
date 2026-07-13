const fs = require('fs');
const schemaData = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
const schema = schemaData.data.__schema;
const categoryType = schema.types.find(t => t.name === 'CategoryType');
console.log('CategoryType fields:', categoryType ? categoryType.fields.map(f => f.name).join(', ') : 'Not found');
const productType = schema.types.find(t => t.name === 'ProductType');
console.log('ProductType fields:', productType ? productType.fields.map(f => f.name).join(', ') : 'Not found');
