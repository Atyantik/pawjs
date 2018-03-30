export const getURLParam = (target, key, defaultValue = null) => {
  let values = [];
  if(!target){
    target = location.href;
  }
  
  key = key.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  
  let pattern = key + "=([^&#]+)";
  let o_reg = new RegExp(pattern,"ig");
  
  // eslint-disable-next-line
  while(true){
    let matches = o_reg.exec(target);
    if(matches && matches[1]){
      values.push(matches[1]);
    }
    else{
      break;
    }
  }
  if(!values.length){
    return defaultValue;
  }
  else{
    return values.length === 1 ? values[0] : values;
  }
};