import "./App.css";
import { useState } from "react";
import { DropZone } from "../features/upload-file";

function App() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div>
      <section>
        <h1>PDF Text Extractor</h1>
        <DropZone onFiles={setFiles}/>
        <ul>
          {files.map(file => (
            <li key={`${file.name}-${file.lastModified}`}>
              {file.name} - {file.size} байт
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
