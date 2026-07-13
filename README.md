# Personal dashboard

A dependency-free start page with a live local time, full date, greeting, current location, weather, personal website shortcuts, and current news updates.

## Open it now

Double-click `index.html`. The dashboard works directly from disk and does not need Python.

Safari will ask for location permission the first time it opens. Choose **Allow** so the dashboard can load local weather. If location is blocked later, use **Safari → Settings → Websites → Location** to change the permission for the dashboard.

## Make it open with Safari

The simplest setup needs no server:

1. Open `index.html` in Safari.
2. In Safari, choose **Safari → Settings → General**.
3. Set **Homepage** to the dashboard's current `file://` address (or click **Set to Current Page**).
4. Set **New windows open with** to **Homepage**.
5. If desired, also set **New tabs open with** to **Homepage**.

Safari will now show the dashboard whenever a new Safari window opens, including when Safari starts with a new window. If Safari restores the previous session instead, change **Safari opens with** to **A new window** in the same settings panel (when that option is available in your macOS version).

## Weather and privacy

The page requests your position through Safari and sends the coordinates directly from your browser to:

- [Open-Meteo](https://open-meteo.com/) for the weather forecast.
- [BigDataCloud](https://www.bigdatacloud.com/) to turn coordinates into a city and country name.

There is no server, account, API key, or stored location data in this project. If the place-name lookup is unavailable, the dashboard falls back to showing rounded coordinates while still loading the weather.

## Quick access

Choose **Add website**, enter a name and address, and the dashboard will save the shortcut in Safari's local browser storage. Shortcuts open in a new tab and can be removed with the small × button. They are local to this browser profile and are not uploaded anywhere.

## News and updates

The news panel shows the latest five stories from each of these feeds:

- [BBC World](https://www.bbc.com/news/world) for geopolitics and international affairs.
- [CNBC Finance](https://www.cnbc.com/finance/) for finance and markets.

The public [RSS2JSON](https://rss2json.com/) service converts the publishers' RSS feeds into a format the static dashboard can read. Results refresh every 30 minutes and are cached locally so the most recently loaded stories remain visible during a temporary outage.

The summaries come from the publishers and each story links to its original article. The finance section is for general information and is not financial advice.
