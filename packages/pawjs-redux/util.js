// Simple right!
export const cloneDeep = function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
};

export default {
  cloneDeep,
};
