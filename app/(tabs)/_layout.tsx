import { buttonStyles } from '@/src/commonStyles/buttons';
import BottomBar from '@/src/components/bottomBar/BottomBar';
import { PlaybackService } from '@/src/player/musicBackgroundService';
import AudioController from '@/src/useCases/AudioController';
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

export default function Layout() {
  const [url, setUrl] = useState('')
  const [mp3Files, setMp3Files] = useState<string[]>([])
  const [blockDownloadButton, setBlockDownloadButton] = useState(false)
  const audioController = new AudioController()

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
    <SafeAreaProvider>
    <View style={styles.container}>
      <View style={styles.downloadContainer}>
        <TextInput
          style={styles.input}
          placeholder="Cole o link da música..."
          value={url}
          onChangeText={setUrl}
        />
        <Pressable
          style={[buttonStyles.button, !blockDownloadButton ? buttonStyles.downloadButon : buttonStyles.disableButton, {width: "90%"}]}
          disabled={blockDownloadButton}
          onPress={async () => {
            setBlockDownloadButton(true)
            try {
              Alert.alert("Sua música está em processo de download!")
              await audioController.downloadAudio(url)
              const files = await audioController.getMp3FilesList()
              setMp3Files(files)
              
              Alert.alert("Sua música foi baixada!") 
            } catch (error) {
              Alert.alert("Ocorreu um erro, tente novamente mais tarde.")
              console.log(error);
            }
            finally{
              setBlockDownloadButton(false)
            }
          }}
            ><Text style={buttonStyles.textInsideButton}>Baixar música</Text></Pressable>
      </View>
      <View>
        <Pressable style={buttonStyles.button} onPress={() => {togglePlayPause()}}><Text style={buttonStyles.textInsideButton}>Pause</Text></Pressable>
      </View>
      <FlatList
            data={mp3Files}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={buttonStyles.button}
                onPress={() => {
                  audioController.setLockScreen(item, item.split("/").pop() as string)
                  audioController.play()
                }}
              >
                <Text style={buttonStyles.textInsideButton}>
                  {item.split('/').pop()}
                </Text>
              </Pressable>
              
            )}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        <BottomBar/>
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  downloadContainer: {
    top: "5%",
    marginTop: "5%",
    marginBottom: "7%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column"
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