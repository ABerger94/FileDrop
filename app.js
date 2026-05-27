const STORAGE_KEY = "filedrop-demo-state-v2";

const seedOrganizations = [
  { id: "org-greenline", name: "Greenline Labs", prefix: "GL" },
  { id: "org-nexora", name: "Nexora Group", prefix: "NX" },
  { id: "org-external", name: "Outside Organization", prefix: "EXT" },
];

const seedUsers = [
  {
    id: "GL-0001",
    name: "Avery Stone",
    email: "admin@greenline.test",
    password: "admin123",
    orgId: "org-greenline",
    role: "admin",
  },
  {
    id: "GL-2048",
    name: "Maya Chen",
    email: "maya@greenline.test",
    password: "user123",
    orgId: "org-greenline",
    role: "user",
  },
  {
    id: "GL-5172",
    name: "Jon Bell",
    email: "jon@greenline.test",
    password: "user123",
    orgId: "org-greenline",
    role: "user",
  },
  {
    id: "GL-7741",
    name: "Priya Shah",
    email: "priya@greenline.test",
    password: "user123",
    orgId: "org-greenline",
    role: "user",
  },
  {
    id: "NX-1409",
    name: "Owen Brooks",
    email: "owen@nexora.test",
    password: "user123",
    orgId: "org-nexora",
    role: "user",
  },
  {
    id: "EXT-8157",
    name: "External Partner",
    email: "partner@example.test",
    password: "user123",
    orgId: "org-external",
    role: "user",
  },
];

