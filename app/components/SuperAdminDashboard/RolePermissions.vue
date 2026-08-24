<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";

// ---------------- CONFIG ----------------
const props = defineProps({
  darkMode: Boolean,
  rolePermissions: Array,
});
const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

// ---------------- STATE ----------------
const listItems = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingItem = ref(null);
const searchQuery = ref("");

// Sorting state
const sortField = ref("created_at"); // 'email' | 'roles' | 'created_at'
const sortOrder = ref("desc"); // 'asc' | 'desc'

// Selection & Batch state
const selectedIds = ref([]);
const confirmBulkDeleteModal = ref(false);
const isBulkDeleting = ref(false);

// Single delete state
const confirmDeleteModal = ref(false);
const deleteId = ref(null);

// Notification Email State
const showEmailModal = ref(false);
const emailTargetScope = ref("all"); // 'selected' | 'filtered' | 'all'
const emailSubject = ref(
  "Invitation for Cybersecurity For All 2026 | One Lasallian Community LSU 20th Anniversary",
);
const emailBody = ref(
  `Dear Lasallians, Lasallian Partners, Administrators, Alumni, Faculty, Staff, Students, Student Leaders, Directors, Officers, Secretaries, and Members of the LSU Community:

Warm Lasallian greetings!

As part of La Salle University Ozamiz’s 20th Anniversary Celebration, the LSU OPR / NPCC Organizers, in collaboration with the TECH SAVVY Code Camp Community, invite the entire Lasallian community to Cybersecurity For All | Code Camp Season 4, one of the highlight events of this year-long celebration.

Event Details:
Date: August 29, 2026 (Saturday)
Time: 8:30 AM – 11:30 AM
Venue: La Salle University Ozamiz Arts Center

Join us in promoting cybersecurity awareness, digital safety, and responsible technology use while celebrating 20 years of Lasallian excellence and service.

Registration: bit.ly/LSU-CYBERSECURITY-2026
Registration includes a Certificate of Participation.

Please visit the registration link above for complete event details, registration information, and other updates.

Learn. Participate. Serve. Empower.

We look forward to celebrating this milestone with you and the entire Lasallian community.

Respectfully yours,
LSU OPR / NPCC Organizers
in collaboration with
TECH SAVVY Code Camp Community

Event Updates:
Facebook: fb.com/TechSavvyCodeCamp

TECHSAVVY CYBERSECURITY  20th Anniversary By LSU OPR NPCC.png

Disclaimer:
This email is being distributed through La Salle University Ozamiz’s Google Workspace to active @lsu.edu.ph email accounts. It is intended for members of the LSU community and official recipients. Please disregard this message if it was received in error.`,
);

// Notification Email State & Tabs
const activeEmailTab = ref("htmlTemplate"); // 'htmlTemplate' | 'customComposer'
const isSendingNotification = ref(false);
const emailProgressPercent = ref(0);
const emailProgressText = ref("");
const sentEmailCount = ref(0);
const totalEmailsToSend = ref(0);
const failedEmailCount = ref(0);
const shouldCancelEmailSending = ref(false);
const testEmailRecipient = ref("");
const showTestEmailInput = ref(false);
const confirmSendAllModal = ref(false);

// Email Image Attachments & Inline Previews (Gmail style)
const emailImages = ref([]); // Array of { id, name, size, url, file }
const emailImageInputRef = ref(null);
const activePreviewImage = ref(null); // For Image Lightbox / Full-screen modal

const toasts = ref([]);

const defaultForm = {
  email: "",
  role_filter_permissions: [],
  updated_at: "",
};

const formData = ref({ ...defaultForm });

// ---------------- CSV UPLOAD STATE ----------------
const showCsvModal = ref(false);
const csvFile = ref(null);
const csvFileName = ref("");
const csvFileSize = ref("");
const isUploadingCsv = ref(false);
const uploadProgressText = ref("");
const uploadProgressPercent = ref(0);
const shouldCancelUpload = ref(false);
const csvUploadResult = ref(null);
const fileInputRef = ref(null);

// ---------------- PAGINATION STATE ----------------
const currentPage = ref(1);
const pageSize = ref(25);
const pageSizeOptions = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000, 10000];

// ---------------- ROLES ----------------
const availableRoles = [
  "Super Admin",
  "NPCC Menu",
  "OCH Admin",
  "Content Writer",
  "HR Menu",
  "Library Menu",
  "Registrar Menu",
  "Campus Pass Admin",
  "DRS Admin",
  "Animo Run",
  "Commission on Election",
  "Commission on Election BEU",
  "External Links",
  "General Services Office",
  // "IT Services Feedback",
  "Lasalle Alumni Association",
  "Open Educational Resources",
  "Safety and Security Center",
  "Juris Doctor Admin",
  "Juris Doctor Examinee",
].map((r) => ({ value: r, label: r }));

// ---------------- FETCH ----------------
const fetchList = async (retries = 2) => {
  isLoading.value = true;
  try {
    const res = await $fetch(`${endpoint}/api/cits/role-permissions/list/`);
    listItems.value = res || [];
  } catch (e) {
    if (e?.status === 429 && retries > 0) {
      await sleep(2000);
      return fetchList(retries - 1);
    }
    console.warn("Could not refresh role permissions list:", e);
  } finally {
    isLoading.value = false;
  }
};

// ---------------- SORTING ----------------
const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
};

// ---------------- FILTER & SORT COMPUTED ----------------
const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  let list = listItems.value;

  if (q) {
    list = list.filter(
      (i) =>
        i.email?.toLowerCase().includes(q) ||
        i.role_filter_permissions?.some((r) => r.toLowerCase().includes(q)),
    );
  }

  if (!sortField.value) return list;

  return [...list].sort((a, b) => {
    let result = 0;
    if (sortField.value === "email") {
      const valA = (a.email || "").toLowerCase();
      const valB = (b.email || "").toLowerCase();
      result = valA.localeCompare(valB);
    } else if (sortField.value === "roles") {
      const rolesA = (a.role_filter_permissions || []).join(", ").toLowerCase();
      const rolesB = (b.role_filter_permissions || []).join(", ").toLowerCase();
      result = rolesA.localeCompare(rolesB);
    } else if (sortField.value === "created_at") {
      const timeA = new Date(a.created_at || a.updated_at || 0).getTime() || 0;
      const timeB = new Date(b.created_at || b.updated_at || 0).getTime() || 0;
      result = timeA - timeB;
    }
    return sortOrder.value === "asc" ? result : -result;
  });
});

// ---------------- PAGINATION COMPUTED ----------------
const totalItems = computed(() => filteredList.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / pageSize.value)),
);

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(pageSize, () => {
  currentPage.value = 1;
});

const goToPage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p;
  }
};

// ---------------- SELECTION & BATCH STATE ----------------
const isItemSelected = (id) => selectedIds.value.includes(id);

const isAllPageSelected = computed(() => {
  if (!paginatedList.value.length) return false;
  return paginatedList.value.every((item) => selectedIds.value.includes(item.id));
});

const isPartialPageSelected = computed(() => {
  if (!paginatedList.value.length) return false;
  const pageIds = paginatedList.value.map((i) => i.id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.value.includes(id));
  return selectedOnPage.length > 0 && selectedOnPage.length < pageIds.length;
});

const toggleSelectAllPage = () => {
  if (isAllPageSelected.value) {
    const pageIdSet = new Set(paginatedList.value.map((i) => i.id));
    selectedIds.value = selectedIds.value.filter((id) => !pageIdSet.has(id));
  } else {
    const set = new Set(selectedIds.value);
    paginatedList.value.forEach((item) => set.add(item.id));
    selectedIds.value = Array.from(set);
  }
};

const selectAllFiltered = () => {
  selectedIds.value = filteredList.value.map((i) => i.id);
  showToast(
    `Selected all ${filteredList.value.length.toLocaleString()} filtered records`,
    "info",
    2500,
  );
};

const clearSelection = () => {
  selectedIds.value = [];
};

const toggleSelectItem = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  } else {
    selectedIds.value.push(id);
  }
};

// ---------------- BULK DELETE ----------------
const openBulkDeleteModal = () => {
  if (!selectedIds.value.length) return;
  confirmBulkDeleteModal.value = true;
};

const closeBulkDeleteModal = () => {
  if (isBulkDeleting.value) return;
  confirmBulkDeleteModal.value = false;
};

const selectedItemsPreview = computed(() => {
  const idSet = new Set(selectedIds.value);
  return listItems.value.filter((item) => idSet.has(item.id));
});

const performBulkDelete = async () => {
  if (!selectedIds.value.length) return;
  isBulkDeleting.value = true;
  const idsToDelete = [...selectedIds.value];
  const count = idsToDelete.length;

  try {
    await $fetch(`${endpoint}/api/cits/role-permissions/bulk-delete/`, {
      method: "POST",
      body: { ids: idsToDelete },
    });

    const deletedSet = new Set(idsToDelete);
    listItems.value = listItems.value.filter((item) => !deletedSet.has(item.id));
    selectedIds.value = [];
    confirmBulkDeleteModal.value = false;
    showToast(
      `Successfully deleted ${count.toLocaleString()} role permission(s)`,
      "success",
      4000,
    );
  } catch (err) {
    console.error("Bulk delete endpoint error, using fallback loop:", err);
    try {
      const CONCURRENCY = 4;
      for (let i = 0; i < idsToDelete.length; i += CONCURRENCY) {
        const chunk = idsToDelete.slice(i, i + CONCURRENCY);
        await Promise.all(
          chunk.map((id) =>
            $fetch(`${endpoint}/api/cits/role-permissions/${id}/delete/`, {
              method: "DELETE",
            }).catch(() => null),
          ),
        );
      }
      const deletedSet = new Set(idsToDelete);
      listItems.value = listItems.value.filter((item) => !deletedSet.has(item.id));
      selectedIds.value = [];
      confirmBulkDeleteModal.value = false;
      showToast(
        `Successfully deleted ${count.toLocaleString()} role permission(s)`,
        "success",
        4000,
      );
    } catch (fallbackErr) {
      showToast("Error deleting selected role permissions", "error");
    }
  } finally {
    isBulkDeleting.value = false;
  }
};

// ---------------- NOTIFICATION EMAIL (BCC & GMAIL IMAGES) ----------------
const openEmailModal = (scope = null) => {
  if (scope) {
    emailTargetScope.value = scope;
  } else if (selectedIds.value.length > 0) {
    emailTargetScope.value = "selected";
  } else {
    emailTargetScope.value = "all";
  }
  showEmailModal.value = true;
};

const closeEmailModal = () => {
  if (isSendingNotification.value) return;
  showEmailModal.value = false;
};

