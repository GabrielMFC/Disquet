import BottomBar from '@/src/components/bottomBar/BottomBar';
import { AppProvider } from '@/src/context/AppContext';
import { PlaybackService } from '@/src/player/musicBackgroundService';
import * as FileSystem from "expo-file-system/legacy";
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

TrackPlayer.registerPlaybackService(() => PlaybackService);

async function configurePlayer() {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [Capability.Play, Capability.Pause],
      compactCapabilities: [Capability.Play, Capability.Pause],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
    });
  } catch (e) {}
}

function RootLayout() {
  useEffect(() => {
    const createMainFolder = async () => {
      const folder = `${FileSystem.documentDirectory}disquet/`;
      if (!(await FileSystem.getInfoAsync(folder)).exists)
        await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    };
    createMainFolder();
  }, []);

  useEffect(() => {
    configurePlayer()
  },[])
    const { bottom } = useSafeAreaInsets();
    return (
    <AppProvider>
      <SafeAreaProvider>
        <View style={{ flex: 1}}>
            <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={() => null}
            >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="download" />
            </Tabs>
            <BottomBar />
        </View>
        </SafeAreaProvider>
    </AppProvider>
    );
}

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});