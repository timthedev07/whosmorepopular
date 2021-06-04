import React from "react";
import { Leaderboard } from "../components/Leaderboard";
import { useRanking } from "../contexts/RankingControl";

export const RankingPage: React.FC = () => {
  const rankingContext = useRanking();

  return (
    <div className="page-content">
      {rankingContext ? (
        <Leaderboard
          ranking={rankingContext.liveRanking}
          collectionName={rankingContext.currRankingDisplayed}
        />
      ) : null}
    </div>
  );
};
