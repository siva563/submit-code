const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/submit', (req, res) => {
    const { filename, code } = req.body;

    if (!filename || !code) {
        return res.status(400).json({ error: 'Filename and code are required' });
    }

    // ✅ Extract only the filename
    const filenameOnly = path.basename(filename);
    const submissionsDir = path.join(__dirname, 'submissions');

    // ✅ Ensure submissions directory exists
    if (!fs.existsSync(submissionsDir)) {
        fs.mkdirSync(submissionsDir, { recursive: true });
    }

    const filePath = path.join(submissionsDir, filenameOnly);

    // ✅ Save the code to a file
    fs.writeFileSync(filePath, code);

    // ✅ Run inside a Docker container remotely (Cloud)
    exec(`docker run --rm -v ${submissionsDir}:/app node:latest node /app/${filenameOnly}`, (error, stdout, stderr) => {
        let feedback;
        if (error) {
            feedback = `Error: ${stderr}`;
        } else {
            feedback = `Output: ${stdout}`;
        }

        res.json({ feedback });
    });
});

app.listen(3000, () => console.log('✅ Cloud Backend Running on Port 3000'));
