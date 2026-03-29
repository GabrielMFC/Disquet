import AudioController from "@/src/useCases/AudioController";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext<any>("")

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mp3Files, setMp3Files] = useState<string[]>([])
  const audioController = new AudioController()

  const refreshMp3Files = async () => {
    const files = await audioController.getMp3FilesList()
    setMp3Files(files)
  }

  useEffect(() => {
    refreshMp3Files()
  }, [])

  return (
    <AppContext.Provider value={{ mp3Files, refreshMp3Files }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);