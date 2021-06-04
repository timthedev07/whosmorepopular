import React from "react";
import { ReactComponent as CloseIcon } from "../assets/images/icons/close.svg";

interface Props {
  message: string;
  type: "danger" | "info" | "warning";
  active: boolean;
  handleClose: () => void;
}

export const CustomAlert: React.FC<Props> = ({
  handleClose,
  active,
  type,
  message,
}) => {
  const handleClick = (action: string) => {
    switch (action) {
      case "closePopup": {
        handleClose();
      }
    }
  };

  return (
    <div
      className={`custom-alert custom-alert-${type} ${
        active ? "alert-active" : "alert-inactive"
      }`}
    >
      <p>{message}</p>
      <CloseIcon
        onClick={() => handleClick("closePopup")}
        className="close-icon"
      />
    </div>
  );
};
