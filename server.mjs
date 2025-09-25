import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import SaxonJS from 'saxon-js';

const app = express();
app.use(express.text({ type: ['application/xml', 'text/xml', 'application/octet-stream', 'text/plain'], limit: '5mb' }));

// Health check
app.get('/', (req, res) => {
  res.send('Node XSLT service is up. POST XML to /transform');
});

// Transform endpoint - POST raw XML body
app.post('/transform', async (req, res) => {
  try {
    const xml = req.body || '';
    if (!xml.trim()) {
      return res.status(400).send('Missing XML body');
    }
    const sefPath = path.join(process.cwd(), 'xslt', 'transform.sef.json');
    const sefJson = JSON.parse(await fs.readFile(sefPath, 'utf-8'));
    const result = await SaxonJS.transform({
      stylesheetInternal: sefJson,
      sourceText: xml,
      destination: 'serialized'
    });
    res.type('text/html').send(result.principalResult);
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err));
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
