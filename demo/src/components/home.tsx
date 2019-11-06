import React, { useEffect } from 'react';

export default () => {
  console.log('here');
  useEffect(() => {
    console.log('am mounted');
  });
  return (
    <div>
      Tirth Bodawala
    </div>
  );
};
