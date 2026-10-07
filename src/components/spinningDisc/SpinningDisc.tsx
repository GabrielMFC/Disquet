import { useEffect } from "react";
import { Image, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { spinningDiscStyles } from "./style";

type SpinningDiscProps = {
  coverUri: string | null;
  spinning: boolean;
};

export default function SpinningDisc({ coverUri, spinning }: SpinningDiscProps) {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * 0.72, height * 0.38);
  const rotation = useSharedValue(0);

  const frameCallback = useFrameCallback((frame) => {
    const delta = frame.timeSincePreviousFrame ?? 0;
    rotation.value = (rotation.value + (delta / 8000) * 360) % 360;
  }, false);

  useEffect(() => {
    frameCallback.setActive(spinning);
  }, [frameCallback, spinning]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        spinningDiscStyles.disc,
        animatedStyle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={spinningDiscStyles.cover} />
      ) : (
        <View style={spinningDiscStyles.cover} />
      )}
      <View style={spinningDiscStyles.hole} />
    </Animated.View>
  );
}
