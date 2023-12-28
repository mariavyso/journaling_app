import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import Timer from "./timer.js";
import RecordingButton from "./recording_button.js";

export default function App() {
  const [record, setRecord] = React.useState();
  const [isRecodingNow, setIsRecodingNow] = React.useState();
  const [docStatus, setdocStatus] = useState();

  async function startRecording() {
    setIsRecodingNow(true);
    setdocStatus(false);
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording, status } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.LOW_QUALITY,
        bitRate: 64000,
        outputFormat: ".mp3",
      });
      setRecord(recording);
      console.log("Recording started", status, record);
    } catch (err) {
      console.error("Failed to start recording", err);
      setIsRecodingNow(false);
    }
  }

  async function stopRecording() {
    setIsRecodingNow(false);
    console.log("Stopping recording..");
    if (!record) {
      return;
    }
    console.log("after If!recording");
    await record.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const url =
      "https://us-central1-dear-diary-app-401220.cloudfunctions.net/upload_mp3_to_text_2";

    const response = await FileSystem.uploadAsync(
      url,
      record.getURI(),
      {
        fieldName: "file",
        type: "audio/mp3",

        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      },
    );

    console.log(JSON.stringify(response, null, 4));
    const bodyResp = response["body"];
    const jsonObject = JSON.parse(bodyResp);
    setdocStatus(jsonObject.status);
  }

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: "column",
        },
      ]}
    >
      <View style={{ flex: 1 }}></View>
      <View style={{ flex: 2 }}>
        <Timer isRecord={isRecodingNow} />
      </View>
      <View style={{ flex: 2 }}>
        <RecordingButton
          isRecord={isRecodingNow}
          recordingStart={startRecording}
          recordingStop={stopRecording}
          isRecordSet={setIsRecodingNow}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text>{docStatus}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
