import React, { useEffect, useState } from "react";
import { ReactComponent as LBIcon } from "../assets/images/icons/leaderboard.svg";
import { ReactComponent as GithubIcon } from "../assets/images/icons/github.svg";
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg";
import { useRanking } from "../contexts/RankingControl";

export const Nav: React.FC = () => {
  const rankingContext = useRanking();

  const [windowWidth, setWindowWidth] = useState<number>(
    () => window.innerWidth
  );

  useEffect(() => {
    const callBack = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", callBack);
  }, []);

  const signin = (provider: string) => {
    if (!rankingContext) return;
    switch (provider) {
      case "google": {
        rankingContext
          .signInWithGoogle()
          .then((res) => {})
          .catch((err) => {});
        break;
      }
      case "github": {
        rankingContext
          .signInWithGithub()
          .then((res) => {})
          .catch((err) => {});
        break;
      }
    }
  };

  const isSmallScreen = () => {
    return windowWidth < 590;
  };
  if (!rankingContext) return null;

  const handleLogout = () => {
    rankingContext
      .logout()
      .then((res) => {})
      .catch((err) => {});
  };

  return (
    <div className="nav-bar">
      <LBIcon className="nav-bar-item nav-leading-icon" />
      <div className="ui dropdown simple item nav-bar-item">
        <div className="text">Menu</div>
        <i className="dropdown icon"></i>
        <div className="menu">
          {!isSmallScreen() ? (
            <>
              {!rankingContext.currentUser ? (
                <div className="item">
                  <i className="dropdown icon"></i>
                  Sign in with...
                  <div className={`menu right`}>
                    <div onClick={() => signin("github")} className="item">
                      Github&nbsp;
                      <GithubIcon className="nav-menu-icon" />
                    </div>
                    <div onClick={() => signin("google")} className="item">
                      Google&nbsp;
                      <GoogleIcon className="nav-menu-icon" />
                    </div>
                  </div>
                </div>
              ) : (
                <div onClick={() => handleLogout()} className="item">
                  Sign out
                </div>
              )}
              <div className="item">
                <i className="dropdown icon"></i>
                Other leaderboards
                <div className={`menu right`}>
                  <div className="item">Programming Languages</div>
                  <div className="item">Backend Frameworks</div>
                  <div className="item">Machine Learning Libraries</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                style={{ cursor: "default", pointerEvents: "none" }}
                className="item header"
              >
                Sign in with
              </div>
              <div className="item">
                Github&nbsp;
                <GithubIcon className="nav-menu-icon" />
              </div>
              <div className="item">
                Google&nbsp;
                <GoogleIcon className="nav-menu-icon" />
              </div>
              <div className="divider"></div>
              <div
                style={{ cursor: "default", pointerEvents: "none" }}
                className="item header"
              >
                Other leaderboards
              </div>
              <div className="item">Programming Languages</div>
              <div className="item">Backend Frameworks</div>
              <div className="item">Machine Learning Libraries</div>
            </>
          )}
          <div className="item">Manual Refresh</div>
        </div>
      </div>
    </div>
  );
};
