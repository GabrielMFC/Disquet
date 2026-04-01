import { NativeModules } from "react-native";
import TrackPlayer from "react-native-track-player";
const {YtDlp} = NativeModules
const {StorageModule} = NativeModules

export default class AudioController {
    async getMp3FilesList() {
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

    async setLockScreen(uri: string, artist: string) {
        await TrackPlayer.reset()
        await TrackPlayer.add({url: uri, title: "Disquet", artist: artist})
    }

    async downloadAudio(url: string) {
        try {
            await YtDlp.download(url);
        } catch (e) {
            console.log("Erro original:", e);
            throw e;
        }
    }

    async play() {
        await TrackPlayer.play()
    }

    async playAllMusics(musicsList: string[]) {
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