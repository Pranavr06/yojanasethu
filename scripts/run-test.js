const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Custom module loader for ts files and @/ alias
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const relativePath = request.slice(2);
    const resolvedPath = path.resolve(__dirname, '../src', relativePath);
    // Try extensions
    for (const ext of ['', '.ts', '.tsx', '.js', '/index.ts', '/index.js']) {
      if (fs.existsSync(resolvedPath + ext)) {
        return resolvedPath + ext;
      }
    }
    return resolvedPath;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Hook require for .ts files
require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: filename,
  });
  module._compile(result.outputText, filename);
};

// Run the test files
async function runAllTests() {
  try {
    require('./test-placement-transparency.ts');
    const { runCertificateAssessmentTests } = require('./test-certificate-assessment.ts');
    await runCertificateAssessmentTests();
    const { runSkillGapTests } = require('./test-skill-gap.ts');
    await runSkillGapTests();
    const { runResumeBuilderTests } = require("./test-resume-builder.ts");
    await runResumeBuilderTests();
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runAllTests();
