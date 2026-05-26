const adminLock = document.querySelector("#adminLock");
const dashboard = document.querySelector("#adminDashboard");
const unlockBtn = document.querySelector("#unlockBtn");
const adminCode = document.querySelector("#adminCode");
const adminError = document.querySelector("#adminError");
const totalParticipants = document.querySelector("#totalParticipants");
const tableBody = document.querySelector("#adminTableBody");
let activeAdminSecret = "";

const formatDate = (dateValue) => {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(dateValue));
};

const loadAdminData = async (secret) => {
  const response = await fetch("/submissions", {
    headers: { "x-admin-secret": secret }
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not load submissions.");
  }

  totalParticipants.textContent = result.total;
  tableBody.innerHTML = "";

  if (result.data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">No submissions yet.</td></tr>';
    return;
  }

  result.data.forEach((submission) => {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    const email = document.createElement("td");
    const message = document.createElement("td");
    const time = document.createElement("td");

    name.textContent = submission.name;
    email.textContent = submission.email || "Hidden";
    message.textContent = submission.message;
    time.textContent = formatDate(submission.createdAt);

    row.append(name, email, message, time);
    tableBody.appendChild(row);
  });
};

const connectAdminRealtime = () => {
  if (!window.EventSource || !activeAdminSecret) {
    return;
  }

  const events = new EventSource("/submissions/stream");

  events.addEventListener("submission", () => {
    loadAdminData(activeAdminSecret);
  });
};

unlockBtn.addEventListener("click", async () => {
  const secret = adminCode.value.trim();
  adminError.textContent = "";

  if (secret !== "SHECAN2025") {
    adminError.textContent = "Incorrect admin code.";
    return;
  }

  unlockBtn.textContent = "Loading...";
  unlockBtn.disabled = true;

  try {
    activeAdminSecret = secret;
    await loadAdminData(secret);
    adminLock.classList.add("hidden");
    dashboard.classList.remove("hidden");
    connectAdminRealtime();
  } catch (error) {
    adminError.textContent = error.message;
  } finally {
    unlockBtn.textContent = "Unlock Dashboard";
    unlockBtn.disabled = false;
  }
});

adminCode.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockBtn.click();
  }
});
