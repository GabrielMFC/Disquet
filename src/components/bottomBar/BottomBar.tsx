import { buttonStyles } from "@/src/commonStyles/buttons";
import { centralizeFlex } from "@/src/commonStyles/centralizeFlex";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bottomBarStyles } from "./style";

export default function BottomBar() {
    const {bottom} = useSafeAreaInsets()
    
    return(
        <View style={[bottomBarStyles.bottomBarContainer, {bottom: bottom}]}>
            <Pressable style={[buttonStyles.button, centralizeFlex.containerFlex, {height: "80%"}]}><Text style={buttonStyles.textInsideButton}>M</Text></Pressable>
            <Pressable style={[buttonStyles.button, centralizeFlex.containerFlex, {height: "80%"}]}><Text style={buttonStyles.textInsideButton}>D</Text></Pressable>
            <Pressable style={[buttonStyles.button, centralizeFlex.containerFlex, {height: "80%"}]}><Text style={buttonStyles.textInsideButton}>C</Text></Pressable>
        </View>
    )
}