
import { useAppContext } from "@/src/context/AppContext";
import { buttonStyles } from "@/src/styles/commonStyles/buttons";
import { centralizeFlex } from "@/src/styles/commonStyles/centralizeFlex";
import AudioController from "@/src/useCases/AudioController";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  Modal,
  NativeModules,
  Alert
} from "react-native";
import { styles } from "../../src/styles/pagesStyles/homeStyles";

const StorageModule = NativeModules.StorageModule as {
  deleteFile: (filePath: string) => Promise<boolean>;
};

export default function Home() {
  const { mp3Files, refreshMp3Files } = useAppContext();

  const audioController = new AudioController();

  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const createMainFolder = async () => {
      const folder = `${FileSystem.documentDirectory}disquet/`;

      if (!(await FileSystem.getInfoAsync(folder)).exists) {
        await FileSystem.makeDirectoryAsync(folder, {
          intermediates: true
        });
      }
    };

    createMainFolder();
  }, []);

  const removeMusic = async () => {
    if (!selectedMusic) return;

    try {
      const deleted = await StorageModule.deleteFile(selectedMusic);

      if (deleted) {
        await refreshMp3Files();
        setMenuVisible(false);
        setSelectedMusic(null);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir essa música.");
    }
  };

  return (
    <View style={styles.homeContainer}>
      <View style={styles.playContainer}>
        <Pressable
          onPress={() => audioController.playAllMusics(mp3Files)}
          style={[
            buttonStyles.button,
            centralizeFlex.containerFlex,
            { marginTop: "10%" }
          ]}
        >
          <Image
            style={{ width: 32, height: 32 }}
            source={require("../../assets/icons/play.png")}
          />
        </Pressable>

        <Pressable
          onPress={() => audioController.playAllMusicsRandomly(mp3Files)}
          style={[
            buttonStyles.button,
            centralizeFlex.containerFlex,
            { marginTop: "0.5%" }
          ]}
        >
          <Image
            style={{ width: 32, height: 32 }}
            source={require("../../assets/icons/playrandom.png")}
          />
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/playLists")}
          style={[
            buttonStyles.button,
            centralizeFlex.containerFlex,
            { marginTop: "0.5%" }
          ]}
        >
          <Image
            style={{ width: 32, height: 32 }}
            source={require("../../assets/icons/playlist.png")}
          />
        </Pressable>
      </View>

      <FlatList
        style={{ width: "100%" }}
        contentContainerStyle={[
          centralizeFlex.containerFlex,
          { padding: 0, paddingBottom: 200 }
        ]}
        data={mp3Files}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              width: "80%",
              marginBottom: "5%",
              flexDirection: "row",
              alignItems: "stretch",
              backgroundColor: "#2196F3",
              borderRadius: 8,
              overflow: "hidden"
            }}
          >
            {/* Área clicável da música */}
            <Pressable
              style={[
                buttonStyles.button,
                {
                  flex: 1,
                  margin: 0,
                  backgroundColor: "transparent",
                  borderRadius: 0
                }
              ]}
              onPress={() => {
                audioController.setLockScreen(
                  item,
                  item.split("/").pop() as string
                );

                audioController.play();
              }}
            >
              <Text style={buttonStyles.textInsideButton}>
                {item.split("/").pop()}
              </Text>
            </Pressable>

            {/* Botão de opções dentro do card */}
            <Pressable
              style={{
                width: 45,
                backgroundColor: "#123B65",
                alignItems: "center",
                justifyContent: "center"
              }}
              onPress={() => {
                setSelectedMusic(item);
                setMenuVisible(true);
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 23,
                  fontWeight: "bold"
                }}
              >
                ⋮
              </Text>
            </Pressable>
          </View>
        )}
      />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }}
            onPress={() => setMenuVisible(false)}
          />

          <View
            style={{
              width: "75%",
              backgroundColor: "#1E1E1E",
              borderRadius: 12,
              padding: 20
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                marginBottom: 20
              }}
            >
              Opções da música
            </Text>

            <Pressable
              style={{ paddingVertical: 12 }}
              onPress={() => {
                setMenuVisible(false);
                router.push("/(tabs)/playLists");
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>
                Adicionar na playlist
              </Text>
            </Pressable>

            <Pressable
              style={{ paddingVertical: 12 }}
              onPress={removeMusic}
            >
              <Text style={{ color: "#FF5555", fontSize: 16 }}>
                Remover música
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
