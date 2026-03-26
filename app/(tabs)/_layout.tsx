import BottomBar from '@/src/components/bottomBar/BottomBar';
import { AppProvider, useAppContext } from '@/src/context/AppContext';
import DownloadPage from '@/src/pages/downloadPage';
import Home from '@/src/pages/home';
import { PlaybackService } from '@/src/player/musicBackgroundService';
import AudioController from '@/src/useCases/AudioController';
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability, State } from 'react-native-track-player';
TrackPlayer.registerPlaybackService(() => PlaybackService);

async function configurePlayer() {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause],
      compactCapabilities: [Capability.Play, Capability.Pause],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
    });
  } catch (e) {
  }
}

function AppContent() {
    const { selectedPage } = useAppContext()

    return (
        <View style={styles.container}>
            {(selectedPage === "home" || selectedPage === "") && <Home />}
            {selectedPage === "download" && <DownloadPage />}
            <BottomBar />
        </View>
    )
}

export default function Layout() {
  const [mp3Files, setMp3Files] = useState<string[]>([])
  const audioController = new AudioController()
  const {selectedPage} = useAppContext()
  
  useEffect(() => {
    const createMainFolder = async () => {
      const folder = `${FileSystem.documentDirectory}disquet/`;
      if (!(await FileSystem.getInfoAsync(folder)).exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }
    createMainFolder()
  }, [])

  useEffect(() => {
    const showAllFiles = async () => {
      const files = await audioController.getMp3FilesList()
      setMp3Files(files)
    }
    showAllFiles()
  }, [])

  useEffect(() => {
    configurePlayer()
  }, [])

  async function togglePlayPause() {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }

  return (
    <AppProvider>
    <SafeAreaProvider>
      <View style={styles.container}>
        <AppContent/>
        <BottomBar/>
      </View>
    </SafeAreaProvider>
    </AppProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "black"
  }
})