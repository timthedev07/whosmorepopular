import React, { useState } from "react";
import { Leaderboard } from "../components/Leaderboard";
import { useRanking } from "../contexts/RankingControl";
import { Wait } from "../components/Wait";

export const RankingPage: React.FC = () => {
  const [pauseVote, setPauseVote] = useState<boolean>(false);

  const rankingContext = useRanking();

  return (
    <div className="page-content">
      <Wait
        display={pauseVote}
        closePopup={() => setPauseVote(false)}
        message="Take a breath before your next vote"
        timeScale={0.5}
      />
      {rankingContext ? (
        <Leaderboard
          ranking={rankingContext.liveRanking}
          pauseVote={() => setPauseVote(true)}
          unpauseVote={() => setPauseVote(false)}
          collectionName={rankingContext.currRankingDisplayed}
        />
      ) : null}
    </div>
  );
};
