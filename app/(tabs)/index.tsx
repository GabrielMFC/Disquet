import DownloadPage from "@/src/pages/downloadPage";
import Home from "@/src/pages/home";
import { useState } from "react";

export default function HomeScreen() {
  const [selectedPage, setSelectedPage] = useState("")
  
  return (
    <>  
      {selectedPage === "download" ? <DownloadPage/> : <Home/>}
    </>
  );
}