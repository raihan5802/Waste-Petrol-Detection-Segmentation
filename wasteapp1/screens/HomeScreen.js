// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ScrollView // Imported ScrollView
} from 'react-native';
import { 
  Button, 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Snackbar, 
  TextInput 
} from 'react-native-paper'; // Imported TextInput
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isGalleryImage, setIsGalleryImage] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [initialMapLocation, setInitialMapLocation] = useState(null);
  
  // **New State Variable for Complaint Description**
  const [complaintDescription, setComplaintDescription] = useState('');
  
  // **New State Variable for Complaint Date**
  const [complaintDate, setComplaintDate] = useState('');

  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        alert('Media library permission is required.');
      }

      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        alert('Camera permission is required.');
      }

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        alert('Location permission is required.');
      }
    })();
  }, []);

  const pickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', 
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setIsGalleryImage(true);
      setLocation(null);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        setSelectedImage(result.assets[0].uri);
        setIsGalleryImage(false);
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch location.');
      }
    }
  };

  const openLocationSelector = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setInitialMapLocation(loc.coords);
      setIsSelectingLocation(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location.');
    }
  };

  const onLocationMessage = (event) => {
    const data = event.nativeEvent.data;
    try {
      const parsed = JSON.parse(data);
      if (parsed.action === 'close') {
        setIsSelectingLocation(false);
      } else if (parsed.action === 'select' && parsed.latitude && parsed.longitude) {
        setLocation({
          coords: {
            latitude: parsed.latitude,
            longitude: parsed.longitude
          }
        });
        setIsSelectingLocation(false);
      }
    } catch (e) {
      console.log("Error parsing message:", e);
    }
  };

  const sendComplaint = async () => {
    if (!selectedImage || !location) return;

    // **Capture the current date**
    const currentDate = new Date().toISOString(); // ISO format: YYYY-MM-DDTHH:MM:SSZ
    setComplaintDate(currentDate);

    const formData = new FormData();
    formData.append('image', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'complaint.jpg'
    });
    formData.append('latitude', String(location.coords.latitude));
    formData.append('longitude', String(location.coords.longitude));
    
    // **Append the date to FormData**
    formData.append('date', currentDate);

    try {
      const response = await fetch('http://192.168.0.128:5000/complaints', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        setMessage(errData.message || 'Error sending complaint');
        setSnackbarVisible(true);
        // **Clear Complaint Description on Send Attempt**
        setComplaintDescription('');
        return;
      }

      const data = await response.json();
      setMessage(data.message || 'Complaint Registered!');
      setSnackbarVisible(true);

      // Once complaint is sent, clear the image, location, and complaint description
      setSelectedImage(null);
      setLocation(null);
      setIsGalleryImage(false);
      setComplaintDescription(''); // **Clear Complaint Description**
      setComplaintDate(''); // **Clear Complaint Date**
    } catch (e) {
      setMessage('Error sending complaint');
      setSnackbarVisible(true);
      // **Clear Complaint Description on Error**
      setComplaintDescription('');
      setComplaintDate(''); // **Clear Complaint Date**
    }
  };

  const getHtmlContent = (initialLat, initialLng) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes"/>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        html,body,#map{height:100%;margin:0;padding:0;}
        .bottom-controls {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1001;
          display: flex;
          flex-direction: row;
          gap: 10px;
        }
        .action-btn {
          background: white;
          border: 1px solid #ccc;
          padding: 10px 15px;
          cursor: pointer;
          border-radius: 4px;
          font-family: sans-serif;
          text-align: center;
          user-select: none;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="bottom-controls">
        <div class="action-btn" id="cancelBtn">Cancel</div>
        <div class="action-btn" id="doneBtn">Done</div>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          var initialLat = ${initialLat};
          var initialLng = ${initialLng};
          var map = L.map('map', {
            zoomControl: true, 
            scrollWheelZoom: true, 
            touchZoom: true
          }).setView([initialLat, initialLng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          var marker = L.marker([initialLat, initialLng], {draggable: true}).addTo(map);

          function onMapClick(e) {
            if (marker) {
              map.removeLayer(marker);
              marker = null;
            } else {
              marker = L.marker(e.latlng, {draggable: true}).addTo(map);
            }
          }
          map.on('click', onMapClick);

          document.getElementById('doneBtn').addEventListener('click', function() {
            if (marker) {
              var latlng = marker.getLatLng();
              window.ReactNativeWebView.postMessage(JSON.stringify({action:'select', latitude: latlng.lat, longitude: latlng.lng}));
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({action:'close'}));
            }
          });

          document.getElementById('cancelBtn').addEventListener('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({action:'close'}));
          });

        });
      </script>
    </body>
  </html>
