import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';
import SaxonJS from 'saxon-js';

const pexec = promisify(execFile);
const app = express();
const upload = multer();

// --- Static tester page ---
app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.send('OK'));

// --- Helpers ---
function parseOutputMethodFromXslt(xslt) {
    const m = xslt.match(/<xsl:output[^>]*\bmethod\s*=\s*"(.*?)"/i);
    if (m) return m[1].toLowerCase();
    return null;
}

function guessContentType(xslt, serialized) {
    const method = parseOutputMethodFromXslt(xslt);
    if (method === 'html' || /<html[\s>]/i.test(serialized)) return 'text/html; charset=utf-8';
    if (method === 'text') return 'text/plain; charset=utf-8';
    if (method === 'xhtml') return 'application/xhtml+xml; charset=utf-8';
    return 'application/xml; charset=utf-8';
}

// --- JSON endpoint ---
app.post('/transform', async (req, res) => {
    const { xml, xslt } = req.body || {};
    if (!xml || !xslt) {
        return res.status(400).json({ error: 'Missing xml or xslt in JSON body' });
    }
    try {
        const { body, ctype } = await compileAndTransform(xml, xslt);
        res.set('Content-Type', ctype).send(body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: String(err) });
    }
});

// --- multipart/form-data endpoint ---
app.post('/transform-upload', upload.fields([{ name: 'xml' }, { name: 'xslt' }]), async (req, res) => {
    try {
        const xml = req.files?.xml?.[0]?.buffer?.toString('utf-8');
        const xslt = req.files?.xslt?.[0]?.buffer?.toString('utf-8');
        if (!xml || !xslt) {
            return res.status(400).send('Missing XML or XSLT file');
        }
        const { body, ctype } = await compileAndTransform(xml, xslt);
        res.set('Content-Type', ctype).send(body);
    } catch (err) {
        console.error(err);
        res.status(500).send(String(err));
    }
});

async function compileAndTransform(xml, xslt) {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'xslt-'));
    const xslPath = path.join(tmpDir, 'in.xslt');
    const sefPath = path.join(tmpDir, 'out.sef.json');
    await fs.writeFile(xslPath, xslt, 'utf-8');

    const cli = path.join(process.cwd(), 'node_modules', 'xslt3', 'xslt3.js');
    const args = [`-xsl:${xslPath}`, `-export:${sefPath}`, '-nogo'];
    await pexec(process.execPath, [cli, ...args]);

    const sefJson = JSON.parse(await fs.readFile(sefPath, 'utf-8'));
    const result = await SaxonJS.transform({
        stylesheetInternal: sefJson,
        sourceText: xml,
        destination: 'serialized'
    });

    const body = result.principalResult;
    const ctype = guessContentType(xslt, body);
    return { body, ctype };
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
