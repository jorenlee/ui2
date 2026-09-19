<script setup>
import { ref, computed, onMounted } from 'vue';

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const rawItems = ref([]);
const loading = ref(true);
const errorMsg = ref('');
const searchQuery = ref('');

// Helper to check if item is published
const isPublished = (item) => {
    if (!item) return false;
    if (item.is_published === true) return true;
    const filters = (item.filters || '').toLowerCase();
    if (filters.includes('published')) return true;
    if (item.status && item.status.toLowerCase() === 'published') return true;
    return false;
};

// Helper to check if item belongs to DOWNLOADS filter or title
const isDownloadsPost = (item) => {
    if (!item) return false;
    const filters = (item.filters || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    return filters.includes('downloads') || title.includes('downloads');
};

const fetchData = async () => {
    loading.value = true;
    errorMsg.value = '';
    try {
        const res = await $fetch(`${endpoint.value}/api/cms/content/list/`);
        rawItems.value = Array.isArray(res) ? res : [];
    } catch (err) {
        console.error('Error fetching CMS downloads:', err);
        errorMsg.value = 'Failed to load downloads data.';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

// Filter published posts with DOWNLOADS filter
const publishedDownloadsPosts = computed(() => {
    return rawItems.value.filter(
        (item) => isPublished(item) && isDownloadsPost(item)
    );
});

// Extract all files from published downloads posts
const downloadFiles = computed(() => {
    const list = [];
    publishedDownloadsPosts.value.forEach((post) => {
        if (Array.isArray(post.files)) {
            post.files.forEach((file, idx) => {
                let fileName = '';
                let fileUrl = '';

                if (typeof file === 'string') {
                    fileName = file;
                    fileUrl = file.startsWith('http://') || file.startsWith('https://')
                        ? file
                        : `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`;
                } else if (file && typeof file === 'object') {
                    fileName = file.name || file.filename || 'file';
                    fileUrl = file.url || (file.name ? `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file.name}` : '#');
                }

                if (fileName) {
                    list.push({
                        id: `${post.id}-file-${idx}`,
                        fileName: fileName,
                        title: formatTitle(fileName),
                        postTitle: post.title || 'Downloads',
                        author: post.authors || post.personnel || 'LSU Administration',
                        date: post.date || (post.created_at ? post.created_at.split('T')[0] : ''),
                        url: fileUrl,
                        ext: getFileExt(fileName),
                        type: 'file',
                    });
                }
            });
        }

        if (Array.isArray(post.links)) {
            post.links.forEach((link, idx) => {
                let linkUrl = '';
                let linkTitle = '';

                if (typeof link === 'string' && link.trim()) {
                    linkUrl = link.trim();
                } else if (link && typeof link === 'object') {
                    linkUrl = link.url || link.link || '';
                    linkTitle = link.title || link.name || '';
                }

                if (linkUrl) {
                    const baseTitle = linkTitle || post.title || `External Reference ${idx + 1}`;
                    const displayTitle = (Array.isArray(post.links) && post.links.length > 1 && !linkTitle && post.title)
                        ? `${baseTitle} (${idx + 1})`
                        : baseTitle;

                    list.push({
                        id: `${post.id}-link-${idx}`,
                        fileName: linkUrl,
                        title: displayTitle,
                        postTitle: post.title || 'Downloads',
                        author: post.authors || post.personnel || 'LSU Administration',
                        date: post.date || (post.created_at ? post.created_at.split('T')[0] : ''),
                        url: linkUrl,
                        ext: 'link',
                        type: 'link',
                    });
                }
            });
        }
    });
    return list;
});

// Helper for extension
const getFileExt = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

// Helper for formatted title
const formatTitle = (filename) => {
    if (!filename) return 'Downloadable File';
    const nameWithoutExt = filename.includes('.')
        ? filename.substring(0, filename.lastIndexOf('.'))
        : filename;
    return nameWithoutExt
        .replace(/[_]/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

// Helper for icon class
const getFileIconClass = (ext) => {
    if (ext === 'pdf') return 'fa fa-file-pdf-o text-red-600';
    if (['doc', 'docx'].includes(ext)) return 'fa fa-file-word-o text-blue-600';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'fa fa-file-excel-o text-green-600';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'fa fa-file-image-o text-purple-600';
    if (['zip', 'rar', '7z'].includes(ext)) return 'fa fa-file-archive-o text-yellow-600';
    if (ext === 'link') return 'fa fa-external-link text-indigo-600';
    return 'fa fa-file-text-o text-gray-600';
};

// Filtered files based on search
const filteredFiles = computed(() => {
    if (!searchQuery.value.trim()) return downloadFiles.value;
    const q = searchQuery.value.toLowerCase().trim();
    return downloadFiles.value.filter(
        (item) =>
            item.fileName.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.postTitle.toLowerCase().includes(q) ||
            item.author.toLowerCase().includes(q)
    );
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main class="flex-grow lg:pt-24 pt-20 pb-12 w-11/12 max-w-9xl mx-auto">
            <!-- Title & Header Banner -->
            <div class="text-center mb-8">
                <h1
                    class="text-2xl lg:text-3xl font-bold text-green-900 uppercase tracking-wide border-b-2 border-green-800 pb-3 inline-block px-8">
                    Downloads
                </h1>
                <p class="text-sm text-gray-600 mt-2">
                    Access official university forms, documents, and downloadable resources.
                </p>
            </div>

            <!-- Controls Bar: Search & Stats -->
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-2 text-sm font-medium text-green-900">
                    <i class="fa fa-folder-open text-green-700 text-lg"></i>
                    <span>Available Files:</span>
                    <span class="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {{ downloadFiles.length }}
                    </span>
                </div>

                <div class="relative w-full md:w-80">
                    <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input v-model="searchQuery" type="text" placeholder="Search downloads..."
                        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition" />
                    <button v-if="searchQuery" @click="searchQuery = ''"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading"
                class="flex flex-col justify-center items-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <svg class="animate-spin h-10 w-10 text-green-700 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <p class="text-sm font-medium text-gray-600">Loading downloadable files...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMsg"
                class="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 my-6">
                <i class="fa fa-exclamation-triangle text-2xl mb-2"></i>
                <p class="font-semibold">{{ errorMsg }}</p>
                <button @click="fetchData"
                    class="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition">
                    Retry
                </button>
            </div>

            <!-- Files Grid -->
            <div v-else-if="filteredFiles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="item in filteredFiles" :key="item.id"
                    class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group">
                    <div>

                        <div class="flex items-start lg:justify-between gap-3 mb-3">

                            <div class=" flex items-center justify-between">

                                <span
                                    class="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 tracking-wider">
                                    {{ item.ext || 'FILE' }}
                                </span>
                                <a :href="item.url" target="_blank" download
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-800 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
                                    <i class="fa fa-download text-xs"></i>
                                    <span>Download</span>
                                </a>
                            </div>

                            <!-- Title & Filename -->
                            <h3 class="font-bold text-gray-800 text-sm leading-snug mb-1 group-hover:text-green-800 transition-colors line-clamp-2"
                                :title="item.title">
                                {{ item.title }}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center my-6">
                <div
                    class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-700">
                    <i class="fa fa-folder-open-o text-3xl"></i>
                </div>
                <h3 class="text-base font-bold text-gray-800 mb-1">No Download Files Found</h3>
                <p class="text-xs text-gray-500 max-w-md mx-auto mb-4">
                    {{ searchQuery ? `No files matching "${searchQuery}". Try a different keyword.` : 'There are currently no published files under the DOWNLOADS category.' }}
                </p>
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition">
                    Clear Search Filter
                </button>
            </div>
        </main>

        <Footer />
    </div>
</template>
