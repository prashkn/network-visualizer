import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameCanvas } from "./components/GameCanvas";
import { AddDevice } from "./components/AddDevice";

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1a1a2e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Routes>
          <Route path="/" element={<GameCanvas />} />
          <Route path="/add" element={<AddDevice />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
