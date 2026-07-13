const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('schema.json', 'utf8')).data.__schema;

function printType(typeName) {
  const type = schema.types.find(t => t.name === typeName);
  if (!type) {
    console.log(`${typeName} not found`);
    return;
  }
  console.log(`\n--- Type: ${typeName} ---`);
  if (type.fields) {
    type.fields.forEach(f => {
      let args = '';
      if (f.args && f.args.length > 0) {
        args = `(${f.args.map(a => `${a.name}: ${a.type.name || a.type.kind}`).join(', ')})`;
      }
      console.log(`  ${f.name}${args}: ${f.type.name || f.type.kind}`);
    });
  } else if (type.inputFields) {
    type.inputFields.forEach(f => {
      console.log(`  ${f.name}: ${f.type.name || f.type.kind}`);
    });
  }
}

['OrderType', 'InitiatePaymentResult', 'UserAddressType', 'UserCartType', 'CreateUserAddressInput'].forEach(printType);
