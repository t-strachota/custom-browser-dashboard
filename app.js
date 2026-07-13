const timeElement = document.querySelector("#time");
const dateElement = document.querySelector("#date");
const welcomeElement = document.querySelector("#welcome");
const weatherLoading = document.querySelector("#weather-loading");
const weatherError = document.querySelector("#weather-error");
const weatherErrorMessage = document.querySelector("#weather-error-message");
const weatherContent = document.querySelector("#weather-content");
const refreshWeatherButton = document.querySelector("#refresh-weather");
const retryWeatherButton = document.querySelector("#retry-weather");
const shortcutList = document.querySelector("#shortcut-list");
const shortcutEmpty = document.querySelector("#shortcut-empty");
const addShortcutButton = document.querySelector("#add-shortcut");
const shortcutDialog = document.querySelector("#shortcut-dialog");
const closeShortcutDialogButton = document.querySelector("#close-shortcut-dialog");
const shortcutForm = document.querySelector("#shortcut-form");
const shortcutNameInput = document.querySelector("#shortcut-name");
const shortcutUrlInput = document.querySelector("#shortcut-url");
const shortcutFormError = document.querySelector("#shortcut-form-error");
const refreshNewsButton = document.querySelector("#refresh-news");
const newsUpdated = document.querySelector("#news-updated");

const SHORTCUTS_KEY = "personal-dashboard.shortcuts.v1";
const NEWS_CACHE_KEY = "personal-dashboard.news.v1";
const NEWS_FEEDS = {
  geopolitics: {
    element: document.querySelector("#geopolitics-feed"),
    source: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
  },
  finance: {
    element: document.querySelector("#finance-feed"),
    source: "CNBC Finance",
    url: "https://www.cnbc.com/id/10000664/device/rss/rss.html",
  },
};

const weatherElements = {
  location: document.querySelector("#weather-location"),
  icon: document.querySelector("#weather-icon"),
  temperature: document.querySelector("#current-temperature"),
  description: document.querySelector("#weather-description"),
  high: document.querySelector("#temperature-high"),
  low: document.querySelector("#temperature-low"),
  rain: document.querySelector("#rain-chance"),
  wind: document.querySelector("#wind-speed"),
};

const WEATHER_CODES = {
  0: ["Clear sky", "☀️"],
  1: ["Mostly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Icy fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Heavy freezing drizzle", "🌧️"],
  61: ["Light rain", "🌦️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Heavy freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Light showers", "🌦️"],
  81: ["Showers", "🌧️"],
  82: ["Heavy showers", "⛈️"],
  85: ["Snow showers", "🌨️"],
  86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Severe thunderstorm", "⛈️"],
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function greetingFor(hour) {
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

function updateDashboard() {
  const now = new Date();

  timeElement.dateTime = now.toISOString();
  dateElement.dateTime = now.toISOString().slice(0, 10);
  timeElement.textContent = timeFormatter.format(now);
  dateElement.textContent = dateFormatter.format(now);
  welcomeElement.textContent = greetingFor(now.getHours());
}

updateDashboard();
setInterval(updateDashboard, 1_000);

function setWeatherState(state, message = "") {
  weatherLoading.hidden = state !== "loading";
  weatherError.hidden = state !== "error";
  weatherContent.hidden = state !== "ready";
  refreshWeatherButton.hidden = state !== "ready";

  if (message) weatherErrorMessage.textContent = message;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 30 * 60 * 1_000,
    });
  });
}

async function getPlaceName(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(5),
    longitude: longitude.toFixed(5),
    localityLanguage: navigator.language || "en",
  });

  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    );
    if (!response.ok) throw new Error("Location lookup failed");

    const place = await response.json();
    const locality = place.city || place.locality || place.principalSubdivision;
    return [locality, place.countryName].filter(Boolean).join(", ");
  } catch {
    return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  }
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "1",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) throw new Error("The weather service did not respond.");
  return response.json();
}

