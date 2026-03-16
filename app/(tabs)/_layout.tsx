import { PlaybackService } from '@/src/player/musicBackgroundService';
import AudioController from '@/src/useCases/AudioController';
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [audio, setAudio] = useState("")
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
    <>
    <View style={styles.container}>
      <View style={styles.downloadContainer}>
        <TextInput
          style={styles.input}
          placeholder="Cole o link da música..."
          value={url}
          onChangeText={setUrl}
        />
        <Pressable
          style={[styles.button, styles.downloadButon]}
          onPress={async () => {
            try {
              Alert.alert("Sua música está em processo de download!")
              await audioController.downloadAudio(url)
              const files = await audioController.getMp3FilesList()
              setMp3Files(files)
              Alert.alert("Sua música foi baixada!") 
            } catch (error) {
              Alert.alert("Ocorreu um erro, tente novamente mais tarde.")
            }
          }}
            ><Text style={styles.textInsideButton}>Baixar música</Text></Pressable>
      </View>
      <View>
        <Pressable style={styles.button} onPress={() => {togglePlayPause()}}><Text style={styles.textInsideButton}>Pause</Text></Pressable>
      </View>
    <FlatList
            data={mp3Files}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.button}
                onPress={() => {
                  setAudio(item)
                  audioController.setLockScreen(item, item.split("/").pop() as string)
                  audioController.play()
                }}
              >
                <Text style={styles.textInsideButton}>
                  {item.split('/').pop()}
                </Text>
              </Pressable>
              
            )}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  downloadContainer: {
    top: "5%",
    marginTop: "5%",
    marginBottom: "7%"
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: "black"
  },
  button: {
    margin: "5%",
    textAlign: "center",
    backgroundColor: "#2196F3",
    color: "white",
    padding: "5%",
    borderRadius: 5
  },
  downloadButon: {
    backgroundColor: "#075fa7"
  },
  textInsideButton: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  }
})