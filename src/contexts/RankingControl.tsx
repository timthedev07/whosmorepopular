import firebase from "firebase/app";
import React, { useContext, createContext, useState, useEffect } from "react";
import { db, auth } from "../firebase";

export const LANGUAGE_COLLECTION_NAME: string = "programming-languages";
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
  currentUser: firebase.User | null;
  signInWithGoogle: () => Promise<firebase.auth.UserCredential>;
  signInWithGithub: () => Promise<firebase.auth.UserCredential>;
  logout: () => Promise<void>;
};

const RankingContext = createContext<RankingContextType | null>(null);

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
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [currRankingDisplayed, setCurrRankingDisplayed] = useState<string>(
    () => FRONTEND_FRAMEWORK_NAME
  );
  const [liveRanking, setLiveRanking] = useState<Ranking>(() => []);

  /**
   * Function for voting a specific item
   * @param {string} id
   */
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

  /**
   * Function for downvoting a specific item
   * @param {string} id
   */
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

  /**
   * Signs a user in with github
   */
  const signInWithGithub = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  /**
   * Signs a user in with github
   */
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  /**
   * Logs an user out
   */
  const logout = () => {
    setCurrentUser(null);
    return auth.signOut();
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

  // updates the state of the user whenever there is a change in the auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  });

  // all of the values we want our consumers to access
  const value = {
    liveRanking: liveRanking,
    setLiveRanking: setLiveRanking,
    currRankingDisplayed,
    setCurrRankingDisplayed,
    vote,
    downVote,
    currentUser,
    signInWithGoogle,
    signInWithGithub,
    logout,
  };

  return (
    <RankingContext.Provider value={value}>{children}</RankingContext.Provider>
  );
};
