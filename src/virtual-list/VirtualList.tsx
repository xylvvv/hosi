import { ReactNode, UIEventHandler, useEffect, useRef, useState } from 'react';
import useUpdate from './useUpdate';
import './index.less';

export interface ILoadState {
  complete: () => void;
  loaded: () => void;
}

interface IVirtualListProps<T> {
  dataSource: T[];
  loadMore?: ($state: ILoadState) => void;
  children: (item: T, index: number) => ReactNode;
}

interface ICacheItem<T> {
  data: T;
  index: number;
  height: number;
  top: number;
  bottom: number;
}

const TRY_RENDER_NUM = 10;
const BUFFER_SCALE = 1;

const getStartIndex = (caches: ICacheItem<any>[], scrollTop: number) => {
  // 找到第一个在可视区域的节点（即第一个bottom大于等于scrollTop的节点）
  let low = 0;
  let high = caches.length - 1;
  while (low <= high) {
    const mid = low + ((high - low) >> 1);
    const midValue = caches[mid].bottom;
    if (midValue >= scrollTop) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return low;
};

export const VirtualList = <T,>(props: IVirtualListProps<T>) => {
  const { dataSource, children, loadMore } = props;
  const [renderList, setRenderList] = useState<ICacheItem<T>[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const loading = useRef(false);
  const estimatedItemHeight = useRef(0);
  const cacheList = useRef<ICacheItem<T>[]>([]);
  const firstScreenRendered = useRef(false);
  const [start, setStart] = useState(0);

  useEffect(() => {
    if (!loadMore) {
      finished.current = true;
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (finished.current || loading.current) return;
      loading.current = true;
      loadMore({
        complete: () => {
          finished.current = true;
        },
        loaded: () => {
          loading.current = false;
        },
      });
    });
    observer.observe(footer.current as HTMLDivElement);
    return () => {
      observer.disconnect();
    };
  }, [loadMore]);

  useEffect(() => {
    const caches = cacheList.current as ICacheItem<T>[];
    for (let i = caches.length; i < dataSource.length; i++) {
      caches.push({
        data: dataSource[i],
        index: i,
        height: estimatedItemHeight.current,
        top: i * estimatedItemHeight.current,
        bottom: (i + 1) * estimatedItemHeight.current,
      });
    }
    const holderEl = holder.current as HTMLDivElement;
    const listEl = list.current as HTMLUListElement;
    if (firstScreenRendered.current) {
      holderEl.style.height = `${estimatedItemHeight.current * dataSource.length}px`;
    } else {
      setRenderList(caches.slice(0, listEl.childNodes.length + TRY_RENDER_NUM));
    }
  }, [dataSource]);

  useUpdate(() => {
    // 更新每项位置信息及列表高度
    const containerEl = container.current as HTMLDivElement;
    const holderEl = holder.current as HTMLDivElement;
    const listEl = list.current as HTMLUListElement;
    const caches = cacheList.current as ICacheItem<T>[];
    const nodes = Array.from(listEl.children);
    if (nodes.length) {
      let diff = 0;
      let hSum = 0;
      nodes.forEach((node) => {
        const index = Number((node as HTMLElement).dataset.index);
        const height = node.getBoundingClientRect().height;
        const oldHeight = caches[index].height;
        diff += oldHeight - height;
        hSum += height;
        caches[index].top = caches[index - 1]?.bottom || 0;
        caches[index].bottom = caches[index].top + height;
        caches[index].height = height;
      });
      if (!estimatedItemHeight.current) {
        estimatedItemHeight.current = hSum / nodes.length;
      }
      const lastRenderedNodeIndex = Number((nodes[nodes.length - 1] as HTMLElement).dataset.index);
      if (diff) {
        for (let i = lastRenderedNodeIndex + 1; i < caches.length; i++) {
          caches[i].top = caches[i - 1].bottom;
          caches[i].height = caches[i].height || estimatedItemHeight.current;
          caches[i].bottom = caches[i].top + caches[i].height;
        }
      }
      holderEl.style.height = `${caches[caches.length - 1].bottom}px`;
      if (!firstScreenRendered.current) {
        if (caches[lastRenderedNodeIndex].bottom >= containerEl.clientHeight) {
          firstScreenRendered.current = true;
        } else if (caches[caches.length - 1].bottom >= containerEl.clientHeight) {
          const firstBlowNode = caches.find((item) => item.bottom >= containerEl.clientHeight);
          setRenderList(caches.slice(0, (firstBlowNode as ICacheItem<T>).index + 1));
        } else if (finished.current && renderList.length < caches.length) {
          firstScreenRendered.current = true;
          setRenderList([...caches]);
        }
      }
    }
  }, [renderList]);

  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    const start = getStartIndex(cacheList.current, scrollTop);
    setStart(start);
  };

  useUpdate(() => {
    const containerEl = container.current as HTMLDivElement;
    const listEl = list.current as HTMLUListElement;
    const caches = cacheList.current;
    const visibleCount = Math.ceil(containerEl.clientHeight / estimatedItemHeight.current);
    const end = start + visibleCount;
    const aboveCount = Math.min(start, visibleCount * BUFFER_SCALE);
    const belowCount = Math.min(caches.length - end, visibleCount * BUFFER_SCALE);
    setRenderList(caches.slice(start - aboveCount, end + belowCount));
    const startOffset = caches[start - aboveCount] ? caches[start - aboveCount].top : 0;
    listEl.style.transform = `translate3d(0,${startOffset}px,0)`;
  }, [start]);

  return (
    <div styleName="container" ref={container} onScroll={handleScroll}>
      <div ref={holder} />
      <ul styleName="list" ref={list}>
        {renderList.map((item) => (
          <li key={item.index} styleName="item" data-index={item.index}>
            {children(item.data, item.index)}
          </li>
        ))}
      </ul>
      <div ref={footer}></div>
    </div>
  );
};
