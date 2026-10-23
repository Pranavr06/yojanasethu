const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\PranavR\\.gemini\\antigravity\\brain\\55f4e510-8a17-4f06-a85d-feb984547332\\.system_generated\\logs\\transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":100')) {
    const json = JSON.parse(line);
    const content = json.content || '';
    fs.writeFileSync('scratch/full_user_schema.sql', content);
    console.log('Saved scratch/full_user_schema.sql, length:', content.length);
  }
});
