import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from './FlightSearch';
import Dropdown from './Dropdown';
import AddBookingPage from './AddBookingPage';
import BookingConfirmPage from './BookingConfirmPage';

export type Flight = {
  id: string;
  name: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
};

export type BookingDetails = {
  flight_name: string;
  departure: string;
  arrival: string;
  date: string;
  departure_time: string;
  arrival_time: string;
  airline: string;
};

export type RootStackParamList = {
  Search: undefined;
  Dropdown: undefined;
  Bookconfirm: { flightDetails: Flight };
  AddBooking: { bookingDetails: BookingDetails };
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Search">
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Dropdown" component={Dropdown} />
        <Stack.Screen name="AddBooking" component={AddBookingPage} />
        <Stack.Screen name="Bookconfirm" component={BookingConfirmPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
