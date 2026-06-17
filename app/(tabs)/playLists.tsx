import { buttonStyles } from "@/src/styles/commonStyles/buttons";
import { centralizeFlex } from "@/src/styles/commonStyles/centralizeFlex";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, NativeModules, Pressable, Text, View } from "react-native";


const mockPlaylistDirs: string[] = ["Dir1", "Dir2", "Dir3"]

export default function playLists() {
  const[dirsList, setDirsList] = useState<String[]>([])
  useEffect(() => {
    const PlayListsDirs = async () => {
      const dir = setDirsList(await NativeModules.StorageModule.getDirs())
    }
    PlayListsDirs()
  }, [])
  console.log(dirsList);
  
  
    return (
        <View>
            <View><Pressable style={[buttonStyles.button, {marginTop: "14%"}]} onPress={() => router.push("/(tabs)/home")}><Text>X</Text></Pressable></View>
            <View><Pressable style={[buttonStyles.button, {marginTop: "0.5%"}]} onPress={() => NativeModules.StorageModule.getOrCreate("primeiraPlaylist")}><Text>Criar playlist</Text></Pressable></View>

            <FlatList 
              style={{width: "100%"}}
              contentContainerStyle={[centralizeFlex.containerFlex,{padding:0,paddingBottom: 200}]}
              data={dirsList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View  style={[centralizeFlex.containerFlex,{marginBottom:"5%",width: '80%',flexDirection:"row" }]}>
                  <Pressable
                    style={[buttonStyles.button, {margin: "0%",flex:1, alignSelf:"stretch", backgroundColor: "#2196F3"}]}
                    onPress={() => {
                      null
                    }}
                    >
                    <Text style={buttonStyles.textInsideButton}>
                      {item.split("/").pop()}
                    </Text>
                  </Pressable>
                </View>
            )}/>
        </View>
    )
}