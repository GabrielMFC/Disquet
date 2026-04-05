import AudioController from "@/src/useCases/AudioController";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext<any>("")

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mp3Files, setMp3Files] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgression, setDownloadProgression] = useState(0)
  const audioController = new AudioController()

  const refreshMp3Files = async () => {
    const files = await audioController.getMp3FilesList()
    setMp3Files(files)
  }

  useEffect(() => {
    refreshMp3Files()
  }, [])

  return (
    <AppContext.Provider value={{ mp3Files, refreshMp3Files, isDownloading, setIsDownloading, downloadProgression, setDownloadProgression }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);