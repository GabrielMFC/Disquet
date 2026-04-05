import { useAppContext } from "@/src/context/AppContext"
import { buttonStyles } from "@/src/styles/commonStyles/buttons"
import { inputStyles } from "@/src/styles/commonStyles/input"
import AudioController from "@/src/useCases/AudioController"
import { useState } from "react"
import { Alert, FlatList, NativeModules, Pressable, Text, TextInput, View } from "react-native"
import { styles } from "../../src/styles/pagesStyles/searchStyles"
const {YoutubeSearch} = NativeModules

export default function SearchPage() {
    const [music, setMusic] = useState("")
    const {isDownloading, setIsDownloading} = useAppContext()
    const {downloadProgression, setDownloadProgression} = useAppContext()
    type Music = {
        title: string
        url: string
    }
    const [results, setResults] = useState<Music[]>([])
    const [searchingStatus, setSearchingStatus] = useState("")
    const audioController = useState(() => new AudioController())[0]

    async function getMusics (query: string, ammount: number) {
        try {
            const results = await YoutubeSearch.search(query, ammount)
            setSearchingStatus("")
            setResults(results)
        } catch (error) {
            console.log(error);
        }
    }

    return(
        <View style={styles.searchContainer}>
            <TextInput 
                placeholder="Pesquise sua música..." 
                style={inputStyles.input}
                value={music}
                onChangeText={setMusic}
                placeholderTextColor="gray"
            />

            <Pressable style={[buttonStyles.button, {width:"90%"}]} onPress={() => {
                setResults([])
                setSearchingStatus("searching")
                getMusics(music,10)}}
                >
                <Text style={buttonStyles.textInsideButton}>Pesquisar</Text>
            </Pressable>
            
            { 
                searchingStatus === "" && !results?
                    <Text style={{color: "black", width: "100%", marginTop: "15%", fontSize: 18, textAlign: "center"}}>Utilize o campo de pesquisa para achar suas músicas.</Text>
                :
                searchingStatus === "searching" ?
                    <Text style={{color: "black", width: "100%", marginTop: "15%", fontSize: 24, textAlign: "center"}}>Pesquisando...</Text>
                :
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={[{padding:0,paddingBottom: 120}]}
                    renderItem={({ item }) => (
                        <View style={{ padding: 12 }}>
                        <Text style={{color: "black", textAlign: "center"}}>{item.title}</Text>

                        <Pressable
                            style={[
                                buttonStyles.button,
                                {
                                    marginTop: 8,
                                    padding: 8,
                                    backgroundColor: "#2196F3"
                                }
                            ]}
                            onPress={() => {
                                if (isDownloading) {
                                    Alert.alert("Há um download em andamento!")
                                    return null
                                }
                                setDownloadProgression(0)
                                setIsDownloading(true)
                                audioController.downloadAudio(item.url)
                            }}
                        >
                            <Text style={buttonStyles.textInsideButton}>
                            Baixar
                            </Text>
                        </Pressable>
                        </View>
                    )}
                />
            }
        </View>
    )
}