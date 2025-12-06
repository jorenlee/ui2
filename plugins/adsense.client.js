export default defineNuxtPlugin(() => {
  const route = useRoute();
  
  // Skip loading AdSense on the landing page
  if (route.path === '/') {
    return;
  }

  // Add AdSense account meta tag
  if (!document.querySelector('meta[name="google-adsense-account"]')) {
    const metaTag = document.createElement('meta');
    metaTag.name = 'google-adsense-account';
    metaTag.content = 'ca-pub-5434839287765657';
    document.head.appendChild(metaTag);
  }

  // Check if AdSense is already loaded to avoid duplicates
  if (window.adsbygoogle || document.querySelector('script[src*="adsbygoogle.js"]')) {
    return;
  }

  // Load AdSense script for all other pages
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5434839287765657';
  script.crossOrigin = 'anonymous';
  script.async = true;
  
  script.onload = () => {
    // Initialize adsbygoogle array if not exists
    window.adsbygoogle = window.adsbygoogle || [];
  };
  
  document.head.appendChild(script);
});


