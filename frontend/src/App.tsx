import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EthPoolIndexer from "./pages/EthPoolIndexer";
import SolPoolIndexer from "./pages/SolPoolIndexer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EthPoolIndexer />} />
        <Route path="/solana" element={<SolPoolIndexer />} />
      </Routes>
    </Router>
  );
};

export default App;
