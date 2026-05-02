export var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["HOTEL_ADMIN"] = "HOTEL_ADMIN";
    UserRole["SYSTEM_ADMIN"] = "SYSTEM_ADMIN";
})(UserRole || (UserRole = {}));
export var RoomType;
(function (RoomType) {
    RoomType["SINGLE"] = "SINGLE";
    RoomType["DOUBLE"] = "DOUBLE";
    RoomType["SUITE"] = "SUITE";
    RoomType["DELUXE"] = "DELUXE";
    RoomType["FAMILY"] = "FAMILY";
})(RoomType || (RoomType = {}));
export var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["NO_SHOW"] = "NO_SHOW";
})(BookingStatus || (BookingStatus = {}));
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentMethod || (PaymentMethod = {}));
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (PaymentStatus = {}));
export var HotelOwnerRole;
(function (HotelOwnerRole) {
    HotelOwnerRole["OWNER"] = "OWNER";
    HotelOwnerRole["MANAGER"] = "MANAGER";
})(HotelOwnerRole || (HotelOwnerRole = {}));
