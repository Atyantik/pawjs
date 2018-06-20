// Simple right!
export const cloneDeep = function(obj){
  return JSON.parse(JSON.stringify(obj));
};