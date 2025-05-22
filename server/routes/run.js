const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const { v4: uuid } = require('uuid');
const { exec } = require('child_process');
const path = require('path');

const executorBaseDir = path.join(__dirname, '../../executor');

const languageConfigs = {
  python: {
    ext: 'py',
    templatePath: 'templates/python',
    runCmd: 'python3 code.py',
  },
  node: {
    ext: 'js',
    templatePath: 'templates/node',
    runCmd: 'node code.js',
  },
  cpp: {
    ext: 'cpp',
    templatePath: 'templates/cpp',
    runCmd: './out',
  },
  java: {
    ext: 'java',
    templatePath: 'templates/java',
    runCmd: 'java Code',
  },
};

router.post('/', async (req, res) => {
  const { code, language = 'python', testCases = [] } = req.body;

  if (!code || !languageConfigs[language])
    return res.status(400).json({ error: 'Invalid code or language' });

  const config = languageConfigs[language];
  const jobId = uuid();
  const jobDir = path.join(executorBaseDir, jobId);

  await fs.mkdir(jobDir);

  const codeFile =
  language === 'java'
    ? path.join(jobDir, `Code.java`)
    : path.join(jobDir, `code.${config.ext}`);
  await fs.writeFile(codeFile, code);

  // Copy language-specific Dockerfile
  await fs.copy(
    path.join(executorBaseDir, config.templatePath, 'Dockerfile'),
    path.join(jobDir, 'Dockerfile')
  );

  const results = [];

  try {
    for (const test of testCases) {
      const { input, expectedOutput } = test;

      // Build image
      await execPromise(`docker build -t ${jobId} .`, { cwd: jobDir });

      // Run with input
      const { stdout, stderr } = await execPromise(
        `docker run -i ${jobId}`,
        { input }
      );

      const cleanedOutput = (stdout || stderr).trim();
      const cleanedExpected = expectedOutput.trim();

      results.push({
        input,
        expectedOutput,
        actualOutput: cleanedOutput,
        passed: cleanedOutput === cleanedExpected,
      });
    }

    return res.json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.stderr || err.message });
  } finally {
    // Clean up (optional)
    await fs.remove(jobDir);
  }
});

function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = exec(command, options, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      resolve({ stdout, stderr });
    });

    if (options.input) {
      proc.stdin.write(options.input);
      proc.stdin.end();
    }
  });
}

module.exports = router;
