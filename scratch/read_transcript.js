const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\PranavR\\.gemini\\antigravity\\brain\\55f4e510-8a17-4f06-a85d-feb984547332\\.system_generated\\logs\\transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":100')) {
    try {
      const json = JSON.parse(line);
      const text = json.content || '';
      console.log('Total content length:', text.length);

      const matchEs = text.indexOf('create table public.evidence_submissions');
      console.log('create table public.evidence_submissions index:', matchEs);
      if (matchEs !== -1) {
        console.log('=== CREATE TABLE EVIDENCE_SUBMISSIONS ===');
        console.log(text.slice(matchEs, matchEs + 1200));
      }

      const matchDept = text.indexOf('departments');
      console.log('departments index:', matchDept);
      if (matchDept !== -1) {
        console.log('=== DEPARTMENTS ===');
        console.log(text.slice(matchDept - 50, matchDept + 700));
      }
    } catch (e) {
      console.error(e);
    }
  }
});
