import { buttonStyles } from "@/src/commonStyles/buttons";
import { centralizeFlex } from "@/src/commonStyles/centralizeFlex";
import { useAppContext } from "@/src/context/AppContext";
import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bottomBarStyles } from "./style";

export default function BottomBar() {
    const {selectedPage, setSelectedPage} = useAppContext()
    const {bottom} = useSafeAreaInsets()
    
    return(
        <View style={[bottomBarStyles.bottomBarContainer, {bottom: bottom}]}>
            <Pressable onPress={() => {setSelectedPage("home")}}
                style={[buttonStyles.button, centralizeFlex.containerFlex, {height: "80%"}, selectedPage === "home" || selectedPage === ""? {backgroundColor: "gray"}: ""]}>
                <Image style={{width:32, height:32}} source={require("../../../assets/icons/home.png")}/>
            </Pressable>
            <Pressable onPress={() => {setSelectedPage("download")}}
                style={[buttonStyles.button, centralizeFlex.containerFlex, {height: "80%"}, selectedPage === "download"? {backgroundColor: "gray"}: ""]}>
                <Image style={{width:32, height:32}} source={require("../../../assets/icons/download.png")}/>
            </Pressable>
        </View>
    )
}