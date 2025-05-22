// client/src/App.js
import { useState } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState('// Start coding here...');

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleRun = () => {
    alert('Code submitted:\n\n' + code);
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
