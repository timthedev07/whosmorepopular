import React, { useContext, createContext } from "react";

type AuthContextType = {
    currentUser: undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    return useContext(AuthContext);
};
