"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMockHistory = buildMockHistory;
const europe = {
    summary: 'This part of Europe sat within shifting kingdoms, trade routes, and cultural exchanges. Settlement patterns, rulers, and local economies changed frequently across centuries.',
    events: [
        {
            year: undefined,
            title: 'Regional powers and trade',
            detail: 'Town life, agriculture, and long-distance trade shaped daily life around major rivers and crossroads.',
        },
        {
            year: undefined,
            title: 'Faith and learning',
            detail: 'Religious institutions and emerging universities influenced law, architecture, and record keeping.',
        },
    ],
    confidence: 'medium',
};
const templates = {
    europe,
    americas: {
        summary: 'Indigenous nations, empires, and later colonial frontiers shaped this landscape. Names, borders, and languages changed dramatically over time.',
        events: [
            {
                title: 'Indigenous polities',
                detail: 'Many regions were governed by complex societies with distinct languages, rituals, and trade networks.',
            },
            {
                title: 'Contact and transformation',
                detail: 'Later centuries brought new diseases, goods, and political structures that reshaped local life.',
            },
        ],
        confidence: 'medium',
    },
    africa: {
        summary: 'This area participated in regional kingdoms, desert and coastal trade, and diverse agricultural systems. Historical records vary by period and location.',
        events: [
            {
                title: 'Trade corridors',
                detail: 'Caravan routes and port cities connected inland communities to wider markets.',
            },
            {
                title: 'State formation',
                detail: 'Rulers, councils, and kinship networks organized land use, tribute, and defense.',
            },
        ],
        confidence: 'medium',
    },
    asia: {
        summary: 'Dense agrarian societies, imperial courts, and merchant networks defined much of this region. Urban centers rose and fell with dynastic change.',
        events: [
            {
                title: 'Imperial administration',
                detail: 'Tax systems, road networks, and official chronicles helped govern large populations.',
            },
            {
                title: 'Cultural exchange',
                detail: 'Pilgrimage, printing, and maritime trade spread ideas, technologies, and styles.',
            },
        ],
        confidence: 'medium',
    },
    oceania: {
        summary: 'Island and continental communities developed sophisticated navigation, ecology management, and oral histories adapted to local environments.',
        events: [
            {
                title: 'Wayfinding and settlement',
                detail: 'Seafaring knowledge linked scattered islands through deliberate voyaging and exchange.',
            },
            {
                title: 'Ecological stewardship',
                detail: 'Fire regimes, fishing practices, and seasonal calendars structured community life.',
            },
        ],
        confidence: 'medium',
    },
    default: {
        summary: 'Historical knowledge for this coordinate varies. The area may have been sparsely documented, uninhabited, or known under different names in older sources.',
        events: [
            {
                title: 'Limited direct records',
                detail: 'For many dates and coordinates, only broad climatic or archaeological inferences are available.',
            },
        ],
        confidence: 'low',
    },
};
function regionFor(lat, lng) {
    if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45)
        return templates.europe;
    if (lat >= -56 && lat <= 72 && lng >= -170 && lng <= -30)
        return templates.americas;
    if (lat >= -35 && lat <= 38 && lng >= -20 && lng <= 55)
        return templates.africa;
    if (lat >= -10 && lat <= 55 && lng >= 45 && lng <= 150)
        return templates.asia;
    if (lat >= -50 && lat <= 10 && lng >= 110 && lng <= 180)
        return templates.oceania;
    return templates.default;
}
function formatYear(year) {
    if (year < 0)
        return `${Math.abs(year)} BCE`;
    if (year === 0)
        return '1 BCE / 1 CE';
    return `${year} CE`;
}
function formatYearRange(startYear, endYear) {
    return `${formatYear(startYear)} – ${formatYear(endYear)}`;
}
function buildMockHistory(lat, lng, startYear, endYear, placeName) {
    const region = regionFor(lat, lng);
    const periodLabel = `${placeName}, ${formatYearRange(startYear, endYear)}`;
    return {
        placeName,
        periodLabel,
        summary: `${region.summary} Between ${formatYearRange(startYear, endYear)}, ${placeName} would have experienced conditions consistent with its broader region.`,
        events: region.events.map((event) => ({
            ...event,
            year: event.year ?? endYear,
        })),
        confidence: region.confidence,
        source: 'mock',
    };
}
