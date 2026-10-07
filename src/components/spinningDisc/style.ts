import { StyleSheet } from "react-native";

const spinningDiscStyles = StyleSheet.create({
  disc: {
    overflow: "hidden",
    backgroundColor: "#9a9a9a",
    borderWidth: 3,
    borderColor: "#ececec",
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  hole: {
    position: "absolute",
    width: "18%",
    height: "18%",
    borderRadius: 999,
    backgroundColor: "#fff",
  },
});

export { spinningDiscStyles };
