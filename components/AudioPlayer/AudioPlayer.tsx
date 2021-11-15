import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";

const AudioPlayer = ({ soundURI }) => {
  const [paused, setPaused] = useState(true);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadSound();
    () => {
      //? unload the sound
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [soundURI]);

  const loadSound = async () => {
    if (!soundURI) {
      return;
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: soundURI },
      {},
      onPlaybackStatusUpdate
    );
    setSound(sound);
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }

    setAudioProgress(status.positionMillis / (status.durationMillis || 1));
    setPaused(!status.isPlaying);
    setAudioDuration(status.durationMillis || 0);
  };

  const playPauseSound = async () => {
    if (!sound) {
      return;
    }

    if (paused) {
      await sound.playFromPositionAsync(0);
    } else {
      await sound.pauseAsync();
    }
  };

  const getFormattedDuration = () => {
    const minutes = Math.floor(audioDuration / (60 * 1000));
    const seconds = Math.floor((audioDuration % (60 * 1000)) / 1000);

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={styles.sendAudioContainer}>
      <Pressable onPress={playPauseSound}>
        <Entypo
          name={paused ? "controller-play" : "controller-paus"}
          size={24}
          color="grey"
        />
      </Pressable>

      <View style={styles.audioProgressBG}>
        <View
          style={[styles.audioProgressFG, { left: `${audioProgress * 100}%` }]}
        ></View>
      </View>

      <Text>{getFormattedDuration()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sendAudioContainer: {
    flexDirection: "row",
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    alignSelf: "stretch",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  audioProgressBG: {
    height: 3,
    flex: 1,
    backgroundColor: "lightgrey",
    borderRadius: 10,
    margin: 10,
  },
  audioProgressFG: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgb(0,195,0)",
    position: "absolute",
    top: -3.5,
  },
});

export default AudioPlayer;
