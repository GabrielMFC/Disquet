import { useAppContext } from "@/src/context/AppContext"
import { buttonStyles } from "@/src/styles/commonStyles/buttons"
import { inputStyles } from "@/src/styles/commonStyles/input"
import AudioController from "@/src/useCases/AudioController"
import { useEffect, useState } from "react"
import { Alert, NativeEventEmitter, NativeModules, Pressable, Text, TextInput, View } from "react-native"
import { styles } from "../../src/styles/pagesStyles/downloadStyles"

export default function DownloadPage() {
    const [url, setUrl] = useState('')
    const [blockDownloadButton, setBlockDownloadButton] = useState(false)
    const [mp3Files, setMp3Files] = useState<string[]>([])
    const {downloadProgression, setDownloadProgression} = useAppContext()
    const [statusText, setStatusText] = useState("")
    const {isDownloading, setIsDownloading} = useAppContext()
    const {refreshMp3Files} = useAppContext()

    const { YtDlp } = NativeModules;
    const emitter = useState(() => new NativeEventEmitter(YtDlp))[0];
    const audioController = useState(() => new AudioController())[0];

    useEffect(() => {
        const progressSub = emitter.addListener("downloadProgress", (progress) => {
            const p = Number(progress);
            if (p < 0) return;

            setDownloadProgression((prev: number) => Math.max(prev, p));
        });

        const statusSub = emitter.addListener("downloadStatus", (text) => {
            
            setStatusText(text);
        });

        const completeSub = emitter.addListener("downloadComplete", async () => {

            setBlockDownloadButton(false);
            Alert.alert("Sua música foi baixada!");
            await refreshMp3Files()
            setIsDownloading(false);
        });

        return () => {
            progressSub.remove();
            statusSub.remove();
            completeSub.remove();
        };
    }, []);

    return (
        <View style={styles.downloadContainer}>
        <TextInput
            style={inputStyles.input}
            placeholder="Cole o link da música..."
            value={url}
            onChangeText={setUrl}
            placeholderTextColor="gray"
        />
        <Pressable
            style={[buttonStyles.button, !blockDownloadButton ? buttonStyles.downloadButon : buttonStyles.disableButton, {width: "90%"}]}
            disabled={blockDownloadButton}
            onPress={() => {
                setIsDownloading(true)
                setDownloadProgression(0);
                setStatusText("Preparando...");
                setBlockDownloadButton(true);

                audioController.downloadAudio(url);
            }}
            ><Text style={buttonStyles.textInsideButton}>Baixar música</Text></Pressable>
            {
                isDownloading ?
                <View style={{ width: "80%" }}>
                <Text style={[buttonStyles.textInsideButton, {color:"black"}]}>
                    {statusText} {downloadProgression > 0 ? `${Math.floor(downloadProgression)}%` : ""}
                </Text>

                <View style={{ height: 40, borderWidth: 0.5 }}>
                    <View style={{
                    backgroundColor: "#32CD34",
                    height: "100%",
                    width: `${downloadProgression}%`
                    }} />
                </View>
                </View>
                : null
            }
        </View>
    )
}