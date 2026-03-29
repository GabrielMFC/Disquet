import { useAppContext } from "@/src/context/AppContext";
import { buttonStyles } from "@/src/styles/commonStyles/buttons";
import { centralizeFlex } from "@/src/styles/commonStyles/centralizeFlex";
import AudioController from "@/src/useCases/AudioController";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
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
            <Pressable onPress={() => audioController.playAllMusics(mp3Files)} 
            style={[buttonStyles.button, centralizeFlex.containerFlex,
            {backgroundColor:"#0E5089",marginTop: "15%", height:60, width:"90%"}]}>
                <Text style={buttonStyles.textInsideButton}>Reproduzir tudo</Text>
            </Pressable>
            <FlatList 
              style={{width: "100%"}}
              contentContainerStyle={[centralizeFlex.containerFlex,{padding:0,paddingBottom: 200}]}
              data={mp3Files}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View  style={[centralizeFlex.containerFlex,{marginBottom:"5%",width: '80%',flexDirection:"row" }]}>
                  <Pressable
                    style={[buttonStyles.button, {margin: "0%",flex:1, alignSelf:"stretch"}]}
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
            )}
          />
        </View>
    )
}