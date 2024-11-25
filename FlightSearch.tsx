import React, { useEffect, useState } from 'react';
import {View,Text,TouchableOpacity,FlatList} from 'react-native';
import { db } from './firebaseConfig';
import {collection,getDocs,getDoc,DocumentData,DocumentSnapshot} from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

interface Flight {
  id: string;
  name: string;
  from: string;
  to: string;
  date: string;
  arrivalDate: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
}

type RootStackParamList = {
  Search: undefined;
  Dropdown: undefined;
  Bookconfirm: { flightDetails: Flight };
};

type SearchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Search'
>;

const FlightSearch: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [departureCity, setDepartureCity] = useState<string>('');
  const [arrivalCity, setArrivalCity] = useState<string>('');
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [expandedDeparture, setExpandedDeparture] = useState<boolean>(false);
  const [expandedArrival, setExpandedArrival] = useState<boolean>(false);
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(
    null
  );
  const [selectedArrival, setSelectedArrival] = useState<string | null>(null);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);

  const navigation = useNavigation<SearchScreenNavigationProp>();

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    type: string
  ) => {
    const currentDate = selectedDate || new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    if (type === 'departure') {
      setDepartureDate(formattedDate);
      setShowDeparturePicker(false);
    } else if (type === 'return') {
      setReturnDate(formattedDate);
      setShowReturnPicker(false);
    }
  };

  const handleResetAll = () => {
    setDepartureCity('');
    setArrivalCity('');
    setDepartureDate('');
    setReturnDate('');
    setSelectedDeparture(null);
    setSelectedArrival(null);
    setShowDeparturePicker(false);
    setShowReturnPicker(false);
  };

  const handleBookNow = (flight: Flight) => {
    navigation.navigate('Bookconfirm', {
      flightDetails: flight, // Pass the selected flight details
    });
  };

  useEffect(() => {
    const fetchFlights = async () => {
      const flightsCollection = collection(db, 'flights');
      const flightSnapshot = await getDocs(flightsCollection);

      const flightList = await Promise.all(
        flightSnapshot.docs.map(async (flightDoc) => {
          const data: DocumentData = flightDoc.data();

          let arrivalCity = data.arrival_city;
          let departureCity = data.departure_city;

          
          if (arrivalCity && typeof arrivalCity === 'object') {
            const arrivalCityDoc: DocumentSnapshot<DocumentData> = await getDoc(arrivalCity);
            arrivalCity = arrivalCityDoc.exists() ? (arrivalCityDoc.data()?.name as string) : 'Unknown City';
          }

          if (departureCity && typeof departureCity === 'object') {
            const departureCityDoc: DocumentSnapshot<DocumentData> = await getDoc(departureCity);
            departureCity = departureCityDoc.exists() ? (departureCityDoc.data()?.name as string) : 'Unknown City';
          }

          const date = data.date?.toDate
            ? data.date.toDate().toISOString().split('T')[0]
            : data.date;
          const arrivalDate = data.arrival_date?.toDate
            ? data.arrival_date.toDate().toISOString().split('T')[0]
            : data.arrival_date;
          const departureTime = data.departure_time?.toDate
            ? data.departure_time.toDate().toLocaleTimeString()
            : 'Unknown Time';
          const arrivalTime = data.arrival_time?.toDate
            ? data.arrival_time.toDate().toLocaleTimeString()
            : 'Unknown Time';

          return {
            id: flightDoc.id,
            name: data.flight_number ?? 'Unknown Flight',
            from: departureCity,
            to: arrivalCity,
            date: date,
            arrivalDate: arrivalDate,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            airline: data.airline ?? 'Unknown Airline',
          };
        })
      );

      setFlights(flightList);
    };

    fetchFlights();
  }, []);

  const handleSearch = () => {
    console.log('Search button pressed');
    const filteredFlights = flights.filter((flight) => {
      return (
        (!departureCity || flight.from === departureCity) &&
        (!arrivalCity || flight.to === arrivalCity) &&
        (!departureDate || flight.date === departureDate) &&
        (!returnDate || flight.date === returnDate)
      );
    });
  
    setSearchResults(filteredFlights);
  };
  

  
  const uniqueDepartureCities = [...new Set(flights.map((flight) => flight.from))];
  const uniqueArrivalCities = [...new Set(flights.map((flight) => flight.to))];

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Flight Search</Text>
        {/* Departure City Dropdown */}
       <View style={styles.form}>
        <Text style={styles.label}>Select Departure City:</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, styles.shadow]}
            onPress={() => setExpandedDeparture(!expandedDeparture)}
          >
            <Text style={styles.text}>{selectedDeparture || 'Select departure city'}</Text>
            <AntDesign name={expandedDeparture ? 'caretup' : 'caretdown'} size={16} />
          </TouchableOpacity>
          {expandedDeparture && (
            <FlatList
              data={uniqueDepartureCities}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedDeparture(item);
                    setDepartureCity(item); // Update the value of departureCity
                    setExpandedDeparture(false);
                  }}
                >
                  <Text style={styles.city}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
  
        {/* Arrival City Dropdown */}
        <Text style={styles.label}>Select Arrival City:</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, styles.shadow]}
            onPress={() => setExpandedArrival(!expandedArrival)}
          >
            <Text style={styles.text}>{selectedArrival || 'Select arrival city'}</Text>
            <AntDesign name={expandedArrival ? 'caretup' : 'caretdown'} size={16} />
          </TouchableOpacity>
          {expandedArrival && (
            <FlatList
              data={uniqueArrivalCities}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedArrival(item);
                    setArrivalCity(item); // Update the value of arrivalCity
                    setExpandedArrival(false);
                  }}
                >
                  <Text style={styles.city}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
  
        {/* Departure Date Picker */}
        <Text style={styles.label}>Select Departure Date:</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, styles.shadow]}
            onPress={() => setShowDeparturePicker(true)}
          >
            <Text style={styles.text}>
              {departureDate ? departureDate : 'Select departure date'}
            </Text>
          </TouchableOpacity>
          {showDeparturePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={departureDate ? new Date(departureDate) : new Date()}
              onChange={(e, date) => handleDateChange(e, date, 'departure')}
            />
          )}
        </View>
  
        {/* Return Date Picker */}
        <Text style={styles.label}>Select Return Date:</Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, styles.shadow]}
            onPress={() => setShowReturnPicker(true)}
          >
            <Text style={styles.text}>
              {returnDate ? returnDate : 'Select return date'}
            </Text>
          </TouchableOpacity>
          {showDeparturePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={departureDate ? new Date(departureDate) : new Date()}
              onChange={(e, date) => handleDateChange(e, date, 'departure')}
            />
          )}
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleResetAll}>
        <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        </View>
  
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.result}>
            <Text>Flight: {item.name}</Text>
            <Text>From: {item.from}</Text>
            <Text>To: {item.to}</Text>
            <Text>Departure Date: {item.date}</Text>
            <Text>Arrival Time: {item.arrivalTime}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => handleBookNow(item)} // Pass flight data to the handler
            >
              <Text style={styles.buttonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No flights found.</Text>}
      />
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
  label: {
    marginVertical: 8,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  city: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  result: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 4,
    
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 4,
    paddingVertical: 5,  // Reduced vertical padding for a smaller height
    paddingLeft: 1,     // Smaller padding on the left side
    paddingRight: 1,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default FlightSearch;
