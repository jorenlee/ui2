import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // JSON payload from client
  const filePath = path.join(process.cwd(), 'public', 'data.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');
    return { success: true, message: 'Boxes saved successfully.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