const defaultState = {
  sessionUserId: null,
  organizations: seedOrganizations,
  users: seedUsers,
  directShares: [
    {
      id: crypto.randomUUID(),
      senderId: "GL-5172",
      recipientId: "GL-2048",
      message: "Latest vendor handoff packet.",
      files: [{ name: "vendor-handoff.pdf", size: 2540000, type: "application/pdf" }],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  boardPosts: [
    {
      id: crypto.randomUUID(),
      senderId: "GL-7741",
      orgId: "org-greenline",
      title: "Brand assets",
      message: "Approved logos and type files for launch work.",
      files: [
        { name: "brand-kit.zip", size: 8432000, type: "application/zip" },
        { name: "logo-pack.svg", size: 68000, type: "image/svg+xml" },
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
};

let state = loadState();
let directFiles = [];
let communityFiles = [];

const els = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  sessionName: document.querySelector("#sessionName"),
  sessionUserId: document.querySelector("#sessionUserId"),
  sessionOrg: document.querySelector("#sessionOrg"),
  sessionRole: document.querySelector("#sessionRole"),
  logoutButton: document.querySelector("#logoutButton"),
  adminTab: document.querySelector("#adminTab"),
  navTabs: document.querySelectorAll(".nav-tab"),
  viewTitle: document.querySelector("#viewTitle"),
  directForm: document.querySelector("#directForm"),
  recipientId: document.querySelector("#recipientId"),
  directDropzone: document.querySelector("#directDropzone"),
  directFilesInput: document.querySelector("#directFiles"),
  directFileList: document.querySelector("#directFileList"),
  directMessage: document.querySelector("#directMessage"),
  recipientDirectory: document.querySelector("#recipientDirectory"),
  communityForm: document.querySelector("#communityForm"),
  communityDropzone: document.querySelector("#communityDropzone"),
  communityFilesInput: document.querySelector("#communityFiles"),
  communityFileList: document.querySelector("#communityFileList"),
  postTitle: document.querySelector("#postTitle"),
  postMessage: document.querySelector("#postMessage"),
  communityBoard: document.querySelector("#communityBoard"),
  boardScope: document.querySelector("#boardScope"),
  inboxList: document.querySelector("#inboxList"),
  addUserForm: document.querySelector("#addUserForm"),
  newUserName: document.querySelector("#newUserName"),
  newUserEmail: document.querySelector("#newUserEmail"),
  newUserPassword: document.querySelector("#newUserPassword"),
  newUserOrg: document.querySelector("#newUserOrg"),
  newUserRole: document.querySelector("#newUserRole"),
  newUserId: document.querySelector("#newUserId"),
  generateUserId: document.querySelector("#generateUserId"),
  adminScope: document.querySelector("#adminScope"),
  adminUserList: document.querySelector("#adminUserList"),
  toast: document.querySelector("#toast"),
  resetDemo: document.querySelector("#resetDemo"),
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? migrateState(JSON.parse(stored)) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function migrateState(nextState) {
  if (!nextState.organizations) {
    return structuredClone(defaultState);
  }
  return nextState;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showToast("That file is too large for this local prototype. A production version should use cloud file storage.");
    return false;
  }
}

function currentUser() {
  return state.users.find((user) => user.id === state.sessionUserId) || null;
}

function organizationById(orgId) {
  return state.organizations.find((org) => org.id === orgId) || null;
}

function currentOrg() {
  const user = currentUser();
  return user ? organizationById(user.orgId) : null;
}

function userName(userId) {
  return state.users.find((user) => user.id === userId)?.name || userId;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function fileSummary(file) {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
    dataUrl: await readFileAsDataUrl(file),
  };
}

async function fileSummaries(files) {
  return Promise.all(files.map(fileSummary));
}

function findStoredFile(fileId) {
  const directFiles = state.directShares.flatMap((share) => share.files || []);
  const boardFiles = state.boardPosts.flatMap((post) => post.files || []);
  return [...directFiles, ...boardFiles].find((file) => file.id === fileId);
}

function dataUrlToBlob(dataUrl) {
  const [header, base64Data] = dataUrl.split(",");
  const mimeMatch = header.match(/data:([^;]+);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function openStoredFile(fileId) {
  const file = findStoredFile(fileId);

  if (!file?.dataUrl) {
    showToast("This file was saved before file opening was added.");
    return;
  }

  const blob = dataUrlToBlob(file.dataUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("visible"), 2600);
}

function setActiveView(viewName) {
  const user = currentUser();
  const requestedView = viewName === "admin" && user?.role !== "admin" ? "direct" : viewName;

  els.navTabs.forEach((item) => item.classList.toggle("active", item.dataset.view === requestedView));
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${requestedView}View`).classList.add("active");
  els.viewTitle.textContent = document.querySelector(`[data-view="${requestedView}"]`).textContent;
}

function generateUserId(orgId = currentUser()?.orgId) {
  const org = organizationById(orgId);
  const prefix = org?.prefix || "USR";
  let id = "";

  do {
    id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (state.users.some((user) => user.id === id));

  return id;
}

function renderShell() {
  const user = currentUser();
  const signedIn = Boolean(user);

  els.authScreen.classList.toggle("hidden", signedIn);
  els.appShell.classList.toggle("hidden", !signedIn);

  if (!signedIn) return;

  const org = organizationById(user.orgId);
  els.sessionName.textContent = user.name;
  els.sessionUserId.textContent = user.id;
  els.sessionOrg.textContent = org?.name || "Unknown org";
  els.sessionRole.textContent = user.role;
  els.adminTab.classList.toggle("hidden", user.role !== "admin");
}

function renderDirectory() {
  const user = currentUser();
  if (!user) return;

  els.recipientDirectory.innerHTML = state.users
    .filter((recipient) => recipient.id !== user.id)
    .map((recipient) => {
      const recipientOrg = organizationById(recipient.orgId);
      const scope = recipient.orgId === user.orgId ? "Same organization" : "External";
      return `
        <article class="directory-card">
          <div>
            <strong>${escapeHtml(recipient.name)}</strong>
            <span>${escapeHtml(recipientOrg?.name || "Unknown org")}</span>
          </div>
          <div>
            <strong>${escapeHtml(recipient.id)}</strong>
            <span>${escapeHtml(scope)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderFileList(files, target) {
  target.innerHTML = files
    .map(
      (file) => `
        <li class="file-row">
          <span class="file-name">${escapeHtml(file.name)}</span>
          <span class="file-meta">${formatBytes(file.size)} - ${escapeHtml(file.type || "Unknown type")}</span>
        </li>
      `,
    )
    .join("");
}

function renderBoard() {
  const org = currentOrg();
  if (!org) return;

  els.boardScope.textContent = `Visible to ${org.name}`;
  const posts = state.boardPosts
    .filter((post) => post.orgId === org.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  els.communityBoard.innerHTML = posts.length
    ? posts.map(renderPostCard).join("")
    : `<div class="empty-state">No organization-wide files have been posted yet.</div>`;
}

function renderInbox() {
  const user = currentUser();
  if (!user) return;

  const directItems = state.directShares
    .filter((share) => share.recipientId === user.id)
    .map((share) => ({
      ...share,
      title: `Direct from ${userName(share.senderId)}`,
      meta: `Sent to ${share.recipientId}`,
    }));

  const boardItems = state.boardPosts
    .filter((post) => post.orgId === user.orgId)
    .map((post) => ({
      ...post,
      title: `Board: ${post.title}`,
      meta: `Posted by ${userName(post.senderId)} to ${organizationById(post.orgId)?.name || "Unknown org"}`,
    }));

  const items = [...directItems, ...boardItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  els.inboxList.innerHTML = items.length
    ? items.map(renderActivityCard).join("")
    : `<div class="empty-state">No files are available for this user yet.</div>`;
}

function renderAdmin() {
  const user = currentUser();
  if (!user || user.role !== "admin") return;

  els.newUserOrg.innerHTML = state.organizations
    .map((org) => `<option value="${escapeHtml(org.id)}">${escapeHtml(org.name)}</option>`)
    .join("");
  if (!els.newUserOrg.value) {
    els.newUserOrg.value = user.orgId;
  }
  if (!els.newUserId.value) {
    els.newUserId.value = generateUserId(els.newUserOrg.value);
  }
  els.adminScope.textContent = "Managing users across all organizations";

  const manageableUsers = state.users;
  els.adminUserList.innerHTML = manageableUsers
    .map(
      (listedUser) => {
        const org = organizationById(listedUser.orgId);
        return `
        <article class="directory-card user-card">
          <div>
            <strong>${escapeHtml(listedUser.name)}</strong>
            <span>${escapeHtml(listedUser.email)} - ${escapeHtml(org?.name || "Unknown org")}</span>
          </div>
          <div>
            <strong>${escapeHtml(listedUser.id)}</strong>
            <span>${escapeHtml(listedUser.role)}</span>
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderPostCard(post) {
  return `
    <article class="activity-card">
      <div>
        <div class="activity-title">${escapeHtml(post.title)}</div>
        <div class="activity-meta">Posted by ${escapeHtml(userName(post.senderId))} - ${new Date(post.createdAt).toLocaleString()}</div>
      </div>
      ${post.message ? `<p>${escapeHtml(post.message)}</p>` : ""}
      ${renderFileChips(post.files)}
    </article>
  `;
}

function renderActivityCard(item) {
  return `
    <article class="activity-card">
      <div>
        <div class="activity-title">${escapeHtml(item.title)}</div>
        <div class="activity-meta">${escapeHtml(item.meta)} - ${new Date(item.createdAt).toLocaleString()}</div>
      </div>
      ${item.message ? `<p>${escapeHtml(item.message)}</p>` : ""}
      ${renderFileChips(item.files)}
    </article>
  `;
}

function renderFileChips(files) {
  return `
    <div class="activity-files">
      ${files
        .map((file) => {
          const label = `${file.name} - ${formatBytes(file.size)}`;
          return file.dataUrl
            ? `<button class="file-chip file-open" type="button" data-file-id="${escapeHtml(file.id)}">${escapeHtml(label)}</button>`
            : `<span class="file-chip unavailable-file">${escapeHtml(label)} - unavailable</span>`;
        })
        .join("")}
    </div>
  `;
}

function renderAll() {
  renderShell();
  if (!currentUser()) return;

  renderDirectory();
  renderFileList(directFiles, els.directFileList);
  renderFileList(communityFiles, els.communityFileList);
  renderBoard();
  renderInbox();
  renderAdmin();
}

function wireDropzone(dropzone, input, onFiles) {
  dropzone.addEventListener("click", () => input.click());

  dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      input.click();
    }
  });

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });

  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
    onFiles([...event.dataTransfer.files]);
  });

  input.addEventListener("change", () => onFiles([...input.files]));
}

document.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.addEventListener("drop", (event) => {
  if (!event.target.closest(".dropzone")) {
    event.preventDefault();
  }
});

els.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = els.loginEmail.value.trim().toLowerCase();
  const password = els.loginPassword.value;
  const user = state.users.find((candidate) => candidate.email.toLowerCase() === email && candidate.password === password);

  if (!user) {
    showToast("Invalid email or password.");
    return;
  }

  state.sessionUserId = user.id;
  els.loginForm.reset();
  saveState();
  renderAll();
  setActiveView("direct");
  showToast(`Signed in as ${user.name}.`);
});

els.logoutButton.addEventListener("click", () => {
  state.sessionUserId = null;
  directFiles = [];
  communityFiles = [];
  saveState();
  renderAll();
});

els.navTabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveView(tab.dataset.view));
});

wireDropzone(els.directDropzone, els.directFilesInput, (files) => {
  directFiles = files;
  renderFileList(directFiles, els.directFileList);
});

wireDropzone(els.communityDropzone, els.communityFilesInput, (files) => {
  communityFiles = files;
  renderFileList(communityFiles, els.communityFileList);
});

els.directForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const sender = currentUser();
  const recipient = state.users.find((user) => user.id.toLowerCase() === els.recipientId.value.trim().toLowerCase());
  const submitButton = els.directForm.querySelector('button[type="submit"]');

  if (!sender) return;

  if (!recipient) {
    showToast("No user found for that ID.");
    return;
  }

  if (recipient.id === sender.id) {
    showToast("Choose a different recipient ID.");
    return;
  }

  if (!directFiles.length) {
    showToast("Add at least one file before sending.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  let storedFiles = [];
  try {
    storedFiles = await fileSummaries(directFiles);
  } catch {
    showToast("Could not read one of those files.");
    submitButton.disabled = false;
    submitButton.textContent = "Send to User";
    return;
  }

  state.directShares.push({
    id: crypto.randomUUID(),
    senderId: sender.id,
    recipientId: recipient.id,
    message: els.directMessage.value.trim(),
    files: storedFiles,
    createdAt: new Date().toISOString(),
  });

  if (!saveState()) {
    state.directShares.pop();
    submitButton.disabled = false;
    submitButton.textContent = "Send to User";
    return;
  }
  directFiles = [];
  els.directForm.reset();
  renderAll();
  submitButton.disabled = false;
  submitButton.textContent = "Send to User";
  showToast(`Files sent to ${recipient.name}.`);
});

els.communityForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const sender = currentUser();
  const submitButton = els.communityForm.querySelector('button[type="submit"]');
  if (!sender) return;

  if (!communityFiles.length) {
    showToast("Add at least one file before posting.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Posting...";

  let storedFiles = [];
  try {
    storedFiles = await fileSummaries(communityFiles);
  } catch {
    showToast("Could not read one of those files.");
    submitButton.disabled = false;
    submitButton.textContent = "Post to Board";
    return;
  }

  state.boardPosts.push({
    id: crypto.randomUUID(),
    senderId: sender.id,
    orgId: sender.orgId,
    title: els.postTitle.value.trim(),
    message: els.postMessage.value.trim(),
    files: storedFiles,
    createdAt: new Date().toISOString(),
  });

  if (!saveState()) {
    state.boardPosts.pop();
    submitButton.disabled = false;
    submitButton.textContent = "Post to Board";
    return;
  }
  communityFiles = [];
  els.communityForm.reset();
  renderAll();
  submitButton.disabled = false;
  submitButton.textContent = "Post to Board";
  showToast("Posted to the Community Board.");
});

document.addEventListener("click", (event) => {
  const openButton = event.target.closest(".file-open");
  if (!openButton) return;
  openStoredFile(openButton.dataset.fileId);
});

els.generateUserId.addEventListener("click", () => {
  els.newUserId.value = generateUserId(els.newUserOrg.value);
});

els.newUserOrg.addEventListener("change", () => {
  els.newUserId.value = generateUserId(els.newUserOrg.value);
});

els.addUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const admin = currentUser();
  const email = els.newUserEmail.value.trim().toLowerCase();
  const userId = els.newUserId.value.trim().toUpperCase();

  if (!admin || admin.role !== "admin") return;

  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    showToast("A user with that email already exists.");
    return;
  }

  if (state.users.some((user) => user.id.toLowerCase() === userId.toLowerCase())) {
    showToast("That user ID is already assigned.");
    return;
  }

  state.users.push({
    id: userId,
    name: els.newUserName.value.trim(),
    email,
    password: els.newUserPassword.value,
    orgId: els.newUserOrg.value,
    role: els.newUserRole.value,
  });

  els.addUserForm.reset();
  els.newUserOrg.value = admin.orgId;
  els.newUserId.value = generateUserId(admin.orgId);
  saveState();
  renderAll();
  showToast(`Created ${userId}.`);
});

els.resetDemo.addEventListener("click", () => {
  state = structuredClone(defaultState);
  directFiles = [];
  communityFiles = [];
  els.loginForm.reset();
  saveState();
  renderAll();
  setActiveView("direct");
  showToast("Demo data reset.");
});

if (currentUser()?.role === "admin") {
  els.newUserId.value = generateUserId(currentUser().orgId);
}

renderAll();
