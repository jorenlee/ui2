<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import moment from "moment";

/* ================= AUTH ================= */
const { user, init } = useAuth();


const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const requests = ref([]);
const showModal = ref(false);
const isCreate = ref(false);
const statusFilter = ref("");
const technicianFilter = ref("");
const searchFilter = ref("");
const dateFilter = ref("");
const customOffice = ref("");

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Sorting
const sortColumn = ref("created_at");
const sortDirection = ref("asc"); // oldest first by default

// Real-time update
let realtimeInterval = null;

const successfullySavedData = ref(false);

// Dropdown options
const CATEGORY_OPTIONS = [
  "Hardware",
  "Software",
  "Network",
  "Computer Lab",
  "Accounts",
  "LSU Webpages",
  "Student Portal",
  "Others",
];

const ITEM_TYPE_OPTIONS_MAP = {
  Hardware: [
    "Laptop",
    "Desktop",
    "Printer",
    "Scanner",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Projector",
    "Webcam",
    "Headset",
    "Speaker",
    "Microphone",
    "External Hard Drive",
    "USB Flash Drive",
    "Power Supply",
    "Motherboard",
    "RAM",
    "Graphics Card",
    "CPU",
    "Cooling Fan",
    "Others",
  ],
  Software: ["Installation", "Repair", "Uninstall"],
  Network: ["WiFi Access", "Network Configuration"],
  "Computer Lab": [
    "Computer Setup",
    "Software Installation",
    "Hardware Issue",
    "Network Connectivity",
    "Maintenance",
    "Others",
  ],
  Accounts: ["LSU Gmail", "Canvas", "Microsoft", "Student Portal", "Others"],
  "LSU Webpages": [
    "Update Content",
    "Fix Errors",
    "Add New Page",
    "Remove Page",
    "Others",
  ],
  "Student Portal": ["Forgot Password", "Others"],
  Others: [
    "Screwdriver Set",
    "Cable Ties",
    "Thermal Paste",
    "Cleaning Kit",
    "Cable Tester",
    "Crimping Tool",
    "Anti-static Wrist Strap",
    "Compressed Air",
    "HDMI Cable",
    "VGA Cable",
    "Ethernet Cable",
    "USB Cable",
    "Power Cable",
    "Extension Cord",
    "Others",
  ],
};

// Computer Lab location options
const COMPUTER_LAB_LOCATIONS = {
  "BVM and SJ Buildings": [
    "BVM 4F Computer Lab",
    "BVM 2F Computer Lab",
    "SJ Computer Lab",
  ],
  "LS Building": [
    "LS209 - Maclab",
    "LS211 - Networking",
    "LS212 - Programming",
    "LS213 - Multimedia",
    "LS215 - Openlab",
  ],
};

const CENTER_OFFICE_ROOM_OPTIONS = ["OCH", "NPCC", "Registrar", "N/A", "OTHER"];

// Computed property to get location options based on category
const getLocationOptions = computed(() => {
  // If Computer Lab is selected, show computer lab locations
  if (info.value.issue_concern_request_category_type === "Computer Lab") {
    // Combine all computer lab locations
    const allLabLocations = [
      ...COMPUTER_LAB_LOCATIONS["BVM and SJ Buildings"],
      ...COMPUTER_LAB_LOCATIONS["LS Building"],
    ];
    return allLabLocations;
  }

  // Otherwise, show default office options
  return CENTER_OFFICE_ROOM_OPTIONS;
});

const SEMESTER_OPTIONS = ["First Semester", "Second Semester", "Summer"];
const STATUS_OPTIONS = [
  "New",
  "Used",
  "For Repair",
  "For Disposal",
  "Returned",
  "Issued",
  "Replaced",
  "Condemned",
  "Serviceable",
  "Unserviceable",
  "Running",
];
const TECHNICIANS_PERSONNEL = [
  {
    name: "Michael John Puertogalera",
    email: "michaeljohn.puertogalera@lsu.edu.ph",
    specializations: ["Accounts", "Software"],
    role: "Accounts / Software",
  },
  {
    name: "Jason Yap",
    email: "jason.yap@lsu.edu.ph",
    specializations: ["Network", "Accounts", "Software"],
    role: "Network / Accounts / Software",
  },
  {
    name: "Flourence John Gonzaga",
    email: "johny14_gonzaga@lsu.edu.ph",
    specializations: ["Network", "Accounts", "Software"],
    role: "Network / Accounts / Software",
  },
  {
    name: "Denzel Roy Suarez",
    email: "denzelroy.suarez@lsu.edu.ph",
    specializations: ["Computer Lab"],
    location: "BVM and SJ Buildings",
    role: "Computer Laboratory: BVM and SJ Buildings Rooms",
  },
  {
    name: "Rommel Rosal",
    email: "rommel.rosal@lsu.edu.ph",
    specializations: ["Computer Lab"],
    location: "LS Building",
    role: "Computer Laboratory: LS Building Rooms",
  },
  {
    name: "Giovanni Jose Morales",
    email: "giovanni.morales@lsu.edu.ph",
    specializations: ["Hardware"],
    role: "PC and Printers and Other Hardwares - Whole LSU Campus Admins and Staffs",
  },
  {
    name: "Jo Renlee Luna",
    email: "jorenlee.luna@lsu.edu.ph",
    specializations: ["Software"],
    role: "LSU Website",
  },
];

const loading = ref(false);
const modalLoading = ref(false);

const fetchRequests = async (silent = false) => {
  if (!silent) loading.value = true;
  try {
    const res = await $fetch(endpoint.value + "/api/cits/request-ticket/list/");
    requests.value = res.data || res;

    // console.log(requests.value);
  } catch (err) {
    console.error("Failed to fetch tech support list", err);
  } finally {
    if (!silent) loading.value = false;
  }
};

// Real-time updates every second
const startRealtimeUpdates = () => {
  realtimeInterval = setInterval(() => {
    fetchRequests(true); // silent update
  }, 1000);
};

const stopRealtimeUpdates = () => {
  if (realtimeInterval) {
    clearInterval(realtimeInterval);
    realtimeInterval = null;
  }
};

onMounted(() => {
  fetchRequests();
  startRealtimeUpdates();
});

onUnmounted(() => {
  stopRealtimeUpdates();
});

