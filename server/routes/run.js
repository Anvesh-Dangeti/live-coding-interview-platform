// server/routes/run.js

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const { v4: uuid } = require('uuid');
const { exec } = require('child_process');
const path = require('path');

const executorDir = path.join(__dirname, '../../executor');

router.post('/', async (req, res) => {
  const { code, language = "python", testCases = [] } = req.body;

  if (!code) return res.status(400).json({ error: 'Code is required' });

  const jobId = uuid();
  const tempCodePath = path.join(executorDir, 'code.py');
  const tempInputPath = path.join(executorDir, 'input.txt');

  try {
    await fs.writeFile(tempCodePath, code);

    const results = [];

    for (const test of testCases) {
      const { input, expectedOutput } = test;

      // Write test input
      await fs.writeFile(tempInputPath, input);

      // Build and run Docker container
      await execPromise(`docker build -t ${jobId} .`, { cwd: executorDir });

      const { stdout, stderr } = await execPromise(
        `docker run -i ${jobId}`,
        { cwd: executorDir, input }
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
  }
});

function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = exec(command, options, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      resolve({ stdout, stderr });
    });

    // If there's input, write it to stdin
    if (options.input) {
      proc.stdin.write(options.input);
      proc.stdin.end();
    }
  });
}

module.exports = router;

