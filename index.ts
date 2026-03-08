import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import layout from './app/(tabs)/_layout';

TrackPlayer.registerPlaybackService(() => require('./service'));
registerRootComponent(layout);