import { buttonStyles } from "@/src/commonStyles/buttons"
import { inputStyles } from "@/src/commonStyles/input"
import AudioController from "@/src/useCases/AudioController"
import { useEffect, useState } from "react"
import { Alert, NativeEventEmitter, NativeModules, Pressable, Text, TextInput, View } from "react-native"
import { styles } from "./styles"

export default function DownloadPage() {
    const [url, setUrl] = useState('')
    const [blockDownloadButton, setBlockDownloadButton] = useState(false)
    const [mp3Files, setMp3Files] = useState<string[]>([])
    const [downloadProgression, setDownloadProgression] = useState(0)
    const [statusText, setStatusText] = useState("")
    const { YtDlp } = NativeModules;
    const emitter = useState(() => new NativeEventEmitter(YtDlp))[0];
    const audioController = useState(() => new AudioController())[0];

    useEffect(() => {
        const progressSub = emitter.addListener("downloadProgress", (progress) => {
            const p = Number(progress);
            if (p < 0) return;
            
            setDownloadProgression(prev => Math.max(prev, p));
        });

        const statusSub = emitter.addListener("downloadStatus", (text) => {
            
            setStatusText(text);
        });

        const completeSub = emitter.addListener("downloadComplete", async () => {
            const files = await audioController.getMp3FilesList();
            setMp3Files(files);

            setBlockDownloadButton(false);
            Alert.alert("Sua música foi baixada!");
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
        />
        <Pressable
            style={[buttonStyles.button, !blockDownloadButton ? buttonStyles.downloadButon : buttonStyles.disableButton, {width: "90%"}]}
            disabled={blockDownloadButton}
            onPress={() => {
                setDownloadProgression(0);
                setStatusText("Preparando...");
                setBlockDownloadButton(true);

                audioController.downloadAudio(url);
            }}
            ><Text style={buttonStyles.textInsideButton}>Baixar música</Text></Pressable>
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
        </View>
    )
}