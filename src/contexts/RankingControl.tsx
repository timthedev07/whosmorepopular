import firebase from "firebase/app";
import React, { useContext, createContext, useState, useEffect } from "react";
import { db, auth } from "../firebase";

export const LANGUAGE_COLLECTION_NAME: string = "programming-languages";
export const BACKEND_FRAMEWORK_NAME: string = "backend-frameworks";
export const FRONTEND_FRAMEWORK_NAME: string = "frontend-frameworks";
export const MACHINE_LEARNING_NAME: string = "machine-learning-libraries";

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
  switchLeaderboard: (target: string) => void;
  otherLeaderboards: string[];
  canVote: boolean;
  incrementVoteRecord: () => void;
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
    () => {
      return localStorage.getItem("leaderboard") || FRONTEND_FRAMEWORK_NAME;
    }
  );
  const [canVote, setCanVote] = useState<boolean>(false);
  const [liveRanking, setLiveRanking] = useState<Ranking>(() => []);
  const [otherLeaderboards, setOtherLeaderboards] = useState<Array<string>>([]);

  const switchLeaderboard = (target: string) => {
    setCurrRankingDisplayed(target);
    localStorage.setItem("leaderboard", target);
  };

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

  const incrementVoteRecord = () => {
    if (!currentUser) return;
    const userInfoRef = db.collection("u").doc(currentUser.uid);
    userInfoRef.update({
      v: firebase.firestore.FieldValue.increment(1),
    });
  };

  /**
   * Logs an user out
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user-info");
    return auth.signOut();
  };

  useEffect(() => {
    setOtherLeaderboards(
      [
        LANGUAGE_COLLECTION_NAME,
        BACKEND_FRAMEWORK_NAME,
        MACHINE_LEARNING_NAME,
        FRONTEND_FRAMEWORK_NAME,
      ].filter((each) => each !== currRankingDisplayed)
    );
  }, [currRankingDisplayed]);

  useEffect(() => {
    const checkUserVotes = () => {
      if (!currentUser) return;
      let hasUserInfo = localStorage.getItem("user-info");
      const userInfoRef = db.collection("u").doc(currentUser.uid);
      userInfoRef
        .get({ source: hasUserInfo ? "cache" : "server" })
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            userInfoRef.onSnapshot((doc) => {
              // here we implement the logic of limiting user's votes per day

              const data = doc.data();
              if (!data) return;
              let today = new Date();
              today.setHours(0, 0, 0, 0);

              // first start off by getting the different between the
              // date where the limit was hit and today
              let diffInDays =
                Math.abs(data.dt.toDate().valueOf() - today.valueOf()) /
                (60 * 60 * 24 * 1000);

              // if that diff is greater than one, meaning the limit
              // is going to be reset today
              if (diffInDays >= 1) {
                userInfoRef.update({
                  v: 0,
                  dt: firebase.firestore.Timestamp.fromDate(today),
                });
                setCanVote(true);
              } else if (data.v < 10) {
                // otherwise if there is still some votes left today
                setCanVote(true);
              } else {
                // else that means the user hit the limit today
                setCanVote(false);
              }
            });
          } else {
            let today = new Date();
            today.setHours(0, 0, 0, 0);
            userInfoRef.set({
              v: 0,
              dt: firebase.firestore.Timestamp.fromDate(today),
            });
            localStorage.setItem("user-info", "valid");
            setCanVote(true);
          }
        });
    };
    checkUserVotes();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = db
      .collection(currRankingDisplayed)
      .onSnapshot((snapshot) => {
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
    switchLeaderboard,
    otherLeaderboards,
    canVote,
    incrementVoteRecord,
  };

  return (
    <RankingContext.Provider value={value}>{children}</RankingContext.Provider>
  );
};
