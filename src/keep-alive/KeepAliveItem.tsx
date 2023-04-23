import { FC, ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { useKeepAliveContext } from './hooks';
import { ACTION_ENUM } from './reducer';

interface IKeepAliveItem {
  children: ReactNode;
  cacheId: string;
}

const KeepAliveItem: FC<IKeepAliveItem> = (props) => {
  const { children, cacheId } = props;
  const ref = useRef<HTMLDivElement>(null);
  const { dispatch } = useKeepAliveContext();

  useEffect(() => {
    return () => {
      dispatch({
        type: ACTION_ENUM.DETACH,
        payload: {
          cacheId,
        },
      });
    };
  }, [cacheId]);

  useLayoutEffect(() => {
    dispatch({
      type: ACTION_ENUM.CREATE_OR_UPDATE,
      payload: {
        cacheId,
        reactElement: children,
        load: (node: HTMLDivElement) => {
          ref.current?.appendChild(node);
        },
      },
    });
  }, [children, dispatch, cacheId]);

  return <div ref={ref} />;
};

export default KeepAliveItem;
