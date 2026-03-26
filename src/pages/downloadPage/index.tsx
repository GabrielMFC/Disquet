import { buttonStyles } from "@/src/commonStyles/buttons"
import { inputStyles } from "@/src/commonStyles/input"
import AudioController from "@/src/useCases/AudioController"
import { useState } from "react"
import { Alert, Pressable, Text, TextInput, View } from "react-native"
import { styles } from "./styles"

export default function DownloadPage() {
    const [url, setUrl] = useState('')
    const [blockDownloadButton, setBlockDownloadButton] = useState(false)
    const [mp3Files, setMp3Files] = useState<string[]>([])
    const audioController = new AudioController()

    return (
        <View style={styles.downloadContainer}>
        <TextInput
            style={inputStyles.input}
            placeholder="Cole o link da música..."
            value={url}
            onChangeText={setUrl}
        />
        <Pressable
            style={[buttonStyles.button, !blockDownloadButton ? buttonStyles.downloadButon : buttonStyles.disableButton, {width: "90%"}]}
            disabled={blockDownloadButton}
            onPress={async () => {
            setBlockDownloadButton(true)
            try {
                Alert.alert("Sua música está em processo de download!")
                await audioController.downloadAudio(url)
                const files = await audioController.getMp3FilesList()
                setMp3Files(files)
                
                Alert.alert("Sua música foi baixada!") 
            } catch (error) {
                Alert.alert("Ocorreu um erro, tente novamente mais tarde.")
                console.log(error);
            }
            finally{
                setBlockDownloadButton(false)
            }
            }}
            ><Text style={buttonStyles.textInsideButton}>Baixar música</Text></Pressable>
        </View>
    )
}