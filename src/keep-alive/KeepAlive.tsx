import { FC, ReactNode, useReducer } from 'react';
import KeepAliveContext from './context';
import { reducer } from './reducer';
import ScopeItem from './ScopeItem';

interface IKeepAliveProps {
  children: ReactNode;
}

const KeepAlive: FC<IKeepAliveProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, {});

  return (
    <KeepAliveContext.Provider value={{ state, dispatch }}>
      {children}
      {Object.keys(state).map((cacheId) => {
        const { reactElement, load, status } = state[cacheId];
        return <ScopeItem reactElement={reactElement} key={cacheId} load={load} status={status} />;
      })}
    </KeepAliveContext.Provider>
  );
};

export default KeepAlive;
