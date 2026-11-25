import { useAppContext } from "@/src/context/AppContext";
import { buttonStyles } from "@/src/styles/commonStyles/buttons";
import { centralizeFlex } from "@/src/styles/commonStyles/centralizeFlex";
import AudioController from "@/src/useCases/AudioController";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  Modal,
  NativeModules,
  Alert
} from "react-native";
import { styles } from "../../src/styles/pagesStyles/homeStyles";

const StorageModule = NativeModules.StorageModule as {
  deleteFile: (filePath: string) => Promise<boolean>;
  getDirs: () => Promise<string[]>;
  getFilesFromDir: (folderPath: string) => Promise<string[]>;
  moveFile: (filePath: string, destinationDir: string) => Promise<boolean>;
  getOrCreate: (folderName: string) => Promise<string>;
};

export default function Home() {
  const { mp3Files, refreshMp3Files } = useAppContext();

  const audioController = new AudioController();

  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const [showPlaylists, setShowPlaylists] = useState(false);
  const [dirsList, setDirsList] = useState<string[]>([]);

  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playlistFiles, setPlaylistFiles] = useState<string[]>([]);

  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);

  const [createPlaylistModalVisible, setCreatePlaylistModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

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

  const togglePlaylists = async () => {
    if (selectedPlaylist) {
      setSelectedPlaylist(null);
      setPlaylistFiles([]);
      return;
    }

    if (showPlaylists) {
      setShowPlaylists(false);
      return;
    }

    try {
      const dirs = await StorageModule.getDirs();
      setDirsList(dirs);
      setShowPlaylists(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as playlists.");
    }
  };

  const openPlaylist = async (playlistDir: string) => {
    try {
      const files = await StorageModule.getFilesFromDir(playlistDir);

      setPlaylistFiles(files);
      setSelectedPlaylist(playlistDir);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir essa playlist.");
    }
  };

  const openPlaylistSelection = async () => {
    setMenuVisible(false);

    try {
      const dirs = await StorageModule.getDirs();
      setDirsList(dirs);
      setPlaylistModalVisible(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as playlists.");
    }
  };

  const moveMusicToPlaylist = async (playlistDir: string) => {
    if (!selectedMusic) return;

    try {
      await StorageModule.moveFile(selectedMusic, playlistDir);

      await refreshMp3Files();

      setPlaylistModalVisible(false);
      setSelectedMusic(null);

      Alert.alert("Sucesso", "Música adicionada à playlist!");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível adicionar a música à playlist."
      );
    }
  };

  const createPlaylist = async () => {
    const name = newPlaylistName.trim();

    if (!name) {
      Alert.alert("Atenção", "Informe um nome para a playlist.");
      return;
    }

    if (name.includes("/") || name.includes("\\")) {
      Alert.alert("Nome inválido", "O nome da playlist não pode conter barras.");
      return;
    }

    try {
      setIsCreatingPlaylist(true);

      await StorageModule.getOrCreate(name);

      const dirs = await StorageModule.getDirs();
      setDirsList(dirs);

      setNewPlaylistName("");
      setCreatePlaylistModalVisible(false);

      Alert.alert("Sucesso", "Playlist criada!");
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message || "Não foi possível criar a playlist."
      );
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

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

  // Define exatamente o conteúdo que será exibido na lista.
  const displayedFiles = selectedPlaylist
    ? playlistFiles
    : showPlaylists
      ? dirsList
      : mp3Files;

  const isShowingMusic = !showPlaylists || selectedPlaylist !== null;

  return (
    <View style={styles.homeContainer}>
      <View style={styles.playContainer}>
        <Pressable
          onPress={() => {
            if (!isShowingMusic) return;
            audioController.playAllMusics(displayedFiles);
          }}
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
          onPress={() => {
            if (!isShowingMusic) return;
            audioController.playAllMusicsRandomly(displayedFiles);
          }}
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
          onPress={togglePlaylists}
          style={[
            buttonStyles.button,
            centralizeFlex.containerFlex,
            { marginTop: "0.5%" },
            showPlaylists && { backgroundColor: "#808080" }
          ]}
        >
          <Image
            style={{ width: 32, height: 32 }}
            source={require("../../assets/icons/playlist.png")}
          />
        </Pressable>
      </View>

      {showPlaylists && !selectedPlaylist && (
        <Pressable
          style={[
            buttonStyles.button,
            {
              width: "80%",
              alignSelf: "center",
              marginBottom: 15,
              backgroundColor: "#0D47A1"
            }
          ]}
          onPress={() => setCreatePlaylistModalVisible(true)}
        >
          <Text style={buttonStyles.textInsideButton}>
            + Criar playlist
          </Text>
        </Pressable>
      )}

      <FlatList
        style={{ width: "100%", flex: 1 }}
        contentContainerStyle={[
          centralizeFlex.containerFlex,
          { padding: 0, paddingBottom: 200 }
        ]}
        data={displayedFiles}
        keyExtractor={(item) => item}
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
                if (showPlaylists && !selectedPlaylist) {
                  openPlaylist(item);
                  return;
                }

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

            {!showPlaylists && !selectedPlaylist && (
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
            )}
          </View>
        )}
      />

      {/* Modal de opções da música */}
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
              onPress={openPlaylistSelection}
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

      {/* Modal de seleção da playlist */}
      <Modal
        visible={playlistModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlaylistModalVisible(false)}
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
            onPress={() => setPlaylistModalVisible(false)}
          />

          <View
            style={{
              width: "85%",
              maxHeight: "70%",
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
              Escolha uma playlist
            </Text>

            {dirsList.length === 0 ? (
              <Text style={{ color: "#AAAAAA", fontSize: 15 }}>
                Nenhuma playlist encontrada.
              </Text>
            ) : (
              <FlatList
                data={dirsList}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      buttonStyles.button,
                      {
                        marginHorizontal: 0,
                        marginBottom: 10,
                        backgroundColor: "#2196F3"
                      }
                    ]}
                    onPress={() => moveMusicToPlaylist(item)}
                  >
                    <Text style={buttonStyles.textInsideButton}>
                      {item.split("/").pop()}
                    </Text>
                  </Pressable>
                )}
              />
            )}

            <Pressable
              style={{ paddingVertical: 12, marginTop: 10 }}
              onPress={() => setPlaylistModalVisible(false)}
            >
              <Text
                style={{
                  color: "#FF7777",
                  fontSize: 16,
                  textAlign: "center"
                }}
              >
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal de criação de playlist */}
      <Modal
        visible={createPlaylistModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreatePlaylistModalVisible(false)}
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
            onPress={() => setCreatePlaylistModalVisible(false)}
          />

          <View
            style={{
              width: "85%",
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
              Nova playlist
            </Text>

            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="Nome da playlist"
              placeholderTextColor="#888888"
              autoFocus
              style={{
                color: "white",
                backgroundColor: "#333333",
                borderRadius: 8,
                padding: 12,
                marginBottom: 20
              }}
            />

            <Pressable
              style={[
                buttonStyles.button,
                { backgroundColor: "#2196F3" }
              ]}
              disabled={isCreatingPlaylist}
              onPress={createPlaylist}
            >
              <Text style={buttonStyles.textInsideButton}>
                {isCreatingPlaylist ? "Criando..." : "Confirmar"}
              </Text>
            </Pressable>

            <Pressable
              style={{ paddingVertical: 12, marginTop: 5 }}
              onPress={() => {
                setCreatePlaylistModalVisible(false);
                setNewPlaylistName("");
              }}
            >
              <Text
                style={{
                  color: "#FF7777",
                  fontSize: 16,
                  textAlign: "center"
                }}
              >
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
