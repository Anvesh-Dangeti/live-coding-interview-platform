const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const { v4: uuid } = require('uuid');
const { exec } = require('child_process');
const path = require('path');

const executorDir = path.join(__dirname, '../../executor');

router.post('/', async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: 'Code is required' });

  const jobId = uuid();
  const tempFilePath = path.join(executorDir, 'code.py');

  try {
    // Write code to file
    await fs.writeFile(tempFilePath, code);

    // Build docker image
    await execPromise(`docker build -t ${jobId} .`, { cwd: executorDir });

    // Run docker container
    const { stdout, stderr } = await execPromise(`docker run ${jobId}`);

    return res.json({
      output: stdout || stderr,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.stderr || err.message });
  }
});

function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) return reject({ error, stderr });
      resolve({ stdout, stderr });
    });
  });
}

module.exports = router;
