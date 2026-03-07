import { Buffer } from 'buffer';
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';


// const downloadsDir = FileSystem.documentDirectory + 'disquet/';

// async function clearDownloads() {
//   try {
//     const files = await FileSystem.readDirectoryAsync(downloadsDir);
//     for (const file of files) {
//       await FileSystem.deleteAsync(downloadsDir + file);
//     }
//     console.log('Downloads apagados');
//   } catch (err) {
//     console.log('Não há arquivos para apagar', err);
//   }
// }

// clearDownloads();

const playAudio = async (uri: string) => {

    // await Audio.setAudioModeAsync({
    //   allowsRecordingIOS: false,
    //   staysActiveInBackground: true,
    //   interruptionModeIOS: Audio.,
    //   playsInSilentModeIOS: true,
    //   shouldDuckAndroid: true,
    //   interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
    // });
    const audio = useAudioPlayer(uri)
};
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
  console.log('MP3 salvo em:', fileUri);
  console.log("Status:", res.status);
  
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

  const player = useAudioPlayer(audio)

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
      setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, [])

  useEffect(() => {
    player.setActiveForLockScreen(true, {
      title: "Disquet",
      artist: "artista",
      albumTitle: "album",
      artworkUrl: "https://example.com/artwork.jpg"
    })
  }, [player])
  const playMusic = () => {
    player.play()
  }

  const pauseMusic = () => {
    player.pause()

    player.setActiveForLockScreen(false)
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
        <Pressable style={styles.button} onPress={() => {pauseMusic()}}><Text style={styles.textInsideButton}>Pause</Text></Pressable>
      </View>
    <FlatList
            data={mp3Files}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.button}
                onPress={() => {
                  setAudio(item)
                  playMusic()
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