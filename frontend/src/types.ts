export type Customer = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type Vehicle = {
  _id: string;
  make: string;
  model: string;
  year?: number;
  plateNumber: string;
  dailyRate: number;
  isActive?: boolean;
};

export type Booking = {
  _id: string;
  customer: Customer;
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
};
