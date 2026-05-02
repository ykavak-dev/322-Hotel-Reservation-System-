import { z } from 'zod';
import { UserRole, RoomType, BookingStatus, PaymentMethod, PaymentStatus, HotelOwnerRole } from './types';
export declare const UserRoleSchema: z.ZodNativeEnum<typeof UserRole>;
export declare const RoomTypeSchema: z.ZodNativeEnum<typeof RoomType>;
export declare const BookingStatusSchema: z.ZodNativeEnum<typeof BookingStatus>;
export declare const PaymentMethodSchema: z.ZodNativeEnum<typeof PaymentMethod>;
export declare const PaymentStatusSchema: z.ZodNativeEnum<typeof PaymentStatus>;
export declare const HotelOwnerRoleSchema: z.ZodNativeEnum<typeof HotelOwnerRole>;
export declare const createUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodNativeEnum<typeof UserRole>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    role?: UserRole | undefined;
}>;
export declare const updateUserSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof UserRole>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    role?: UserRole | undefined;
    isActive?: boolean | undefined;
}>;
export declare const createHotelSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    address: z.ZodString;
    city: z.ZodString;
    country: z.ZodString;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    starRating: z.ZodOptional<z.ZodNumber>;
    amenities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address: string;
    city: string;
    country: string;
    amenities: string[];
    images: string[];
    description?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    starRating?: number | undefined;
}, {
    name: string;
    address: string;
    city: string;
    country: string;
    description?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    starRating?: number | undefined;
    amenities?: string[] | undefined;
    images?: string[] | undefined;
}>;
export declare const updateHotelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    starRating: z.ZodOptional<z.ZodNumber>;
    amenities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    starRating?: number | undefined;
    amenities?: string[] | undefined;
    images?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    country?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    starRating?: number | undefined;
    amenities?: string[] | undefined;
    images?: string[] | undefined;
}>;
export declare const rejectHotelSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
}, {
    reason: string;
}>;
export declare const createRoomSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof RoomType>;
    description: z.ZodOptional<z.ZodString>;
    pricePerNight: z.ZodNumber;
    capacity: z.ZodNumber;
    bedType: z.ZodOptional<z.ZodString>;
    roomSize: z.ZodOptional<z.ZodNumber>;
    amenities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    totalQuantity: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: RoomType;
    amenities: string[];
    images: string[];
    pricePerNight: number;
    capacity: number;
    totalQuantity: number;
    description?: string | undefined;
    bedType?: string | undefined;
    roomSize?: number | undefined;
}, {
    type: RoomType;
    pricePerNight: number;
    capacity: number;
    description?: string | undefined;
    amenities?: string[] | undefined;
    images?: string[] | undefined;
    bedType?: string | undefined;
    roomSize?: number | undefined;
    totalQuantity?: number | undefined;
}>;
export declare const updateRoomSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodNativeEnum<typeof RoomType>>;
    description: z.ZodOptional<z.ZodString>;
    pricePerNight: z.ZodOptional<z.ZodNumber>;
    capacity: z.ZodOptional<z.ZodNumber>;
    bedType: z.ZodOptional<z.ZodString>;
    roomSize: z.ZodOptional<z.ZodNumber>;
    amenities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    totalQuantity: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: RoomType | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    amenities?: string[] | undefined;
    images?: string[] | undefined;
    pricePerNight?: number | undefined;
    capacity?: number | undefined;
    bedType?: string | undefined;
    roomSize?: number | undefined;
    totalQuantity?: number | undefined;
}, {
    type?: RoomType | undefined;
    isActive?: boolean | undefined;
    description?: string | undefined;
    amenities?: string[] | undefined;
    images?: string[] | undefined;
    pricePerNight?: number | undefined;
    capacity?: number | undefined;
    bedType?: string | undefined;
    roomSize?: number | undefined;
    totalQuantity?: number | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare const createBookingSchema: z.ZodObject<{
    userId: z.ZodString;
    roomId: z.ZodString;
    checkIn: z.ZodDate;
    checkOut: z.ZodDate;
    numberOfGuests: z.ZodNumber;
    specialRequests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    specialRequests?: string | undefined;
}, {
    userId: string;
    roomId: string;
    checkIn: Date;
    checkOut: Date;
    numberOfGuests: number;
    specialRequests?: string | undefined;
}>;
export declare const updateBookingSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof BookingStatus>>;
    checkIn: z.ZodOptional<z.ZodDate>;
    checkOut: z.ZodOptional<z.ZodDate>;
    numberOfGuests: z.ZodOptional<z.ZodNumber>;
    specialRequests: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: BookingStatus | undefined;
    checkIn?: Date | undefined;
    checkOut?: Date | undefined;
    numberOfGuests?: number | undefined;
    specialRequests?: string | undefined;
}, {
    status?: BookingStatus | undefined;
    checkIn?: Date | undefined;
    checkOut?: Date | undefined;
    numberOfGuests?: number | undefined;
    specialRequests?: string | undefined;
}>;
export declare const createPaymentSchema: z.ZodObject<{
    bookingId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentMethod;
}, {
    bookingId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    currency?: string | undefined;
}>;
export declare const updatePaymentSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof PaymentStatus>>;
    transactionId: z.ZodOptional<z.ZodString>;
    paidAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    status?: PaymentStatus | undefined;
    transactionId?: string | undefined;
    paidAt?: Date | undefined;
}, {
    status?: PaymentStatus | undefined;
    transactionId?: string | undefined;
    paidAt?: Date | undefined;
}>;
export declare const createReviewSchema: z.ZodObject<{
    hotelId: z.ZodString;
    bookingId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookingId: string;
    hotelId: string;
    rating: number;
    comment: string;
}, {
    bookingId: string;
    hotelId: string;
    rating: number;
    comment: string;
}>;
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    isApproved: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rating?: number | undefined;
    comment?: string | undefined;
    isApproved?: boolean | undefined;
}, {
    rating?: number | undefined;
    comment?: string | undefined;
    isApproved?: boolean | undefined;
}>;
export declare const createHotelOwnerSchema: z.ZodObject<{
    userId: z.ZodString;
    hotelId: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<typeof HotelOwnerRole>>;
}, "strip", z.ZodTypeAny, {
    role: HotelOwnerRole;
    userId: string;
    hotelId: string;
}, {
    userId: string;
    hotelId: string;
    role?: HotelOwnerRole | undefined;
}>;
export declare const createAdminActivityLogSchema: z.ZodObject<{
    adminId: z.ZodString;
    action: z.ZodString;
    entityType: z.ZodString;
    entityId: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    adminId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown> | undefined;
}, {
    adminId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown> | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodNativeEnum<typeof UserRole>>;
    hotelName: z.ZodOptional<z.ZodString>;
    hotelAddress: z.ZodOptional<z.ZodString>;
    hotelCity: z.ZodOptional<z.ZodString>;
    hotelCountry: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
    hotelName?: string | undefined;
    hotelAddress?: string | undefined;
    hotelCity?: string | undefined;
    hotelCountry?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    role?: UserRole | undefined;
    hotelName?: string | undefined;
    hotelAddress?: string | undefined;
    hotelCity?: string | undefined;
    hotelCountry?: string | undefined;
}>, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string | undefined;
    hotelName?: string | undefined;
    hotelAddress?: string | undefined;
    hotelCity?: string | undefined;
    hotelCountry?: string | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    role?: UserRole | undefined;
    hotelName?: string | undefined;
    hotelAddress?: string | undefined;
    hotelCity?: string | undefined;
    hotelCountry?: string | undefined;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
}>;
export declare const cuidParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
