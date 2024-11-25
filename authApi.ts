
import { AuthDetail, Booking } from "@/type/user";
import api from "./api";

// API function to get all booked flights or by userId if provided
export const getBookedFlights = async (userId?: string): Promise<Booking[]> => {
  try {
    const response = await api.get<Booking[]>('/booked-flights', {
      params: userId ? { userId } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booked flights:', error);
    throw error;
  }
};

// API function to get all booked detail 
export const getBookedDetail = async (bookingId: string): Promise<Booking> => {
  try {
    const response = await api.get<Booking>('/booked-flights/'+bookingId);
    return response.data;
  } catch (error) {
    console.error('Error fetching booked flights:', error);
    throw error;
  }
};



// API function for user login
export const login = async (username: string, password: string): Promise<AuthDetail> => {
  try {
    const response = await api.post<AuthDetail>('/login', { username, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// API function for user registration
export const register = async (username: string, password: string): Promise<AuthDetail> => {
  try {
    const response = await api.post<AuthDetail>('/register', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};


  