# E-Shop

## Full E-Commerce RESTful API with NodeJS

This is a Node.js-based e-commerce API designed to handle the backend operations for an e-commerce platform, including user authentication, product management, order processing, and more.

## Installation

- ##### Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

- ##### Clone the Repository

```bash
git clone https://github.com/yourusername/e-commerce-api.git
cd e-commerce-api
```

- Install Dependencies

```bash
npm install
# or
yarn install
 ```

- ##### Set Up Environment Variables
Create a .env file in the root directory and add the following:
```plaintext
PORT=8000
BASE_URL=http://localhost:8000
NODE_ENV=development
DB_USER=your data base user 
DB_PASSWORD=data base password
DB_NAME=data base name
DB_URI=data base url

SALT=Salt number

JWT_SECRET=jwt secret string
JWT_EXPIRE_IN=90d


#EMAIL

EMAIL_HOST= email of host
EMAIL_PORT=465
EMAIL_USER=email user
EMAIL_PASS=email password
EMAIL_FROM="E-shop App "

#STRIPE SITTING

STRIPE_SECRET= strip secrit string
STRIPE_WEBHOOK_SECRET=strip webhook secrit string

```
- ##### Running the Server
Start the server using:
```bash
npm start
# or
yarn start

```
-    --------------

### Features

- User Authentication & Authorization: JWT-based authentication for user registration, login, and management.
- User can Add product to wishlist ,make review on product ,etc.
  
- Product Management: Create, read, update, and delete products.
- Order Processing: Manage orders with status tracking.
- Cart Management: Users can manage their shopping carts.
- Coupon Management: Users can use coubons to have discount the price.
- Cash and Online payment management: Users can pay cash or online [ card or wallet,more... ]
- Admin Panel: Admin-specific routes to manage products and orders.
- 
-    --------------

### Usage

###### API Documentation

