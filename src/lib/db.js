// Small wrappers so every page reads entity lists the same way.
// The SDK returns an array without options and { items, next_cursor } with them.

export async function fetchList(entity, query = {}, options = {}) {
  const result = await entity.filter(query, { sort: "-created_date", limit: 100, ...options });
  return Array.isArray(result) ? result : (result?.items ?? []);
}

export function sumBy(rows, pick) {
  return rows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
}

export function countBy(rows, pick) {
  return rows.reduce((acc, row) => {
    const key = pick(row);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}