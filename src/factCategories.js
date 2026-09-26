// The three fact sections. Each has a list page and an article page that
// share the FactList and FactArticle components.
export const FACT_CATEGORIES = [
    {
        key: 'binatang',
        path: '/fakta-binatang',
        title: 'Fakta-Fakta Binatang',
        listEndpoint: '/api/fetchAnimalFacts',
        articleEndpoint: '/api/fetchAnimalFact',
    },
    {
        key: 'angkasa',
        path: '/fakta-angkasa',
        title: 'Fakta-Fakta Angkasa',
        listEndpoint: '/api/fetchSpaceFacts',
        articleEndpoint: '/api/fetchSpaceFact',
    },
    {
        key: 'aneh',
        path: '/fakta-aneh',
        title: 'Fakta-Fakta Aneh Tapi Nyata',
        listEndpoint: '/api/fetchRandomFacts',
        articleEndpoint: '/api/fetchRandomFact',
    },
];