`;


  return (
    // **Wrapped Content with KeyboardAvoidingView and ScrollView**
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} // Applied styles
        keyboardShouldPersistTaps="handled" // Ensures that taps are handled correctly when the keyboard is active
      >
        <View style={styles.container}>
          <Image
            source={require('../assets/user-icon.png')} // Replace with your user icon file path
            style={styles.userIcon}
          />
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Card style={styles.card}>
            <Card.Content>
              <Title>Submit a Complaint</Title>
              <Paragraph>Upload an image and provide your location to report an issue.</Paragraph>
            </Card.Content>
          </Card>
          <Button 
            mode="contained" 
            onPress={pickImageFromGallery} 
            icon="image"
            style={styles.button}
          >
            Upload Image
          </Button>
          <Button 
            mode="contained" 
            onPress={takePhoto} 
            icon="camera"
            style={styles.button}
          >
            Take Photo
          </Button>
          {selectedImage && (
            <Card style={styles.imageCard}>
              <Card.Cover source={{ uri: selectedImage }} />
            </Card>
          )}
          {selectedImage && isGalleryImage && !location && (
            <Button 
              mode="outlined" 
              onPress={openLocationSelector} 
              icon="map-marker"
              style={styles.button}
            >
              Select Location
            </Button>
          )}
          {location && (
            <Text style={styles.locationText}>
              Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
            </Text>
          )}

          {/* **New Section: Complaint Description** */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.subheading}>Complaint Description</Title>
              <TextInput
                mode="outlined"
                label="Describe your complaint"
                placeholder="Enter description..."
                value={complaintDescription}
                onChangeText={text => setComplaintDescription(text)}
                multiline
                numberOfLines={4}
                style={styles.textInput}
              />
            </Card.Content>
          </Card>

          {/* **Optional: Display Complaint Date (for debugging or user information) */}
          {/* <Text style={styles.dateText}>
            Date: {complaintDate}
          </Text> */}

          <Button
            mode="contained"
            onPress={sendComplaint}
            disabled={!selectedImage || !location}
            style={styles.sendButton}
            icon="send"
          >
            Send Complaint
          </Button>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {message}
          </Snackbar>
          {isSelectingLocation && initialMapLocation && (
            <View style={StyleSheet.absoluteFill}>
              <WebView
                source={{ html: getHtmlContent(initialMapLocation.latitude, initialMapLocation.longitude) }}
                style={{ flex: 1 }}
                onMessage={onLocationMessage}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5',
    paddingTop: 40, // Added top padding
  },
  scrollContainer: {
    paddingBottom: 40, // Added padding to ensure content is not hidden behind elements like Snackbar
  },
  logo: {
    width: 100, // Increased width to accommodate larger logo
    height: 100, // Increased height to accommodate larger logo
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain', // Ensures the entire image fits within the bounds
  },
  userIcon: {
    width: 80, 
    height: 80, 
    position: 'absolute', 
    top: 39, 
    right: 10, 
    borderRadius: 30, 
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  subheading: {
    marginBottom: 10, // Added margin for better spacing
  },
  button: {
    marginVertical: 5,
  },
  sendButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
  },
  imageCard: {
    marginTop: 20,
    elevation: 4,
  },
  locationText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#ffffff',
  },
  webviewCard: {
    flex: 1,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  // **Optional: Style for Complaint Date Display**
  dateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
