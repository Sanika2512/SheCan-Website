const quotes = [
  "Code like a girl.",
  "Empowered women empower women.",
  "Girls can lead in technology too.",
  "She believed she could, so she did."
];

const quoteText = document.querySelector("#quoteText");
const form = document.querySelector("#participationForm");
const formError = document.querySelector("#formError");
const submitBtn = document.querySelector("#submitBtn");
const successPopup = document.querySelector("#successPopup");
const themeToggle = document.querySelector("#themeToggle");

let quoteIndex = 0;

const setTheme = (theme) => {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("sheCanTheme", theme);
  themeToggle.querySelector(".theme-icon").textContent = theme === "dark" ? "☀" : "☾";
};

setTheme(localStorage.getItem("sheCanTheme") || "light");

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(nextTheme);
});

setInterval(() => {
  quoteText.classList.add("fade");

  setTimeout(() => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    quoteText.textContent = quotes[quoteIndex];
    quoteText.classList.remove("fade");
  }, 350);
}, 3000);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const startCounters = () => {
  document.querySelectorAll(".counter").forEach((counter) => {
    const target = Number(counter.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 80);

    const updateCounter = () => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        return;
      }

      counter.textContent = current;
      requestAnimationFrame(updateCounter);
    };

    updateCounter();
  });
};

const statsObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startCounters();
        observer.disconnect();
      }
    });
  },
  { threshold: 0.35 }
);

const statsSection = document.querySelector(".stats");
if (statsSection) {
  statsObserver.observe(statsSection);
}

const showSuccess = (message = "Saved successfully") => {
  successPopup.textContent = message;
  successPopup.classList.add("show");
  setTimeout(() => successPopup.classList.remove("show"), 2800);
};

const submitParticipation = async () => {
  formError.textContent = "";

  const formData = new FormData(form);
  const payload = {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    message: formData.get("message").trim()
  };

  if (payload.name.length < 2 || payload.message.length < 5 || !/^\S+@\S+\.\S+$/.test(payload.email)) {
    formError.textContent = "Please enter a valid name, email, and message.";
    return;
  }

  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Submission failed.");
    }

    form.reset();
    showSuccess("Participation saved for admin");
  } catch (error) {
    formError.textContent = error.message;
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitParticipation();
});