function renderWeather(placeName, forecast) {
  const current = forecast.current;
  const daily = forecast.daily;
  const [description, icon] = WEATHER_CODES[current.weather_code] || [
    "Weather unavailable",
    "🌡️",
  ];

  weatherElements.location.textContent = placeName;
  weatherElements.icon.textContent = icon;
  weatherElements.temperature.textContent = Math.round(current.temperature_2m);
  weatherElements.description.textContent = description;
  weatherElements.high.textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
  weatherElements.low.textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
  weatherElements.rain.textContent = `${daily.precipitation_probability_max[0] ?? 0}%`;
  weatherElements.wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  setWeatherState("ready");
}

function locationErrorMessage(error) {
  if (error?.code === 1) {
    return "Location access is off. Allow it in Safari’s website settings, then try again.";
  }
  if (error?.code === 3) return "Finding your location took too long. Please try again.";
  return error?.message || "Your location and weather could not be loaded.";
}

async function loadWeather() {
  setWeatherState("loading");

  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    const [placeName, forecast] = await Promise.all([
      getPlaceName(latitude, longitude),
      getWeather(latitude, longitude),
    ]);
    renderWeather(placeName, forecast);
  } catch (error) {
    setWeatherState("error", locationErrorMessage(error));
  }
}

refreshWeatherButton.addEventListener("click", loadWeather);
retryWeatherButton.addEventListener("click", loadWeather);
loadWeather();

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The dashboard still works when private browsing blocks local storage.
  }
}

let shortcuts = readStorage(SHORTCUTS_KEY, []);
if (!Array.isArray(shortcuts)) shortcuts = [];

function shortcutHue(name) {
  return [...name].reduce((total, character) => total + character.charCodeAt(0), 0) % 360;
}

function normalizeWebsiteUrl(value) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);

  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Unsupported address");
  return url.href;
}

function createShortcut(shortcut, index) {
  const item = document.createElement("div");
  item.className = "shortcut-item";

  const link = document.createElement("a");
  link.className = "shortcut-link";
  link.href = shortcut.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.title = shortcut.url;

  const icon = document.createElement("span");
  icon.className = "shortcut-icon";
  icon.style.setProperty("--shortcut-hue", shortcutHue(shortcut.name));
  icon.textContent = shortcut.name.trim().slice(0, 2);

  const name = document.createElement("span");
  name.className = "shortcut-name";
  name.textContent = shortcut.name;

  const removeButton = document.createElement("button");
  removeButton.className = "remove-shortcut";
  removeButton.type = "button";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", `Remove ${shortcut.name}`);
  removeButton.addEventListener("click", () => {
    shortcuts.splice(index, 1);
    writeStorage(SHORTCUTS_KEY, shortcuts);
    renderShortcuts();
  });

  link.append(icon, name);
  item.append(link, removeButton);
  return item;
}

function renderShortcuts() {
  shortcutList.replaceChildren(...shortcuts.map(createShortcut));
  shortcutList.hidden = shortcuts.length === 0;
  shortcutEmpty.hidden = shortcuts.length > 0;
}

function openShortcutDialog() {
  shortcutForm.reset();
  shortcutFormError.hidden = true;
  shortcutDialog.showModal();
  requestAnimationFrame(() => shortcutNameInput.focus());
}

addShortcutButton.addEventListener("click", openShortcutDialog);
shortcutEmpty.addEventListener("click", openShortcutDialog);
closeShortcutDialogButton.addEventListener("click", () => shortcutDialog.close());
shortcutDialog.addEventListener("click", (event) => {
  if (event.target === shortcutDialog) shortcutDialog.close();
});

shortcutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const name = shortcutNameInput.value.trim();
    const url = normalizeWebsiteUrl(shortcutUrlInput.value.trim());
    if (!name) throw new Error("Please enter a name.");

    shortcuts.push({ name, url });
    writeStorage(SHORTCUTS_KEY, shortcuts);
    renderShortcuts();
    shortcutDialog.close();
  } catch {
    shortcutFormError.textContent = "Enter a valid website, such as example.com.";
    shortcutFormError.hidden = false;
  }
});

