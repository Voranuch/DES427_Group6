import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './App'; 
import { StackNavigationProp } from '@react-navigation/stack';

// Define the BookingDetails type
export type BookingDetails = {
  id: string;
  flight_id: string;
  flight_name: string;
  departure: string;
  arrival: string;
  date: string;
  departureTime: string; 
  arrivalTime: string;  
  airline: string;
  status: string;
  user: string;
  created_at: string;
  updated_at: string;
};

// Define the route type for Bookconfirm screen
type AddBookingConfirmRouteProp = RouteProp<RootStackParamList, 'Bookconfirm'>;

const Bookconfirm: React.FC = () => {
  // Get the route data passed from FlightSearch
  const route = useRoute<AddBookingConfirmRouteProp>(); 
  const { flightDetails } = route.params; 

  // Initialize navigation with typing
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'AddBooking'>>();

  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async () => {
    if (!flightDetails) {
      alert('No flight details available for booking');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        flight_id: flightDetails.id,
        flight_name: flightDetails.name,
        departure: flightDetails.from,
        arrival: flightDetails.to,
        date: flightDetails.date,
        departure_time: flightDetails.departureTime,
        arrival_time: flightDetails.arrivalTime,
        airline: flightDetails.airline,
        user: '/users/demoUserId', // Replace with actual user ID
        status: 'BOOKED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add booking to Firestore
      const bookingsCollection = collection(db, 'bookings');
      await addDoc(bookingsCollection, bookingData);

      alert('Booking confirmed successfully!');
      // Navigate to AddBooking screen with bookingData as params
      navigation.navigate('AddBooking', { bookingDetails: bookingData });
    } catch (error) {
      alert('Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Confirmation</Text>
      <Text>Flight: {flightDetails.name}</Text>
      <Text>From: {flightDetails?.from}</Text>
      <Text>To: {flightDetails?.to}</Text>
      <Text>Departure Date: {flightDetails?.date}</Text>
      <Text>Departure Time: {flightDetails?.departureTime}</Text>
      <Text>Arrival Time: {flightDetails?.arrivalTime}</Text>
      <Text>Airline: {flightDetails?.airline}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleConfirmBooking}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Confirm Booking</Text>
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

export default Bookconfirm;
