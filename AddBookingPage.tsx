import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './App';  // Ensure the correct path
import { BookingDetails } from './App'; // Ensure the correct path
import { RouteProp } from '@react-navigation/native';


type AddBookingRouteProp = RouteProp<RootStackParamList, 'AddBooking'>;

const AddBookingPage: React.FC = () => {
  const route = useRoute<AddBookingRouteProp>();
  const { bookingDetails } = route.params;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(false);

  const handleCancelBooking = async () => {
    alert('Booking canceled successfully!');
    navigation.navigate('Search');
  };

  const handleReturnHome = () => {
    navigation.navigate('Search');
  };

  if (!bookingDetails) {
    return <Text>No booking details available.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Details</Text>
      <Text>Flight: {bookingDetails.flight_name}</Text>
      <Text>From: {bookingDetails.departure}</Text>
      <Text>To: {bookingDetails.arrival}</Text>
      <Text>Departure Date: {bookingDetails.date}</Text>
      <Text>Departure Time: {bookingDetails.departure_time}</Text>
      <Text>Arrival Time: {bookingDetails.arrival_time}</Text>
      <Text>Airline: {bookingDetails.airline}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCancelBooking}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Cancel Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleReturnHome}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AddBookingPage;
