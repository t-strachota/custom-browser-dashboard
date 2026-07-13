# Custom Browser Dashboard

A lightweight, privacy-conscious start page for Safari and other modern browsers. It combines the time, local weather, personal shortcuts, and current world and finance headlines in one responsive dashboard.

Built with plain HTML, CSS, and JavaScript—no framework, build process, account, or backend required.

## Features

- Live local time, date, and time-sensitive greeting
- Current weather, daily high and low, rain probability, and wind speed
- Browser-based location detection with a readable city and country fallback
- Custom website shortcuts stored locally in the browser
- Geopolitics and finance headlines with publisher-provided summaries
- Automatic news refresh and locally cached stories
- Responsive layout for desktop and mobile screens
- Loading, permission, network, and service-outage states

## Getting started

Clone the repository:

```sh
git clone https://github.com/t-strachota/custom-browser-dashboard.git
cd custom-browser-dashboard
```

Open `index.html` in a modern browser. The dashboard is entirely static, so it does not require dependency installation or a local server.

The browser will request location permission when the weather widget loads. Weather remains unavailable if permission is declined, but the rest of the dashboard continues to work normally.

## Use it as a Safari start page

1. Open the hosted dashboard—or the local `index.html` file—in Safari.
2. Choose **Safari → Settings → General**.
3. Set **Homepage** to the dashboard's current address, or select **Set to Current Page**.
4. Set **New windows open with** to **Homepage**.
5. Optionally set **New tabs open with** to **Homepage** as well.

If Safari restores the previous session at startup, change **Safari opens with** to **A new window** when that setting is available in your macOS version.

## Quick access

Select **Add website**, enter a name and web address, and the shortcut will appear in the Quick Access panel. Addresses without a protocol, such as `github.com`, are automatically opened over HTTPS.

Shortcuts are saved with `localStorage`. They remain in the current browser profile and are never uploaded to this repository or another server. Removing browser website data will also remove saved shortcuts.

## News and updates

The dashboard displays five recent stories in each category:

- [BBC World](https://www.bbc.com/news/world) supplies international and geopolitical coverage.
- [CNBC Finance](https://www.cnbc.com/finance/) supplies finance and market coverage.

[RSS2JSON](https://rss2json.com/) converts the publishers' RSS feeds into browser-readable JSON. Stories refresh every 30 minutes and the last successful responses are cached locally. Summaries are supplied by the respective publishers, and every item links to its original article.

The finance section is provided for general information and does not constitute financial advice.

## Weather and location privacy

Location access is requested through the browser's standard Geolocation API and requires explicit permission. Coordinates are sent directly from the browser to:

- [Open-Meteo](https://open-meteo.com/) for current conditions and the daily forecast
- [BigDataCloud](https://www.bigdatacloud.com/) for the city and country name

The project has no application server and does not store location data. If the place-name request fails, the weather widget displays rounded coordinates instead.

## Project structure

```text
custom-browser-dashboard/
├── index.html    # Dashboard markup and accessible structure
├── styles.css    # Layout, visual design, and responsive behavior
├── app.js        # Clock, weather, shortcuts, storage, and news logic
└── README.md     # Project documentation
```

## Technologies

- Semantic HTML5
- Modern CSS with responsive layouts and backdrop effects
- Vanilla JavaScript and browser APIs
- `localStorage` for user preferences and cached news
- Open-Meteo, BigDataCloud, and RSS2JSON APIs

## Limitations

- Weather requires location permission and access to the external weather services.
- News availability depends on the publishers' RSS feeds and the RSS conversion service.
- Shortcuts and cached stories do not synchronize between browsers or devices.
- Safari settings and location behavior can vary between macOS versions.

## Contributing

Issues and focused pull requests are welcome. Before submitting a change, verify the dashboard in a modern browser and confirm that its clock, weather states, shortcut management, and both news columns continue to work.
