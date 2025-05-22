import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const ROOM_ID = 'demo-room-123'; // later can be dynamic

function App() {
  const [code, setCode] = useState('// Start coding here...');

  useEffect(() => {
    socket.emit('join-room', ROOM_ID);

    socket.on('receive-code', (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off('recieve-code');
    };
  }, []);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-change', { roomID: ROOM_ID, code: value });
  };

  // const handleRun = () => {
  //   alert('Code submitted:\n\n' + code);
  // };

  const handleRun = async () => {
  const response = await fetch('http://localhost:5000/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();
  alert(data.output || data.error);
};


  return (
    <div className="App">
      <h1>Live Coding Interview Platform</h1>
      <Editor
        height="500px"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={handleCodeChange}
      />
      <button onClick={handleRun}>Run Code</button>
    </div>
  );
}

export default App;
