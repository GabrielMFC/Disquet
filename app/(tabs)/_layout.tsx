import { Buffer } from 'buffer';
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import TrackPlayer, { Capability, State } from 'react-native-track-player';

TrackPlayer.registerPlaybackService(() => require('../../musicBackgroundService'));

async function configurePlayer() {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause],
    });
  } catch (e) {
  }
}

async function playAudio(uri: string, artist: string) {
  await TrackPlayer.reset();
  await TrackPlayer.add({ url: uri, title: 'Disquet', artist: artist });
  await TrackPlayer.play();
}

const getMp3File = async (mp3URL: string) => {
  const folder = `${FileSystem.documentDirectory}disquet/`;

  const res = await fetch("https://disquetapi-production.up.railway.app/download", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: mp3URL }),
  });

  const arrayBuffer = await res.arrayBuffer();
  if (res.status !== 200 && res.status !== 201) {
    Alert.alert("A requisição falhou.")
    console.log(res.status);
    throw new Error("Request failed.")
  }
  const fileName =
    (res.headers
      .get('content-disposition')
      ?.match(/filename="?([^"]+)"?/)?.[1]
      || 'default.mp3'
    ).replace(/[\/\\\?%*:|"<>]/g, '-');
  
  const fileUri = `${folder}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, Buffer.from(arrayBuffer).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
};

async function showMp3Files() {
  try {
  const folder = `${FileSystem.documentDirectory}disquet/`;

    const dirInfo = await FileSystem.getInfoAsync(folder);
    if (!dirInfo.exists) {
      console.log('Pasta disquet não existe.');
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(folder);

    const mp3Files = files
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(file => `${folder}${file}`);

    return mp3Files;
  } catch (error) {
    console.error('Erro ao listar MP3:', error);
    return [];
  }
}

export default function Layout() {
  const [url, setUrl] = useState('')
  const [mp3Files, setMp3Files] = useState<string[]>([])
  const [audio, setAudio] = useState("")

  useEffect(() => {
    const createMainFolder = async () => {
      const folder = `${FileSystem.documentDirectory}disquet/`;
      if (!(await FileSystem.getInfoAsync(folder)).exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }
    createMainFolder()
  }, [])

  useEffect(() => {
    const showAllFiles = async () => {
      const files = await showMp3Files()
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
            Alert.alert("Sua música está em processo de download!")
            await getMp3File(url)
            const files = await showMp3Files()
            setMp3Files(files)
            Alert.alert("Sua música foi baixada!")
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
                  playAudio(item, item.split("/").pop() as string)
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