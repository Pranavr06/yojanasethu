const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\PranavR\\.gemini\\antigravity\\brain\\55f4e510-8a17-4f06-a85d-feb984547332\\.system_generated\\logs\\transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":100')) {
    const json = JSON.parse(line);
    const content = json.content || '';
    const tables = [...content.matchAll(/create table public\.(\w+)/g)].map(m => m[1]);
    console.log('Tables found in Supabase schema:');
    console.log(tables);
  }
});
