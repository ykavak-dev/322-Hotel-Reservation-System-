import { z } from 'zod';

export const checkoutSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    specialRequests: z.string().max(500, 'Special requests must be 500 characters or less').optional(),
    isBookingForSomeoneElse: z.boolean().default(false),
    guestFirstName: z.string().optional(),
    guestLastName: z.string().optional(),
    guestEmail: z.string().optional(),
    guestPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isBookingForSomeoneElse) {
      if (!data.guestFirstName || data.guestFirstName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Guest first name is required',
          path: ['guestFirstName'],
        });
      }
      if (!data.guestLastName || data.guestLastName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Guest last name is required',
          path: ['guestLastName'],
        });
      }
      if (!data.guestEmail || data.guestEmail.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Guest email is required',
          path: ['guestEmail'],
        });
      } else {
        // Validate guest email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.guestEmail)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid guest email address',
            path: ['guestEmail'],
          });
        }
      }
      if (!data.guestPhone || data.guestPhone.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Guest phone is required',
          path: ['guestPhone'],
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Card number must be in format XXXX XXXX XXXX XXXX'),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Expiry must be in MM/YY format'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardholderName: z.string().min(2, 'Cardholder name must be at least 2 characters'),
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;