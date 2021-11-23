
export const toName = (str: string) => {
  return str.replace(/-/g, ' ').split(' ').map((s) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};
