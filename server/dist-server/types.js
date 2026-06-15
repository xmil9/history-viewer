"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyResponseSchema = exports.historyRequestSchema = void 0;
const zod_1 = require("zod");
exports.historyRequestSchema = zod_1.z.object({
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    startYear: zod_1.z.number().int().min(-3000).max(new Date().getFullYear()),
    endYear: zod_1.z.number().int().min(-3000).max(new Date().getFullYear()),
    zoom: zod_1.z.number().min(0).max(22),
}).refine((data) => data.startYear <= data.endYear, {
    message: 'startYear must be less than or equal to endYear',
});
exports.historyResponseSchema = zod_1.z.object({
    placeName: zod_1.z.string(),
    periodLabel: zod_1.z.string(),
    summary: zod_1.z.string(),
    events: zod_1.z.array(zod_1.z.object({
        year: zod_1.z.number().optional(),
        title: zod_1.z.string(),
        detail: zod_1.z.string(),
    })),
    confidence: zod_1.z.enum(['high', 'medium', 'low']),
    source: zod_1.z.enum(['gemini', 'groq', 'ollama', 'mock', 'cache']),
});
