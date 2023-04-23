import { useEffect, useRef } from 'react';

const useUpdate = (...args: Parameters<typeof useEffect>) => {
  const [callback, deps] = args;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    return callback();
  }, deps);
};

export default useUpdate;
