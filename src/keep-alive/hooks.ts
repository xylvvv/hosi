import { useContext } from 'react';
import KeepAliveContext from './context';

export const useKeepAliveContext = () => {
  const keepAliveContext = useContext(KeepAliveContext);
  if (!keepAliveContext) {
    throw new Error('useKeepAliveContext has to be used within <KeepAliveContext.Provider>');
  }
  return keepAliveContext;
};
