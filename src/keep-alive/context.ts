import { Dispatch, createContext } from 'react';
import { IAction, IState } from './reducer';

export interface IKeepAliveContext {
  state: IState;
  dispatch: Dispatch<IAction>;
}

const KeepAliveContext = createContext<IKeepAliveContext | null>(null);
export default KeepAliveContext;
