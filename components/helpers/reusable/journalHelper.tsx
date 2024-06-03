import * as SecureStore from 'expo-secure-store';
import CryptoJS from "react-native-crypto-js";

var Sentiment = require('sentiment');
var sentiment = new Sentiment();

const semanticAnalysis = (stringInput: string) => {
    var result = sentiment.analyze(stringInput);
    return result.score;
}

const decryptString = (encryptedText: string, userPin: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedText, userPin);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}


const decryptStringWithoutPin = async (encryptedText: string) => {
    try {
        const userPin = await loadSettingFromStorage("userPin");
        //console.log("userPin: ", userPin)

        if (userPin) {

            // const bytes = CryptoJS.AES.decrypt(encryptedText, userPin);

            // const originalText = bytes.toString(CryptoJS.enc.Utf8);
            // console.log("--------------originalText: ", originalText)


            let decData = CryptoJS.enc.Base64.parse(encryptedText).toString(CryptoJS.enc.Utf8)
            let bytes = CryptoJS.AES.decrypt(decData, userPin).toString(CryptoJS.enc.Utf8)
            console.log("--------------bytes: ", bytes)
            return JSON.parse(bytes)

            //return decData;
        }
    }
    catch (error) {
        console.log(error)
    }


}

const loadSettingFromStorage = async (setting: string) => {
    try {
        const storedSetting = await SecureStore.getItemAsync(setting);
        if (storedSetting) {
            return storedSetting
        }
    } catch (error) {
        console.error('error getting setting: ', error);
    }
};

const semanticAnalyiseEncryptedJournal = async (stringInput: string) => {
    const userPin = await loadSettingFromStorage("userPin");
    if (userPin) {
        const decryptedText = decryptString(stringInput, userPin);
        const result = sentiment.analyze(decryptedText);
        //console.log("result.comparative: ", result.comparative)
        return result.comparative
    }

}

export { semanticAnalysis, decryptString, loadSettingFromStorage, semanticAnalyiseEncryptedJournal, decryptStringWithoutPin };