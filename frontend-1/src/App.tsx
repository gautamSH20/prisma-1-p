import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Signin } from "./components/Signin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sigin" element={<Signin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
