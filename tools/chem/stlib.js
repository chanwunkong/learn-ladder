// 共用：載入章節、算識別碼
const fs = require('fs'), path = require('path'), R = path.join(__dirname, '../../src/chem/');
global.CH = []; global.STEPS = {};
for (const f of fs.readdirSync(R + 'ch')) eval(fs.readFileSync(R + 'ch/' + f, 'utf8'));
if (fs.existsSync(R + 'st')) for (const f of fs.readdirSync(R + 'st')) eval(fs.readFileSync(R + 'st/' + f, 'utf8'));
const strip = h => String(h).replace(/<[^>]+>/g, '');
const qhash = s => { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0; return h.toString(36); };
const key = (c, q, k) => k + ':' + (q.id || qhash(c.id + '|' + k + '|' + strip(q.q)));
module.exports = { fs, R, CH, STEPS, strip, key };
