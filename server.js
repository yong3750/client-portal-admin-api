const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

const root = __dirname;
const port = Number(process.env.PORT || 4175);
const host = process.env.HOST || "127.0.0.1";
let store;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".png": "image/png",
};

async function loadStore() {
  const raw = await fs.readFile(path.join(root, "data", "seed.json"), "utf8");
  store = JSON.parse(raw);
}

function send(response, status, payload, type = "application/json; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(Buffer.isBuffer(payload) || typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function summary() {
  const revenue = store.clients.reduce((sum, client) => sum + client.monthlyRevenue, 0);
  const openRequests = store.requests.filter((request) => request.status !== "Completed");
  const risk = store.requests.filter((request) => request.status === "Blocked" || request.priority === "High");
  const unpaid = store.invoices.filter((invoice) => invoice.status === "Unpaid");

  return {
    revenue,
    clients: store.clients.length,
    openRequests: openRequests.length,
    risk: risk.length,
    outstandingInvoices: unpaid.reduce((sum, invoice) => sum + invoice.amount, 0),
    unpaidInvoices: unpaid.length,
  };
}

async function handleApi(request, response, url) {
  if (request.method === "OPTIONS") {
    send(response, 204, "");
    return true;
  }

  if (url.pathname === "/api/clients" && request.method === "GET") {
    send(response, 200, store.clients);
    return true;
  }

  if (url.pathname === "/api/requests" && request.method === "GET") {
    send(response, 200, store.requests);
    return true;
  }

  if (url.pathname === "/api/requests" && request.method === "POST") {
    const body = await readJson(request);
    const next = {
      id: `REQ-${1100 + store.requests.length}`,
      clientId: body.clientId,
      title: body.title,
      owner: body.owner || "Phil",
      status: body.status || "In Progress",
      dueDate: body.dueDate,
      priority: body.priority || "Medium",
    };
    store.requests.unshift(next);
    send(response, 201, next);
    return true;
  }

  const requestMatch = url.pathname.match(/^\/api\/requests\/([^/]+)$/);
  if (requestMatch && request.method === "PATCH") {
    const body = await readJson(request);
    const requestItem = store.requests.find((item) => item.id === requestMatch[1]);
    if (!requestItem) {
      send(response, 404, { error: "Request not found" });
      return true;
    }
    Object.assign(requestItem, body);
    send(response, 200, requestItem);
    return true;
  }

  if (url.pathname === "/api/invoices" && request.method === "GET") {
    send(response, 200, store.invoices);
    return true;
  }

  if (url.pathname === "/api/summary" && request.method === "GET") {
    send(response, 200, summary());
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    send(response, 404, { error: "API route not found" });
    return true;
  }

  return false;
}

async function serveStatic(response, pathname) {
  const filePath = path.normalize(path.join(root, pathname === "/" ? "index.html" : pathname));
  if (!filePath.startsWith(root)) {
    send(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const type = contentTypes[path.extname(filePath)] || "application/octet-stream";
    send(response, 200, file, type);
  } catch (error) {
    send(response, 404, "Not found", "text/plain; charset=utf-8");
  }
}

async function route(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (await handleApi(request, response, url)) return;
  await serveStatic(response, decodeURIComponent(url.pathname));
}

loadStore()
  .then(() => {
    http.createServer((request, response) => {
      route(request, response).catch((error) => {
        send(response, 500, { error: error.message });
      });
    }).listen(port, host, () => {
      console.log(`Client portal demo running at http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
