/**
 * Shared Composable for CMS Content List fetching with in-memory caching and request de-duplication.
 * Eliminates redundant network roundtrips across academic and portal pages.
 */
let inFlightFetch = null;

export const useCmsContent = () => {
  const config = useRuntimeConfig();
  const endpoint = config.public?.apiUrl || "https://lsu-cms-api.example.com";
  const cachedList = useState("lsu_cms_content_list_cache", () => null);

  const fetchCmsList = async (force = false) => {
    // 1. Return cached list if available
    if (!force && cachedList.value && Array.isArray(cachedList.value) && cachedList.value.length > 0) {
      return cachedList.value;
    }

    // 2. Return in-flight promise if a request is already running
    if (inFlightFetch && !force) {
      return inFlightFetch;
    }

    // 3. Initiate single de-duplicated request
    inFlightFetch = $fetch(`${endpoint}/api/cms/content/list/`)
      .then((data) => {
        if (Array.isArray(data)) {
          cachedList.value = data;
        }
        inFlightFetch = null;
        return data;
      })
      .catch((err) => {
        inFlightFetch = null;
        console.error("Failed to fetch CMS content list:", err);
        return cachedList.value || [];
      });

    return inFlightFetch;
  };

  const getCachedItem = (idOrSlug) => {
    if (!cachedList.value || !Array.isArray(cachedList.value) || !idOrSlug) return null;
    const clean = String(idOrSlug).toLowerCase().trim();
    return cachedList.value.find((c) => {
      if (!c) return false;
      const cId = String(c.id || "").toLowerCase();
      const cContentId = String(c.content_id || "").toLowerCase();
      const cTitle = (c.title || "").toLowerCase();
      const cFilters = (c.filters || "").toLowerCase();
      const titleSlug = cTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      return (
        cId === clean ||
        cContentId === clean ||
        titleSlug === clean ||
        titleSlug.includes(clean) ||
        clean.includes(titleSlug) ||
        cFilters.includes(clean)
      );
    }) || null;
  };

  return {
    cachedList,
    fetchCmsList,
    getCachedItem,
  };
};
