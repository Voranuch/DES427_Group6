const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const {mapBookingData, mapSingleBookingData} = require('./utils/mapping');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Server listening
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/flights', async (req, res) => {
  try {
    const flights = await db.collection('flights').get();
    const formattedFlights = flights.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(formattedFlights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch available flights
app.get('/flights', async (req, res) => {
  try {
    const flightsSnapshot = await db.collection('flights').get();

    const flights = await Promise.all(
      flightsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch referenced city names for departure and arrival
        const departureCityDoc = await data.departure_city.get();
        const arrivalCityDoc = await data.arrival_city.get();

        return {
          id: doc.id,
          flight_number: data.flight_number,
          departure_city: { name: departureCityDoc.exists ? departureCityDoc.data().name : "Unknown" },
          arrival_city: { name: arrivalCityDoc.exists ? arrivalCityDoc.data().name : "Unknown" },
          date: data.date.toDate().toISOString().split('T')[0],
          arrival_date: data.arrival_date ? data.arrival_date.toDate().toISOString().split('T')[0] : null,
          departure_time: data.departure_time ? data.departure_time.toDate().toLocaleTimeString() : null,
          arrival_time: data.arrival_time ? data.arrival_time.toDate().toLocaleTimeString() : null,
          airline: data.airline || "Unknown Airline",
        };
      })
    );

    res.json(flights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username).where('password', '==', password).get();
    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const userDoc = snapshot.docs[0]; // Get the first matching user document

    res.json({ message: 'Login successful' , userId: userDoc.id, username:username});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = {
      username,
      password,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      booked_flights: []
    };

    const userRef = await db.collection('users').add(newUser);
    res.json({ message: 'User registered successfully', userId: userRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/bookings', async (req, res) => {
  const { flightId, userId } = req.body;
  try {
    const flightRef = db.collection('flights').doc(flightId);
    const userRef = db.collection('users').doc(userId);

    const bookingData = {
      flight: flightRef,
      user: userRef,
      status: 'Pending', // Assuming status starts as 'Pending'
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const bookingRef = await db.collection('bookings').add(bookingData);
    res.status(201).json({ id: bookingRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const handleBookNow = async (flight) =>{
  try {
    // Send the flight booking data to the server to initiate booking
    const response = await fetch('http://localhost:3000/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flightId: flight.id,
        userId: 'some-user-id', // Replace with actual user ID if applicable
      }),
    });

    const bookingData = await response.json();

    // Navigate to the BookingConfirmPage with the booking details
    navigation.navigate('BookingConfirmPage', { bookingId: bookingData.id });
  } catch (error) {
    console.error('Error booking flight:', error);
  }
};


// อันนี้ ถ้าไม่ได้ไส่ user id ไป จะเอา list booked_flight มาทั้งหมด ถ้าทำ feature booked flight ได้แล้ว ให้ ส่ง user ID มาด้วย
app.get('/booked-flights', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const bookedFlights = [];
  
      if (userId) {
        // Fetch booked flights for a specific user
        const userDoc = await db.collection('users').doc(userId).get();
  
        if (!userDoc.exists) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        const bookedFlightsRefs = userDoc.data().booked_flights;
        console.log("Booked: ", bookedFlightsRefs)
        for (const flightRef of bookedFlightsRefs) {
          const flightDoc = await flightRef.get();
          console.log("doc ", flightDoc)
          if (flightDoc.exists) {
            bookedFlights.push(await getExpandedBooking(flightDoc));
          }
        }
      } else {
        // Fetch all booked flights in the system
        const bookingsSnapshot = await db.collection('bookings').get();
  
        for (const doc of bookingsSnapshot.docs) {
          bookedFlights.push(await getExpandedBooking(doc));
        }
      }
      const mappedData = await  mapBookingData({bookedFlights});
  
      res.json( mappedData );
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: error.message });
    }
  });
  // อันนี้เป็นตัว หา booking detail น่ะ น้องไปหาวิธีใน firebase admin เอาเองว่า จะเอา booking detail ด้วย booking id ยังไง ที่เหลือพี่เตรียมใว้ให้แล้ว
  app.get('/booked-flights/:id', async (req, res) => {
    try {
      // 1. Extract booking ID from the request parameters
      const bookingId = req.params.id;

      // 2. Fetch the booking document by ID from Firestore
      const bookingDoc = null;

      // 3. Check if the booking exists; if not, respond with a 404 status
      if (!bookingDoc.exists) {
          return res.status(404).send('Booking not found');
      }
      const bookingData = getExpandedBooking(bookingDoc)

      // 4. Map the booking data using mapSingleBookingData
      const mappedBooking = await mapSingleBookingData(bookingData);

      // 5. Send the mapped booking data as JSON in the response
      res.json(mappedBooking);
  } catch (error) {
      // 6. Handle any errors that occur during the fetch or mapping process
      console.error('Error fetching booking:', error);
      res.status(500).send('Server Error');
  }
  });

  // Helper function to expand booking references
  async function getExpandedBooking(bookingDoc) {
    const bookingData = bookingDoc.data();
    console.log("Booking Data",bookingData)
  
    // Fetch referenced flight data
    const flightDoc = await bookingData.flights.get();
    const flightData = flightDoc.exists ? flightDoc.data() : null;
  
    // Fetch referenced status data
    const statusDoc = await bookingData.status.get();
    const statusData = statusDoc.exists ? statusDoc.data() : null;
  
    // Fetch referenced user data
    const userDoc = await bookingData.user.get();
    const userData = userDoc.exists ? userDoc.data() : null;
  
    return {
      id: bookingDoc.id,
      ...bookingData,
      flights: flightData,
      status: statusData,
      user: userData,
    };
  }