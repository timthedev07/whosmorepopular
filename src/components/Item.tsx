import React from "react";
import { Button } from "react-bootstrap";
import { ReactComponent as UpArrow } from "../assets/images/icons/up-arrow.svg";
import { ReactComponent as DownArrow } from "../assets/images/icons/down-arrow.svg";
import { ReactComponent as Crown } from "../assets/images/icons/crown.svg";

interface Props {
    name: string;
    id: string;
    rank: number;
    collectionName: string;
    votes: number;
    handleClick: (action: "vote" | "downvote", id: string) => void;
}

const Item: React.FC<Props> = ({ name, rank, votes, handleClick, id }) => {
    return (
        <>
            {rank === 0 ? (
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        height: "75px",
                    }}
                >
                    <Crown
                        style={{
                            marginLeft: "auto",
                            marginRight: "auto",
                            width: "100px",
                            height: "90px",
                        }}
                    />
                </div>
            ) : null}
            <div className={`rank-item ranked-${rank}`}>
                <h3 style={{ textAlign: "center" }}>
                    {name} &nbsp;{votes} votes
                </h3>

                <div className="rank-item-action-button-container">
                    <Button
                        className="rank-item-action-button btn-light"
                        variant="light"
                        onClick={() => handleClick("vote", id)}
                    >
                        <UpArrow className="icons" />
                    </Button>
                    <Button
                        className="rank-item-action-button btn-dark"
                        variant="dark"
                        onClick={() => handleClick("downvote", id)}
                    >
                        <DownArrow className="icons" />
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Item;
