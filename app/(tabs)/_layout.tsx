import { Buffer } from 'buffer';
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const playAudio = async (uri: string, soundRef: React.RefObject<Audio.Sound | null>) => {
  try {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    soundRef.current = sound;

  } catch (error) {
    console.error('Erro ao tocar áudio:', error);
  }
};
const getMp3File = async (mp3URL: string) => {
  const folder = `${FileSystem.cacheDirectory}disquet/`;
  if (!(await FileSystem.getInfoAsync(folder)).exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
  
  const res = await fetch(process.env.EXPO_PUBLIC_YT_DLP_API?.trim()! as string, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: mp3URL }),
  });

  const arrayBuffer = await res.arrayBuffer();
  const fileName =
    res.headers
      .get('content-disposition')
      ?.match(/filename="?([^"]+)"?/)?.[1]
    || 'default.mp3';
  const fileUri = `${folder}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, Buffer.from(arrayBuffer).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
  console.log('MP3 salvo em:', fileUri);
};

async function showMp3Files() {
  try {
    const folder = `${FileSystem.cacheDirectory}disquet/`;

    const dirInfo = await FileSystem.getInfoAsync(folder);
    if (!dirInfo.exists) {
      console.log('Pasta disquet não existe.');
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(folder);

    const mp3Files = files
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .map(file => `${folder}${file}`);

    console.log('MP3 encontrados:', mp3Files);

    return mp3Files;
  } catch (error) {
    console.error('Erro ao listar MP3:', error);
    return [];
  }
}

export default function Layout() {
  const [url, setUrl] = useState('')
  const [mp3Files, setMp3Files] = useState<string[]>([])
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const showAllFiles = async () => {
      const files = await showMp3Files()
      setMp3Files(files)
    }
    showAllFiles()
  }, [])

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
    <FlatList
            data={mp3Files}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.button}
                onPress={() => playAudio(item, soundRef)}
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