const fallbackData = {
  clients: [
    {
      id: "northstar",
      name: "Northstar Dental",
      plan: "Growth Ops",
      health: 82,
      owner: "Phil",
      monthlyRevenue: 1800,
      lastTouch: "2026-07-07",
    },
    {
      id: "harbor",
      name: "Harbor Coffee",
      plan: "Automation Care",
      health: 74,
      owner: "Mina",
      monthlyRevenue: 1250,
      lastTouch: "2026-07-08",
    },
    {
      id: "kindred",
      name: "Kindred Legal",
      plan: "Client Portal",
      health: 68,
      owner: "Jae",
      monthlyRevenue: 2100,
      lastTouch: "2026-07-05",
    },
    {
      id: "maple",
      name: "Maple Goods",
      plan: "Inventory Sync",
      health: 91,
      owner: "Phil",
      monthlyRevenue: 1650,
      lastTouch: "2026-07-09",
    },
    {
      id: "evergreen",
      name: "Evergreen Tutors",
      plan: "Support Desk",
      health: 79,
      owner: "Mina",
      monthlyRevenue: 980,
      lastTouch: "2026-07-06",
    },
  ],
  requests: [
    {
      id: "REQ-1042",
      clientId: "northstar",
      title: "Add patient callback status to weekly report",
      owner: "Phil",
      status: "In Progress",
      dueDate: "2026-07-12",
      priority: "High",
    },
    {
      id: "REQ-1043",
      clientId: "harbor",
      title: "Connect wholesale order form to admin dashboard",
      owner: "Mina",
      status: "Review",
      dueDate: "2026-07-11",
      priority: "Medium",
    },
    {
      id: "REQ-1044",
      clientId: "kindred",
      title: "Fix document upload permissions for client portal",
      owner: "Jae",
      status: "Blocked",
      dueDate: "2026-07-10",
      priority: "High",
    },
    {
      id: "REQ-1045",
      clientId: "maple",
      title: "Build low-stock alert endpoint",
      owner: "Phil",
      status: "In Progress",
      dueDate: "2026-07-15",
      priority: "High",
    },
    {
      id: "REQ-1046",
      clientId: "evergreen",
      title: "Create tutor onboarding checklist",
      owner: "Mina",
      status: "Completed",
      dueDate: "2026-07-08",
      priority: "Low",
    },
    {
      id: "REQ-1047",
      clientId: "northstar",
      title: "Add invoice PDF link to account screen",
      owner: "Jae",
      status: "Review",
      dueDate: "2026-07-13",
      priority: "Medium",
    },
    {
      id: "REQ-1048",
      clientId: "harbor",
      title: "Import loyalty members from CSV",
      owner: "Phil",
      status: "In Progress",
      dueDate: "2026-07-16",
      priority: "Medium",
    },
  ],
  invoices: [
    { id: "INV-6021", clientId: "northstar", amount: 1800, status: "Paid", dueDate: "2026-07-05" },
    { id: "INV-6022", clientId: "harbor", amount: 1250, status: "Unpaid", dueDate: "2026-07-14" },
    { id: "INV-6023", clientId: "kindred", amount: 2100, status: "Unpaid", dueDate: "2026-07-12" },
    { id: "INV-6024", clientId: "maple", amount: 1650, status: "Paid", dueDate: "2026-07-03" },
    { id: "INV-6025", clientId: "evergreen", amount: 980, status: "Draft", dueDate: "2026-07-19" },
  ],
  activity: [
    {
      type: "api",
      message: "GET /api/summary returned dashboard totals in 42 ms.",
      time: "07:42",
    },
    {
      type: "request",
      message: "REQ-1044 marked blocked until final folder access is approved.",
      time: "07:35",
    },
    {
      type: "invoice",
      message: "Harbor Coffee invoice reminder queued for Friday.",
      time: "07:18",
    },
  ],
};

const state = {
  data: structuredClone(fallbackData),
  filters: {
    status: "all",
    owner: "all",
    search: "",
  },
};

