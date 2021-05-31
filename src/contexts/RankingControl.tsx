import firebase from "firebase/app";
import React, { useContext, createContext, useState, useEffect } from "react";
import { db } from "../firebase";

export const LANGUAGE_COLLECTION_NAME: string = "languages";
export const BACKEND_FRAMEWORK_NAME: string = "backend-frameworks";
export const FRONTEND_FRAMEWORK_NAME: string = "frontend-frameworks";

// types and interfaces

export interface RankItem {
    id: string;
    name: string;
    votes: number;
}

export interface Ranking extends Array<RankItem> {}

type RankingContextType = {
    liveRanking: Ranking;
    setLiveRanking: React.Dispatch<React.SetStateAction<Ranking>>;
    currRankingDisplayed: string;
    setCurrRankingDisplayed: React.Dispatch<React.SetStateAction<string>>;
    vote: (id: string) => Promise<void>;
    downVote: (id: string) => Promise<void>;
};

const RankingContext = createContext<RankingContextType | undefined>(undefined);

export const useRanking = () => {
    return useContext(RankingContext);
};

interface Props {
    children: JSX.Element;
}
/**
 * Returns a sorted version of the given ranking
 * @param ranking existing ranking
 */
export const rankItems = (ranking: Ranking) => {
    return [...ranking].sort((a: RankItem, b: RankItem) =>
        a.votes > b.votes ? -1 : a.votes === b.votes ? 0 : 1
    );
};

export const RankingControl: React.FC<Props> = ({ children }) => {
    const [currRankingDisplayed, setCurrRankingDisplayed] = useState<string>(
        () => FRONTEND_FRAMEWORK_NAME
    );
    const [liveRanking, setLiveRanking] = useState<Ranking>(() => []);

    const vote = (id: string) => {
        // get that document
        const docRef = db.collection(currRankingDisplayed).doc(id);
        let clone = [...liveRanking];
        let ind = clone.findIndex((obj) => obj.id === id);
        clone[ind].votes++;
        setLiveRanking(rankItems(clone));
        return docRef.update({
            votes: firebase.firestore.FieldValue.increment(1),
        });
    };

    const downVote = (id: string) => {
        // get that document
        const docRef = db.collection(currRankingDisplayed).doc(id);
        let clone = [...liveRanking];
        let ind = clone.findIndex((obj) => obj.id === id);
        clone[ind].votes--;
        setLiveRanking(rankItems(clone));
        return docRef.update({
            votes: firebase.firestore.FieldValue.increment(-1),
        });
    };

    useEffect(() => {
        const unsubscribe = db
            .collection(currRankingDisplayed)
            .onSnapshot((snapshot) => {
                console.log("Data change detected");
                const res = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return { id: doc.id, name: data.name, votes: data.votes };
                });
                console.log("new data: ", res);
                setLiveRanking(rankItems(res));
            });
        return unsubscribe;
    }, [currRankingDisplayed]);

    useEffect(() => {
        /**
         * Retrieves the latest ranking, returns a promise.
         * @param source
         * @returns
         */
        const retrieveItems = async (source: "server" | "cache") => {
            const snapshot = await db
                .collection(currRankingDisplayed)
                .get({ source: source });
            const res = snapshot.docs.map((doc) => {
                const data = doc.data();
                return { id: doc.id, name: data.name, votes: data.votes };
            });
            return res;
        };
        const processRetrieval = async () => {
            // see if this is the first visit
            if (
                !localStorage.getItem("visited") ||
                localStorage.getItem("visited") !== "holyYes"
            ) {
                retrieveItems("server").then((res) => {
                    setLiveRanking(rankItems(res));
                });
                // after a fresh visit, update local storage so that next time
                // the same user visits, use cached data for performance reasons
                return localStorage.setItem("visited", "holyYes");
            }
            retrieveItems("cache").then((res) => {
                setLiveRanking(rankItems(res));
            });
        };
        processRetrieval();
    }, [currRankingDisplayed]);

    const value = {
        liveRanking: liveRanking,
        setLiveRanking: setLiveRanking,
        currRankingDisplayed,
        setCurrRankingDisplayed,
        vote,
        downVote,
    };

    return (
        <RankingContext.Provider value={value}>
            {children}
        </RankingContext.Provider>
    );
};
