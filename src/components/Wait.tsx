import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";

interface Props {
  message: string;
  timeScale: number;
  display: boolean;
  closePopup: () => void;
}

export const Wait: React.FC<Props> = ({
  timeScale,
  message,
  display,
  closePopup,
}) => {
  const [timePassed, setTimePassed] = useState<number>(0);

  useEffect(() => {
    const delay = () => {
      return new Promise((resolve) => setTimeout(resolve, 1));
    };

    const updateTime = async () => {
      await delay();
      setTimePassed((prev) => {
        return prev + 1;
      });
    };

    const f = async () => {
      if (!display) return;
      let ms = timeScale * 500;
      for (let i = 0; i < ms; i++) {
        await updateTime();
      }
      setTimePassed(0);
      closePopup();
    };
    f();
  }, [timeScale, display, closePopup]);

  if (!display) return null;

  return (
    <div className="wait-popup-container">
      <div className="wait-popup">
        <div className="wait-popup-content">{message}</div>
        <ProgressBar
          className="wait-progress-bar"
          variant="danger"
          now={(timePassed / (timeScale * 500)) * 100}
        />
      </div>
    </div>
  );
};