const closeConfirmSendModal = () => {
  if (isSendingNotification.value) return;
  confirmSendAllModal.value = false;
};

const handleConfirmCancelOrStop = () => {
  if (isSendingNotification.value) {
    shouldCancelEmailSending.value = true;
  } else {
    confirmSendAllModal.value = false;
  }
};

// Regular expression matching emails with dash (-), underscore (_), numbers, dots (.), pluses (+), etc.
// Examples: johny14_gonzaga@lsu.edu.ph, aaronjosh.bag-ao@lsu.edu.ph
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+/g;

// Custom / Editable Email Recipients State
const customEmailsText = ref("");
const isManualEmailEdit = ref(false);
const newCustomEmailInput = ref("");

const parsedCustomEmails = computed(() => {
  if (!customEmailsText.value) return [];
  const matches = customEmailsText.value.match(EMAIL_REGEX);
  if (matches && matches.length > 0) {
    return Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
  }
  const tokens = customEmailsText.value
    .split(/[\r\n,;\s]+/)
    .map((e) => e.trim().replace(/^['"<]+|['">]+$/g, ""))
    .filter((e) => e.length > 0 && e.includes("@"));
  return Array.from(new Set(tokens.map((e) => e.toLowerCase())));
});

const selectCustomScope = () => {
  if (!customEmailsText.value && targetEmailsList.value.length > 0 && emailTargetScope.value !== "custom") {
    customEmailsText.value = targetEmailsList.value.join(", ");
  }
  emailTargetScope.value = "custom";
};

const loadCurrentScopeIntoCustom = () => {
  let items = [];
  if (emailTargetScope.value === "selected" && selectedIds.value.length > 0) {
    const idSet = new Set(selectedIds.value);
    items = listItems.value.filter((i) => idSet.has(i.id));
  } else {
    items = listItems.value;
  }
  const emails = items.map((i) => i.email?.trim()).filter(Boolean);
  customEmailsText.value = emails.join(", ");
  showToast(`Loaded ${emails.length.toLocaleString()} emails into editor`, "info", 2000);
};

const toggleEditMode = () => {
  if (!isManualEmailEdit.value) {
    if (emailTargetScope.value !== "custom") {
      customEmailsText.value = targetEmailsList.value.join(", ");
      emailTargetScope.value = "custom";
    }
    isManualEmailEdit.value = true;
  } else {
    isManualEmailEdit.value = false;
  }
};

const addCustomEmailsFromInput = () => {
  const raw = newCustomEmailInput.value.trim();
  if (!raw) return;

  let currentList = [];
  if (emailTargetScope.value === "custom") {
    currentList = [...parsedCustomEmails.value];
  } else {
    currentList = [...targetEmailsList.value];
    emailTargetScope.value = "custom";
  }

  const extracted = raw.match(EMAIL_REGEX);
  const newEmails = extracted && extracted.length > 0
    ? extracted.map((e) => e.trim().toLowerCase())
    : raw
        .split(/[\r\n,;\s]+/)
        .map((e) => e.trim().replace(/^['"<]+|['">]+$/g, "").toLowerCase())
        .filter((e) => e.length > 0 && e.includes("@"));

  if (newEmails.length === 0) {
    showToast("Please enter a valid email address", "warning");
    return;
  }

  const set = new Set(currentList.map((e) => e.toLowerCase()));
  let addedCount = 0;
  newEmails.forEach((email) => {
    if (!set.has(email)) {
      set.add(email);
      addedCount++;
    }
  });

  customEmailsText.value = Array.from(set).join(", ");
  newCustomEmailInput.value = "";
  if (addedCount > 0) {
    showToast(`Added ${addedCount} email(s) to target recipients`, "success", 2000);
  } else {
    showToast("Email(s) already in recipient list", "info", 2000);
  }
};

const removeCustomEmail = (emailToRemove) => {
  let list = [];
  if (emailTargetScope.value === "custom") {
    list = [...parsedCustomEmails.value];
  } else {
    list = [...targetEmailsList.value];
    emailTargetScope.value = "custom";
  }
  list = list.filter((e) => e !== emailToRemove);
  customEmailsText.value = list.join(", ");
  showToast(`Removed ${emailToRemove}`, "info", 1500);
};

const targetEmailsList = computed(() => {
  if (emailTargetScope.value === "custom") {
    return parsedCustomEmails.value;
  }
  let items = [];
  if (emailTargetScope.value === "selected" && selectedIds.value.length > 0) {
    const idSet = new Set(selectedIds.value);
    items = listItems.value.filter((i) => idSet.has(i.id));
  } else {
    items = listItems.value;
  }
  return items.map((i) => i.email?.trim()).filter(Boolean);
});

// Trigger image upload
const triggerEmailImageUpload = () => {
  if (emailImageInputRef.value) {
    emailImageInputRef.value.click();
  }
};

// Format file size
const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Process an image file into state
const addImageFile = (file) => {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Please select valid image files (JPG, PNG, GIF, WebP)", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    emailImages.value.push({
      id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatBytes(file.size),
      url: e.target.result,
      file: file,
    });
    showToast(`Added image "${file.name}"`, "success", 2000);
  };
  reader.readAsDataURL(file);
};

// Handle file input selection
const handleEmailImageSelect = (event) => {
  const files = event.target.files;
  if (!files || !files.length) return;
  for (let i = 0; i < files.length; i++) {
    addImageFile(files[i]);
  }
  // reset input so the same file can be chosen again if needed
  event.target.value = "";
};

// Handle paste inside the message composer (intercept pasted images)
const handleMessagePaste = (event) => {
  const clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  const items = clipboardData.items;
  if (!items) return;

  let imageFound = false;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const file = items[i].getAsFile();
      if (file) {
        // If pasted without explicit filename, name it with timestamp
        const customFile = new File(
          [file],
          `pasted_image_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`,
          { type: file.type },
        );
        addImageFile(customFile);
        imageFound = true;
      }
    }
  }

  if (imageFound) {
    // Prevent default raw filename / binary paste into the textarea
    event.preventDefault();
  }
};

// Handle drop files into the message composer
const handleMessageDrop = (event) => {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (!files || !files.length) return;

  for (let i = 0; i < files.length; i++) {
    if (files[i].type.startsWith("image/")) {
      addImageFile(files[i]);
    }
  }
};

// Remove image attachment
const removeEmailImage = (id) => {
  emailImages.value = emailImages.value.filter((img) => img.id !== id);
  showToast("Image removed", "info", 1500);
};

// Open Lightbox image modal
const openImageLightbox = (image) => {
  activePreviewImage.value = image;
};

const closeImageLightbox = () => {
  activePreviewImage.value = null;
};

// ---------------- DIRECT GMAIL COMPOSER (ALL 20,000+ EMAILS) ----------------
const composeGmail = async () => {
  const emails = targetEmailsList.value;
  if (!emails.length) {
    showToast("No recipient emails selected", "warning");
    return;
  }

  const bccClipboardStr = emails.join(", ");
  const bccUrlStr = emails.join(",");
  const subjectEnc = encodeURIComponent(emailSubject.value.trim());
  let bodyText = emailBody.value.trim();

  if (emailImages.value.length > 0) {
    bodyText += `\n\n[Attached Images: ${emailImages.value.map((i) => i.name).join(", ")}]`;
  }
  const bodyEnc = encodeURIComponent(bodyText);

  // 1. Copy ALL BCC recipients directly to clipboard
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(bccClipboardStr);
    }
  } catch (clipErr) {
    console.warn("Could not copy BCC to clipboard:", clipErr);
  }

  // 2. Safe URL construction: Google/browsers drop connection (ERR_CONNECTION_CLOSED) if URL > 2,000 chars.
  // If list is small, pass directly in URL query; if large (20,000+), open composer and let user press Ctrl+V into BCC.
  let gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${subjectEnc}&body=${bodyEnc}`;
  const bccParam = encodeURIComponent(bccUrlStr);
  const willIncludeUrlBcc = (gmailUrl + `&bcc=${bccParam}`).length < 1800;

  if (willIncludeUrlBcc) {
    gmailUrl += `&bcc=${bccParam}`;
  }

  window.open(gmailUrl, "_blank");

  if (willIncludeUrlBcc) {
    showToast(
      `Opened Gmail composer with all ${emails.length.toLocaleString()} BCC recipient(s)!`,
      "success",
      5000,
    );
  } else {
    showToast(
      `All ${emails.length.toLocaleString()} BCC emails copied! In Gmail, click 'BCC' and press Ctrl+V to paste.`,
      "success",
      7000,
    );
  }
};

const downloadAllBccTxt = () => {
  const emails = targetEmailsList.value;
  if (!emails.length) {
    showToast("No recipient emails to download", "warning");
    return;
  }

  const content = emails.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `lsu_bcc_recipients_${emails.length}_emails.txt`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(
    `Downloaded ${emails.length.toLocaleString()} email addresses as .txt!`,
    "info",
    3000,
  );
};

const composeMailto = () => {
  const emails = targetEmailsList.value;
  if (!emails.length) {
    showToast("No recipient emails selected", "warning");
    return;
  }
  const bccStr = emails.join(",");
  const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccStr)}&subject=${encodeURIComponent(emailSubject.value)}&body=${encodeURIComponent(emailBody.value)}`;
  window.location.href = mailtoUrl;
};

const copyBccEmails = async () => {
  const emails = targetEmailsList.value;
  if (!emails.length) {
    showToast("No recipient emails to copy", "warning");
    return;
  }
  try {
    await navigator.clipboard.writeText(emails.join(", "));
    showToast(
      `Copied all ${emails.length.toLocaleString()} BCC email(s) to clipboard!`,
      "success",
      3000,
    );
  } catch {
    showToast("Failed to copy to clipboard", "error");
  }
};

