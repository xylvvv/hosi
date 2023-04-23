import { KeepAlive, KeepAliveItem } from 'hosi';
import { useState } from 'react';
import { Radio, Input } from 'antd';

const ComponentA = (props: { num: number }) => (
  <div>
    <Input />
    {props.num}
  </div>
);
const ComponentB = () => <Input />;

const KeepAliveBasic = () => {
  const [current, setCurrent] = useState<number>(1);
  const [number, setNumber] = useState(0);
  return (
    <KeepAlive>
      <Radio.Group name="current" onChange={(e) => setCurrent(e.target.value)} value={current}>
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
      </Radio.Group>
      {current === 1 ? (
        <div>
          <p>Current component is A</p>
          <KeepAliveItem cacheId="A">
            <ComponentA num={number} />
          </KeepAliveItem>
        </div>
      ) : (
        <div>
          <p>Current component is B</p>
          <KeepAliveItem cacheId="B">
            <ComponentB />
          </KeepAliveItem>
        </div>
      )}
      {current === 1 && (
        <KeepAliveItem cacheId="C">
          <ComponentB />
        </KeepAliveItem>
      )}
      <button onClick={() => setNumber(number + 1)}>add</button>
    </KeepAlive>
  );
};

export default KeepAliveBasic;