const elements = {
  statusFilter: document.querySelector("#statusFilter"),
  ownerFilter: document.querySelector("#ownerFilter"),
  searchInput: document.querySelector("#searchInput"),
  requestRows: document.querySelector("#requestRows"),
  requestCount: document.querySelector("#requestCount"),
  revenueMetric: document.querySelector("#revenueMetric"),
  revenueDetail: document.querySelector("#revenueDetail"),
  openMetric: document.querySelector("#openMetric"),
  riskMetric: document.querySelector("#riskMetric"),
  invoiceMetric: document.querySelector("#invoiceMetric"),
  invoiceDetail: document.querySelector("#invoiceDetail"),
  clientCards: document.querySelector("#clientCards"),
  ownerChart: document.querySelector("#ownerChart"),
  invoiceList: document.querySelector("#invoiceList"),
  activityLog: document.querySelector("#activityLog"),
  requestForm: document.querySelector("#requestForm"),
  newClient: document.querySelector("#newClient"),
  newTitle: document.querySelector("#newTitle"),
  newOwner: document.querySelector("#newOwner"),
  newDueDate: document.querySelector("#newDueDate"),
  syncButton: document.querySelector("#syncButton"),
  exportButton: document.querySelector("#exportButton"),
  copySummaryButton: document.querySelector("#copySummaryButton"),
  handoffText: document.querySelector("#handoffText"),
};