// ---------------- SEND HTML TEMPLATE NOTIFICATION VIA SERVER ----------------
const sendCybersecurityNotification = async (isTest = false) => {
  if (isTest) {
    const rawTestEmail = testEmailRecipient.value.trim().replace(/^['"<]+|['">]+$/g, "");
    const emailMatch = rawTestEmail.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+/);
    const testEmail = emailMatch ? emailMatch[0] : rawTestEmail;
    if (!testEmail || !testEmail.includes("@")) {
      showToast("Please enter a valid test recipient email address", "warning");
      return;
    }

    isSendingNotification.value = true;
    sentEmailCount.value = 0;
    totalEmailsToSend.value = 1;
    emailProgressPercent.value = 0;
    emailProgressText.value = `Sending test email to ${testEmail}...`;

    try {
      const res = await $fetch(`${endpoint}/api/cits/send-cybersecurity-notification/`, {
        method: "POST",
        body: {
          target_scope: "test",
          test_email: testEmail,
          subject: emailSubject.value.trim(),
        },
      });

      if (res?.status === "success") {
        sentEmailCount.value = 1;
        emailProgressPercent.value = 100;
        emailProgressText.value = `Test email sent successfully to ${testEmail}!`;
        showToast(
          res.message || `Test notification sent successfully to ${testEmail}`,
          "success",
          5000,
        );
      } else {
        showToast(res?.message || "Failed to send test email", "error", 5000);
      }
    } catch (err) {
      console.error("Error sending test email:", err);
      showToast(
        err?.data?.message || err?.message || "Error sending test email",
        "error",
        5000,
      );
    } finally {
      isSendingNotification.value = false;
    }
    return;
  }

  // Broadcast / Bulk mode
  const allEmails = targetEmailsList.value;
  if (!allEmails || allEmails.length === 0) {
    showToast("No recipient emails selected", "warning");
    return;
  }

  isSendingNotification.value = true;
  shouldCancelEmailSending.value = false;
  sentEmailCount.value = 0;
  failedEmailCount.value = 0;
  totalEmailsToSend.value = allEmails.length;
  emailProgressPercent.value = 0;
  emailProgressText.value = `Preparing to send to ${allEmails.length.toLocaleString()} recipients...`;

  const BATCH_SIZE = 50; // Each server request sends to 50 recipients via BCC
  const totalBatches = Math.ceil(allEmails.length / BATCH_SIZE);

  try {
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      if (shouldCancelEmailSending.value) {
        showToast("Email broadcast cancelled by user", "warning");
        emailProgressText.value = `Broadcast cancelled. Sent ${sentEmailCount.value.toLocaleString()} of ${allEmails.length.toLocaleString()} emails.`;
        break;
      }

      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, allEmails.length);
      const batch = allEmails.slice(start, end);

      emailProgressText.value = `Sending batch ${batchIndex + 1} of ${totalBatches} (${sentEmailCount.value.toLocaleString()} / ${allEmails.length.toLocaleString()} sent)...`;

      try {
        const res = await $fetch(`${endpoint}/api/cits/send-cybersecurity-notification/`, {
          method: "POST",
          body: {
            target_scope: "batch",
            subject: emailSubject.value.trim(),
            emails: batch,
          },
        });

        if (res?.status === "success") {
          sentEmailCount.value += batch.length;
        } else {
          console.warn("Batch send response error:", res);
          failedEmailCount.value += batch.length;
        }
      } catch (batchErr) {
        console.error(`Error sending batch ${batchIndex + 1}:`, batchErr);
        failedEmailCount.value += batch.length;
      }

      emailProgressPercent.value = Math.min(
        100,
        Math.round(((sentEmailCount.value + failedEmailCount.value) / allEmails.length) * 100),
      );
    }

    if (sentEmailCount.value > 0) {
      emailProgressText.value = `Complete! Successfully sent ${sentEmailCount.value.toLocaleString()} of ${allEmails.length.toLocaleString()} emails.`;
      showToast(
        `Successfully sent notification to ${sentEmailCount.value.toLocaleString()} of ${allEmails.length.toLocaleString()} recipient(s)!` +
        (failedEmailCount.value > 0 ? ` (${failedEmailCount.value} failed)` : ""),
        sentEmailCount.value === allEmails.length ? "success" : "warning",
        7000,
      );
      confirmSendAllModal.value = false;
    } else {
      emailProgressText.value = "Failed to send notification emails.";
      showToast("Failed to send notification emails", "error", 5000);
    }
  } catch (err) {
    console.error("Error sending notification:", err);
    showToast(
      err?.data?.message || err?.message || "Error sending email notification via server",
      "error",
      5000,
    );
  } finally {
    isSendingNotification.value = false;
  }
};

// ---------------- HELPERS ----------------
const resetForm = () => {
  formData.value = { ...defaultForm };
  editingItem.value = null;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

// ---------------- FORM ----------------
const openForm = (item = null) => {
  editingItem.value = item;
  formData.value = item
    ? {
      email: item.email,
      role_filter_permissions: [...item.role_filter_permissions],
    }
    : { ...defaultForm };

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

// ---------------- CSV MODAL HANDLERS ----------------
const openCsvModal = () => {
  csvFile.value = null;
  csvFileName.value = "";
  csvFileSize.value = "";
  csvUploadResult.value = null;
  uploadProgressText.value = "";
  showCsvModal.value = true;
};

const closeCsvModal = () => {
  if (isUploadingCsv.value) return;
  showCsvModal.value = false;
  csvFile.value = null;
  csvFileName.value = "";
  csvFileSize.value = "";
  csvUploadResult.value = null;
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  processSelectedFile(file);
};

const handleFileDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  if (!file) return;
  processSelectedFile(file);
};

const processSelectedFile = (file) => {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    showToast("Please select a valid CSV file (.csv)", "warning");
    return;
  }
  csvFile.value = file;
  csvFileName.value = file.name;
  csvFileSize.value =
    file.size > 1024 * 1024
      ? (file.size / (1024 * 1024)).toFixed(2) + " MB"
      : (file.size / 1024).toFixed(1) + " KB";
  csvUploadResult.value = null;
};

// ---------------- CSV PARSER & UPLOADER (CLIENT-SIDE) ----------------
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error("Failed to read CSV file"));
    reader.readAsText(file, "UTF-8");
  });
};

const parseCsvEmails = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const lineEmailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9.-]+/g;
  const emails = [];
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const matches = line.match(lineEmailPattern);
    if (matches) {
      for (const m of matches) {
        const cleaned = m.trim().toLowerCase();
        if (cleaned && !seen.has(cleaned)) {
          seen.add(cleaned);
          emails.push(cleaned);
        }
      }
    }
  }
  return emails;
};

const cancelCsvProcessing = () => {
  shouldCancelUpload.value = true;
  uploadProgressText.value = "Cancelling import...";
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const submitCsvUpload = async () => {
  if (!csvFile.value) {
    showToast("Please select a CSV file first", "warning");
    return;
  }

  isUploadingCsv.value = true;
  shouldCancelUpload.value = false;
  uploadProgressPercent.value = 0;
  uploadProgressText.value = "Reading and parsing CSV file...";

  try {
    const fileText = await readFileAsText(csvFile.value);
    const extractedEmails = parseCsvEmails(fileText);

    if (extractedEmails.length === 0) {
      showToast("No valid email addresses found in the CSV file.", "error");
      isUploadingCsv.value = false;
      return;
    }

    const existingEmailsSet = new Set(
      listItems.value
        .map((item) => item.email?.trim().toLowerCase())
        .filter(Boolean),
    );

    const seenInBatch = new Set();
    const emailsToCreate = [];
    let skippedCount = 0;

    for (const rawEmail of extractedEmails) {
      const emailLower = rawEmail.toLowerCase();
      if (existingEmailsSet.has(emailLower) || seenInBatch.has(emailLower)) {
        skippedCount++;
      } else {
        seenInBatch.add(emailLower);
        emailsToCreate.push(rawEmail);
      }
    }

    if (emailsToCreate.length === 0) {
      csvUploadResult.value = {
        total_rows: extractedEmails.length,
        added_count: 0,
        skipped_count: skippedCount,
        message: `All ${extractedEmails.length.toLocaleString()} emails in the file already exist in the database (skipped).`,
      };
      showToast(csvUploadResult.value.message, "info", 5000);
      isUploadingCsv.value = false;
      return;
    }

    const totalToCreate = emailsToCreate.length;
    let addedCount = 0;
    let failedCount = 0;
    const CONCURRENCY_LIMIT = 4;

    const createSingleRole = async (email, retries = 2) => {
      const now = new Date();
      const payload = {
        email: email,
        role_filter_permissions: ["External Links"],
        updated_at: now.toString(),
      };
      try {
        const res = await $fetch(`${endpoint}/api/cits/role-permissions/create/`, {
          method: "POST",
          body: payload,
        });
        addedCount++;
        listItems.value.unshift({
          id: res?.id || Date.now() + Math.random(),
          email: email,
          role_filter_permissions: ["External Links"],
          created_at: now.toISOString(),
          updated_at: now.toString(),
        });
        existingEmailsSet.add(email.toLowerCase());
        return true;
      } catch (err) {
        if (err?.status === 429 && retries > 0) {
          await sleep(2000);
          return createSingleRole(email, retries - 1);
        }
        console.error(`Failed to add ${email}:`, err);
        failedCount++;
        return false;
      }
    };

    uploadProgressText.value = `Importing 0 of ${totalToCreate.toLocaleString()} users...`;

    for (let i = 0; i < emailsToCreate.length; i += CONCURRENCY_LIMIT) {
      if (shouldCancelUpload.value) {
        showToast("Upload stopped by user", "warning");
        break;
      }

      const chunk = emailsToCreate.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(chunk.map((email) => createSingleRole(email)));

      const processed = Math.min(i + chunk.length, totalToCreate);
      uploadProgressPercent.value = Math.round(
        (processed / totalToCreate) * 100,
      );
      uploadProgressText.value = `Imported ${processed.toLocaleString()} of ${totalToCreate.toLocaleString()} new users (${uploadProgressPercent.value}%)...`;

      await sleep(150);
    }

    csvUploadResult.value = {
      total_rows: extractedEmails.length,
      added_count: addedCount,
      skipped_count: skippedCount + failedCount,
      message: `Successfully imported ${addedCount.toLocaleString()} user(s) with "External Links" role. Skipped ${skippedCount.toLocaleString()} existing/duplicate record(s).`,
    };

    showToast(csvUploadResult.value.message, "success", 5000);
  } catch (err) {
    console.error("CSV Upload error:", err);
    showToast(`Error processing CSV: ${err.message}`, "error");
  } finally {
    isUploadingCsv.value = false;
  }
};

// ---------------- DOWNLOAD CSV TEMPLATE ----------------
const downloadCsvTemplate = () => {
  const headers = ["First Name", "Last Name", "Email Address"];
  const sampleRows = [
    ["Juan", "Dela Cruz", "juan.delacruz@lsu.edu.ph"],
    ["Maria", "Santos", "maria.santos@lsu.edu.ph"],
    ["Pedro", "Penduko", "pedro.penduko@lsu.edu.ph"],
  ];

  const csvContent =
    headers.join(",") +
    "\n" +
    sampleRows.map((r) => r.join(",")).join("\n") +
    "\n";

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "roles_permission_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("CSV Template downloaded", "info", 2500);
};

// ---------------- ROLE TOGGLE ----------------
const toggleRole = (role) => {
  const roles = formData.value.role_filter_permissions;
  roles.includes(role)
    ? (formData.value.role_filter_permissions = roles.filter((r) => r !== role))
    : roles.push(role);
};

// ---------------- SAVE ----------------
const submitForm = async () => {
  if (!formData.value.email.trim())
    return showToast("Email cannot be empty", "warning");

  formData.value.updated_at = new Date().toString();
  isLoading.value = true;

  const url = editingItem.value
    ? `${endpoint}/api/cits/role-permissions/${editingItem.value.id}/edit/`
    : `${endpoint}/api/cits/role-permissions/create/`;

  const method = editingItem.value ? "PUT" : "POST";

  try {
    await $fetch(url, { method, body: formData.value });

    showToast(
      `Role permission ${editingItem.value ? "updated" : "created"} successfully`,
      "success",
    );

    await fetchList();
    closeForm();
  } catch (e) {
    showToast("Error saving role permission", "error");
  } finally {
    isLoading.value = false;
  }
};

// ---------------- SINGLE DELETE ----------------
const deleteItem = (id) => {
  deleteId.value = id;
  confirmDeleteModal.value = true;
};

const cancelDelete = () => {
  confirmDeleteModal.value = false;
  deleteId.value = null;
};

const performDelete = async () => {
  if (!deleteId.value) return;

  isLoading.value = true;

  try {
    await $fetch(
      `${endpoint}/api/cits/role-permissions/${deleteId.value}/delete/`,
      { method: "DELETE" },
    );

    await fetchList();
    showToast("Role permission deleted", "success");
  } catch {
    showToast("Error deleting role permission", "error");
  } finally {
    cancelDelete();
    isLoading.value = false;
  }
};

// ---------------- TOAST ----------------
const showToast = (message, type = "info", duration = 3000) => {
  const id = Date.now();
  toasts.value.push({ id, message, type });

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
};

// ---------------- SCREEN & KEYBOARD LOCK DURING EMAIL SENDING ----------------
const handleGlobalKeyInterception = (e) => {
  if (!isSendingNotification.value) return;
  // Block all keyboard events in the current tab during email sending to prevent interruptions
  e.preventDefault();
  e.stopPropagation();
};

const handleBeforeUnload = (e) => {
  if (!isSendingNotification.value) return;
  // Standard browser warning when user attempts to reload or close tab during active email sending
  e.preventDefault();
  e.returnValue = "Email sending is in progress. Are you sure you want to leave or refresh?";
  return e.returnValue;
};

watch(isSendingNotification, (isSending) => {
  if (typeof window === "undefined") return;
  if (isSending) {
    window.addEventListener("keydown", handleGlobalKeyInterception, { capture: true });
    window.addEventListener("keyup", handleGlobalKeyInterception, { capture: true });
    window.addEventListener("keypress", handleGlobalKeyInterception, { capture: true });
    window.addEventListener("beforeunload", handleBeforeUnload);
  } else {
    window.removeEventListener("keydown", handleGlobalKeyInterception, { capture: true });
    window.removeEventListener("keyup", handleGlobalKeyInterception, { capture: true });
    window.removeEventListener("keypress", handleGlobalKeyInterception, { capture: true });
    window.removeEventListener("beforeunload", handleBeforeUnload);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleGlobalKeyInterception, { capture: true });
    window.removeEventListener("keyup", handleGlobalKeyInterception, { capture: true });
    window.removeEventListener("keypress", handleGlobalKeyInterception, { capture: true });
    window.removeEventListener("beforeunload", handleBeforeUnload);
  }
});

