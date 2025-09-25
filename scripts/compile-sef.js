import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const pexec = promisify(execFile);

const xsltDir = path.join(process.cwd(), 'xslt');
const xsl = path.join(xsltDir, 'transform.xslt');
const sef = path.join(xsltDir, 'transform.sef.json');

async function ensureSef() {
  try {
    await fs.access(sef);
    console.log('SEF already present:', sef);
    return;
  } catch (_) {}

  console.log('Compiling XSLT to SEF...');
  const cli = path.join(process.cwd(), 'node_modules', 'xslt3', 'xslt3.js');
  const args = [`-xsl:${xsl}`, `-export:${sef}`, '-nogo', '-t'];
  await pexec(process.execPath, [cli, ...args], { stdio: 'inherit' });
  console.log('SEF generated at', sef);
}

ensureSef().catch(e => { console.error(e); process.exit(1); });
