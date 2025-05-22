import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";

const CodeEditor = () => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("# Write your code here");
  const [testCases, setTestCases] = useState([
    { input: "", expectedOutput: "" },
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  };

  const removeTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const handleRunCode = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/run", {
        code,
        language,
        testCases,
      });
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
      alert("Code execution failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Live Coding Interview Platform</h1>

      <select
        className="border p-2 rounded mb-4"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="node">Node.js</option>
      </select>

      <MonacoEditor
        height="400px"
        language={language === "cpp" ? "cpp" : language}
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{ fontSize: 14 }}
      />

      <h2 className="text-lg font-semibold mt-6 mb-2">Test Cases</h2>

      {testCases.map((testCase, index) => (
        <div key={index} className="mb-4 border p-3 rounded">
          <textarea
            className="w-full p-2 border rounded mb-2"
            rows="2"
            placeholder="Input"
            value={testCase.input}
            onChange={(e) => updateTestCase(index, "input", e.target.value)}
          />
          <textarea
            className="w-full p-2 border rounded"
            rows="2"
            placeholder="Expected Output"
            value={testCase.expectedOutput}
            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
          />
          <button
            className="text-red-500 mt-1 text-sm"
            onClick={() => removeTestCase(index)}
          >
            ❌ Remove
          </button>
        </div>
      ))}

      <button
        className="bg-blue-500 text-white px-3 py-1 rounded"
        onClick={addTestCase}
      >
        ➕ Add Test Case
      </button>

      <div className="mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleRunCode}
          disabled={loading}
        >
          {loading ? "Running..." : "▶ Run Code"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          {results.map((res, i) => (
            <div key={i} className="bg-gray-100 p-3 my-2 rounded">
              <p><strong>Input:</strong> {res.input}</p>
              <p><strong>Expected:</strong> {res.expectedOutput}</p>
              <p><strong>Output:</strong> {res.actualOutput}</p>
              <p className={res.passed ? "text-green-600" : "text-red-600"}>
                {res.passed ? "✅ Passed" : "❌ Failed"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