async function loadData() {
  try {
    const response = await fetch("data/seed.json", { cache: "no-store" });
    if (response.ok) {
      state.data = await response.json();
    }
  } catch (error) {
    addActivity("api", "Static fallback data loaded because seed.json was not available.");
  }
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateLabel(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function clientName(clientId) {
  return state.data.clients.find((client) => client.id === clientId)?.name ?? "Unknown client";
}

function daysUntil(dateValue) {
  const today = new Date("2026-07-09T12:00:00");
  const due = new Date(`${dateValue}T12:00:00`);
  return Math.ceil((due - today) / 86400000);
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function getFilteredRequests() {
  const search = state.filters.search.trim().toLowerCase();
  return state.data.requests.filter((request) => {
    const matchesStatus = state.filters.status === "all" || request.status === state.filters.status;
    const matchesOwner = state.filters.owner === "all" || request.owner === state.filters.owner;
    const searchable = [
      request.id,
      request.title,
      request.owner,
      request.status,
      request.priority,
      clientName(request.clientId),
    ]
      .join(" ")
      .toLowerCase();
    return matchesStatus && matchesOwner && searchable.includes(search);
  });
}

function renderFilters() {
  const statuses = [...new Set(state.data.requests.map((request) => request.status))];
  const owners = [...new Set(state.data.requests.map((request) => request.owner))];
  elements.statusFilter.innerHTML = `<option value="all">All</option>${statuses
    .map((status) => `<option value="${status}">${status}</option>`)
    .join("")}`;
  elements.ownerFilter.innerHTML = `<option value="all">All</option>${owners
    .map((owner) => `<option value="${owner}">${owner}</option>`)
    .join("")}`;
  elements.newClient.innerHTML = state.data.clients
    .map((client) => `<option value="${client.id}">${client.name}</option>`)
    .join("");
  elements.newOwner.innerHTML = owners.map((owner) => `<option value="${owner}">${owner}</option>`).join("");
}

function renderMetrics(requests) {
  const revenue = state.data.clients.reduce((sum, client) => sum + client.monthlyRevenue, 0);
  const active = requests.filter((request) => request.status !== "Completed");
  const risk = requests.filter((request) => request.status === "Blocked" || daysUntil(request.dueDate) <= 3);
  const unpaidInvoices = state.data.invoices.filter((invoice) => invoice.status === "Unpaid");
  const unpaidTotal = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  elements.revenueMetric.textContent = currency(revenue);
  elements.revenueDetail.textContent = `${state.data.clients.length} active subscriptions`;
  elements.openMetric.textContent = active.length;
  elements.riskMetric.textContent = risk.length;
  elements.invoiceMetric.textContent = currency(unpaidTotal);
  elements.invoiceDetail.textContent = `${unpaidInvoices.length} unpaid invoices`;
}

function renderRequests(requests) {
  elements.requestCount.textContent = `${requests.length} records`;
  if (requests.length === 0) {
    elements.requestRows.innerHTML = `<tr><td colspan="6"><div class="empty-state">No requests match the current filters.</div></td></tr>`;
    return;
  }

  elements.requestRows.innerHTML = requests
    .map(
      (request) => `
        <tr>
          <td><strong>${clientName(request.clientId)}</strong><br /><small>${request.id}</small></td>
          <td>${request.title}<br /><small>${request.priority} priority</small></td>
          <td>${request.owner}</td>
          <td><span class="status ${statusClass(request.status)}">${request.status}</span></td>
          <td>${dateLabel(request.dueDate)}<br /><small>${daysUntil(request.dueDate)} days left</small></td>
          <td><button class="row-action" type="button" data-complete="${request.id}">Complete</button></td>
        </tr>
      `,
    )
    .join("");
}

function renderClients() {
  elements.clientCards.innerHTML = state.data.clients
    .map(
      (client) => `
        <article class="client-card">
          <strong>${client.name}</strong>
          <div class="meta">
            <span>${client.plan}</span>
            <span>${currency(client.monthlyRevenue)}/mo</span>
            <span>Health ${client.health}%</span>
            <span>Owner ${client.owner}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderOwnerChart(requests) {
  const counts = requests.reduce((totals, request) => {
    totals[request.owner] = (totals[request.owner] || 0) + 1;
    return totals;
  }, {});
  const max = Math.max(1, ...Object.values(counts));

  elements.ownerChart.innerHTML = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([owner, count]) => `
        <div class="bar-row">
          <span>${owner}</span>
          <span class="bar-track"><span class="bar-fill" style="width: ${(count / max) * 100}%"></span></span>
          <span>${count} items</span>
        </div>
      `,
    )
    .join("");
}

function renderInvoices() {
  elements.invoiceList.innerHTML = state.data.invoices
    .map(
      (invoice) => `
        <article class="invoice-card">
          <strong>${invoice.id} - ${clientName(invoice.clientId)}</strong>
          <div class="meta">
            <span>${currency(invoice.amount)}</span>
            <span>${invoice.status}</span>
            <span>Due ${dateLabel(invoice.dueDate)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderActivity() {
  elements.activityLog.innerHTML = state.data.activity
    .slice(0, 5)
    .map(
      (item) => `
        <article class="activity-item">
          <strong>${item.time} - ${item.type.toUpperCase()}</strong>
          <span>${item.message}</span>
        </article>
      `,
    )
    .join("");
}

function buildHandoff(requests) {
  const risk = requests.filter((request) => request.status === "Blocked" || daysUntil(request.dueDate) <= 3);
  const unpaid = state.data.invoices.filter((invoice) => invoice.status === "Unpaid");
  return `Client portal operations handoff

Visible requests: ${requests.length}
Open requests: ${requests.filter((request) => request.status !== "Completed").length}
SLA risk: ${risk.length}
Outstanding invoices: ${currency(unpaid.reduce((sum, invoice) => sum + invoice.amount, 0))}

Suggested next action:
1. Clear blocked requests first.
2. Follow up on invoices due this week.
3. Review owner workload before accepting new client requests.

API routes demonstrated in this repo:
GET /api/clients
GET /api/requests
POST /api/requests
PATCH /api/requests/:id
GET /api/invoices
GET /api/summary`;
}

function render() {
  const requests = getFilteredRequests();
  renderMetrics(requests);
  renderRequests(requests);
  renderClients();
  renderOwnerChart(requests);
  renderInvoices();
  renderActivity();
  elements.handoffText.value = buildHandoff(requests);
}

function addActivity(type, message) {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  state.data.activity.unshift({ type, message, time });
}

function completeRequest(id) {
  const request = state.data.requests.find((item) => item.id === id);
  if (!request) return;
  request.status = "Completed";
  addActivity("request", `${id} completed from the admin dashboard.`);
  renderFilters();
  render();
}

function createRequest(event) {
  event.preventDefault();
  const id = `REQ-${1100 + state.data.requests.length}`;
  state.data.requests.unshift({
    id,
    clientId: elements.newClient.value,
    title: elements.newTitle.value.trim() || "New client request",
    owner: elements.newOwner.value,
    status: "In Progress",
    dueDate: elements.newDueDate.value,
    priority: "Medium",
  });
  addActivity("api", `POST /api/requests created ${id}.`);
  elements.newTitle.value = "";
  renderFilters();
  render();
}

function runSync() {
  addActivity("api", "GET /api/summary refreshed clients, requests, invoices, and activity.");
  render();
}

function exportReport() {
  const report = {
    generatedAt: new Date().toISOString(),
    clients: state.data.clients.length,
    visibleRequests: getFilteredRequests(),
    invoices: state.data.invoices,
    summary: elements.handoffText.value,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "client-portal-report.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyHandoff() {
  await navigator.clipboard?.writeText(elements.handoffText.value);
  addActivity("api", "Client handoff copied to clipboard.");
  render();
}

function bindEvents() {
  elements.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    render();
  });
  elements.ownerFilter.addEventListener("change", (event) => {
    state.filters.owner = event.target.value;
    render();
  });
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    render();
  });
  elements.requestRows.addEventListener("click", (event) => {
    const id = event.target?.dataset?.complete;
    if (id) completeRequest(id);
  });
  elements.requestForm.addEventListener("submit", createRequest);
  elements.syncButton.addEventListener("click", runSync);
  elements.exportButton.addEventListener("click", exportReport);
  elements.copySummaryButton.addEventListener("click", copyHandoff);
}

async function init() {
  await loadData();
  renderFilters();
  bindEvents();
  render();
}

init();
