import React from "react";
import "./css/master.css";
import { RankingPage } from "./pages/RankingPage";
import "bootstrap/dist/css/bootstrap.min.css";
import { RankingControl } from "./contexts/RankingControl";
import { Nav } from "./components/Nav";
import "semantic-ui-css/semantic.min.css";

const App: React.FC = () => {
    return (
        <div className="App">
            <RankingControl>
                <>
                    <Nav />
                    <RankingPage />
                </>
            </RankingControl>
        </div>
    );
};

export default App;