The API follows RESTful principles. Use tools like [Postman](https://www.postman.com/) to interact with the API.

##### My Postman Collection [Collection](https://documenter.getpostman.com/view/29296726/2sA3kd9H7z)

-    --------------

#### API Endpoints

- User
  - Create user `POST  /api/v1/users` (Only Admin or manager)
  - Get specific User by id ` GET /api/v1/users/:id` (Only Admin or manager)
  - Get list of users  `GET /api/v1/users`(Only Admin or manager)
  - Update specific User `PUT /api/v1/users/:id`(Only Admin or manager)
  - Change user password `DELETE /api/v1/users/changePassword/:id`(Only Logged User)
  - Delete specific User  `DELETE /api/v1/users/:id`(Only Admin)
  - Get logged user data  `GET /api/v1/users/getMe` (Only Logged User)
  - Update user password `PUT /api/v1/users/updateMyPassword` (Only Logged User)
  - Update logged user data without [password,role]  `PUT /api/v1/users/updateMe` (Only Logged User)
  - Deactvate logged user `PUT /api/v1/users/deleteMe` (Only Logged User)
  -    --------------
  - Signup `POST /api/v1/auth/signup` (Only User)
  - Login `POST /api/v1/auth/login`(Only User)
  - Forgot password`POST /api/v1/auth/forgotPassword`(Only User)
  - verify Password Reset Code `POST /api/v1/auth/verifyResetCode`(Only User)
  - reset Password `POST /api/v1/auth/resetPassword` (Only User)
  -    --------------
  - Get all reviews on specific product `GET /api/v1/products/:productId/reviews`
  - Create review `POST  /api/v1/reviews` (Only Logged User)
  - Get specific review by id `GET /api/v1/reviews/:id`
  - Get list of reviews `GET /api/v1/reviews`
  - Update specific review `PUT /api/v1/reviews/:id`(Only Logged User)
  - Delete specific review `DELETE /api/v1/reviews/:id`(Logged User or Admin)
  -    --------------
  - Add product to wishlist `POST  /api/v1/wishlist` (Only Logged User)
  - Get all wishlists `GET  /api/v1/wishlist`(Only Logged User)
  - Remove product from wishlist `DELETE  /api/v1/wishlist/:productId` (Only Logged User)
  
  -    --------------
- Category
  - Create category `POST  /api/v1/categories`(Only Admin)
  - Get specific category by id `GET /api/v1/categories/:id`
  - Get list of categories `GET /api/v1/categories`
  - Update specific category `PUT /api/v1/categories/:id`(Only Admin)
  - Delete specific category `DELETE /api/v1/categories/:id`(Only Admin)
  -    --------------
- Subcategories
  - Get supCategorys of specific category `GET /api/v1/categories/:categoryId/subcategories`
  - Create subCategory `POST  /api/v1/subcategories`(Only Admin)
  - Get specific subcategory by id `GET /api/v1/subcategories/:id`
  - Get list of subcategories `GET /api/v1/subcategories`
  - Update specific subcategory `PUT /api/v1/subcategories/:id`(Only Admin)
  - Delete specific subCategory `DELETE /api/v1/subcategories/:id`(Only Admin)
  -    --------------
- Brand
  - Create brand `POST  /api/v1/brands`(Only Admin)
  - Get specific brand by id ` GET /api/v1/brands/:id`
  - Get list of brands `GET /api/v1/brands`
  - Update specific brand `PUT /api/v1/brands/:id`(Only Admin)
  - Delete specific brand `DELETE /api/v1/brands/:id`(Only Admin)
  -    --------------
- Products
  - Create product `POST  /api/v1/products`(Only Admin)
  - Get specific product by id ` GET /api/v1/products/:id`
  - Get list of products `GET /api/v1/products`
  - Update specific product `PUT /api/v1/products/:id`(Only Admin)
  - Delete specific product `DELETE /api/v1/products/:id`(Only Admin)
  -    --------------
- Coupon
  - Create coupon `POST  /api/v1/coupons`(Only Admin and Manager)
  - Get specific coupon by id ` GET /api/v1/coupons/:id`(Only Admin and Manager)
  - Get list of coupons `GET /api/v1/coupons`(Only Admin and Manager)
  - Update specific coupon `PUT /api/v1/coupons/:id`(Only Admin and Manager)
  - Delete specific coupon `DELETE /api/v1/coupons/:id`(Only Admin and Manager)
  -    --------------

- Order
  - create cash order `POST  /api/v1/orders/:cartId`(Only Logged user)
  - Get specific order `GET  /api/v1/orders/:id`(Only Logged user)
  - Get all orders  `GET  /api/v1/orders`(Only for Logged user or Admin or Manager)
  - Update order paid status `GET  /api/v1/orders/:id/pay`(Only Admin and Manager)
  - Update order delivered status  `GET  /api/v1/orders/:id/delivered`(Only Admin and Manager)
  - Get checkout session from stripe and send it as response  `GET  /api/v1/orders/checkout-session/:cartId`(Only Logged user)
  - This webhook will run when stripe payment success paid `POST /webhook-checkout`(Only Logged user)
  -    --------------
- Cart
  - Add product to cart `POST /api/v1/cart` (Only Logged user)
  - Get logged user cart `GET /api/v1/cart`(Only Logged user)
  - Get all carts for `GET /api/v1/cart/all` (Only Admin and Manager)
  - Update cart quantity `PUT /api/v1/cart/:id` (Only Logged user)
  - Delete spicific cart item `DELETE /api/v1/cart/:id` (Only Logged user)
  -  Delete all cart items `DELETE /api/v1/cart`(Only Logged user)
  -  Apply coupon on cart `PUT /api/v1/applayCoupon`(Only Logged user)
  -  
  -    --------------

### Testing
You can write and run tests using a testing framework like Jest.

To run tests:
```bash
npm test
# or
yarn test
```

### Contributing
Contributions are welcome! Please follow these steps:

- 1- Fork the repository.
- 2- Create a new branch (git checkout -b feature/your-feature-name).
- 3- Make your changes.
Commit your changes (git commit -m 'Add some feature').
- 4- Push to the branch (git push origin feature/your-feature-name).
- 5- Create a Pull Request.
