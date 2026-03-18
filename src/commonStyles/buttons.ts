import { StyleSheet } from "react-native";

const buttonStyles = StyleSheet.create({
    button: {
        textAlign: "center",
        backgroundColor: "#2196F3",
        borderRadius: 5,
        padding: "5%",
        margin: "5%"
    },
    downloadButon: {
        backgroundColor: "#075fa7"
    },
    disableButton: {
        backgroundColor: "#808080"
    },
    textInsideButton: {
        width: "100%",
        color: "white",
        textAlign: "center",
        fontWeight: "bold"
  }
})

export { buttonStyles };
