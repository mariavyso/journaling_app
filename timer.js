import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function Timer({ isRecord }) {
  const startTime = useRef(null);
  const [finalTimer, setFinalTimer] = useState();
  const isRecodingNow = isRecord;
  const intervalRef = useRef(null);

  function formatTimer(finalTimer) {
    const minutes = Math.floor(finalTimer / 60);
    const seconds = finalTimer % 60;

    return `${String(minutes).padStart(2, "0")}:${
      String(seconds).padStart(2, "0")
    }`;
  }

  function updateFinalTimer() {
    const time = new Date(Date.now() - startTime.current);
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const totalSeconds = minutes * 60 + seconds;
    setFinalTimer(totalSeconds);
  }

  useEffect(() => {
    console.log("The state changed:", isRecodingNow);
    if (isRecodingNow) {
      startTime.current = Date.now();
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(updateFinalTimer, 100);
    } else {
      setFinalTimer("00:00");
      clearInterval(intervalRef.current);
    }
  }, [isRecodingNow]);

  return (
    <View>
      <Text style={styles.timerText}>
        {finalTimer === null || isNaN(finalTimer)
          ? "00:00"
          : formatTimer(finalTimer)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timerText: {
    color: "#20232a",
    textAlign: "center",
    fontSize: 50,
    fontWeight: "bold",
  },
});

export default Timer;
