import { VirtualList, ILoadState } from 'hosi';
import { useState } from 'react';
import faker from 'faker';

interface IItem {
  title: string;
  desc: string;
}

const VirtualListBasic = () => {
  const [list, setList] = useState<Array<IItem>>([]);
  const loadMore = (state: ILoadState) => {
    console.log('load more....');

    setTimeout(() => {
      const data = [];
      let id = list.length;
      for (let i = 0; i < 10; i++) {
        data.push({ title: `标题 - ${++id}`, desc: faker.lorem.sentences() });
      }
      setList([...list, ...data]);
      state.loaded();
      if (data.length + list.length >= 100) {
        state.complete();
      }
    }, 300);
  };

  return (
    <div style={{ height: '500px', border: '1px solid #ccc' }}>
      <VirtualList dataSource={list} loadMore={loadMore}>
        {(item) => (
          <div>
            <p>{item.title}</p>
            <p>{item.desc}</p>
          </div>
        )}
      </VirtualList>
    </div>
  );
};

export default VirtualListBasic;
