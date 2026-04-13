# Food Management System - TODO

## Database & Backend
- [x] Database schema for food items (name, description, price, image URL, stock, availability)
- [x] Database schema for orders and order items
- [x] Database schema for cart items (temporary storage)
- [ ] S3 image upload API endpoint
- [x] Food CRUD API routes (create, read, update, delete)
- [x] Cart API routes (add, remove, update quantity, get cart)
- [x] Order creation API route
- [ ] Stripe webhook handler for payment confirmation

## Admin Dashboard
- [x] Admin authentication check and role-based access
- [x] Admin layout with sidebar navigation
- [x] Food list view with all items
- [ ] Add food item form with image upload to S3
- [x] Edit food item form with image management
- [x] Delete food item functionality
- [x] Stock management and availability toggle
- [x] Price management
- [ ] Image preview before upload

## Customer Food List
- [x] Public food list page with grid layout
- [x] Food item cards with image, name, price, description
- [x] Stock availability indicator
- [x] Add to cart button with quantity input
- [ ] Search/filter functionality (optional)
- [x] Responsive design for mobile and desktop

## Shopping Cart
- [x] Cart page with item list
- [x] Quantity adjustment (increase/decrease)
- [x] Remove item from cart
- [x] Cart summary with subtotal, tax, total
- [x] Proceed to checkout button
- [x] Empty cart state

## Checkout & Stripe Integration
- [x] Table number input field
- [ ] Stripe payment form integration
- [x] Order creation before payment
- [ ] Stripe payment processing
- [ ] Error handling for failed payments
- [ ] Success redirect after payment

## Receipt & Order Confirmation
- [x] Receipt page after successful payment
- [x] Display order details (items, quantities, prices)
- [x] Display table number
- [x] Display order ID and timestamp
- [x] Print receipt functionality
- [ ] Download receipt as PDF (optional)

## UI/UX & Styling
- [x] Elegant color scheme and typography
- [x] Tailwind CSS styling for all components
- [x] Responsive design for all pages
- [x] Loading states and spinners
- [x] Error messages and toast notifications
- [ ] Smooth transitions and animations

## Testing & Deployment
- [ ] Unit tests for API routes
- [ ] Integration tests for cart and checkout flow
- [ ] Manual testing of complete user flow
- [ ] Performance optimization
- [ ] Final checkpoint before delivery

## Bug Fixes
- [ ] Fix cart state not persisting between FoodList and Checkout pages
