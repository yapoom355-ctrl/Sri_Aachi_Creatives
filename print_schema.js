const fs = require('fs');

const schemaData = JSON.parse(fs.readFileSync('schema.json', 'utf8'));
if (!schemaData.data || !schemaData.data.__schema) {
  console.log("No schema found");
  process.exit(1);
}

const schema = schemaData.data.__schema;

const queryType = schema.queryType ? schema.queryType.name : 'Query';
const mutationType = schema.mutationType ? schema.mutationType.name : 'Mutation';

function formatType(type) {
  if (!type) return 'Unknown';
  if (type.kind === 'NON_NULL') return `${formatType(type.ofType)}!`;
  if (type.kind === 'LIST') return `[${formatType(type.ofType)}]`;
  return type.name || (type.ofType ? formatType(type.ofType) : 'Unknown');
}

console.log('--- QUERIES ---');
const queries = schema.types.find(t => t.name === queryType);
if (queries && queries.fields) {
  queries.fields.forEach(f => {
    const args = f.args.map(a => `${a.name}: ${formatType(a.type)}`).join(', ');
    console.log(`${f.name}(${args}): ${formatType(f.type)}`);
  });
} else {
  console.log('No queries found');
}

console.log('\n--- MUTATIONS ---');
const mutations = schema.types.find(t => t.name === mutationType);
if (mutations && mutations.fields) {
  mutations.fields.forEach(f => {
    const args = f.args.map(a => `${a.name}: ${formatType(a.type)}`).join(', ');
    console.log(`${f.name}(${args}): ${formatType(f.type)}`);
  });
} else {
  console.log('No mutations found');
}
