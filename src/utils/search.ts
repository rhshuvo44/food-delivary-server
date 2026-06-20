export interface SearchOptions {
    query: string;
    fields: string[];
}

export function buildSearchFilter(query: string, fields: string[]): Record<string, unknown> {
    return {
        OR: fields.map((field) => ({
            [field]: {
                contains: query,
                mode: 'insensitive',
            },
        })),
    };
}
