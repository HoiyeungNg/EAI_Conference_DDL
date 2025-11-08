const grid = document.getElementById("conferenceGrid");
const statusEl = document.getElementById("status");
let countdownInterval = null;

const UNIT_IN_SECONDS = {
  day: 60 * 60 * 24,
  hour: 60 * 60,
  minute: 60,
};

async function loadConferences() {
  try {
    const response = await fetch("data/conferences.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load data (${response.status})`);
    }

    const conferences = await response.json();
    renderCards(conferences);
    startCountdown();
    statusEl.textContent = "Countdowns update in real time.";
  } catch (error) {
    console.error(error);
    statusEl.textContent =
      "We could not load the deadlines right now. Please refresh or check the data file.";
  }
}

function createCountdownBlock(label) {
  const wrapper = document.createElement("div");
  wrapper.className = "countdown__block";

  const value = document.createElement("p");
  value.className = "countdown__value";
  value.dataset.unit = label.toLowerCase();
  value.textContent = "--";

  const unitLabel = document.createElement("p");
  unitLabel.className = "countdown__label";
  unitLabel.textContent = label;

  wrapper.append(value, unitLabel);
  return wrapper;
}

function createCard(conference) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.deadline = conference.deadline;

  const eyebrow = document.createElement("p");
  eyebrow.className = "card__eyebrow";
  eyebrow.textContent = `${conference.acronym} • ${conference.location}`;

  const heading = document.createElement("h2");
  heading.textContent = conference.name;

  const deadlineText = document.createElement("p");
  deadlineText.className = "card__deadline";
  deadlineText.textContent = `Deadline: ${formatDeadline(conference.deadline)}${
    conference.deadlineNote ? ` (${conference.deadlineNote})` : ""
  }`;

  const status = document.createElement("p");
  status.className = "card__status";
  status.dataset.status = "status";
  status.textContent = "Calculating…";

  const countdown = document.createElement("div");
  countdown.className = "countdown";
  countdown.append(
    createCountdownBlock("Days"),
    createCountdownBlock("Hours"),
    createCountdownBlock("Minutes"),
    createCountdownBlock("Seconds"),
  );

  const timezone = document.createElement("p");
  timezone.className = "card__timezone";
  timezone.textContent = `Reference timezone: ${conference.timezone}`;

  const note = document.createElement("p");
  note.className = "card__note";
  note.textContent = conference.note || "";
  if (!conference.note) {
    note.hidden = true;
  }

  const link = document.createElement("a");
  link.className = "card__link";
  link.href = conference.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "Official site";

  card.append(eyebrow, heading, deadlineText, status, countdown, timezone, note, link);
  return card;
}

function renderCards(conferences) {
  const fragment = document.createDocumentFragment();
  conferences.forEach((conf) => fragment.appendChild(createCard(conf)));
  grid.replaceChildren(fragment);
}

function formatDeadline(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

function getTimeParts(deadline) {
  const now = Date.now();
  const distance = new Date(deadline).getTime() - now;

  if (distance <= 0) {
    return { distance, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor(distance / 1000);
  const days = Math.floor(seconds / UNIT_IN_SECONDS.day);
  const hours = Math.floor(
    (seconds % UNIT_IN_SECONDS.day) / UNIT_IN_SECONDS.hour,
  );
  const minutes = Math.floor(
    (seconds % UNIT_IN_SECONDS.hour) / UNIT_IN_SECONDS.minute,
  );
  const remainingSeconds = seconds % UNIT_IN_SECONDS.minute;

  return { distance, days, hours, minutes, seconds: remainingSeconds };
}

function updateCountdowns() {
  document.querySelectorAll(".card").forEach((card) => {
    const deadline = card.dataset.deadline;
    const { distance, days, hours, minutes, seconds } = getTimeParts(deadline);

    const status = card.querySelector("[data-status]");
    const units = card.querySelectorAll("[data-unit]");

    if (distance <= 0) {
      card.classList.add("card--closed");
      status.textContent = "Deadline has passed";
      units.forEach((unit) => {
        unit.textContent = "--";
      });
    } else {
      card.classList.remove("card--closed");
      status.textContent = `${days}d ${hours}h ${minutes}m remaining`;
      units.forEach((unit) => {
        unit.textContent = {
          days,
          hours,
          minutes,
          seconds,
        }[unit.dataset.unit] ?? "--";
      });
    }
  });
}

function startCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  updateCountdowns();
  countdownInterval = setInterval(updateCountdowns, 1000);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden || !countdownInterval) return;
  updateCountdowns();
});

loadConferences();
