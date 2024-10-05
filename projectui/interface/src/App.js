// import React, { useState } from 'react';

// function App() {
//     const [file, setFile] = useState(null);
//     const [output, setOutput] = useState("");

//     const handleFileChange = (e) => setFile(e.target.files[0]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData();
//         formData.append('file', file);

//         const response = await fetch('http://localhost:5000/upload', {
//             method: 'POST',
//             body: formData,
//         });

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();

//         reader.read().then(function processText({ done, value }) {
//             if (done) return;
//             setOutput(prev => prev + decoder.decode(value));
//             reader.read().then(processText);
//         });
//     };

//     return (
//         <div className="App">
//             <h1>Simulation Interface</h1>
//             <form onSubmit={handleSubmit}>
//                 <input type="file" onChange={handleFileChange} />
//                 <button type="submit">Start Simulation</button>
//             </form>
//             <pre>{output}</pre>
//         </div>
//     );
// }

// export default App;
import React from 'react';
import SimulationInterface from './SimulationInterface';

function App() {
  return (
    <div className="App">
      <SimulationInterface />
    </div>
  );
}

export default App;