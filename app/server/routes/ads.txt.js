import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const filePath = path.join(process.cwd(), 'public', 'ads.txt');
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    setHeader(event, 'content-type', 'text/plain; charset=utf-8');
    return data;
  } catch (err) {
    setHeader(event, 'content-type', 'text/plain; charset=utf-8');
    return 'google.com, pub-5434839287765657, DIRECT, f08c47fec0942fa0';
  }
});
