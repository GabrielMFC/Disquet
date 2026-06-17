import { useAppContext } from "@/src/context/AppContext";
import { buttonStyles } from "@/src/styles/commonStyles/buttons";
import { centralizeFlex } from "@/src/styles/commonStyles/centralizeFlex";
import AudioController from "@/src/useCases/AudioController";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { useEffect } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { styles } from "../../src/styles/pagesStyles/homeStyles";

export default function Home() {
      const {mp3Files, setMp3Files} = useAppContext()
      const audioController = new AudioController()
      
      useEffect(() => {
        const createMainFolder = async () => {
          const folder = `${FileSystem.documentDirectory}disquet/`;
          if (!(await FileSystem.getInfoAsync(folder)).exists) await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
        }
        createMainFolder()
      }, [])
    
    return (
        <View style={styles.homeContainer}>
            <View style={styles.playContainer}>
              <Pressable onPress={() => audioController.playAllMusics(mp3Files)}
              style={[buttonStyles.button, centralizeFlex.containerFlex,
              {marginTop: "10%"}]}>
                <Image style={{ width: 32, height: 32 }} source={require("../../assets/icons/play.png")}/>
              </Pressable>
              <Pressable onPress={() => audioController.playAllMusicsRandomly(mp3Files)}
              style={[buttonStyles.button, centralizeFlex.containerFlex,
              {marginTop: "0.5%"}]}>
                <Image style={{ width: 32, height: 32 }} source={require("../../assets/icons/playrandom.png")}/>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/playLists")}
              style={[buttonStyles.button, centralizeFlex.containerFlex,
              {marginTop: "0.5%"}]}>
                <Image style={{ width: 32, height: 32 }} source={require("../../assets/icons/playlist.png")}/>
              </Pressable>
            </View>

            <FlatList 
              style={{width: "100%"}}
              contentContainerStyle={[centralizeFlex.containerFlex,{padding:0,paddingBottom: 200}]}
              data={mp3Files}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View  style={[centralizeFlex.containerFlex,{marginBottom:"5%",width: '80%',flexDirection:"row" }]}>
                  <Pressable
                    style={[buttonStyles.button, {margin: "0%",flex:1, alignSelf:"stretch", backgroundColor: "#2196F3"}]}
                    onPress={() => {
                      audioController.setLockScreen(item, item.split("/").pop() as string)
                      audioController.play()
                    }}
                    >
                    <Text style={buttonStyles.textInsideButton}>
                      {item.split('/').pop()}
                    </Text>
                  </Pressable>
                </View>
            )}/>
            
        </View>
    )
}