renderShortcuts();

function cleanSummary(value) {
  const documentFragment = new DOMParser().parseFromString(value || "", "text/html");
  return documentFragment.body.textContent.trim();
}

function relativeTime(value) {
  const normalizedDate = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const published = new Date(normalizedDate);
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - published.getTime()) / 60_000));

  if (!Number.isFinite(elapsedMinutes)) return "Recently";
  if (elapsedMinutes < 60) return `${Math.max(1, elapsedMinutes)}m ago`;
  if (elapsedMinutes < 1_440) return `${Math.round(elapsedMinutes / 60)}h ago`;
  return `${Math.round(elapsedMinutes / 1_440)}d ago`;
}

function createNewsItem(item, source) {
  const link = document.createElement("a");
  link.className = "news-item";
  try {
    link.href = normalizeWebsiteUrl(item.link);
  } catch {
    link.removeAttribute("href");
  }
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const meta = document.createElement("div");
  meta.className = "news-meta";

  const sourceElement = document.createElement("span");
  sourceElement.textContent = source;
  const timeElement = document.createElement("time");
  timeElement.textContent = relativeTime(item.pubDate);
  meta.append(sourceElement, timeElement);

  const title = document.createElement("h4");
  title.textContent = item.title;
  const summary = document.createElement("p");
  summary.textContent = cleanSummary(item.description || item.content);
  summary.hidden = !summary.textContent;

  link.append(meta, title, summary);
  return link;
}

function renderNewsFeed(feed, items) {
  if (!items.length) throw new Error("No recent stories were returned.");
  feed.element.replaceChildren(...items.slice(0, 5).map((item) => createNewsItem(item, feed.source)));
}

async function fetchNewsFeed(key, feed) {
  const endpoint = new URL("https://api.rss2json.com/v1/api.json");
  endpoint.searchParams.set("rss_url", feed.url);
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("News service unavailable");

  const data = await response.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("Invalid news response");
  return [key, data.items];
}

async function loadNews() {
  refreshNewsButton.disabled = true;
  refreshNewsButton.setAttribute("aria-busy", "true");
  const cache = readStorage(NEWS_CACHE_KEY, {});
  const results = await Promise.allSettled(
    Object.entries(NEWS_FEEDS).map(([key, feed]) => fetchNewsFeed(key, feed)),
  );

  let receivedFreshNews = false;
  results.forEach((result, index) => {
    const [fallbackKey, feed] = Object.entries(NEWS_FEEDS)[index];

    if (result.status === "fulfilled") {
      const [key, items] = result.value;
      renderNewsFeed(NEWS_FEEDS[key], items);
      cache[key] = items;
      receivedFreshNews = true;
      return;
    }

    if (Array.isArray(cache[fallbackKey]) && cache[fallbackKey].length) {
      renderNewsFeed(feed, cache[fallbackKey]);
      return;
    }

    const error = document.createElement("div");
    error.className = "feed-error";
    error.textContent = "Updates are temporarily unavailable. Use Refresh to try again.";
    feed.element.replaceChildren(error);
  });

  if (receivedFreshNews) {
    cache.updatedAt = new Date().toISOString();
    writeStorage(NEWS_CACHE_KEY, cache);
  }

  const lastUpdate = cache.updatedAt ? new Date(cache.updatedAt) : null;
  newsUpdated.textContent = lastUpdate
    ? `Updated ${new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(lastUpdate)}`
    : "Live updates are temporarily unavailable";
  refreshNewsButton.disabled = false;
  refreshNewsButton.removeAttribute("aria-busy");
}

refreshNewsButton.addEventListener("click", loadNews);
loadNews();
setInterval(loadNews, 30 * 60 * 1_000);
