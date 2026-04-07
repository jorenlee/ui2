/**
 * Composable for handling image URLs
 * Cleans URLs by removing query parameters and extra strings after file extension
 */
export const useImageUrl = () => {
  /**
   * Clean image URL - removes everything after the file extension
   * @param {string} url - The image URL to clean
   * @returns {string} - Cleaned URL with only the path up to the file extension
   */
  const cleanImageUrl = (url) => {
    if (!url) return '';
    
    // Match URL up to and including a file extension
    // This regex captures everything up to a common image/file extension
    const match = url.match(/^(.*?\.(jpg|jpeg|png|gif|webp|svg|bmp|pdf|doc|docx|mp4|mov|avi))/i);
    
    if (match) {
      return match[1];
    }
    
    // If no extension found, return the original URL
    return url;
  };

  /**
   * Get image URL from item object (handles different data structures)
   * @param {object} item - The item object that may contain image data
   * @param {string} fallbackUrl - Optional fallback URL if no image found
   * @returns {string} - Cleaned image URL
   */
  const getImageUrl = (item, fallbackUrl = 'https://fpstorage.sgp1.cdn.digitaloceanspaces.com/www.aptitudeentertainment.com/logo.jpg') => {
    let url = '';
    
    // Check if item has img property (legacy format)
    if (item?.img) {
      url = item.img;
    }
    // Check if item has files array (CMS format)
    else if (item?.files && item.files.length > 0) {
      url = item.files[0].url;
    }
    // Use fallback
    else {
      url = fallbackUrl;
    }
    
    // Clean the URL before returning
    return cleanImageUrl(url);
  };

  return {
    cleanImageUrl,
    getImageUrl
  };
};

