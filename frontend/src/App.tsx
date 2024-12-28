import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UniswapPoolsIndexer from "./pages/UniswapPoolsIndexer";
import RaydiumPoolIndexer from "./pages/RaydiumPoolIndexer";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RaydiumPoolIndexer />} />
        <Route path="/uniswap" element={<UniswapPoolsIndexer />} />
      </Routes>
    </Router>
  );
};

export default App;
