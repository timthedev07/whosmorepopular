import React, { useState } from "react";
import { Ranking, useRanking } from "../contexts/RankingControl";

import { capitalize } from "../utils/Strings";
import Item from "./Item";
import { CustomAlert } from "../components/CustomAlert";

interface Props {
  ranking: Ranking;
  collectionName: string;
  pauseVote: () => void;
  unpauseVote: () => void;
}

export const Leaderboard: React.FC<Props> = ({
  ranking,
  collectionName,
  pauseVote,
  unpauseVote,
}) => {
  const rankingContext = useRanking();
  const [alertDisplay, setAlertDisplay] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  /**
   * Closes the alert popup
   */
  const closeAlert = () => {
    setAlertDisplay(false);
    setAlertMessage("");
  };

  const handleClick = (action: "vote" | "downvote", id: string) => {
    if (!rankingContext) return;
    if (!rankingContext.currentUser) {
      setAlertMessage("Sign in to vote for your favorite library/language. 😉");
      setAlertDisplay(true);
      return;
    }
    if (!rankingContext.canVote) {
      setAlertMessage(
        "Sorry, you have reached the limit of voting 10 times a day. 🤨"
      );
      setAlertDisplay(true);
      return;
    }
    pauseVote();
    switch (action) {
      case "vote": {
        rankingContext
          .vote(id)
          .then((res) => {
            rankingContext.incrementVoteRecord();
          })
          .catch((err) => {
            if (err.code === "permission-denied") {
              setAlertMessage(
                "Sign in to vote for your favorite library/language. 😉"
              );
              setAlertDisplay(true);
            }
          });
        break;
      }
      case "downvote": {
        rankingContext
          .downVote(id)
          .then((res) => {
            rankingContext.incrementVoteRecord();
          })
          .catch((err) => {
            if (err.code === "permission-denied") {
              setAlertMessage(
                "Sign in to vote for your favorite library/language. 😉"
              );
              setAlertDisplay(true);
            }
          });
        break;
      }
    }
  };

  if (!rankingContext) return null;

  return (
    <div className="leaderboard">
      <CustomAlert
        type="info"
        active={alertDisplay}
        message={alertMessage}
        handleClose={() => closeAlert()}
      />
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
