export const getCreateValues = (userId = '') => ({
  createdBy: userId || 'system',
  lastChangedBy: userId || 'system',
});

export const getUpdateValues = (userId = '') => ({
  lastChangedBy: userId || 'system',
});

export const getSqlList = (items: string[]) =>
  `(${items.map((item) => `'${item}'`).join(', ')})`;
