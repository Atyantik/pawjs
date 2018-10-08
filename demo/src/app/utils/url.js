export const getURLParam = (target, key, defaultValue = null) => {
  const values = [];
  if (!target) {
    target = location.href;
  }

  key = key.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');

  const pattern = `${key}=([^&#]+)`;
  const o_reg = new RegExp(pattern, 'ig');

  // eslint-disable-next-line
  while(true){
    const matches = o_reg.exec(target);
    if (matches && matches[1]) {
      values.push(matches[1]);
    } else {
      break;
    }
  }
  if (!values.length) {
    return defaultValue;
  }

  return values.length === 1 ? values[0] : values;
};
