// screens/MapHeatmapScreen.js
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native'; // Ensure ActivityIndicator is imported
import { Appbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';

export default function MapHeatmapScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Heatmap" />
      </Appbar.Header>
      <WebView
        source={{ uri: 'http://192.168.0.128:5000/map-embed' }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