// ---------------- MOUNT & WATCH ----------------
watch(
  () => props.rolePermissions,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      listItems.value = newVal;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  if (props.rolePermissions && props.rolePermissions.length > 0) {
    listItems.value = props.rolePermissions;
  } else if (!props.rolePermissions) {
    await fetchList();
  }
});
</script>

<template>
  <div class="min-h-screen" :class="darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'">
    <!-- HEADER -->
    <div class="lg:flex items-center w-full px-2 mb-3 space-y-2 lg:space-y-0 gap-3">
      <div class="w-full">
        <div class="flex items-center gap-2">
          <p class="text-lg font-semibold text-green-700 lg:whitespace-nowrap">
            Role Permissions Management
          </p>
          <span v-if="listItems.length"
            class="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
            {{ listItems.length.toLocaleString() }} users
          </span>
        </div>
        <span class="text-gray-600 text-xs -mt-1 flex">
          Manage user roles and permissions
        </span>
      </div>

      <!-- SEARCH -->
      <div class="w-full relative">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input v-model="searchQuery" type="text" placeholder="Search by email or role..."
          class="w-full pl-10 pr-4 lg:py-2 py-1 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white text-gray-800 shadow-2xs" />
      </div>

      <!-- ACTION BUTTONS -->
      <div class="lg:w-fit flex items-center gap-2">
        <button @click="downloadCsvTemplate()"
          class="px-3 lg:py-2 py-1 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2 shadow-xs hover:shadow transition whitespace-nowrap text-xs lg:text-sm font-medium cursor-pointer"
          title="Download sample CSV template">
          <i class="fa fa-download text-emerald-600 text-sm"></i> Download Template
        </button>

        <button @click="openCsvModal()"
          class="px-3 lg:py-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition whitespace-nowrap text-xs lg:text-sm font-medium cursor-pointer"
          title="Upload CSV of LSU emails">
          <i class="fa fa-file-csv text-sm"></i> CSV upload
        </button>

        <!-- EMAIL NOTIFICATION BUTTON -->
        <button @click="openEmailModal(selectedIds.length > 0 ? 'selected' : 'all')"
          class="px-3 lg:py-2 py-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition whitespace-nowrap text-xs lg:text-sm font-medium cursor-pointer"
          title="Send Gmail / Notification Email with BCC">
          <i class="fa fa-envelope text-sm"></i>
          <span>Email BCC</span>
        </button>

        <button @click="openForm()"
          class="px-4 lg:py-2 py-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition whitespace-nowrap text-xs lg:text-sm font-medium cursor-pointer">
          <i class="fa fa-plus text-sm"></i> Add
        </button>
      </div>
    </div>

    <!-- BATCH ACTION BAR (Shown when items are selected) -->
    <div v-if="selectedIds.length > 0"
      class="mx-2 mb-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div class="flex items-center gap-2 text-xs text-emerald-900 font-medium">
        <i class="fa fa-check-circle text-emerald-600 text-base"></i>
        <span>
          <strong class="font-bold text-emerald-950 text-sm">{{ selectedIds.length.toLocaleString() }}</strong> of
          {{ totalItems.toLocaleString() }} record(s) selected
        </span>
        <button v-if="selectedIds.length < totalItems" @click="selectAllFiltered()"
          class="text-emerald-700 hover:text-emerald-900 underline font-semibold ml-2 cursor-pointer">
          Select all {{ totalItems.toLocaleString() }} records
        </button>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <button @click="openEmailModal('selected')"
          class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-xs transition cursor-pointer"
          title="Send BCC email to selected recipients">
          <i class="fa fa-envelope"></i>
          <span>Email Selected ({{ selectedIds.length }})</span>
        </button>

        <button @click="openBulkDeleteModal()"
          class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 font-medium shadow-xs transition cursor-pointer"
          title="Delete selected role permissions">
          <i class="fa fa-trash"></i>
          <span>Delete Selected ({{ selectedIds.length }})</span>
        </button>

        <button @click="clearSelection()"
          class="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg flex items-center gap-1 font-medium transition cursor-pointer"
          title="Clear all selections">
          <i class="fa fa-times"></i> Deselect
        </button>
      </div>
    </div>

    <!-- TABLE SECTION -->
    <div class="px-2">
      <div class="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <!-- PAGINATION BAR -->
        <div v-if="totalItems > 0"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 text-xs text-gray-600 bg-gray-50/80 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <span>Showing</span>
            <span class="font-semibold text-gray-900">
              {{ (currentPage - 1) * pageSize + 1 }}
            </span>
            <span>to</span>
            <span class="font-semibold text-gray-900">
              {{ Math.min(currentPage * pageSize, totalItems) }}
            </span>
            <span>of</span>
            <span class="font-semibold text-green-700">
              {{ totalItems.toLocaleString() }}
            </span>
            <span>records</span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Page size selector -->
            <div class="flex items-center gap-1.5">
              <span>Per page:</span>
              <select v-model.number="pageSize"
                class="border border-gray-300 rounded px-2 py-1 bg-white text-gray-800 text-xs focus:ring-1 focus:ring-green-500">
                <option v-for="size in pageSizeOptions" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>

            <!-- Page Navigation Buttons -->
            <div class="flex items-center gap-1">
              <button @click="goToPage(1)" :disabled="currentPage === 1"
                class="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer bg-white"
                title="First Page">
                <i class="fa fa-angle-double-left"></i>
              </button>
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                class="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 cursor-pointer bg-white">
                <i class="fa fa-chevron-left"></i> Prev
              </button>

              <span class="px-2 font-medium text-gray-700">
                Page {{ currentPage }} of {{ totalPages }}
              </span>

              <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 cursor-pointer bg-white">
                Next <i class="fa fa-chevron-right"></i>
              </button>
              <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
                class="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs cursor-pointer bg-white"
                title="Last Page">
                <i class="fa fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <!-- TABLE HEADER -->
            <thead>
              <tr
                class="bg-gray-100 text-gray-700 uppercase font-semibold text-[11px] border-b border-gray-200 select-none">
                <!-- Checkbox Column (Clean, Dedicated Width & Centering) -->
                <th scope="col"
                  class="w-12 px-3 py-3.5 text-center shrink-0 border-r border-gray-200/60 bg-gray-100/90">
                  <div class="flex items-center justify-center">
                    <input type="checkbox" :checked="isAllPageSelected" :indeterminate.prop="isPartialPageSelected"
                      @change="toggleSelectAllPage()"
                      class="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer accent-green-600"
                      title="Select all on current page" />
                  </div>
                </th>

                <!-- Email Column -->
                <th scope="col" @click="sortBy('email')"
                  class="px-4 py-3.5 cursor-pointer hover:bg-gray-200/70 transition" title="Click to sort by Email">
                  <div class="flex items-center gap-1.5">
                    <span>Email</span>
                    <span class="text-xs">
                      <i v-if="sortField === 'email'" class="fa"
                        :class="sortOrder === 'asc' ? 'fa-sort-up text-green-700 font-bold' : 'fa-sort-down text-green-700 font-bold'"></i>
                      <i v-else class="fa fa-sort text-gray-400 opacity-60"></i>
                    </span>
                  </div>
                </th>

                <!-- Roles Column -->
                <th scope="col" @click="sortBy('roles')"
                  class="px-4 py-3.5 cursor-pointer hover:bg-gray-200/70 transition" title="Click to sort by Roles">
                  <div class="flex items-center gap-1.5">
                    <span>Roles</span>
                    <span class="text-xs">
                      <i v-if="sortField === 'roles'" class="fa"
                        :class="sortOrder === 'asc' ? 'fa-sort-up text-green-700 font-bold' : 'fa-sort-down text-green-700 font-bold'"></i>
                      <i v-else class="fa fa-sort text-gray-400 opacity-60"></i>
                    </span>
                  </div>
                </th>

                <!-- Created / Updated Column -->
                <th scope="col" @click="sortBy('created_at')"
                  class="px-4 py-3.5 whitespace-nowrap cursor-pointer hover:bg-gray-200/70 transition"
                  title="Click to sort by Date">
                  <div class="flex items-center gap-1.5">
                    <span>Created / Updated</span>
                    <span class="text-xs">
                      <i v-if="sortField === 'created_at'" class="fa"
                        :class="sortOrder === 'asc' ? 'fa-sort-up text-green-700 font-bold' : 'fa-sort-down text-green-700 font-bold'"></i>
                      <i v-else class="fa fa-sort text-gray-400 opacity-60"></i>
                    </span>
                  </div>
                </th>

                <!-- Actions Column -->
                <th scope="col" class="w-28 px-4 py-3.5 text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>

            <!-- TABLE BODY -->
            <tbody class="divide-y divide-gray-100">
              <!-- Loading State -->
              <tr v-if="isLoading">
                <td colspan="5" class="py-12 text-center text-gray-500">
                  <div class="flex items-center justify-center gap-2">
                    <i class="fa fa-spinner fa-spin text-green-600 text-lg"></i>
                    <span class="text-sm font-medium">Loading role permissions...</span>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-else-if="filteredList.length === 0">
                <td colspan="5" class="py-12 text-center text-gray-500">
                  <div class="text-sm">No role permissions found.</div>
                </td>
              </tr>

              <!-- Data Rows -->
              <tr v-for="(item, k) in paginatedList" :key="item.id || k" class="transition group" :class="[
                isItemSelected(item.id)
                  ? 'bg-emerald-50/90 text-emerald-950 font-medium'
                  : k % 2
                    ? 'bg-white hover:bg-gray-50/80'
                    : 'bg-gray-50/50 hover:bg-gray-100/70',
              ]">
                <!-- Checkbox Column (Properly Spaced & Centered) -->
                <td class="w-12 px-3 py-3 text-center shrink-0 border-r border-gray-100/80">
                  <div class="flex items-center justify-center">
                    <input type="checkbox" :checked="isItemSelected(item.id)" @change="toggleSelectItem(item.id)"
                      class="w-4 h-4 rounded text-green-600 focus:ring-green-500 cursor-pointer accent-green-600" />
                  </div>
                </td>

                <!-- Email Column -->
                <td class="px-4 py-3 font-medium text-gray-900 break-all">
                  {{ item.email }}
                </td>

                <!-- Roles Column -->
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="role in item.role_filter_permissions" :key="role"
                      class="px-2 py-0.5 text-[10px] rounded-lg bg-green-600 text-white font-medium shadow-xs">
                      {{ role }}
                    </span>
                    <span v-if="!item.role_filter_permissions || item.role_filter_permissions.length === 0"
                      class="text-gray-400 italic text-[11px]">
                      No roles assigned
                    </span>
                  </div>
                </td>

                <!-- Created / Updated Column -->
                <td class="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                  <div>Created: {{ formatDate(item.created_at) }}</div>
                  <div>Updated: {{ formatDate(item.updated_at) }}</div>
                </td>

                <!-- Actions Column -->
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button @click="openForm(item)"
                      class="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
                      title="Edit Roles">
                      <i class="fa fa-edit w-3.5 h-3.5 flex items-center justify-center"></i>
                    </button>

                    <button @click="deleteItem(item.id)"
                      class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-2xs transition cursor-pointer"
                      title="Delete Role Permission">
                      <i class="fa fa-trash w-3.5 h-3.5 flex items-center justify-center"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION EMAIL MODAL (CYBERSECURITY HTML TEMPLATE & GMAIL BCC) -->
    <div v-if="showEmailModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="closeEmailModal">
      <div class="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <i class="fa fa-shield-alt text-xl"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                Cybersecurity Event Notification
                <span
                  class="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  20th Anniversary
                </span>
              </h2>
              <p class="text-xs text-gray-500">
                Send official HTML email template or compose custom notification to LSU Community accounts
              </p>
            </div>
          </div>
          <button @click="closeEmailModal"
            class="text-gray-400 hover:text-gray-600 text-lg p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <!-- Mode Navigation Tabs -->
        <div class="flex items-center gap-2 border-b pb-2">
          <button type="button" @click="activeEmailTab = 'htmlTemplate'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            :class="[
              activeEmailTab === 'htmlTemplate'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]">
            <i class="fa fa-file-code"></i>
            <span>CybersecurityEventNotification.html</span>
          </button>

          <button type="button" @click="activeEmailTab = 'customComposer'"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            :class="[
              activeEmailTab === 'customComposer'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]">
            <i class="fa fa-edit"></i>
            <span>Custom Message / Gmail BCC</span>
          </button>
        </div>

        <!-- Scope Selection Tabs -->
        <div class="flex flex-wrap items-center gap-2 text-xs border-b pb-2.5">
          <span class="font-semibold text-gray-600">Send To:</span>
          <button type="button" @click="emailTargetScope = 'selected'" :disabled="selectedIds.length === 0"
            class="px-3 py-1 rounded-lg border font-medium transition cursor-pointer" :class="[
              emailTargetScope === 'selected'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
              selectedIds.length === 0 ? 'opacity-40 cursor-not-allowed' : '',
            ]">
            Selected Users ({{ selectedIds.length }})
          </button>

          <button type="button" @click="emailTargetScope = 'all'"
            class="px-3 py-1 rounded-lg border font-medium transition cursor-pointer" :class="[
              emailTargetScope === 'all'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
            ]">
            All Users ({{ listItems.length.toLocaleString() }})
          </button>

          <button type="button" @click="selectCustomScope"
            class="px-3 py-1 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1.5" :class="[
              emailTargetScope === 'custom'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
            ]">
            <i class="fa fa-pencil-alt text-[10px]"></i>
            <span>Custom / Manual List ({{ (emailTargetScope === 'custom' ? targetEmailsList.length :
              parsedCustomEmails.length).toLocaleString() }})</span>
          </button>
        </div>

        <!-- Target Recipients Card (Editable & Customizable) -->
        <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs space-y-2.5">
          <!-- Top Row: Counter, CC pill, and Actions -->
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold text-emerald-900 flex items-center gap-1.5">
                <i class="fa fa-user-friends text-emerald-600"></i>
                Target Recipients ({{ targetEmailsList.length.toLocaleString() }} emails)
              </span>
              <span
                class="px-2 py-0.5 bg-emerald-200/70 text-emerald-900 rounded font-semibold text-[10.5px] border border-emerald-300">
                BCC Only (No Limit)
              </span>
              <span v-if="emailTargetScope === 'custom'"
                class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[10.5px] border border-amber-300 flex items-center gap-1">
                <i class="fa fa-edit text-[10px]"></i> Custom List Active
              </span>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <!-- Mode Toggle: Raw text edit vs Visual chips -->
              <button type="button" @click="toggleEditMode"
                class="px-2.5 py-1 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg text-emerald-800 font-semibold text-[11px] flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                :title="isManualEmailEdit ? 'Switch to interactive chips view' : 'Edit raw emails in multi-line text area'">
                <i :class="isManualEmailEdit ? 'fa fa-th-large' : 'fa fa-edit'"></i>
                <span>{{ isManualEmailEdit ? "Done / View Chips" : "Edit / Customize Emails" }}</span>
              </button>

              <button type="button" @click="copyBccEmails()"
                class="text-emerald-700 hover:text-emerald-900 font-semibold underline text-[11px] flex items-center gap-1 cursor-pointer">
                <i class="fa fa-copy"></i> Copy Email List
              </button>
            </div>
          </div>

          <!-- EDITABLE TEXTAREA VIEW (Multi-line input / paste) -->
          <div v-if="isManualEmailEdit" class="space-y-2">
            <div class="relative">
              <textarea v-model="customEmailsText" rows="4"
                class="w-full border border-emerald-300 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono leading-relaxed"
                placeholder="Enter or paste recipient emails here separated by commas, newlines, or semicolons...&#10;e.g. jorenlee.luna@lsu.edu.ph, juvanee.luna@lsu.edu.ph, altheadanna.luna@lsu.edu.ph"></textarea>
            </div>
            <div class="flex flex-wrap items-center justify-between text-[11px] text-emerald-900 gap-2">
              <div class="flex items-center gap-2">
                <span class="font-semibold">
                  <i class="fa fa-check text-emerald-600"></i> {{ parsedCustomEmails.length.toLocaleString() }} valid
                  email(s) detected
                </span>
                <span class="text-gray-500 text-[10.5px]">
                  (Comma, newline, semicolon, or space separated)
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" @click="loadCurrentScopeIntoCustom"
                  class="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-medium text-[10.5px] cursor-pointer"
                  title="Reset custom list to the current active scope">
                  <i class="fa fa-sync-alt text-[9px] mr-1"></i> Load From Scope
                </button>
                <button type="button" @click="customEmailsText = ''"
                  class="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-700 rounded font-medium text-[10.5px] cursor-pointer">
                  <i class="fa fa-trash text-[9px] mr-1"></i> Clear
                </button>
                <button type="button" @click="isManualEmailEdit = false"
                  class="px-2.5 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[10.5px] cursor-pointer">
                  Done Editing
                </button>
              </div>
            </div>
          </div>

          <!-- VISUAL CHIPS VIEW (with Quick Single/Multi Add and Chip Removal) -->
          <div v-else class="space-y-2">
            <!-- Quick Add Bar -->
            <div class="flex items-center gap-1.5">
              <div class="relative flex-1">
                <input v-model="newCustomEmailInput" @keyup.enter="addCustomEmailsFromInput" type="text"
                  placeholder="Type email(s) to add (e.g. jorenlee.luna@lsu.edu.ph, juvanee.luna@lsu.edu.ph) and press Enter"
                  class="w-full bg-white border border-emerald-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder:text-gray-400 font-mono" />
              </div>
              <button type="button" @click="addCustomEmailsFromInput" :disabled="!newCustomEmailInput.trim()"
                class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-xs transition flex items-center gap-1 shrink-0 cursor-pointer">
                <i class="fa fa-plus text-[10px]"></i> Add
              </button>
            </div>

            <!-- Email preview chips box -->
            <div
              class="max-h-24 overflow-y-auto flex flex-wrap gap-1.5 p-1.5 bg-white rounded-lg border border-emerald-100">
              <template v-if="targetEmailsList.length > 0">
                <span v-for="(email, idx) in targetEmailsList.slice(0, 80)" :key="email + idx"
                  class="group inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-mono border border-emerald-100 transition">
                  <span>{{ email }}</span>
                  <button type="button" @click.stop="removeCustomEmail(email)"
                    class="text-emerald-400 group-hover:text-red-600 hover:bg-red-100 rounded px-1 font-bold ml-0.5 cursor-pointer leading-none transition"
                    title="Remove recipient">
                    ×
                  </button>
                </span>
                <span v-if="targetEmailsList.length > 80"
                  class="px-2 py-0.5 text-emerald-700 font-semibold text-[10px]">
                  +{{ (targetEmailsList.length - 80).toLocaleString() }} more
                </span>
              </template>
              <div v-else class="w-full py-2.5 text-center text-gray-400 italic text-[11px]">
                No target emails found. Type or paste emails above or switch scope.
              </div>
            </div>
          </div>
        </div>

        <!-- Subject Input -->
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">
            Email Subject
          </label>
          <input v-model="emailSubject" type="text"
            class="w-full border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            placeholder="Enter email subject" />
        </div>

        <!-- REAL-TIME EMAIL SENDING PROGRESS BANNER -->
        <div v-if="isSendingNotification || sentEmailCount > 0"
          class="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3.5 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i v-if="isSendingNotification" class="fa fa-spinner fa-spin text-emerald-700 text-base"></i>
              <i v-else class="fa fa-check-circle text-emerald-600 text-base"></i>
              <span class="font-bold text-xs text-emerald-950">
                {{ isSendingNotification ? "Sending Email Broadcast..." : "Email Broadcast Completed" }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                {{ sentEmailCount.toLocaleString() }} / {{ totalEmailsToSend.toLocaleString() }} Sent ({{
                  emailProgressPercent }}%)
              </span>
              <button v-if="isSendingNotification" type="button" @click="shouldCancelEmailSending = true"
                class="text-xs font-semibold text-red-600 hover:text-red-800 underline ml-1 cursor-pointer">
                Stop
              </button>
            </div>
          </div>

          <!-- Progress Bar Track -->
          <div class="w-full bg-emerald-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              class="bg-gradient-to-r from-emerald-600 to-green-500 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-1.5 text-[9px] text-white font-bold"
              :style="{ width: `${emailProgressPercent}%` }">
              <span v-if="emailProgressPercent >= 12">{{ emailProgressPercent }}%</span>
            </div>
          </div>

          <!-- Status text -->
          <div class="flex items-center justify-between text-[11px] text-emerald-900">
            <span>{{ emailProgressText }}</span>
            <span v-if="failedEmailCount > 0" class="text-red-600 font-semibold">
              Failed: {{ failedEmailCount.toLocaleString() }}
            </span>
          </div>
        </div>

        <!-- TAB 1: OFFICIAL HTML TEMPLATE PREVIEW & SEND -->
        <div v-if="activeEmailTab === 'htmlTemplate'" class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-gray-700">
              HTML Template Preview (CybersecurityEventNotification.html)
            </label>
            <span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <i class="fa fa-check-circle"></i> Official 20th Anniversary Template
            </span>
          </div>

          <!-- Template Visual Preview Card -->
          <div
            class="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-gray-50 max-h-[420px] overflow-y-auto">
            <!-- Header Preview -->
            <div
              class="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 text-white text-center p-4 sm:p-5">
              <div class="inline-block bg-white px-4 py-2 rounded-xl mb-2.5 shadow-md">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-c-v.png"
                  alt="LSU Logo" class="h-10 sm:h-12 w-auto max-w-[220px] object-contain inline-block" />
              </div>
              <div>
                <span
                  class="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider bg-white/20 inline-block px-3 py-0.5 rounded-full mb-1">
                  20th Anniversary Celebration
                </span>
              </div>
              <h3 class="text-lg sm:text-xl font-extrabold text-white">Cybersecurity For All</h3>
              <p class="text-xs sm:text-[13px] text-emerald-100">Building a Safer Digital Community
              </p>
            </div>

            <!-- Body Preview -->
            <div class="p-4 sm:p-5 text-xs sm:text-[13px] text-gray-700 space-y-3 bg-white">
              <p class="font-bold text-gray-900 text-xs sm:text-[13px]">
                Dear Lasallians, Lasallian Partners, Administrators, Alumni, Faculty, Staff, Students, Student Leaders,
                Directors, Officers, Secretaries, and Members of the LSU Community:
              </p>
              <p class="text-emerald-700 font-bold text-sm">
                Warm Lasallian greetings!
              </p>
              <p class="text-gray-600 text-xs sm:text-[13px] leading-relaxed">
                As part of <strong>La Salle University Ozamiz’s 20th Anniversary Celebration</strong>, the <strong>LSU
                  OPR / NPCC Organizers</strong>, in collaboration with the <strong>TECH SAVVY Code Camp
                  Community</strong>, invite the entire Lasallian community to <strong>Cybersecurity For All | Code Camp
                  Season 4</strong>, one of the highlight events of this year-long celebration.
              </p>

              <!-- Event Details Box -->
              <div class="bg-gray-50 border-l-4 border-emerald-600 p-3 rounded text-xs sm:text-[13px] space-y-1">
                <div class="font-bold text-emerald-900 uppercase text-xs sm:text-[12px]">📅 Event Details</div>
                <div><strong>Date:</strong> August 29, 2026 (Saturday)</div>
                <div><strong>Time:</strong> 8:30 AM – 11:30 AM</div>
                <div><strong>Venue:</strong> La Salle University Ozamiz Arts Center</div>
              </div>

              <!-- Student & Partner Incentives -->
              <div
                class="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-xs sm:text-[12.5px] text-emerald-900 space-y-0.5">
                <div class="font-bold text-emerald-800">🎓 Participation Credits & Extension:</div>
                <div>• Current AY 2026–2027 Students: <strong>20 Points Lasalle Passport</strong></div>
                <div>• Lasallian Partners: <strong>Community Extension</strong></div>
              </div>

              <!-- CTA Preview -->
              <div
                class="bg-emerald-50 border border-dashed border-emerald-300 rounded-lg p-3 sm:p-4 text-center space-y-1.5">
                <p class="text-emerald-800 font-semibold text-xs sm:text-[13px]">🏆 Registration includes a Certificate
                  of Participation</p>
                <div
                  class="inline-block bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-lg shadow-xs">
                  Register: bit.ly/LSU-CYBERSECURITY-2026
                </div>
              </div>

              <!-- Poster Banner Image Preview -->
              <div class="text-center my-2">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/TECHSAVVY%20CYBERSECURITY%20%2020th%20Anniversary%20By%20LSU%20OPR%20NPCC.png"
                  alt="Athena Aliafe Abe Poster" class="rounded-lg max-h-56 w-auto mx-auto shadow-sm" />
              </div>

              <div
                class="bg-slate-900 text-white font-bold text-center py-2 rounded text-[10px] sm:text-[11px] tracking-widest uppercase">
                Learn • Participate • Serve • Empower
              </div>

              <!-- Inquiries & Registration Assistance -->
              <div
                class="bg-slate-50 border-l-2 border-emerald-700 p-2.5 rounded text-xs sm:text-[12.5px] text-slate-700 space-y-0.5">
                <div class="font-bold text-slate-900">📧 Inquiries & Registration Assistance:</div>
                <div>Email: <a href="mailto:jorenlee.luna@lsu.edu.ph"
                    class="text-emerald-700 font-bold underline">jorenlee.luna@lsu.edu.ph</a> (Event Chair,
                  Cybersecurity For All 2026)</div>
                <div class="text-[11px] text-slate-500 italic">LSU OPR / NPCC – Serving for Community Extension</div>
              </div>

              <div class="text-xs sm:text-[12px] text-gray-600 pt-2 border-t">
                <p>Respectfully yours,</p>
                <p class="font-bold text-gray-900">LSU OPR / NPCC Organizers</p>
                <p class="italic text-gray-500">in collaboration with</p>
                <p class="font-bold text-emerald-700">TECH SAVVY Code Camp Community</p>
                <p class="mt-1 text-[11px]">Facebook: <span
                    class="text-blue-600 underline">fb.com/TechSavvyCodeCamp</span></p>
              </div>

              <!-- University & 20th Anniversary Logos (No border) -->
              <div class="flex items-center justify-center py-2">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20&%20Theme%20with%20Corp%20Logo%20Green.png"
                  alt="La Salle University Ozamiz - 20th Anniversary" class="h-14 sm:h-16 w-auto object-contain" />
              </div>

              <div class="p-2.5 bg-gray-50 rounded text-[10.5px] sm:text-[11px] text-gray-500 italic border space-y-1">
                <div>Disclaimer: This email is being distributed through La Salle University Ozamiz’s Google Workspace
                  to active @lsu.edu.ph email accounts. It is intended for members of the LSU community and official
                  recipients. Please disregard this message if it was received in error.</div>
                <div class="text-emerald-800 font-medium">Powered By lsu.edu.ph | www.lsu.edu.ph</div>
              </div>
            </div>
          </div>

          <!-- Test Email Subsection -->
          <div
            class="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div class="flex-1 min-w-[240px]">
              <label class="block text-[11px] font-semibold text-gray-700 mb-1">
                Send Test Email (Verify Inbox Appearance)
              </label>
              <input v-model="testEmailRecipient" type="email"
                placeholder="Enter your email to receive a test copy (e.g. name@lsu.edu.ph)"
                class="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <button type="button" @click="sendCybersecurityNotification(true)"
              :disabled="isSendingNotification || !testEmailRecipient.trim()"
              class="px-3.5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed self-end cursor-pointer">
              <i v-if="isSendingNotification" class="fa fa-spinner fa-spin"></i>
              <i v-else class="fa fa-paper-plane text-emerald-400"></i>
              <span>Send Test Email</span>
            </button>
          </div>
        </div>

        <!-- TAB 2: GMAIL-STYLE CUSTOM MESSAGE COMPOSER -->
        <div v-else class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-gray-700">
              Email Message Body
            </label>
            <span class="text-[11px] text-gray-400">
              💡 Paste (Ctrl+V) images or drag & drop directly
            </span>
          </div>

          <!-- Composer Box with Toolbar & Image Previews -->
          <div
            class="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition bg-white">
            <!-- Gmail-Style Formatting & Image Toolbar -->
            <div
              class="bg-gray-100/90 px-3 py-2 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-1 text-gray-700">
                <button type="button" @click="triggerEmailImageUpload"
                  class="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-gray-300 hover:border-indigo-300 rounded-md font-medium flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  title="Insert or attach an image (JPG, PNG, GIF, WebP)">
                  <i class="fa fa-image text-indigo-600"></i>
                  <span>Add Image</span>
                </button>

                <input ref="emailImageInputRef" type="file" accept="image/*" multiple class="hidden"
                  @change="handleEmailImageSelect" />

                <span class="text-gray-300 mx-1">|</span>

                <span class="text-gray-500 text-[11px] italic">
                  Drag & drop or paste images anywhere in this box
                </span>
              </div>

              <div v-if="emailImages.length > 0"
                class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <i class="fa fa-paperclip"></i>
                {{ emailImages.length }} image{{ emailImages.length > 1 ? "s" : "" }} attached
              </div>
            </div>

            <!-- Text Body Textarea with Paste & Drop Listener -->
            <div @paste="handleMessagePaste" @dragover.prevent @drop="handleMessageDrop" class="relative">
              <textarea v-model="emailBody" rows="6"
                class="w-full p-3 text-xs text-gray-800 focus:outline-none font-sans bg-white border-0 resize-y"
                placeholder="Type your message content here. You can paste (Ctrl+V) images directly into this area..."></textarea>
            </div>

            <!-- GMAIL-STYLE IMAGE PREVIEWS / ATTACHMENT GALLERY -->
            <div v-if="emailImages.length > 0" class="p-3 bg-gray-50 border-t border-gray-200 space-y-2">
              <div
                class="flex items-center justify-between text-[11px] text-gray-600 font-semibold uppercase tracking-wider">
                <span class="flex items-center gap-1.5 text-gray-700">
                  <i class="fa fa-images text-indigo-600"></i>
                  Attached Images ({{ emailImages.length }})
                </span>
                <span class="text-[10px] text-gray-400 normal-case">
                  Click on an image to view full size
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div v-for="img in emailImages" :key="img.id"
                  class="group relative flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition">
                  <div @click="openImageLightbox(img)"
                    class="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 cursor-pointer border border-gray-100 group-hover:opacity-95"
                    title="Click to view full image">
                    <img :src="img.url" :alt="img.name" class="w-full h-full object-cover" />
                    <div
                      class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                      <i class="fa fa-search-plus"></i>
                    </div>
                  </div>

                  <div class="flex-1 min-w-0 pr-6">
                    <p @click="openImageLightbox(img)"
                      class="text-xs font-semibold text-gray-800 truncate cursor-pointer hover:text-indigo-600"
                      :title="img.name">
                      {{ img.name }}
                    </p>
                    <p class="text-[10px] text-gray-500 mt-0.5">
                      {{ img.size }}
                    </p>
                    <div class="flex items-center gap-2 mt-1">
                      <button type="button" @click="openImageLightbox(img)"
                        class="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-1 cursor-pointer">
                        <i class="fa fa-eye"></i> View
                      </button>
                    </div>
                  </div>

                  <button type="button" @click="removeEmailImage(img.id)"
                    class="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                    title="Remove image">
                    <i class="fa fa-times text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
          <div class="flex items-center gap-2">
            <button type="button" @click="copyBccEmails()"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              :title="`Copy all ${targetEmailsList.length.toLocaleString()} emails to clipboard`">
              <i class="fa fa-copy text-gray-500"></i> Copy List ({{ targetEmailsList.length.toLocaleString() }})
            </button>

            <button type="button" @click="downloadAllBccTxt()"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              title="Download all recipient email addresses as a .txt file">
              <i class="fa fa-download text-gray-500"></i> Download (.txt)
            </button>

            <button type="button" @click="composeMailto()"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
              title="Open default native mail application">
              <i class="fa fa-envelope text-gray-500"></i> Mail Client
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button @click="closeEmailModal"
              class="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer">
              Cancel
            </button>

            <!-- Send via Server Action (Cybersecurity HTML Template) -->
            <button v-if="activeEmailTab === 'htmlTemplate'" type="button" @click="confirmSendAllModal = true"
              :disabled="targetEmailsList.length === 0 || isSendingNotification"
              class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Send official HTML email template to all target recipients via server">
              <i v-if="isSendingNotification" class="fa fa-spinner fa-spin"></i>
              <i v-else class="fa fa-paper-plane"></i>
              <span v-if="isSendingNotification">
                Sending... ({{ sentEmailCount.toLocaleString() }} / {{ totalEmailsToSend.toLocaleString() }})
              </span>
              <span v-else>
                Send HTML Email ({{ targetEmailsList.length.toLocaleString() }})
              </span>
            </button>

            <!-- Gmail Composer Action (Custom composer) -->
            <button v-else type="button" @click="composeGmail()" :disabled="targetEmailsList.length === 0"
              class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Open directly in Gmail Web Composer with all BCC emails and customized message">
              <i class="fa fa-paper-plane"></i>
              <span>Compose in Gmail ({{ targetEmailsList.length.toLocaleString() }} BCC)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CONFIRM SEND ALL HTML NOTIFICATION MODAL -->
    <div v-if="confirmSendAllModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4"
      @click.self="closeConfirmSendModal">
      <div class="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center gap-3 text-emerald-700 border-b pb-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg shrink-0">
            <i class="fa fa-shield-alt"></i>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Confirm Email Broadcast</h2>
            <p class="text-xs text-gray-500">
              Cybersecurity For All 2026 Notification
            </p>
          </div>
        </div>

        <div class="text-xs text-gray-600 space-y-2">
          <p>
            You are about to send the official <strong>CybersecurityEventNotification.html</strong> email to <strong>{{
              targetEmailsList.length.toLocaleString() }}</strong> recipients.
          </p>
          <div class="bg-gray-50 p-2.5 rounded-lg border border-gray-200 space-y-1">
            <div><span class="font-semibold text-gray-800">Subject:</span> {{ emailSubject }}</div>
            <div class="text-emerald-700 font-semibold"><span class="font-semibold text-gray-800">Delivery:</span>
              BCC Batches Only (Direct & Unlimited)</div>
          </div>
          <p class="text-emerald-800 font-medium">
            Emails will be distributed securely via pure BCC batches to protect recipient privacy and ensure no CC limit restrictions.
          </p>
        </div>

        <!-- Real-Time Progress inside Confirmation Modal if active -->
        <div v-if="isSendingNotification"
          class="space-y-2 py-2 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
          <div class="flex items-center justify-between text-xs font-bold text-emerald-950">
            <span class="flex items-center gap-1.5">
              <i class="fa fa-spinner fa-spin text-emerald-700"></i>
              <span>Sending Broadcast...</span>
            </span>
            <span class="text-emerald-800">{{ sentEmailCount.toLocaleString() }} / {{ totalEmailsToSend.toLocaleString()
            }} ({{ emailProgressPercent }}%)</span>
          </div>
          <div class="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-emerald-600 h-full rounded-full transition-all duration-300"
              :style="{ width: `${emailProgressPercent}%` }"></div>
          </div>
          <p class="text-[11px] text-gray-600">{{ emailProgressText }}</p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t">
          <button type="button" @click="handleConfirmCancelOrStop"
            class="px-4 py-2 text-xs font-medium rounded-lg transition cursor-pointer"
            :class="isSendingNotification ? 'text-red-600 hover:bg-red-50 font-semibold' : 'text-gray-600 hover:bg-gray-100'">
            {{ isSendingNotification ? "Stop Broadcast" : "Cancel" }}
          </button>
          <button type="button" @click="sendCybersecurityNotification(false)" :disabled="isSendingNotification"
            class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer">
            <i v-if="isSendingNotification" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-check"></i>
            <span>{{ isSendingNotification ? `Sending (${sentEmailCount.toLocaleString()} /
              ${totalEmailsToSend.toLocaleString()})` : "Confirm & Send Now" }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- IMAGE LIGHTBOX / FULL VIEW MODAL -->
    <div v-if="activePreviewImage" class="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4"
      @click.self="closeImageLightbox">
      <div class="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <!-- Lightbox Header -->
        <div class="flex items-center justify-between p-3.5 bg-gray-900 text-white">
          <div class="flex items-center gap-2 truncate pr-2">
            <i class="fa fa-image text-indigo-400"></i>
            <span class="text-xs font-medium truncate">{{ activePreviewImage.name }}</span>
            <span class="text-[11px] text-gray-400">({{ activePreviewImage.size }})</span>
          </div>
          <button type="button" @click="closeImageLightbox"
            class="text-gray-400 hover:text-white p-1 text-sm rounded cursor-pointer">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <!-- Image Content -->
        <div class="p-4 bg-gray-950 flex items-center justify-center overflow-auto max-h-[70vh]">
          <img :src="activePreviewImage.url" :alt="activePreviewImage.name"
            class="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg" />
        </div>

        <!-- Lightbox Footer -->
        <div class="p-3 bg-gray-100 flex items-center justify-between text-xs border-t">
          <span class="text-gray-500 text-[11px]">Image attached to notification email</span>
          <div class="flex items-center gap-2">
            <button type="button" @click="removeEmailImage(activePreviewImage.id); closeImageLightbox();"
              class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer">
              <i class="fa fa-trash"></i> Remove Image
            </button>
            <button type="button" @click="closeImageLightbox"
              class="px-3.5 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- BULK DELETE CONFIRM MODAL -->
    <div v-if="confirmBulkDeleteModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="closeBulkDeleteModal">
      <div class="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center gap-3 text-red-600 border-b pb-3">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900">Confirm Bulk Delete</h2>
            <p class="text-xs text-gray-500">
              You are about to delete {{ selectedIds.length.toLocaleString() }} records
            </p>
          </div>
        </div>

        <p class="text-xs text-gray-600">
          Are you sure you want to delete
          <strong class="font-semibold text-gray-900">{{ selectedIds.length.toLocaleString() }}</strong>
          selected role permission record(s)? This action <span class="text-red-600 font-semibold">cannot be
            undone</span>.
        </p>

        <!-- Preview box -->
        <div
          class="bg-gray-50 border border-gray-200 rounded-lg p-2.5 max-h-28 overflow-y-auto text-[11px] text-gray-700 space-y-1">
          <div v-for="item in selectedItemsPreview.slice(0, 10)" :key="item.id" class="truncate font-mono">
            • {{ item.email }}
          </div>
          <div v-if="selectedItemsPreview.length > 10" class="text-gray-400 italic text-[10px]">
            ...and {{ (selectedItemsPreview.length - 10).toLocaleString() }} more
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <button @click="closeBulkDeleteModal" :disabled="isBulkDeleting"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition disabled:opacity-50 cursor-pointer">
            Cancel
          </button>

          <button @click="performBulkDelete" :disabled="isBulkDeleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50 cursor-pointer">
            <i v-if="isBulkDeleting" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-trash"></i>
            {{ isBulkDeleting ? "Deleting..." : `Delete ${selectedIds.length} Users` }}
          </button>
        </div>
      </div>
    </div>

    <!-- CSV UPLOAD MODAL -->
    <div v-if="showCsvModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="closeCsvModal">
      <div class="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <i class="fa fa-file-csv text-xl"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900">Upload CSV Emails</h2>
              <p class="text-xs text-gray-500">Bulk import LSU Google Workspace user emails</p>
            </div>
          </div>
          <button @click="closeCsvModal" :disabled="isUploadingCsv"
            class="text-gray-400 hover:text-gray-600 text-lg p-1 disabled:opacity-30 cursor-pointer">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="font-semibold flex items-center gap-1.5">
              <i class="fa fa-info-circle text-blue-600"></i> Import Rules & Defaults:
            </div>
            <button type="button" @click="downloadCsvTemplate()"
              class="text-blue-700 hover:text-blue-900 underline font-medium flex items-center gap-1 text-[11px] cursor-pointer"
              title="Download CSV Template file">
              <i class="fa fa-download"></i> Download Template
            </button>
          </div>
          <ul class="list-disc pl-5 space-y-1 text-blue-800">
            <li>
              <strong>Default Permission:</strong> New users are assigned
              <span class="bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-medium">External Links</span> only.
            </li>
            <li>
              <strong>Skip Existing:</strong> Any email already present in the table will be <strong>skipped</strong> —
              keeping their existing roles intact.
            </li>
            <li>
              <strong>Bulk Ready:</strong> Optimized to process <strong>25,000+</strong> emails efficiently.
            </li>
          </ul>
        </div>

        <!-- Drag and Drop Dropzone -->
        <div @dragover.prevent @drop="handleFileDrop" @click="triggerFileInput"
          class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-2"
          :class="csvFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 bg-gray-50'">
          <input ref="fileInputRef" type="file" accept=".csv" class="hidden" @change="handleFileSelect" />

          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
            <i :class="csvFile ? 'fa fa-check' : 'fa fa-cloud-upload-alt'"></i>
          </div>

          <div v-if="!csvFile">
            <p class="text-sm font-semibold text-gray-700">
              Click to browse or drag & drop CSV file
            </p>
            <p class="text-xs text-gray-400 mt-0.5">
              Supports Google Workspace user download CSV (.csv)
            </p>
          </div>

          <div v-else
            class="text-left bg-white border border-emerald-200 rounded-lg p-3 w-full flex items-center justify-between">
            <div class="flex items-center gap-2 overflow-hidden">
              <i class="fa fa-file-csv text-emerald-600 text-lg"></i>
              <div class="truncate">
                <p class="text-xs font-semibold text-gray-800 truncate">{{ csvFileName }}</p>
                <p class="text-[10px] text-gray-500">{{ csvFileSize }}</p>
              </div>
            </div>
            <button type="button"
              @click.stop="csvFile = null; csvFileName = ''; csvFileSize = ''; csvUploadResult = null;"
              class="text-red-500 hover:text-red-700 text-xs px-2 py-1 cursor-pointer" title="Remove selected file">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Upload Progress Indicator -->
        <div v-if="isUploadingCsv" class="space-y-2 py-2">
          <div class="flex items-center justify-between text-xs text-emerald-700 font-medium">
            <div class="flex items-center gap-2">
              <i class="fa fa-spinner fa-spin text-base"></i>
              <span>{{ uploadProgressText }}</span>
            </div>
            <button type="button" @click="cancelCsvProcessing"
              class="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold cursor-pointer"
              title="Stop processing">
              Stop
            </button>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${uploadProgressPercent}%` }"></div>
          </div>
        </div>

        <!-- Results Summary Card -->
        <div v-if="csvUploadResult" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div class="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <i class="fa fa-check-circle text-emerald-600 text-base"></i>
            Import Completed Successfully!
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="p-2 bg-white rounded-lg border border-emerald-100">
              <p class="text-gray-500 text-[10px] uppercase font-semibold">Total Rows</p>
              <p class="text-sm font-bold text-gray-800">{{ (csvUploadResult.total_rows || 0).toLocaleString() }}</p>
            </div>
            <div class="p-2 bg-white rounded-lg border border-emerald-100">
              <p class="text-gray-500 text-[10px] uppercase font-semibold">Added New</p>
              <p class="text-sm font-bold text-emerald-600">+{{ (csvUploadResult.added_count || 0).toLocaleString() }}
              </p>
            </div>
            <div class="p-2 bg-white rounded-lg border border-emerald-100">
              <p class="text-gray-500 text-[10px] uppercase font-semibold">Skipped</p>
              <p class="text-sm font-bold text-amber-600">{{ (csvUploadResult.skipped_count || 0).toLocaleString() }}
              </p>
            </div>
          </div>
          <p class="text-xs text-emerald-700 pt-1">{{ csvUploadResult.message }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end items-center gap-2 pt-2 border-t">
          <button @click="closeCsvModal" :disabled="isUploadingCsv"
            class="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 cursor-pointer">
            {{ csvUploadResult ? "Close" : "Cancel" }}
          </button>

          <button v-if="!csvUploadResult" @click="submitCsvUpload" :disabled="!csvFile || isUploadingCsv"
            class="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <i v-if="isUploadingCsv" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-upload"></i>
            {{ isUploadingCsv ? "Uploading..." : "Upload & Import" }}
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl">
        <h2 class="text-xl font-bold mb-4 text-gray-900">
          {{
            editingItem ? "Edit Role Permission" : "Create Role Permission"
          }}
        </h2>

        <div class="space-y-4">
          <input v-model="formData.email" type="email" placeholder="User Email"
            class="w-full border border-gray-300 p-3 rounded text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-gray-800" />

          <div>
            <p class="font-semibold mb-2 text-sm text-gray-800">Select Roles</p>

            <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              <label v-for="role in availableRoles" :key="role.value"
                class="flex items-center gap-2 text-xs text-gray-700 hover:bg-gray-50 p-1 rounded cursor-pointer">
                <input type="checkbox" :checked="formData.role_filter_permissions.includes(role.value)
                  " @change="toggleRole(role.value)" class="rounded text-green-600 focus:ring-green-500" />
                {{ role.label }}
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button @click="closeForm"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition cursor-pointer">
            Cancel
          </button>

          <button @click="submitForm"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div v-if="confirmDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
        <h2 class="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
          <i class="fa fa-exclamation-triangle"></i>
          Confirm Delete
        </h2>

        <p class="text-sm mb-6 text-gray-600">
          Are you sure you want to delete this role permission? This action
          cannot be undone.
        </p>

        <div class="flex justify-end gap-3">
          <button @click="cancelDelete"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded transition cursor-pointer">
            Cancel
          </button>

          <button @click="performDelete"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition cursor-pointer">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- FULL-SCREEN LOCK OVERLAY (Active during email sending to prevent interruptions & keypresses) -->
    <div v-if="isSendingNotification"
      class="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto"
      @click.stop @contextmenu.prevent>
      <div
        class="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-500/30 flex flex-col items-center text-center space-y-5">

        <!-- Animated Icon with Radar / Pulse Effect -->
        <div class="relative flex items-center justify-center">
          <div class="absolute w-20 h-20 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div
            class="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-green-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/30">
            <i class="fa fa-paper-plane animate-bounce"></i>
          </div>
        </div>

        <!-- Title & Status Description -->
        <div class="space-y-1.5 w-full">
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
            <i class="fa fa-lock text-amber-700"></i> Screen & Keyboard Locked
          </div>
          <h2 class="text-xl font-extrabold text-gray-900">
            Sending Email Notification...
          </h2>
          <p class="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            All keyboard and screen inputs in this tab are locked to avoid accidental interruptions. You can safely
            switch
            to other browser tabs while sending continues.
          </p>
        </div>

        <!-- Progress Metrics Box -->
        <div class="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-gray-700">
            <span class="flex items-center gap-1.5 text-emerald-800">
              <i class="fa fa-spinner fa-spin text-emerald-600"></i>
              <span>Sending Progress</span>
            </span>
            <span class="text-sm font-extrabold text-emerald-700">
              {{ sentEmailCount.toLocaleString() }} / {{ totalEmailsToSend.toLocaleString() }}
              <span class="text-xs text-gray-500 font-normal">({{ emailProgressPercent }}%)</span>
            </span>
          </div>

          <!-- Progress Bar Track -->
          <div class="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner p-0.5">
            <div
              class="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2 text-[9px] text-white font-bold"
              :style="{ width: `${Math.max(emailProgressPercent, 5)}%` }">
              <span v-if="emailProgressPercent >= 15">{{ emailProgressPercent }}%</span>
            </div>
          </div>

          <!-- Detailed Status Text -->
          <div
            class="text-[11.5px] font-medium text-emerald-900 bg-emerald-50/80 px-3 py-2 rounded-xl border border-emerald-200 truncate">
            {{ emailProgressText }}
          </div>

          <div v-if="failedEmailCount > 0" class="text-xs text-red-600 font-semibold text-left flex items-center gap-1">
            <i class="fa fa-exclamation-circle"></i>
            <span>{{ failedEmailCount.toLocaleString() }} email(s) failed to deliver</span>
          </div>
        </div>

        <!-- Stop Action Button -->
        <div class="w-full space-y-2.5 pt-1">
          <button type="button" @click.stop="shouldCancelEmailSending = true" :disabled="shouldCancelEmailSending"
            class="w-full py-3 px-5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            :class="shouldCancelEmailSending ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white hover:shadow-lg'">
            <i :class="shouldCancelEmailSending ? 'fa fa-spinner fa-spin' : 'fa fa-stop-circle text-base'"></i>
            <span>{{ shouldCancelEmailSending ? "Stopping broadcast..." : "Stop Sending Emails" }}</span>
          </button>

          <p class="text-[11px] text-gray-400">
            Click <strong>Stop</strong> to safely cancel remaining email batches.
          </p>
        </div>
      </div>
    </div>

    <!-- TOASTS -->
    <div class="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-sm">
      <div v-for="toast in toasts" :key="toast.id" :class="{
        'bg-green-600 text-white': toast.type === 'success',
        'bg-red-600 text-white': toast.type === 'error',
        'bg-yellow-500 text-white': toast.type === 'warning',
        'bg-gray-600 text-white': toast.type === 'info',
      }" class="px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2">
        <i class="fa" :class="{
          'fa-check-circle': toast.type === 'success',
          'fa-exclamation-circle': toast.type === 'error',
          'fa-exclamation-triangle': toast.type === 'warning',
          'fa-info-circle': toast.type === 'info',
        }"></i>
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>