// api/client.ts
import { KITS, ADD_ONS } from '../constants';
// Fix: 'BookingStatus' is an enum and is used as a value, so it should not be imported as a type only.
import { type Kit, type User, type AddOn, BookingStatus } from '../types';

// --- SIMULATED DATABASE (using localStorage & sessionStorage) ---

const USER_SESSION_KEY = 'w3-user-data';
const USER_DATABASE_KEY = 'w3-user-database';
const BOOKINGS_DATABASE_KEY = 'w3-bookings-database';

interface UserWithPassword extends User {
  password?: string;
}

export interface Booking {
  bookingId: string;
  userEmail: string;
  kit: Kit;
  date: string; // start date
  nights: number;
  totalPrice: number;
  createdAt: string;
  deliveryDetails: {
    fullName: string;
    phone: string;
    address: string;
    deliveryMethod: string;
  };
  selectedAddOns: { [id: string]: number };
  status: BookingStatus;
  whatsAppUpdates: boolean;
}


// --- API FUNCTIONS ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const initializeUserDatabase = () => {
  const dbString = localStorage.getItem(USER_DATABASE_KEY);
  if (!dbString) {
    const adminUser: Required<UserWithPassword> = {
      fullName: 'Admin User',
      email: 'admin@w3.com',
      password: 'admin123',
      phone: '0000000000',
      address: 'Admin HQ',
      isAdmin: true,
      loyaltyPoints: 1000,
    };
    localStorage.setItem(USER_DATABASE_KEY, JSON.stringify([adminUser]));
  }
};

initializeUserDatabase();


/**
 * Signs up a new user.
 */
// Fix: Modified signup to return the created user object, ensuring consistency with the login function.
export const signup = async (userData: Required<UserWithPassword>): Promise<{ success: boolean; message?: string, user?: User }> => {
  await simulateDelay(700);
  
  const dbString = localStorage.getItem(USER_DATABASE_KEY);
  const db: Required<UserWithPassword>[] = dbString ? JSON.parse(dbString) : [];

  const existingUser = db.find(u => u.email.toLowerCase() === userData.email.toLowerCase());

  if (existingUser) {
    return { success: false, message: 'User with this email already exists. Please log in.' };
  }

  const newUser = { ...userData, isAdmin: false, loyaltyPoints: 50 };
  db.push(newUser);
  localStorage.setItem(USER_DATABASE_KEY, JSON.stringify(db));
  
  const { password, ...userToSession } = newUser;
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userToSession));

  return { success: true, user: userToSession };
};

/**
 * Logs in a user.
 */
export const login = async (email: string, password_provided: string): Promise<{ success: boolean; message?: string, user?: User }> => {
    await simulateDelay(700);

    const dbString = localStorage.getItem(USER_DATABASE_KEY);
    const db: Required<UserWithPassword>[] = dbString ? JSON.parse(dbString) : [];
    
    const foundUser = db.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
        return { success: false, message: 'New user? Please sign up.' };
    }

    if (foundUser.password !== password_provided) {
        return { success: false, message: 'Incorrect password.' };
    }
    
    const { password, ...userToSession } = foundUser;
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userToSession));

    return { success: true, user: userToSession };
};

/**
 * Fetches all available kits.
 */
export const getKits = async (): Promise<Kit[]> => {
  await simulateDelay(500);
  return Promise.resolve(KITS);
};

/**
 * Fetches a single kit by its ID.
 */
export const getKit = async (id: string): Promise<Kit | undefined> => {
  await simulateDelay(300);
  return Promise.resolve(KITS.find(k => k.id === id));
};

/**
 * Simulates creating a new booking and saves it to localStorage.
 */
export const createBooking = async (details: Omit<Booking, 'bookingId' | 'createdAt' | 'status'>, initialStatus: BookingStatus = BookingStatus.PENDING): Promise<string> => {
  console.log('Simulating booking request with details:', details);
  await simulateDelay(1500);
  
  const bookingId = `WK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const newBooking: Booking = {
    ...details,
    bookingId,
    createdAt: new Date().toISOString(),
    status: initialStatus,
  };

  const bookingsDbString = localStorage.getItem(BOOKINGS_DATABASE_KEY);
  const bookingsDb: Booking[] = bookingsDbString ? JSON.parse(bookingsDbString) : [];
  bookingsDb.push(newBooking);
  localStorage.setItem(BOOKINGS_DATABASE_KEY, JSON.stringify(bookingsDb));

  // In a real app, if newBooking.whatsAppUpdates is true, trigger a backend API call here
  // to send a WhatsApp confirmation message. This is where you'd use your access key securely on a server.
  // e.g., fetch('/api/send-whatsapp-confirmation', { method: 'POST', body: JSON.stringify({ bookingId: newBooking.bookingId }) });
  
  console.log('Booking successful. Generated ID:', bookingId);
  return bookingId;
};

/**
 * Fetches past bookings for a given user.
 */
export const getPastBookings = async (userEmail: string): Promise<Booking[]> => {
  await simulateDelay(600);
  const bookingsDbString = localStorage.getItem(BOOKINGS_DATABASE_KEY);
  if (!bookingsDbString) {
    return [];
  }
  const allBookings: Booking[] = JSON.parse(bookingsDbString);
  return allBookings
    .filter(booking => booking.userEmail === userEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // most recent first
};

/**
 * Fetches all bookings for the admin.
 */
export const getAllBookings = async (): Promise<Booking[]> => {
  await simulateDelay(800);
  const bookingsDbString = localStorage.getItem(BOOKINGS_DATABASE_KEY);
  if (!bookingsDbString) {
    return [];
  }
  const allBookings: Booking[] = JSON.parse(bookingsDbString);
  return allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Updates the status of a specific booking.
 */
export const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<boolean> => {
  await simulateDelay(400);
  const bookingsDbString = localStorage.getItem(BOOKINGS_DATABASE_KEY);
  if (!bookingsDbString) {
    return false;
  }
  let allBookings: Booking[] = JSON.parse(bookingsDbString);
  const bookingIndex = allBookings.findIndex(b => b.bookingId === bookingId);
  
  if (bookingIndex > -1) {
    allBookings[bookingIndex].status = status;
    localStorage.setItem(BOOKINGS_DATABASE_KEY, JSON.stringify(allBookings));

    // In a real app, trigger a backend API call here to notify the user of the status change.
    // You would fetch the booking details to get the user's phone number and preference for WhatsApp updates.
    // e.g., fetch('/api/send-whatsapp-update', { method: 'POST', body: JSON.stringify({ bookingId, newStatus: status }) });

    return true;
  }
  
  return false;
};