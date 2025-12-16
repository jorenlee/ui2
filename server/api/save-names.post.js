import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const names = body.names;

  if (!names || !Array.isArray(names)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid names data'
    });
  }

  const filePath = path.join(process.cwd(), 'pages/raffle/names.json');

  try {
    fs.writeFileSync(filePath, JSON.stringify(names, null, 2));
    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save names'
    });
  }
});
