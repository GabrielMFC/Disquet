import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    homeContainer: {
        flex: 1,
        top: "5%",
        marginTop: "5%",
        marginBottom: "7%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
    },
    playContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 12,
        marginBottom: 8,
    },
    smallButton: {
        padding: 8,
        margin: 6,
    }
})

export { styles };
