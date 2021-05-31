import React from "react";
import { Ranking, useRanking } from "../contexts/RankingControl";
import { capitalize } from "../utils/Strings";
import Item from "./Item";

interface Props {
    ranking: Ranking;
    collectionName: string;
}

export const Leaderboard: React.FC<Props> = ({ ranking, collectionName }) => {
    const rankingContext = useRanking();

    const handleClick = (action: "vote" | "downvote", id: string) => {
        if (rankingContext) {
            switch (action) {
                case "vote": {
                    rankingContext.vote(id).then().catch();
                    break;
                }
                case "downvote": {
                    rankingContext.downVote(id).then().catch();
                    break;
                }
            }
        }
    };

    if (!rankingContext) return null;

    return (
        <div className="leaderboard">
            <h1 className="leaderboard-heading">
                {capitalize(collectionName.replace(/-/g, " "))}
            </h1>
            <div className="rank-items-container">
                {rankingContext.liveRanking.length
                    ? rankingContext.liveRanking.map((eachItem, ind) => {
                          return (
                              <Item
                                  rank={ind}
                                  key={eachItem.id}
                                  name={eachItem.name}
                                  id={eachItem.id}
                                  collectionName={collectionName}
                                  votes={eachItem.votes}
                                  handleClick={handleClick}
                              />
                          );
                      })
                    : ranking.map((eachItem, ind) => {
                          return (
                              <Item
                                  rank={ind}
                                  key={eachItem.id}
                                  name={eachItem.name}
                                  id={eachItem.id}
                                  collectionName={collectionName}
                                  votes={eachItem.votes}
                                  handleClick={handleClick}
                              />
                          );
                      })}
            </div>
        </div>
    );
};
