import { Alert, NativeModules } from "react-native";
import TrackPlayer from "react-native-track-player";
const {YtDlp} = NativeModules
const {StorageModule} = NativeModules

export default class AudioController {
    public async getMp3FilesList() {
        try {
            const files = await StorageModule.getFiles() as string[]
            const mp3Files = files
                .filter(file => file.toLowerCase())
                .map(file => `${file}`);
    
        return mp3Files;
        } catch (error) {
            console.error('Erro ao listar MP3:', error);
            return [];
        }
    }

    public async setLockScreen(uri: string, artist: string) {
        await TrackPlayer.reset()
        await TrackPlayer.add({url: uri, title: "Disquet", artist: artist})
    }

    public async downloadAudio(url: string) {
        try {
            Alert.alert("Download iniciado!")
            await YtDlp.download(url);
        } catch (e) {
            console.log("Erro original:", e);
            throw e;
        }
    }

    public async play() {
        await TrackPlayer.play()
    }

    private shuffle(array: string[]) {
        const arr = [...array]
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    }

    public async playAllMusicsRandomly(musicsList: string[]) {
        await TrackPlayer.reset()

        const shuffledList = this.shuffle(musicsList)

        for (let i = 0; i < shuffledList.length; i++) {
            await TrackPlayer.add([{
                id: i,
                url: shuffledList[i]
            }])
        }

        await TrackPlayer.play()
    }

    public async playAllMusics(musicsList: string[]) {
        await TrackPlayer.reset()
        let i
        for(i = 0; i < musicsList.length; i++){
            await TrackPlayer.add([{
                id: i,
                url: musicsList[i]
            }])
        }
        await TrackPlayer.play()
    }
}