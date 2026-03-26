import { createContext, useContext, useState } from "react";

const AppContext = createContext<any>("")

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [selectedPage, setSelectedPage] = useState("");

    return (
        <AppContext.Provider value={{ selectedPage, setSelectedPage }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);