import { StyleSheet } from "react-native";

const buttonStyles = StyleSheet.create({
    button: {
        textAlign: "center",
        backgroundColor: "#0E5089",
        borderRadius: 5,
        padding: "5%",
        margin: "5%"
    },
    downloadButon: {
        backgroundColor: "#0E5089"
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
