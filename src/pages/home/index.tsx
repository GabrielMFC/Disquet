import { buttonStyles } from "@/src/commonStyles/buttons";
import AudioController from "@/src/useCases/AudioController";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { styles } from "./styles";

export default function Home() {
      const [mp3Files, setMp3Files] = useState<string[]>([])
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
    return (
        <View style={styles.homeContainer}>
            <Pressable onPress={() => audioController.playAllMusics(mp3Files)} style={[buttonStyles.button, {marginTop: "15%", backgroundColor: "#075fa7"}]}>
                <Text style={buttonStyles.textInsideButton}>Reproduzir tudo</Text>
            </Pressable>
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
        </View>
    )
}