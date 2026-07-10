export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | Array<string | number | boolean | Date>;

export interface FilterConditions {
  [key: string]:
    | FilterValue
    | { in?: FilterValue[]; gte?: number | string | Date; lte?: number | string | Date };
}

export function buildFilterConditions(filters: FilterConditions): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = value;
      return;
    }

    result[key] = value;
  });

  return result;
}