// Function to auto-assign technicians based on category and specific concern
const autoAssignTechnicians = (category, specificConcern = null) => {
  // Get Michael John Puertogalera (always included in all tickets)
  const michael = TECHNICIANS_PERSONNEL.find(
    (tech) => tech.email === "michaeljohn.puertogalera@lsu.edu.ph",
  );

  // Check for specific concern first (highest priority)
  if (specificConcern === "LSU Website") {
    // For LSU Website: assign Jo Renlee + Michael
    const joRenlee = TECHNICIANS_PERSONNEL.find(
      (tech) => tech.email === "jorenlee.luna@lsu.edu.ph",
    );

    const assignedTechs = [];
    if (michael) {
      assignedTechs.push({
        name: michael.name,
        email: michael.email,
      });
    }
    if (joRenlee) {
      assignedTechs.push({
        name: joRenlee.name,
        email: joRenlee.email,
      });
    }

    info.value.technicians_assigned = assignedTechs;
    return;
  }

  if (!category) {
    // Reset to default if no category (Michael only)
    info.value.technicians_assigned = michael
      ? [
          {
            name: michael.name,
            email: michael.email,
          },
        ]
      : [];
    return;
  }

  // Filter technicians based on their specializations
  const assignedTechs = TECHNICIANS_PERSONNEL.filter((tech) =>
    tech.specializations?.includes(category),
  );

  // Always include Michael in all assignments
  const finalAssignedTechs = assignedTechs.map((tech) => ({
    name: tech.name,
    email: tech.email,
  }));

  // Make sure Michael is included (avoid duplicates)
  const hasMichael = finalAssignedTechs.some(
    (tech) => tech.email === "michaeljohn.puertogalera@lsu.edu.ph",
  );

  if (!hasMichael && michael) {
    finalAssignedTechs.unshift({
      name: michael.name,
      email: michael.email,
    });
  }

  // If no match found, assign only Michael
  if (finalAssignedTechs.length === 0 && michael) {
    info.value.technicians_assigned = [
      {
        name: michael.name,
        email: michael.email,
      },
    ];
  } else {
    info.value.technicians_assigned = finalAssignedTechs;
  }
};

// Function to refine technician assignment based on Computer Lab location
const refineComputerLabAssignment = (location) => {
  if (
    !location ||
    info.value.issue_concern_request_category_type !== "Computer Lab"
  ) {
    return;
  }

  // Get Michael John Puertogalera (always included)
  const michael = TECHNICIANS_PERSONNEL.find(
    (tech) => tech.email === "michaeljohn.puertogalera@lsu.edu.ph",
  );

  // Determine which technician based on location
  let assignedTech = null;

  if (location.startsWith("BVM") || location.startsWith("SJ")) {
    // BVM and SJ Buildings -> Denzel Roy Suarez
    assignedTech = TECHNICIANS_PERSONNEL.find(
      (tech) => tech.name === "Denzel Roy Suarez",
    );
  } else if (location.startsWith("LS")) {
    // LS Building -> Rommel Rosal
    assignedTech = TECHNICIANS_PERSONNEL.find(
      (tech) => tech.name === "Rommel Rosal",
    );
  }

  if (assignedTech) {
    const assignedTechs = [];

    // Always add Michael first
    if (michael) {
      assignedTechs.push({
        name: michael.name,
        email: michael.email,
      });
    }

    // Add the lab-specific technician
    assignedTechs.push({
      name: assignedTech.name,
      email: assignedTech.email,
    });

    info.value.technicians_assigned = assignedTechs;
  }
};

const newLog = reactive({ status: "", remarks: "" });

function addStatusLog() {
  // Make status update optional - only add if status is provided
  if (!newLog.status) {
    return; // Skip adding log if no status selected
  }

  if (!info.value.logs) info.value.logs = [];

  info.value.logs.push({
    status: newLog.status,
    remarks: newLog.remarks || "N/A",
    timestamp: new Date(),
  });

  // Update ticket's current_status
  info.value.current_status = newLog.status;

  // Reset input
  newLog.status = "";
  newLog.remarks = "";
}

// ================= STATUS HELPERS =================
const latestStatus = (item) =>
  item.logs?.length ? item.logs[item.logs.length - 1] : null;

// Check if ticket is completed for rating
const isTicketCompletedForRating = (item) => {
  const currentStatus = item.current_status || latestStatus(item)?.status;
  return currentStatus === "Completed";
};

// Check if modal ticket is completed (for showing rating/feedback fields)
const isModalTicketCompleted = computed(() => {
  const currentStatus =
    info.value.current_status || latestStatus(info.value)?.status;
  return currentStatus === "Completed";
});

// Deduplicated logs for client view - show only one log per unique status
const deduplicatedLogs = computed(() => {
  if (!info.value.logs || info.value.logs.length === 0) return [];

  const uniqueStatuses = new Map();

  // Iterate through logs and keep only the latest entry for each unique status
  info.value.logs.forEach((log) => {
    if (!uniqueStatuses.has(log.status)) {
      uniqueStatuses.set(log.status, log);
    } else {
      // If status already exists, keep the one with the latest timestamp
      const existingLog = uniqueStatuses.get(log.status);
      const existingTime = new Date(existingLog.timestamp).getTime();
      const currentTime = new Date(log.timestamp).getTime();

      if (currentTime > existingTime) {
        uniqueStatuses.set(log.status, log);
      }
    }
  });

  // Convert Map values back to array
  return Array.from(uniqueStatuses.values());
});

// Backend-aligned filter mapping
const TICKET_STATUS_FILTER_MAP = {
  pending: ["Pending"],
  "in progress": ["In Progress", "Reviewed"],
  completed: ["Completed", "Closed"],
};

// Clear filters function
const clearFilters = () => {
  statusFilter.value = "";
  technicianFilter.value = "";
  searchFilter.value = "";
  dateFilter.value = "";
  currentPage.value = 1;
};

// Sort function
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
  currentPage.value = 1; // Reset to first page when sorting
};

// Enhanced filter with sorting
const filteredRequests = computed(() => {
  let filtered = [...requests.value];

  // Filter by logged-in user's email (only show their own tickets)
  const userEmail = user.value?.email;
  if (userEmail) {
    filtered = filtered.filter((r) => {
      return r.requestor_lsu_email === userEmail;
    });
  }
  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((r) => {
      const status = latestStatus(r)?.status;
      return TICKET_STATUS_FILTER_MAP[statusFilter.value]?.includes(status);
    });
  }

  // Technician filter
  if (technicianFilter.value) {
    filtered = filtered.filter((r) =>
      r.technicians_assigned?.includes(technicianFilter.value),
    );
  }

  // Search filter
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.ticket_id?.toLowerCase().includes(search) ||
        r.requestor_fullname?.toLowerCase().includes(search) ||
        r.requestor_lsu_email?.toLowerCase().includes(search),
    );
  }

  // Date filter
  if (dateFilter.value) {
    const now = moment();
    filtered = filtered.filter((r) => {
      const created = moment(r.created_at);
      switch (dateFilter.value) {
        case "today":
          return created.isSame(now, "day");
        case "week":
          return created.isSame(now, "week");
        case "month":
          return created.isSame(now, "month");
        case "year":
          return created.isSame(now, "year");
        default:
          return true;
      }
    });
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal, bVal;

    switch (sortColumn.value) {
      case "ticket_id":
        aVal = a.ticket_id || "";
        bVal = b.ticket_id || "";
        break;
      case "category":
        aVal = a.issue_concern_request_category_type || "";
        bVal = b.issue_concern_request_category_type || "";
        break;
      case "requestor_fullname":
        aVal = a.requestor_fullname || "";
        bVal = b.requestor_fullname || "";
        break;
      case "requestor_lsu_email":
        aVal = a.requestor_lsu_email || "";
        bVal = b.requestor_lsu_email || "";
        break;
      case "technicians_assigned":
        aVal = a.technicians_assigned?.join(", ") || "";
        bVal = b.technicians_assigned?.join(", ") || "";
        break;
      case "status":
        aVal = latestStatus(a)?.status || "";
        bVal = latestStatus(b)?.status || "";
        break;
      case "created_at":
      default:
        aVal = moment(a.created_at).valueOf();
        bVal = moment(b.created_at).valueOf();
        break;
    }

    if (sortDirection.value === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  return filtered;
});

