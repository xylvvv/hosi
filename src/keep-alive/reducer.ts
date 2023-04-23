import { ReactNode } from 'react';

export enum ACTION_ENUM {
  CREATE_OR_UPDATE = 'createOrUpdate',
  DETACH = 'detach',
}

export enum CACHE_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

interface ICache {
  cacheId: string;
  reactElement: ReactNode;
  load: (node: HTMLDivElement) => void;
  status: CACHE_STATUS;
}

export type IState = Record<string, ICache>;

export interface IAction {
  type: ACTION_ENUM;
  payload: Partial<ICache>;
}

export const reducer = (state: IState, action: IAction) => {
  const { type, payload } = action;
  const cacheId = payload.cacheId as string;
  switch (type) {
    case ACTION_ENUM.CREATE_OR_UPDATE:
      return {
        ...state,
        [cacheId]: {
          ...state[cacheId],
          ...payload,
          status: CACHE_STATUS.ACTIVE,
        },
      };
    case ACTION_ENUM.DETACH:
      return {
        ...state,
        [cacheId]: {
          ...state[cacheId],
          status: CACHE_STATUS.INACTIVE,
        },
      };
    default:
      return state;
  }
};
