import React from "react";
import { Leaderboard } from "../components/Leaderboard";
import { useRanking } from "../contexts/RankingControl";
import { GoogleButton } from "../components/GoogleButton";

export const RankingPage: React.FC = () => {
    const rankingContext = useRanking();

    return (
        <div className="page-content">
            <GoogleButton
                displayErrMessage={(err: string) => {}}
                buttonText=""
            />
            {rankingContext ? (
                <Leaderboard
                    ranking={rankingContext.liveRanking}
                    collectionName={rankingContext.currRankingDisplayed}
                />
            ) : null}
        </div>
    );
};