// Paginated results
const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredRequests.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRequests.value.length / itemsPerPage.value);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Visible page numbers for pagination
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Get specific type options based on category
const getSpecificTypeOptions = (categoryType) => {
  if (!categoryType || !ITEM_TYPE_OPTIONS_MAP[categoryType]) {
    return [];
  }
  return ITEM_TYPE_OPTIONS_MAP[categoryType];
};

// Get mood icon based on ticket age and status
const getMoodIcon = (item) => {
  const status = latestStatus(item)?.status?.toLowerCase();
  const isDone =
    status === "completed" || status === "closed" || status === "for review";

  // If ticket is completed/closed/for review - trophy
  if (isDone) {
    return {
      emoji: "🏆",
      bgClass: "bg-gradient-to-br from-gray-200 to-gray-300",
      title: "Completed",
    };
  }

  // If ticket is lacking content - document/clipboard emoji
  if (status === "lacking content") {
    return {
      emoji: "📋",
      bgClass: "bg-gradient-to-br from-orange-400 to-orange-500",
      title: "Lacking Content",
    };
  }

  const createdAt = moment(item.created_at);
  const now = moment();
  const hoursPassed = now.diff(createdAt, "hours");

  // Special handling for "In Progress" status based on age
  if (status === "in progress") {
    if (hoursPassed < 24) {
      return {
        emoji: "😊",
        bgClass: "bg-gradient-to-br from-green-400 to-green-500",
        title: "In Progress (< 24 hours)",
      };
    } else {
      return {
        emoji: "☹️",
        bgClass: "bg-gradient-to-br from-red-400 to-red-500",
        title: "In Progress (> 24 hours)",
      };
    }
  }

  // For other statuses (Pending, Unsuccessful, Cancelled, etc.)
  // New ticket (less than 24 hours) - green happy face
  if (hoursPassed < 24) {
    return {
      emoji: "😊",
      bgClass: "bg-gradient-to-br from-green-400 to-green-500",
      title: "New ticket (< 24 hours)",
    };
  }
  // 24-48 hours - yellow neutral face
  else if (hoursPassed < 48) {
    return {
      emoji: "😐",
      bgClass: "bg-gradient-to-br from-yellow-400 to-yellow-500",
      title: "Aging ticket (24-48 hours)",
    };
  }
  // 48+ hours and not done - red sad face
  else {
    return {
      emoji: "☹️",
      bgClass: "bg-gradient-to-br from-red-400 to-red-500",
      title: "Overdue ticket (48+ hours)",
    };
  }
};

// Date helpers
const getCurrentSemester = () => {
  const month = moment().month() + 1;
  if (month >= 1 && month <= 5) return "Second Semester";
  if (month >= 6 && month <= 7) return "Summer";
  return "First Semester";
};

const getAcademicYear = () => {
  const year = moment().year();
  const month = moment().month() + 1;
  return month >= 6 ? `A.Y ${year} - ${year + 1}` : `A.Y ${year - 1} - ${year}`;
};

const getTodayDateChecked = () => moment().format("DD/MM/YYYY hh:mm A");

const ACADEMIC_YEAR_OPTIONS = (() => {
  const currentYear = moment().year();
  const years = [];
  for (let i = -5; i <= 1; i++) {
    const start = currentYear + i;
    years.push(`A.Y ${start} - ${start + 1}`);
  }
  return years;
})();

// Receipt handling
const receiptFile = ref(null);
const receiptPreview = ref("");

const handleReceiptUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    receiptFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      receiptPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeReceipt = () => {
  receiptFile.value = null;
  receiptPreview.value = "";
};

// Form info
const info = ref({
  ticket_id: "TID" + Date.now(),
  requestor_fullname: "",
  requestor_lsu_email: "",
  technicians_assigned: [],
  issue_concern_request_details: "",
  issue_concern_request_category_type: "",
  issue_concern_request_item_type: "",
  issue_concern_request_center_office_room: "",
  owner_type: "LSU",
  client_role: "",
  buy_me_coffee: "No",
  evaluation_feedback_client_star_rating: "",
  logs: [
    {
      timestamp: new Date().toISOString(),
      remarks: "Initial status",
      status: "Pending",
      assigned_technician_name: "",
      assigned_technician_lsu_email: "",
    },
  ],
});

// Watch for category changes to auto-assign technicians
watch(
  () => info.value.issue_concern_request_category_type,
  (newCategory) => {
    // Only auto-assign when creating new tickets
    if (isCreate.value) {
      autoAssignTechnicians(
        newCategory,
        info.value.issue_concern_request_item_type,
      );
      // Clear location when category changes
      info.value.issue_concern_request_center_office_room = "";
      // Clear specific concern when category changes
      info.value.issue_concern_request_item_type = "";
    }
  },
);

// Watch for specific concern changes to refine technician assignment
watch(
  () => info.value.issue_concern_request_item_type,
  (newSpecificConcern) => {
    // Only auto-assign when creating new tickets
    if (isCreate.value) {
      // Re-assign based on specific concern
      autoAssignTechnicians(
        info.value.issue_concern_request_category_type,
        newSpecificConcern,
      );
    }
  },
);

// Watch for Computer Lab location changes to refine technician assignment
watch(
  () => info.value.issue_concern_request_center_office_room,
  (newLocation) => {
    // Only auto-assign when creating new tickets
    if (isCreate.value) {
      refineComputerLabAssignment(newLocation);
    }
  },
);

// Modal controls
const openCreateModal = () => {
  isCreate.value = true;
  receiptFile.value = null;
  receiptPreview.value = "";
  info.value = {
    ticket_id: "TID" + Date.now(),
    requestor_fullname: "",
    requestor_lsu_email: "",
    technicians_assigned: [],
    issue_concern_request_details: "",
    issue_concern_request_category_type: "",
    issue_concern_request_item_type: "",
    issue_concern_request_center_office_room: "",
    owner_type: "LSU",
    client_role: "",
    buy_me_coffee: "No",
    evaluation_feedback_client_star_rating: "",
    logs: [
      {
        timestamp: new Date().toISOString(),
        remarks: "Initial status",
        status: "Pending",
        assigned_technician_name: "",
        assigned_technician_lsu_email: "",
      },
    ],
  };
  showModal.value = true;
};

