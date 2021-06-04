import React from "react";
import "./css/master.css";
import { RankingPage } from "./pages/RankingPage";
import "bootstrap/dist/css/bootstrap.min.css";
import { RankingControl } from "./contexts/RankingControl";
import { Nav } from "./components/Nav";

const App: React.FC = () => {
  return (
    <div className="App">
      <RankingControl>
        <>
          <Nav />
          <div className="page-wrapper">
            <RankingPage />
          </div>
        </>
      </RankingControl>
    </div>
  );
};

export default App;
