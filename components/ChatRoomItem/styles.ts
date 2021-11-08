import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  badgeContainer: {
    backgroundColor: "rgb(0,195,0)",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 50,
    top: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
  rightContainer: {
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 3,
  },
  text: {
    color: "grey",
    fontSize: 16,
  },
});

export default styles;

//! START AT 2:05:45
