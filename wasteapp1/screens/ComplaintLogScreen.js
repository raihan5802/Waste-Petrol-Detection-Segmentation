// screens/ComplaintLogScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native'; // Import FlatList from 'react-native'
import { Text, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import moment from 'moment'; // Import moment for date formatting

export default function ComplaintLogScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://192.168.0.128:5000/complaints');
      setComplaints(res.data);
    } catch (error) {
      console.log('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator animating={true} size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/user-icon.png')} // Replace with your user icon file path
        style={styles.userIcon}
      />
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.header}>Your Complaints</Text>
      {complaints.length === 0 ? (
        <Text style={styles.noComplaints}>No complaints submitted yet.</Text>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.image_id.toString()} // Ensure keyExtractor returns a string
          renderItem={({ item }) => (
            <Card key={item.image_id} style={styles.card}>
              <Card.Content>
                <Title>Complaint ID: {item.image_id}</Title>
                {/* **Display Date** */}
                <Paragraph>Date: {moment(item.date).format('MMMM Do YYYY, h:mm a')}</Paragraph>
                <Paragraph>Status: {item.status}</Paragraph>
                <Paragraph>Location: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Paragraph>
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingTop: 40, // Added top padding
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
    borderRadius: 20, 
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  noComplaints: {
    fontSize: 16,
    color: '#777',
    alignSelf: 'center',
    marginTop: 50,
  },
  card: {
    marginBottom: 15,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
