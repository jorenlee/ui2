// Server middleware to ensure proper headers for social media crawlers
export default defineEventHandler((event) => {
  const userAgent = getHeader(event, 'user-agent') || ''
  
  // Detect social media crawlers
  const isSocialCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot/i.test(userAgent)
  
  if (isSocialCrawler) {
    // Set headers to ensure proper caching and rendering
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    setHeader(event, 'X-Robots-Tag', 'index, follow')
  }
})

