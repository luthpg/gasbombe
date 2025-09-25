import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '/vite.svg';
import '@/App.css';
import { parameters } from '@/lib/parameters';
import { serverScripts } from '@/lib/server';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  const { userAddress } = parameters;

  const handleHelloButton = async () => {
    try {
      setMessage('Waiting...');
      const result = await serverScripts.sayHello(userAddress);
      setMessage(result);
    } catch (error) {
      console.error(error);
      setMessage('Error. Check the console.');
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button
          type="button"
          onClick={handleHelloButton}
          style={{ marginLeft: '10px' }}
        >
          {message}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
