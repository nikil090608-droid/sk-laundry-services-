export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: 'MEN' | 'WOMEN' | 'HOUSEHOLD' | 'KIDS';
  serviceType?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'Washing'
  | 'Drying'
  | 'Steam Ironing'
  | 'Quality Check'
  | 'Ready'
  | 'Out For Delivery'
  | 'Delivered';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  serviceType?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  mobileNumber: string;
  items: OrderItem[];
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  address: string;
  notes?: string;
  clothImages?: string[]; // base64 strings
  status: OrderStatus;
  timeline: OrderTimelineItem[];
  paymentMethod: 'COD' | 'UPI' | 'GPay' | 'PhonePe' | 'Paytm' | 'Razorpay';
  paymentStatus: PaymentStatus;
  paymentScreenshot?: string; // base64 string
  createdAt: string;
  couponCode?: string;
  discountAmount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address?: string;
  loyaltyPoints: number;
  createdAt: string;
  role: 'OWNER' | 'CUSTOMER';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  description: string;
  isActive: boolean;
}

export interface AppSettings {
  address: string;
  phones: string[];
  upiId: string;
  bannerText: string;
  bannerSubtext: string;
  offers: string[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  coupons: Coupon[];
}
