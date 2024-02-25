import { StyleSheet } from "react-native";
import Colors from "./Colors";

export const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    defaultFontGrey: {
        color: "#ABABAB",
        fontSize: 15,
        fontFamily: "mon-b",
    },
    header1: {
        color: "white",
        fontSize: 15,
        fontFamily: "mon-b",
        flex: 1
    },
    titleHeader: {
        color: "white",
        fontSize: 22,
        fontFamily: "mon-b",
        flex: 1
    },
    button: {
        backgroundColor: Colors.pink,
        padding: 15,
        alignSelf: 'flex-start',
        borderRadius: 10,
        elevation: 10
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-b",
    }

    
})