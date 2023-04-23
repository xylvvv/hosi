import { FC, ReactNode, memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CACHE_STATUS } from './reducer';

interface IScopeItem {
  reactElement: ReactNode;
  load: (node: HTMLDivElement) => void;
  status: CACHE_STATUS;
}

const ScopeItem: FC<IScopeItem> = (props) => {
  const { reactElement, load, status } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      document.body.appendChild(ref.current as HTMLDivElement);
    };
  }, []);

  useEffect(() => {
    const el = ref.current as HTMLDivElement;
    if (status === CACHE_STATUS.ACTIVE) {
      load?.(el);
    } else if (status === CACHE_STATUS.INACTIVE) {
      document.body.appendChild(el);
    }
  }, [status]);
  return createPortal(
    <div ref={ref} style={{ display: status === CACHE_STATUS.INACTIVE ? 'none' : 'block' }}>
      {reactElement}
    </div>,
    document.body,
  );
};

export default memo(ScopeItem);
