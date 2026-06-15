"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHistoryRequest = handleHistoryRequest;
const mock_data_1 = require("./mock-data");
const geocode_1 = require("./geocode");
const llm_1 = require("./llm");
const types_1 = require("./types");
const historyCache = new Map();
function cacheKey(lat, lng, startYear, endYear) {
    return `${lat.toFixed(2)},${lng.toFixed(2)},${startYear},${endYear}`;
}
async function handleHistoryRequest(body) {
    const request = types_1.historyRequestSchema.parse(body);
    const key = cacheKey(request.lat, request.lng, request.startYear, request.endYear);
    const cached = historyCache.get(key);
    if (cached) {
        return { ...cached, source: 'cache' };
    }
    const placeName = await (0, geocode_1.reverseGeocode)(request.lat, request.lng);
    try {
        const generated = await (0, llm_1.generateHistory)(placeName, request.lat, request.lng, request.startYear, request.endYear);
        historyCache.set(key, generated);
        console.log('generated:', generated);
        return generated;
    }
    catch {
        console.log('error generating history, using mock data');
        const mock = (0, mock_data_1.buildMockHistory)(request.lat, request.lng, request.startYear, request.endYear, placeName);
        historyCache.set(key, mock);
        return mock;
    }
}
