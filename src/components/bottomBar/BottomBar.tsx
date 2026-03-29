import { buttonStyles } from "@/src/styles/commonStyles/buttons";
import { centralizeFlex } from "@/src/styles/commonStyles/centralizeFlex";
import { router, usePathname } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bottomBarStyles } from "./style";

export default function BottomBar(props: any) {
  const pathname = usePathname()
  const { bottom } = useSafeAreaInsets()

  return (
    <View style={[bottomBarStyles.bottomBarContainer, { bottom: bottom }]}>
      <Pressable
        onPress={() => router.push("/")}
        style={[buttonStyles.button, centralizeFlex.containerFlex, { height: "80%" },
          pathname === "/" ? { backgroundColor: "gray" } : {}
        ]}
      >
        <Image style={{ width: 32, height: 32 }} source={require("../../../assets/icons/home.png")} />
      </Pressable>
      <Pressable
        onPress={() => router.push("/download")}
        style={[buttonStyles.button, centralizeFlex.containerFlex, { height: "80%" },
          pathname === "/download" ? { backgroundColor: "gray" } : {}
        ]}
      >
        <Image style={{ width: 32, height: 32 }} source={require("../../../assets/icons/download.png")} />
      </Pressable>
    </View>
  )
}