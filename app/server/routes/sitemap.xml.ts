import fs from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  // Use resolved path to ensure we find the public folder correctly
  const filePath = path.resolve('public/sitemap.xml');
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    return data;
  } else {
    throw createError({
      statusCode: 404,
      statusMessage: 'Sitemap not found at ' + filePath,
    });
  }
});
