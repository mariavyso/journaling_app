import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

function RecordingButton(
  { isRecord, recordingStart, recordingStop, isRecordSet },
) {
  const isRecodingNow = isRecord;
  const startRecording = recordingStart;
  const stopRecording = recordingStop;
  const setIsRecodingNow = isRecordSet;

  const handleButtonClick = () => {
    if (isRecodingNow) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecodingNow(!isRecodingNow);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleButtonClick}
        style={[
          styles.button,
          isRecodingNow ? styles.disabledButton : styles.startButton,
        ]}
      >
        <Image
          source={isRecodingNow
            ? require("./images/stop.png")
            : require("./images/micro.png")}
          style={{ width: 50, height: 50 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 150,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#3cb371",
  },
  stopButton: {
    backgroundColor: "#b22222",
  },
  disabledButton: {
    backgroundColor: "#b22222",
  },
});

export default RecordingButton;
