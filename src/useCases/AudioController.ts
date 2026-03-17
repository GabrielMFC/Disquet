import * as FileSystem from "expo-file-system/legacy";
import { NativeModules } from "react-native";
import TrackPlayer from "react-native-track-player";
const {YtDlp} = NativeModules

export default class AudioController {
    async getMp3FilesList() {
        try {
            const folder = `${FileSystem.documentDirectory}disquet/`;
        
            const dirInfo = await FileSystem.getInfoAsync(folder);
            if (!dirInfo.exists) {
                return [];
            }
        
            const files = await FileSystem.readDirectoryAsync(folder);
        
            const mp3Files = files
                .filter(file => file.toLowerCase().endsWith('.mp3'))
                .map(file => `${folder}${file}`);
    
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
            throw new Error("Error: " + e);   
        }
    }

    async play() {
        await TrackPlayer.play()
    }
}