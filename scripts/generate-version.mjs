
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const version = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || randomUUID();
const fecha = new Date().toISOString();
const destino = path.resolve('public/version.json');

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify({ version, fecha }, null, 2) + '\n', 'utf8');

console.log(`Versión generada: ${version}`);
console.log(`Fecha: ${fecha}`);
