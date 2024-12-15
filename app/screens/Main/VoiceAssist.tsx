import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';

export default function VoiceAssist() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Tracks recording state

  // Request permission for microphone access
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      if (isRecording || recording) {
        throw new Error('A recording is already in progress.');
      }

      setIsProcessing(true);

      // Prepare and start a new recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();

      setRecording(newRecording); // Save the recording instance
      setIsRecording(true); // Update recording state
      setIsProcessing(false);
    } catch (err:any) {
      setError(`Error starting recording: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!isRecording || !recording) {
        throw new Error('No active recording to stop.');
      }

      setIsProcessing(true);

      await recording.stopAndUnloadAsync(); // Stop and unload recording
      const uri = recording.getURI(); // Get the recording file URI
      setRecognizedText(`Recording saved at: ${uri}`);

      // Clean up the recording object
      setRecording(null);
      setIsRecording(false);
      setIsProcessing(false);
    } catch (err:any) {
      setError(`Error stopping recording: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Assistance</Text>

      {/* Button to toggle recording */}
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing} // Disable button while processing
      />

      {/* Show loading indicator while processing */}
      {isProcessing && (
        <ActivityIndicator size="large" color="green" style={{ marginTop: 20 }} />
      )}

      {/* Display recording status or recognized text */}
      {!isProcessing && (
        <Text style={styles.text}>
          {isRecording ? 'Recording in progress...' : recognizedText || 'Say something...'}
        </Text>
      )}

      {/* Display error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
