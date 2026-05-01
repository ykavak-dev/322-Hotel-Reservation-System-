// Mock in-memory Prisma client for shallow tests
// Avoids needing a real database connection

type ModelName = 'user' | 'hotel' | 'room' | 'booking' | 'payment' | 'review' | 'hotel_owner' | 'refresh_token' | 'admin_activity_log';

interface MockRecord {
  id: string;
  [key: string]: any;
}

class MockPrismaClient {
  private store: Map<ModelName, MockRecord[]> = new Map();

  constructor() {
    this.store.set('user', []);
    this.store.set('hotel', []);
    this.store.set('room', []);
    this.store.set('booking', []);
    this.store.set('payment', []);
    this.store.set('review', []);
    this.store.set('hotel_owner', []);
    this.store.set('refresh_token', []);
    this.store.set('admin_activity_log', []);
  }

  private genId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private table(name: ModelName): MockRecord[] {
    return this.store.get(name) ?? [];
  }

  async user.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      role: data.role ?? 'CUSTOMER',
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.table('user').push(record);
    return record;
  }

  async user.findUnique({ where }: { where: { id?: string; email?: string } }) {
    return this.table('user').find(u =>
      (where.id && u.id === where.id) || (where.email && u.email === where.email)
    ) ?? null;
  }

  async user.findFirst({ where }: { where?: any }) {
    return this.table('user').find(u => {
      if (!where) return true;
      if (where.email && u.email !== where.email) return false;
      if (where.role && u.role !== where.role) return false;
      if (where.id && u.id !== where.id) return false;
      return true;
    }) ?? null;
  }

  async user.update({ where, data }: { where: { id: string }; data: any }) {
    const users = this.table('user');
    const idx = users.findIndex(u => u.id === where.id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
    return users[idx];
  }

  async hotel.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      name: data.name,
      description: data.description ?? null,
      address: data.address,
      city: data.city,
      country: data.country,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      starRating: data.starRating ?? null,
      amenities: data.amenities ?? null,
      images: data.images ?? null,
      isVerified: data.isVerified ?? false,
      rejectionReason: data.rejectionReason ?? null,
      averageRating: data.averageRating ?? null,
      ownerId: data.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.table('hotel').push(record);
    return record;
  }

  async hotel.findUnique({ where }: { where: { id?: string } }) {
    return this.table('hotel').find(h => h.id === where.id) ?? null;
  }

  async hotel.findMany({ where, skip, take }: { where?: any; skip?: number; take?: number }) {
    let hotels = this.table('hotel');
    if (where?.city) hotels = hotels.filter(h => h.city === where.city);
    if (where?.isVerified !== undefined) hotels = hotels.filter(h => h.isVerified === where.isVerified);
    if (skip) hotels = hotels.slice(skip);
    if (take) hotels = hotels.slice(0, take);
    return hotels;
  }

  async hotel.update({ where, data }: { where: { id: string }; data: any }) {
    const hotels = this.table('hotel');
    const idx = hotels.findIndex(h => h.id === where.id);
    if (idx === -1) throw new Error('Hotel not found');
    hotels[idx] = { ...hotels[idx], ...data, updatedAt: new Date().toISOString() };
    return hotels[idx];
  }

  async room.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      hotelId: data.hotelId,
      type: data.type,
      description: data.description ?? null,
      pricePerNight: data.pricePerNight,
      capacity: data.capacity,
      bedType: data.bedType ?? null,
      roomSize: data.roomSize ?? null,
      amenities: data.amenities ?? null,
      images: data.images ?? null,
      totalQuantity: data.totalQuantity ?? 1,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.table('room').push(record);
    return record;
  }

  async room.findMany({ where }: { where?: { hotelId?: string; isActive?: boolean } }) {
    let rooms = this.table('room');
    if (where?.hotelId) rooms = rooms.filter(r => r.hotelId === where.hotelId);
    if (where?.isActive !== undefined) rooms = rooms.filter(r => r.isActive === where.isActive);
    return rooms;
  }

  async room.findUnique({ where }: { where: { id?: string; hotelId?: string } }) {
    return this.table('room').find(r =>
      (where.id && r.id === where.id) || (where.hotelId && r.hotelId === where.hotelId)
    ) ?? null;
  }

  async booking.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      userId: data.userId,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      numberOfGuests: data.numberOfGuests,
      totalPrice: data.totalPrice,
      status: data.status ?? 'PENDING',
      specialRequests: data.specialRequests ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    this.table('booking').push(record);
    return record;
  }

  async booking.findMany({ where }: { where?: { userId?: string; roomId?: string } }) {
    let bookings = this.table('booking');
    if (where?.userId) bookings = bookings.filter(b => b.userId === where.userId);
    if (where?.roomId) bookings = bookings.filter(b => b.roomId === where.roomId);
    return bookings;
  }

  async booking.findUnique({ where }: { where: { id?: string } }) {
    return this.table('booking').find(b => b.id === where.id) ?? null;
  }

  async payment.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency ?? 'USD',
      paymentMethod: data.paymentMethod,
      status: data.status ?? 'PENDING',
      transactionId: data.transactionId ?? null,
      paidAt: data.paidAt ?? null,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.table('payment').push(record);
    return record;
  }

  async review.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      userId: data.userId,
      hotelId: data.hotelId,
      bookingId: data.bookingId,
      rating: data.rating,
      comment: data.comment,
      isApproved: data.isApproved ?? false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.table('review').push(record);
    return record;
  }

  async review.findMany({ where }: { where?: { hotelId?: string } }) {
    let reviews = this.table('review');
    if (where?.hotelId) reviews = reviews.filter(r => r.hotelId === where.hotelId);
    return reviews;
  }

  async hotel_owner.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      userId: data.userId,
      hotelId: data.hotelId,
      role: data.role ?? 'OWNER',
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.table('hotel_owner').push(record);
    return record;
  }

  async refresh_token.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      token: data.token,
      userId: data.userId,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.table('refresh_token').push(record);
    return record;
  }

  async refresh_token.findUnique({ where }: { where: { token?: string } }) {
    return this.table('refresh_token').find(t => t.token === where.token) ?? null;
  }

  async refresh_token.deleteMany({ where }: { where?: { userId?: string } }) {
    const tokens = this.table('refresh_token');
    const before = tokens.length;
    if (where?.userId) {
      const filtered = tokens.filter(t => t.userId !== where.userId);
      this.store.set('refresh_token', filtered);
      return { count: before - filtered.length };
    }
    return { count: before };
  }

  async admin_activity_log.create({ data }: { data: any }) {
    const record: MockRecord = {
      id: data.id ?? this.genId(),
      adminId: data.adminId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details ?? null,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.table('admin_activity_log').push(record);
    return record;
  }

  async $transaction<T>(fn: (prisma: MockPrismaClient) => Promise<T>): Promise<T> {
    return fn(this);
  }

  async $disconnect() {}
}

export { MockPrismaClient };
