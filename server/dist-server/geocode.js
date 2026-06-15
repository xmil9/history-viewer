"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocode = reverseGeocode;
const geocodeCache = new Map();
let lastNominatimCall = 0;
function cacheKey(lat, lng) {
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}
function formatCoordinates(lat, lng) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}
async function waitForNominatimSlot() {
    const elapsed = Date.now() - lastNominatimCall;
    if (elapsed < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
    }
    lastNominatimCall = Date.now();
}
async function reverseGeocode(lat, lng) {
    const key = cacheKey(lat, lng);
    const cached = geocodeCache.get(key);
    if (cached) {
        return cached;
    }
    const userAgent = process.env.NOMINATIM_USER_AGENT;
    if (!userAgent) {
        const fallback = formatCoordinates(lat, lng);
        geocodeCache.set(key, fallback);
        return fallback;
    }
    try {
        await waitForNominatimSlot();
        const url = new URL('https://nominatim.openstreetmap.org/reverse');
        url.searchParams.set('format', 'json');
        url.searchParams.set('lat', String(lat));
        url.searchParams.set('lon', String(lng));
        url.searchParams.set('zoom', '10');
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent,
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Nominatim responded with ${response.status}`);
        }
        const data = (await response.json());
        const address = data.address;
        const shortName = [
            address?.city ?? address?.town ?? address?.village,
            address?.state,
            address?.country,
        ]
            .filter(Boolean)
            .join(', ');
        const placeName = shortName || data.display_name || formatCoordinates(lat, lng);
        geocodeCache.set(key, placeName);
        return placeName;
    }
    catch {
        const fallback = formatCoordinates(lat, lng);
        geocodeCache.set(key, fallback);
        return fallback;
    }
}