const openModal = (item) => {
  isCreate.value = false;

  // Directly assign reactive ref
  info.value = reactive({
    ...item,
    technicians_assigned: Array.isArray(item.technicians_assigned)
      ? item.technicians_assigned
      : item.technician_assigned
        ? [item.technician_assigned]
        : [],
    logs: item.logs ? [...item.logs] : [],
  });

  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

// Normalize office before submit
const normalizeOffice = () => {
  if (info.value.issue_concern_request_center_office_room === "OTHER")
    info.value.issue_concern_request_center_office_room =
      customOffice.value || "Other";
};

// Check if user has unrated tickets (ANY status - pending, in progress, completed, etc.)
const checkForUnratedTickets = async (email) => {
  try {
    const res = await $fetch(endpoint.value + "/api/cits/request-ticket/list/");

    if (res && Array.isArray(res)) {
      // Filter tickets for this user
      const userTickets = res.filter(
        (ticket) => ticket.requestor_lsu_email === email,
      );

      // Check if ANY ticket (regardless of status) is missing rating or feedback
      const unratedTickets = userTickets.filter((ticket) => {
        const hasNoRating =
          !ticket.evaluation_feedback_client_star_rating ||
          ticket.evaluation_feedback_client_star_rating === "" ||
          ticket.evaluation_feedback_client_star_rating === null;
        const hasNoFeedback =
          !ticket.evaluation_feedback_client_comment ||
          ticket.evaluation_feedback_client_comment === "" ||
          ticket.evaluation_feedback_client_comment === null;

        // Consider a ticket unrated if it's missing BOTH rating AND feedback
        return hasNoRating && hasNoFeedback;
      });

      return unratedTickets.length > 0 ? unratedTickets.length : false;
    }

    return false;
  } catch (error) {
    console.error("Error checking for unrated tickets:", error);
    // If there's an error, allow submission to proceed
    return false;
  }
};

const createTicket = async () => {
  // Validate required fields
  if (!info.value.requestor_fullname || !info.value.requestor_lsu_email) {
    showToaster(
      "❌ Please fill in all required fields (Name and Email).",
      "error",
    );
    return;
  }

  // Check for unrated tickets
  const unratedCount = await checkForUnratedTickets(
    info.value.requestor_lsu_email,
  );
  if (unratedCount) {
    showToaster(
      `❌ You have ${unratedCount} unrated ticket${unratedCount > 1 ? "s" : ""}. Please rate all your previous tickets before creating a new one.`,
      "error",
      5000,
    );
    return;
  }

  modalLoading.value = true;
  normalizeOffice();

  const formData = new FormData();
  formData.append("ticket_id", info.value.ticket_id || `TID${Date.now()}`);
  formData.append(
    "requestor_fullname",
    info.value.requestor_fullname?.trim() || "",
  );
  formData.append(
    "requestor_lsu_email",
    info.value.requestor_lsu_email?.trim() || "",
  );
  formData.append(
    "technicians_assigned",
    JSON.stringify(info.value.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    info.value.issue_concern_request_details?.trim() || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    info.value.issue_concern_request_category_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    info.value.issue_concern_request_item_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    info.value.issue_concern_request_center_office_room?.trim() || "",
  );
  formData.append("owner_type", info.value.owner_type || "LSU");
  formData.append("client_role", info.value.client_role || "");
  formData.append("buy_me_coffee", info.value.buy_me_coffee || "No");
  formData.append("logs", JSON.stringify(info.value.logs || []));

  if (receiptFile.value) {
    formData.append("buy_me_coffee_gcash_receipt", receiptFile.value);
  }

  try {
    const res = await $fetch(
      endpoint.value + "/api/cits/request-ticket/create/",
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "created") {
      showToaster(
        "✅ Ticket created successfully! Confirmation email sent.",
        "success",
      );
      showModal.value = false;
      await fetchRequests(); // Refresh the list
    } else if (res.status === "errors") {
      console.error("Form errors:", res.errors);
      showToaster(
        "❌ Failed to create ticket. Check console for errors.",
        "error",
      );
    }
  } catch (err) {
    console.error("Failed to create ticket:", err);
    showToaster("❌ Failed to create ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

const toaster = ref({
  show: false,
  message: "",
  type: "success", // we can extend later to warning, error, etc.
});

const showToaster = (message, type = "success", duration = 3000) => {
  toaster.value.message = message;
  toaster.value.type = type;
  toaster.value.show = true;

  setTimeout(() => {
    toaster.value.show = false;
  }, duration);
};

const saveChanges = async () => {
  modalLoading.value = true;
  normalizeOffice();
  addStatusLog();

  const formData = new FormData();
  formData.append("ticket_id", info.value.ticket_id);
  formData.append(
    "requestor_fullname",
    info.value.requestor_fullname?.trim() || "",
  );
  formData.append(
    "requestor_lsu_email",
    info.value.requestor_lsu_email?.trim() || "",
  );
  formData.append(
    "technicians_assigned",
    JSON.stringify(info.value.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    info.value.issue_concern_request_details?.trim() || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    info.value.issue_concern_request_category_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    info.value.issue_concern_request_item_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    info.value.issue_concern_request_center_office_room?.trim() || "",
  );
  formData.append("owner_type", info.value.owner_type || "LSU");
  formData.append("client_role", info.value.client_role || "");
  formData.append("buy_me_coffee", info.value.buy_me_coffee || "No");
  formData.append(
    "evaluation_feedback_client_star_rating",
    info.value.evaluation_feedback_client_star_rating || "",
  );
  formData.append(
    "evaluation_feedback_client_comment",
    info.value.evaluation_feedback_client_comment || "",
  );
  formData.append("logs", JSON.stringify(info.value.logs || []));

  if (receiptFile.value) {
    formData.append("buy_me_coffee_gcash_receipt", receiptFile.value);
  }

  try {
    const res = await $fetch(
      endpoint.value + `/api/cits/request-ticket/${info.value.id}/edit/`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "updated") {
      showToaster("✅ Changes saved successfully!", "success");
      showModal.value = false;
      await fetchRequests(); // refresh list
    } else {
      console.error("Update failed:", res);
      showToaster("❌ Failed to update ticket.", "error");
    }
  } catch (err) {
    console.error("Failed to update ticket:", err);
    showToaster("❌ Failed to update ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

// Update star rating
const updateRating = async (item, rating) => {
  const formData = new FormData();
  formData.append("ticket_id", item.ticket_id);
  formData.append("requestor_fullname", item.requestor_fullname || "");
  formData.append("requestor_lsu_email", item.requestor_lsu_email || "");
  formData.append(
    "technicians_assigned",
    JSON.stringify(item.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    item.issue_concern_request_details || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    item.issue_concern_request_category_type || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    item.issue_concern_request_item_type || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    item.issue_concern_request_center_office_room || "",
  );
  formData.append("owner_type", item.owner_type || "LSU");
  formData.append("client_role", item.client_role || "");
  formData.append("buy_me_coffee", item.buy_me_coffee || "No");
  formData.append("evaluation_feedback_client_star_rating", String(rating));
  formData.append(
    "evaluation_feedback_client_comment",
    item.evaluation_feedback_client_comment || "",
  );
  formData.append("logs", JSON.stringify(item.logs || []));

  try {
    const res = await $fetch(
      endpoint.value + `/api/cits/request-ticket/${item.id}/edit/`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "updated") {
      showToaster(
        `✅ Rating updated to ${rating} star${rating > 1 ? "s" : ""}!`,
        "success",
      );
      await fetchRequests(true); // silent refresh
    } else {
      console.error("Rating update failed:", res);
      showToaster("❌ Failed to update rating.", "error");
    }
  } catch (err) {
    console.error("Failed to update rating:", err);
    showToaster("❌ Failed to update rating. Please try again.", "error");
  }
};

// Update feedback comment
const updateFeedbackComment = async (item) => {
  // Only update if ticket is completed/done
  if (!isTicketCompletedForRating(item)) {
    return;
  }

  const formData = new FormData();
  formData.append("ticket_id", item.ticket_id);
  formData.append("requestor_fullname", item.requestor_fullname || "");
  formData.append("requestor_lsu_email", item.requestor_lsu_email || "");
  formData.append(
    "technicians_assigned",
    JSON.stringify(item.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    item.issue_concern_request_details || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    item.issue_concern_request_category_type || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    item.issue_concern_request_item_type || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    item.issue_concern_request_center_office_room || "",
  );
  formData.append("owner_type", item.owner_type || "LSU");
  formData.append("client_role", item.client_role || "");
  formData.append("buy_me_coffee", item.buy_me_coffee || "No");
  formData.append(
    "evaluation_feedback_client_star_rating",
    item.evaluation_feedback_client_star_rating || "",
  );
  formData.append(
    "evaluation_feedback_client_comment",
    item.evaluation_feedback_client_comment || "",
  );
  formData.append("logs", JSON.stringify(item.logs || []));

  try {
    const res = await $fetch(
      endpoint.value + `/api/cits/request-ticket/${item.id}/edit/`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "updated") {
      showToaster("✅ Feedback comment saved!", "success");
      await fetchRequests(true); // silent refresh
    } else {
      console.error("Feedback comment update failed:", res);
      showToaster("❌ Failed to save feedback comment.", "error");
    }
  } catch (err) {
    console.error("Failed to update feedback comment:", err);
    showToaster(
      "❌ Failed to save feedback comment. Please try again.",
      "error",
    );
  }
};

const ticketStatusClass = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "For Review":
      return "bg-purple-100 text-purple-800";
    case "Lacking Content":
      return "bg-orange-100 text-orange-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Closed":
      return "bg-gray-200 text-gray-800";
    case "Cancelled":
    case "Unsuccessful":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const itemStatusClass = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "Used":
      return "bg-yellow-100 text-yellow-800";
    case "For Repair":
      return "bg-orange-100 text-orange-800";
    case "For Disposal":
      return "bg-red-100 text-red-800";
    case "Returned":
      return "bg-green-100 text-green-800";
    case "Issued":
      return "bg-purple-100 text-purple-800";
    case "Replaced":
      return "bg-teal-100 text-teal-800";
    case "Condemned":
      return "bg-gray-100 text-gray-700";
    case "Serviceable":
      return "bg-indigo-100 text-indigo-800";
    case "Unserviceable":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const getStatusIconColor = (status) => {
  switch (status) {
    case "Pending":
      return "text-yellow-500";
    case "In Progress":
      return "text-blue-500";
    case "Lacking Content":
      return "text-orange-500";
    case "Completed":
      return "text-green-500";
    case "Cancelled":
      return "text-red-500";
    case "Unsuccessful":
      return "text-red-600";
    case "For Review":
      return "text-purple-500";
    case "Closed":
      return "text-gray-500";
    default:
      return "text-gray-400";
  }
};
</script>

<template>
  <div class="lg:p-4 p-1 text-sm">
    <!-- User Info Banner -->
    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      
      <p class="text-xs text-gray-600 mt-2">
        <i class="fa fa-info-circle mr-1"></i>
        You can only view and manage your own tickets
      </p>
    </div>

    <div class="lg:flex items-center justify-between">
      <h2 class="lg:text-xl text-sm font-bold lg:mb-4">
       Requested Tickets
      </h2>

      <!-- Results Count & Real-time Indicator -->
      <div class="mb-3 flex justify-between items-center">
        <div class="text-xs text-green-800 font-semibold">
          Showing {{ paginatedRequests.length }} of
          {{ filteredRequests.length }} ticket(s)
          <span class="font-bold uppercase"
            >| {{ filteredRequests.length }} total</span
          >
        </div>
      </div>
    </div>

    <!-- ACTION BAR -->
    <div class="bg-white border rounded-lg py-1 px-2 mb-4 shadow-sm">
      <div class="lg:flex gap-3 mb-3 w-full">



        <!-- Search Filter -->
        <div class="w-full">
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Search</label
          >
          <input
            v-model="searchFilter"
            type="text"
            placeholder="Ticket ID, Name, Email..."
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          />
        </div>


      </div>
    </div>

    <!-- ================= DATE LIST TABLE HEADER ================= -->
    <div
      class="w-full lg:flex hidden bg-gradient-to-r from-green-700 to-green-600 rounded-t-lg shadow-md overflow-hidden"
    >
      <div
        @click="sortBy('ticket_id')"
        class="w-1/4 flex items-center justify-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-ticket mr-1"></i> Ticket ID
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'ticket_id' && sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'ticket_id' && sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>

      <div
        @click="sortBy('category')"
        class="w-1/4 flex items-center justify-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-tag mr-1"></i> Category
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'category' && sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'category' && sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>

      <div
        @click="sortBy('status')"
        class="w-1/4 flex items-center justify-center p-3 text-white font-bold text-sm border-r border-green-500 cursor-pointer hover:bg-green-800 transition-colors"
      >
        <i class="fa fa-info-circle mr-1"></i> Status
        <span class="ml-1 inline-flex flex-col text-xs leading-none">
          <i
            class="fa fa-caret-up"
            :class="
              sortColumn === 'status' && sortDirection === 'asc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
          <i
            class="fa fa-caret-down -mt-1"
            :class="
              sortColumn === 'status' && sortDirection === 'desc'
                ? 'text-white'
                : 'text-green-300 opacity-50'
            "
          ></i>
        </span>
      </div>
      <div
        class="w-1/4 flex items-center justify-center py-3 px-3 text-white font-bold text-sm whitespace-nowrap"
      >
        <i class="fa fa-star mr-1"></i> Rating
      </div>
    </div>

    <!-- Toaster -->
    <transition name="fade">
      <div
        v-if="toaster.show"
        class="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl text-white font-medium flex items-center gap-3 max-w-md"
        :class="{
          'bg-green-600': toaster.type === 'success',
          'bg-red-600': toaster.type === 'error',
          'bg-blue-600': toaster.type === 'info',
          'bg-yellow-600': toaster.type === 'warning',
        }"
      >
        <i
          class="fa text-xl"
          :class="{
            'fa-check-circle': toaster.type === 'success',
            'fa-exclamation-circle': toaster.type === 'error',
            'fa-info-circle': toaster.type === 'info',
            'fa-exclamation-triangle': toaster.type === 'warning',
          }"
        ></i>
        <span>{{ toaster.message }}</span>
      </div>
    </transition>

    <!-- ================= LOADING STATE ================= -->
    <div v-if="loading" class="space-y-2 mt-2">
      <!-- Desktop Skeleton -->
      <div
        v-for="i in 6"
        :key="'desk-' + i"
        class="hidden lg:grid grid-cols-7 gap-2 bg-white p-3 rounded animate-pulse"
      >
        <div v-for="j in 7" :key="j" class="h-4 bg-gray-200 rounded"></div>
      </div>

      <!-- Mobile Skeleton -->
      <div
        v-for="i in 4"
        :key="'mob-' + i"
        class="lg:hidden border-b p-4 space-y-2 animate-pulse"
      >
        <div class="flex justify-between">
          <div class="h-4 w-20 bg-gray-200 rounded"></div>
          <div class="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div class="h-4 w-32 bg-gray-200 rounded"></div>
        <div class="h-3 w-40 bg-gray-200 rounded"></div>
        <div class="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- ================= DATA LIST ================= -->
    <div v-else>
      <div v-for="(item, index) in paginatedRequests" :key="item.id">
        <!-- ================= DESKTOP ROW ================= -->
        <div
          class="hidden lg:flex items-center text-sm cursor-pointer border py-1 transition-colors"
          :class="
            index % 2 === 0
              ? 'bg-white hover:bg-yellow-300'
              : 'bg-gray-50 hover:bg-yellow-300'
          "
          @click="openModal(item)"
        >
          <div class="w-1/4 px-3 flex items-center justify-center text-xs">
            {{ item.ticket_id }}
          </div>

          <div class="w-1/4 px-3 flex items-center justify-center">
            <div class="flex items-center gap-2">
             
              <span class="text-xs font-medium text-gray-700">
                {{ item.issue_concern_request_category_type || "-" }}
              </span>
            </div>
          </div>

          <div class="w-1/4 px-3 flex items-center justify-center">
            <div class="flex items-center gap-2">
              <!-- Status Badge -->
              <span
                class="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap"
                :class="ticketStatusClass(latestStatus(item)?.status)"
              >
                {{ latestStatus(item)?.status || "-" }}
              </span>
            </div>
          </div>

          <!-- Star Rating -->
          <div class="w-1/4 px-3 flex items-center justify-center">
            <div class="flex items-center gap-1 flex-wrap">
              <button
                v-for="star in 5"
                :key="star"
                :disabled="!isTicketCompletedForRating(item)"
                class="text-lg transition-transform"
                :class="{
                  'hover:scale-125 cursor-pointer':
                    isTicketCompletedForRating(item),
                  'cursor-not-allowed opacity-50':
                    !isTicketCompletedForRating(item),
                }"
                :title="
                  isTicketCompletedForRating(item)
                    ? `Rate ${star} star${star > 1 ? 's' : ''}`
                    : 'Rating available when ticket is Completed'
                "
              >
                <i
                  class="fa fa-star"
                  :class="
                    star <= (item.evaluation_feedback_client_star_rating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  "
                ></i>
              </button>
              <span
                v-if="item.evaluation_feedback_client_star_rating"
                class="text-xs text-gray-600 ml-1"
              >
                ({{ item.evaluation_feedback_client_star_rating }})
              </span>
              <span
                v-if="!isTicketCompletedForRating(item)"
                class="text-[10px] text-orange-600 ml-2"
              >
                <i class="fas fa-lock"></i> Available when Completed
              </span>
            </div>
          </div>
        </div>

        <!-- ================= MOBILE CARD VIEW ================= -->
        <div
          class="lg:hidden border border-gray-200 rounded-xl mb-3 bg-white shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all"
          @click="openModal(item)"
        >
          <!-- Card Header with Ticket ID and Status -->
          <div
            class="bg-gradient-to-r from-green-600 to-green-500 p-4 flex justify-between items-center"
          >
            <div class="flex items-center gap-2">
              <i class="fa fa-ticket text-white text-base"></i>
              <span class="text-white font-bold text-base">{{
                item.ticket_id
              }}</span>
            </div>
            <span
              class="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
              :class="ticketStatusClass(latestStatus(item)?.status)"
            >
              {{ latestStatus(item)?.status || "-" }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="p-4 space-y-3">
            <!-- Category -->
            <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fa fa-tag text-blue-600 text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-xs font-semibold text-gray-500 mb-0.5">Category</p>
                <p class="text-sm font-bold text-gray-800">
                  {{ item.issue_concern_request_category_type || "-" }}
                </p>
              </div>
            </div>


            <!-- Rating Section (only show if completed) -->
            <div
              v-if="isTicketCompletedForRating(item)"
              class="pt-3"
            >
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fa fa-star text-yellow-600 text-sm"></i>
                </div>
                <div class="flex-1">
                  <p class="text-xs font-semibold text-gray-500 mb-2">
                    Rate Your Experience
                  </p>
                  <div class="flex items-center gap-1 mb-3">
                    <button
                      v-for="star in 5"
                      :key="star"
                      @click.stop="updateRating(item, star)"
                      class="text-2xl transition-all hover:scale-110 active:scale-95"
                    >
                      <i
                        class="fa fa-star"
                        :class="
                          star <= (item.evaluation_feedback_client_star_rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        "
                      ></i>
                    </button>
                    <span
                      v-if="item.evaluation_feedback_client_star_rating"
                      class="text-sm font-bold text-gray-700 ml-2"
                    >
                      {{ item.evaluation_feedback_client_star_rating }}/5
                    </span>
                  </div>
                
                </div>
              </div>
            </div>

            <!-- Rating Locked Message -->
            <div v-else class="border-t pt-2 mt-2 bg-orange-50 rounded p-2">
              <div class="flex items-center gap-2 text-orange-600">
                <i class="fas fa-lock text-sm"></i>
                <p class="text-xs">
                  Rating available when ticket is Done/Completed
                </p>
              </div>
            </div>

            <!-- Created Date -->
            <div class="flex items-center gap-2 text-xs text-gray-500 pt-1">
              <i class="fa fa-clock"></i>
              <span>{{
                moment(item.created_at).format("MMM DD, YYYY h:mm A")
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div
        v-if="!filteredRequests.length"
        class="text-center py-6 text-gray-500"
      >
        No records found
      </div>
    </div>

    <!-- ================= PAGINATION ================= -->
    <div v-if="totalPages > 1" class="mt-6 gap-2">
      <div class="flex justify-center items-center gap-1 lg:gap-2 flex-wrap">
        <!-- First Page -->
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="lg:px-3 px-2 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm"
          title="First Page"
        >
          <i class="fa fa-angle-double-left"></i>
        </button>

        <!-- Previous Page -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="lg:px-3 px-2 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm"
          title="Previous Page"
        >
          <i class="fa fa-angle-left"></i>
        </button>

        <!-- Page Numbers -->
        <div class="flex gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'lg:px-4 px-3 py-2 rounded border transition-colors font-semibold text-xs lg:text-sm',
              currentPage === page
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <!-- Next Page -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="lg:px-3 px-2 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm"
          title="Next Page"
        >
          <i class="fa fa-angle-right"></i>
        </button>

        <!-- Last Page -->
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="lg:px-3 px-2 py-2 rounded bg-white border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs lg:text-sm"
          title="Last Page"
        >
          <i class="fa fa-angle-double-right"></i>
        </button>
      </div>

      <!-- Page Info -->
      <div
        class="text-xs lg:text-sm text-gray-600 font-medium w-full text-center py-2"
      >
        Page {{ currentPage }} of {{ totalPages }}
      </div>
    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex justify-center items-center z-50 lg:p-4 p-2"
    >
      <div
        class="bg-white lg:w-4/12 w-full rounded-lg lg:p-6 p-3 lg:h-5/6 h-full lg:max-h-[90vh] max-h-full overflow-y-auto relative"
      >
        <!-- Loading Overlay -->
        <div
          v-if="modalLoading"
          class="absolute inset-0 bg-white/95 h-full flex items-center justify-center z-10 rounded-lg backdrop-blur-sm"
        >
          <div
            class="text-center bg-white p-8 rounded-lg shadow-2xl border-2 border-green-600"
          >
            <div
              class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"
            ></div>
            <p class="mt-4 lg:text-sm text-xs font-bold text-gray-800">
              {{ isCreate ? "Creating ticket..." : "Saving changes..." }}
            </p>
            <p class="mt-1 text-xs text-gray-600">
              Please wait, processing your request...
            </p>
          </div>
        </div>
        <div v-if="!modalLoading">
          <div
            class="flex lg:text-sm text-xs items-center lg:pb-5 pb-3 sticky top-0 bg-white z-10 lg:static border-b lg:border-0 mb-3"
          >
            <h3
              class="font-bold lg:text-center text-left w-full lg:text-base text-sm"
            >
              {{ isCreate ? "Create Ticket (Job Request)" : "Ticket Details" }}
            </h3>

            <button
              class="lg:px-4 px-3 lg:py-2 py-1.5 bg-blue-300 rounded text-black hover:bg-gray-400 font-semibold text-xs lg:text-sm whitespace-nowrap"
              @click="closeModal"
              :disabled="modalLoading"
            >
              <i class="fa fa-times lg:mr-1"></i>
              <span class="hidden lg:inline">Close</span>
            </button>
          </div>
      
  
          <!-- REQUEST DETAILS -->
          <div class="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-4 py-3">
              <h4 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-info-circle text-blue-600"></i>
                {{ isCreate ? "Add Details or Concerns" : "Details or Concerns" }}
              </h4>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-4">
              <!-- 1. CATEGORY -->
              <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-tag text-blue-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                  <div v-if="!isCreate" class="text-sm font-medium text-gray-900">
                    {{ info.issue_concern_request_category_type || "N/A" }}
                  </div>
                  <select
                    v-else
                    v-model="info.issue_concern_request_category_type"
                    class="input rounded border px-2 py-1 w-full text-xs"
                    @change="info.issue_concern_request_item_type = ''"
                  >
                    <option disabled value="">Select Category</option>
                    <option
                      v-for="cat in CATEGORY_OPTIONS"
                      :key="cat"
                      :value="cat"
                    >
                      {{ cat }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 2. SPECIFIC CONCERN (Hidden for LSU Webpages and Student Portal) -->
              <div
                v-if="
                  info.issue_concern_request_category_type !==
                    'LSU Webpages' &&
                  info.issue_concern_request_category_type !==
                    'Student Portal'
                "
                class="flex items-start gap-3 pb-3 border-b border-gray-100"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-list-ul text-purple-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Specific Concern</label>
                  <div v-if="!isCreate" class="text-sm font-medium text-gray-900">
                    {{ info.issue_concern_request_item_type || "N/A" }}
                  </div>
                  <select
                    v-else
                    v-model="info.issue_concern_request_item_type"
                    class="input rounded border text-xs px-2 py-1 w-full"
                    :disabled="!info.issue_concern_request_category_type"
                  >
                    <option disabled value="">
                      {{
                        info.issue_concern_request_category_type
                          ? "Select Specific Type"
                          : "Select Category First"
                      }}
                    </option>
                    <option
                      v-for="type in getSpecificTypeOptions(
                        info.issue_concern_request_category_type,
                      )"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- 3. DESCRIPTION (Hidden for Student Portal) -->
              <div
                v-if="
                  info.issue_concern_request_category_type !==
                  'Student Portal'
                "
                class="flex items-start gap-3 pb-3 border-b border-gray-100"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-align-left text-green-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Details / Description</label>
                  <div v-if="!isCreate" class="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {{ info.issue_concern_request_details || "N/A" }}
                  </div>
                  <textarea
                    v-else
                    v-model="info.issue_concern_request_details"
                    class="input rounded border text-xs px-2 py-1 w-full"
                    placeholder="Describe the issue, concern, or request in detail..."
                    rows="3"
                  />
                </div>
              </div>

              <!-- 4. CENTER/OFFICE/ROOM (Hidden for Accounts, Student Portal, and Others) -->
              <div
                v-if="
                  info.issue_concern_request_category_type !== 'Accounts' &&
                  info.issue_concern_request_category_type !==
                    'Student Portal' &&
                  info.issue_concern_request_category_type !== 'Others'
                "
                class="flex items-start gap-3 pb-3 border-b border-gray-100"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-map-marker-alt text-orange-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">
                    {{
                      info.issue_concern_request_category_type ===
                      "Computer Lab"
                        ? "Computer Lab Location"
                        : "Center/Office/Room"
                    }}
                  </label>
                  <div v-if="!isCreate" class="text-sm font-medium text-gray-900">
                    {{ info.issue_concern_request_center_office_room || "N/A" }}
                  </div>
                  <div v-else class="flex">
                    <select
                      v-model="info.issue_concern_request_center_office_room"
                      class="input border w-full rounded text-xs px-2 py-1"
                    >
                      <option disabled value="">
                        {{
                          info.issue_concern_request_category_type ===
                          "Computer Lab"
                            ? "Select Computer Lab"
                            : "Select Location"
                        }}
                      </option>
                      <option
                        v-for="office in getLocationOptions"
                        :key="office"
                        :value="office"
                      >
                        {{ office }}
                      </option>
                    </select>

                    <input
                      v-if="
                        info.issue_concern_request_center_office_room ===
                        'OTHER'
                      "
                      v-model="customOffice"
                      class="input rounded border ml-2 flex-1 px-2 py-1 text-xs"
                      placeholder="Specific or Exact"
                    />
                  </div>
                </div>

              <!-- 5. OWNER TYPE (Hidden for Hardware, Network, Computer Lab, Accounts, LSU Webpages, Student Portal) -->
              <div
                v-if="
                  info.issue_concern_request_category_type !== 'Hardware' &&
                  info.issue_concern_request_category_type !== 'Network' &&
                  info.issue_concern_request_category_type !==
                    'Computer Lab' &&
                  info.issue_concern_request_category_type !== 'Accounts' &&
                  info.issue_concern_request_category_type !==
                    'LSU Webpages' &&
                  info.issue_concern_request_category_type !==
                    'Student Portal'
                "
                class="flex items-start gap-3 pb-3 border-b border-gray-100"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-user-tag text-teal-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-xs font-semibold text-gray-500 mb-1">Owner Type</label>
                  <div v-if="!isCreate" class="text-sm font-medium text-gray-900">
                    {{ info.owner_type || "N/A" }}
                  </div>
                  <select
                    v-else
                    v-model="info.owner_type"
                    class="input rounded border px-2 py-1 w-full text-xs"
                  >
                    <option value="LSU">LSU</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

                <!-- BUY ME COFFEE -->
                <!-- <div class="w-full mb-1">
                  <label class="block text-xs mb-0.5">Buy Me Coffee</label>
                  <select
                    v-model="info.buy_me_coffee"
                    class="input rounded border px-2 py-1 w-full text-xs"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div> -->

                <!-- GCASH RECEIPT UPLOAD -->
                <div v-if="info.buy_me_coffee === 'Yes'" class="w-full mb-1">
                  <label class="block text-xs mb-0.5">GCash Receipt</label>
                  <input
                    type="file"
                    @change="handleReceiptUpload"
                    accept="image/*"
                    class="input rounded border px-2 py-1 w-full text-xs"
                  />
                  <div v-if="receiptPreview" class="mt-2">
                    <div class="relative inline-block">
                      <img
                        :src="receiptPreview"
                        alt="Receipt Preview"
                        class="max-w-xs rounded border"
                      />
                      <button
                        @click="removeReceipt"
                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                      >
                        <i class="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- RATING & FEEDBACK SECTION (only show when ticket is completed/done) -->
          <div v-if="!isCreate && isModalTicketCompleted" class="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-200 px-4 py-3">
              <h4 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-star text-yellow-600"></i>
                Rating & Feedback
              </h4>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-4">
              <!-- EVALUATION RATING -->
              <div class="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-star text-yellow-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-lg font-semibold text-gray-500 mb-2">How's my Service?</label>

                  <!-- Star Rating Display -->
                  <div class="flex items-center gap-1 mb-2">
                    <button
                      v-for="star in 5"
                      :key="star"
                      @click="info.evaluation_feedback_client_star_rating = String(star)"
                      class="text-2xl transition-all hover:scale-110 focus:outline-none"
                      type="button"
                    >
                      <i
                        class="fa fa-star"
                        :class="
                          star <= (info.evaluation_feedback_client_star_rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        "
                      ></i>
                    </button>
                    <span
                      v-if="info.evaluation_feedback_client_star_rating"
                      class="text-sm font-medium text-gray-700 ml-2"
                    >
                      {{ info.evaluation_feedback_client_star_rating }}/5
                    </span>
                    <span
                      v-else
                      class="text-xs text-gray-500 ml-2 italic"
                    >
                      Click to rate
                    </span>
                  </div>


                  <!-- Rating Description (shows only for selected rating) -->
                  <div v-if="info.evaluation_feedback_client_star_rating" class="mt-2">
                    <p class="text-sm font-semibold text-gray-700">
                      <span v-if="info.evaluation_feedback_client_star_rating == 5" class="text-green-600">⭐ Excellent</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 4" class="text-blue-600">⭐ Very Satisfactory</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 3" class="text-yellow-600">⭐ Satisfactory</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 2" class="text-orange-600">⭐ Fair</span>
                      <span v-else-if="info.evaluation_feedback_client_star_rating == 1" class="text-red-600">⭐ Poor</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- FEEDBACK COMMENT -->
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-comment text-blue-600 text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-xs font-semibold text-gray-500 mb-2">Feedback Comment (Optional)</label>
                  <textarea
                    v-model="info.evaluation_feedback_client_comment"
                    class="input rounded-lg border border-gray-300 text-sm px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your feedback or comments about the service..."
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- STATUS HISTORY -->
          <div v-if="!isCreate" class="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-4 py-3">
              <h4 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-history text-purple-600"></i>
                Status History
              </h4>
            </div>

            <!-- Content -->
            <div class="p-4">
              <!-- Existing logs display (read-only) - Deduplicated for client view -->
              <div class="max-h-64 overflow-y-auto space-y-3">
                <div
                  v-for="(log, i) in deduplicatedLogs"
                  :key="i"
                  class="flex items-start gap-3 p-3 rounded-lg border"
                  :class="itemStatusClass(log.status)"
                >
                  <div class="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i class="fas fa-circle text-xs" :class="getStatusIconColor(log.status)"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-1">
                      <span class="font-bold text-sm">{{ log.status }}</span>
                      <span class="text-xs text-gray-600">{{
                        moment(log.timestamp).format("MMM DD, YYYY hh:mm A")
                      }}</span>
                    </div>
                    <div class="text-xs mt-1.5 text-gray-700 italic leading-relaxed">{{ log.remarks }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ACTIONS -->
          <div
            class="flex flex-col lg:flex-row justify-between gap-2 lg:gap-3 mt-6 lg:mt-10 sticky bottom-0 bg-white pt-3 border-t lg:static lg:border-0 lg:pt-0"
          >
            <button
              class="lg:px-4 px-3 lg:py-2 py-2.5 bg-gray-300 rounded hover:bg-gray-400 font-semibold text-sm lg:text-base w-full lg:w-auto order-2 lg:order-1"
              @click="closeModal"
              :disabled="modalLoading"
            >
              <i class="fa fa-times mr-1"></i>
              Cancel
            </button>
            <button
              class="lg:px-4 px-3 lg:py-2 py-2.5 bg-green-700 text-white rounded hover:bg-green-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base w-full lg:w-auto order-1 lg:order-2"
              @click="isCreate ? createTicket() : saveChanges()"
              :disabled="modalLoading"
            >
              <i class="fa mr-1" :class="isCreate ? 'fa-plus' : 'fa-save'"></i>
              {{ isCreate ? "Create Ticket" : "Save Changes" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
