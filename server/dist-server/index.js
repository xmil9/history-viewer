"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const history_handler_1 = require("./history-handler");
const geocode_1 = require("./geocode");
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 3001);
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.get('/api/geocode', async (req, res) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            res.status(400).json({ error: 'Invalid coordinates' });
            return;
        }
        const placeName = await (0, geocode_1.reverseGeocode)(lat, lng);
        res.json({ placeName });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected server error';
        res.status(400).json({ error: message });
    }
});
app.post('/api/history', async (req, res) => {
    try {
        const result = await (0, history_handler_1.handleHistoryRequest)(req.body);
        res.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected server error';
        res.status(400).json({ error: message });
    }
});
app.listen(port, () => {
    console.log(`History API listening on http://localhost:${port}`);
});
