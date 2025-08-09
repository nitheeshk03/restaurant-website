# Restaurant Web API

A comprehensive RESTful Web API built with Express.js, CORS, and Mongoose for managing restaurant data with MongoDB Atlas integration. This API provides robust CRUD operations with extensive query parameter validation, proper HTTP status codes, and comprehensive error handling.

## 🚀 Features

- ✅ **Express.js server** with CORS support
- ✅ **MongoDB Atlas integration** with Mongoose ODM
- ✅ **Database initialization** with proper error handling
- ✅ **Complete CRUD operations** for restaurants
- ✅ **Comprehensive query parameter validation**
- ✅ **Pagination support** with borough filtering
- ✅ **Proper HTTP status codes** (200, 201, 204, 400, 404, 500)
- ✅ **Enhanced error handling** with detailed messages
- ✅ **Input sanitization** and type validation
- ✅ **Restaurant ID-based sorting** for consistent pagination
- ✅ **Borough-based filtering** for geographic queries
- ✅ **Graceful server shutdown**

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account with cluster setup
- npm or yarn package manager

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurants?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

**Important**: The connection string must specify the `restaurants` database name for proper collection access.

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster (e.g., `restaurant-cluster`)
3. Create a database named `restaurants`
4. Create a collection named `restaurant` within the database
5. Create a database user with read/write permissions
6. Whitelist your IP address in Network Access
7. Get the connection string and update the `.env` file

### 4. Sample Data Insertion

Insert sample restaurant data using the provided scripts:

```bash
# Insert sample data (keeps existing data)
npm run seed

# Replace all data with sample data
npm run seed-replace
```

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will only start after successfully connecting to MongoDB Atlas. Connection failures display detailed troubleshooting information.

## 🌐 API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check Endpoint
- **GET** `/health` - Check server and database connectivity status

## 🍽️ Restaurant API Endpoints

### 1. Get All Restaurants (with Pagination & Filtering)

**Endpoint**: `GET /api/restaurants`

**Description**: Retrieves restaurants with pagination support and optional borough filtering. Results are sorted by restaurant ID (`_id`) for consistent pagination.

#### Query Parameters:

| Parameter | Type | Required | Default | Validation | Description |
|-----------|------|----------|---------|------------|-------------|
| `page` | Integer | No | 1 | 1-10000 | Page number for pagination |
| `perPage` | Integer | No | 10 | 1-100 | Number of items per page |
| `borough` | String | No | null | 1-50 chars, letters/spaces/hyphens/apostrophes only | Filter by borough name |

#### Parameter Validation Rules:

- **`page`**: Must be a positive integer between 1 and 10,000
- **`perPage`**: Must be a positive integer between 1 and 100
- **`borough`**: Must be a non-empty string with valid characters only
- **Unknown parameters**: Rejected with 400 Bad Request

#### Example Requests:

```http
GET /api/restaurants
GET /api/restaurants?page=2&perPage=5
GET /api/restaurants?borough=Manhattan
GET /api/restaurants?page=1&perPage=5&borough=Brooklyn
```

#### Success Response (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Mario's Italian Bistro",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "borough": "Manhattan"
      },
      "borough": "Manhattan",
      "cuisine": "Italian",
      "phone": "(212) 555-0101",
      "email": "contact@mariosbistro.com",
      "website": "https://www.mariosbistro.com",
      "rating": 4.5,
      "priceRange": "$$$",
      "hours": {
        "monday": "Closed",
        "tuesday": "11:00 AM - 10:00 PM",
        "wednesday": "11:00 AM - 10:00 PM",
        "thursday": "11:00 AM - 10:00 PM",
        "friday": "11:00 AM - 11:00 PM",
        "saturday": "11:00 AM - 11:00 PM",
        "sunday": "12:00 PM - 9:00 PM"
      },
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 5,
    "totalReturned": 3,
    "hasMore": false
  },
  "filter": {
    "borough": "Manhattan"
  },
  "query": {
    "page": 1,
    "perPage": 5,
    "borough": "Manhattan"
  }
}
```

#### Error Responses (400 Bad Request):

```json
{
  "success": false,
  "message": "Page parameter must be a positive integer"
}
```

```json
{
  "success": false,
  "message": "Invalid query parameters: invalidParam. Allowed parameters: page, perPage, borough"
}
```

### 2. Get Restaurant by ID

**Endpoint**: `GET /api/restaurants/:id`

**Description**: Retrieves a single restaurant by its MongoDB ObjectId.

#### Path Parameters:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `id` | String | Yes | Valid 24-character hex ObjectId | Restaurant's unique identifier |

#### Example Request:

```http
GET /api/restaurants/507f1f77bcf86cd799439011
```

#### Success Response (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Mario's Italian Bistro",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "borough": "Manhattan"
    },
    "borough": "Manhattan",
    "cuisine": "Italian",
    "phone": "(212) 555-0101",
    "email": "contact@mariosbistro.com",
    "website": "https://www.mariosbistro.com",
    "rating": 4.5,
    "priceRange": "$$$",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses:

```json
// 400 Bad Request - Invalid ID format
{
  "success": false,
  "message": "Invalid restaurant ID format"
}

// 404 Not Found - Restaurant doesn't exist
{
  "success": false,
  "message": "Restaurant with ID 507f1f77bcf86cd799439011 not found"
}
```

### 3. Create New Restaurant

**Endpoint**: `POST /api/restaurants`

**Description**: Creates a new restaurant using the provided data.

#### Request Body (JSON):

```json
{
  "name": "New Restaurant",
  "address": {
    "street": "456 Broadway",
    "city": "New York",
    "state": "NY",
    "zipCode": "10013",
    "borough": "Manhattan"
  },
  "borough": "Manhattan",
  "cuisine": "Italian",
  "phone": "(212) 555-0123",
  "email": "contact@newrestaurant.com",
  "website": "https://www.newrestaurant.com",
  "rating": 4.0,
  "priceRange": "$$",
  "hours": {
    "monday": "Closed",
    "tuesday": "11:00 AM - 10:00 PM",
    "wednesday": "11:00 AM - 10:00 PM",
    "thursday": "11:00 AM - 10:00 PM",
    "friday": "11:00 AM - 11:00 PM",
    "saturday": "11:00 AM - 11:00 PM",
    "sunday": "12:00 PM - 9:00 PM"
  }
}
```

#### Success Response (201 Created):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "New Restaurant",
    // ... full restaurant object
  },
  "message": "Restaurant created successfully"
}
```

#### Error Responses:

```json
// 400 Bad Request - Missing request body
{
  "success": false,
  "message": "Request body is required to create a restaurant"
}

// 400 Bad Request - Validation error
{
  "success": false,
  "message": "Validation error: Restaurant name is required, Phone number must be in format (XXX) XXX-XXXX"
}
```

### 4. Update Restaurant (Overwrite)

**Endpoint**: `PUT /api/restaurants/:id`

**Description**: Completely overwrites an existing restaurant with new data.

#### Path Parameters:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `id` | String | Yes | Valid 24-character hex ObjectId | Restaurant's unique identifier |

#### Request Body: Same structure as POST request

#### Success Response (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Restaurant Name",
    // ... updated restaurant object
  },
  "message": "Restaurant updated successfully"
}
```

#### Error Responses:

```json
// 404 Not Found
{
  "success": false,
  "message": "Restaurant with ID 507f1f77bcf86cd799439011 not found"
}

// 400 Bad Request - Validation error
{
  "success": false,
  "message": "Validation error: Email must be a valid email address"
}
```

### 5. Delete Restaurant

**Endpoint**: `DELETE /api/restaurants/:id`

**Description**: Permanently deletes a restaurant from the database.

#### Path Parameters:

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `id` | String | Yes | Valid 24-character hex ObjectId | Restaurant's unique identifier |

#### Success Response (204 No Content):

No response body. Status code 204 indicates successful deletion.

#### Error Responses:

```json
// 404 Not Found
{
  "success": false,
  "message": "Restaurant with ID 507f1f77bcf86cd799439011 not found"
}

// 400 Bad Request - Invalid ID
{
  "success": false,
  "message": "Invalid restaurant ID format"
}
```

## 🗄️ Database Module Functions

The `modules/db.js` module provides the following core functions:

### 1. `db.addNewRestaurant(data)`
Creates a new restaurant in the collection using the provided data object.

### 2. `db.getAllRestaurants(page, perPage, borough)`
Returns paginated restaurants sorted by restaurant_id with optional borough filtering.

### 3. `db.getRestaurantById(Id)`
Returns a single restaurant object matching the provided ID.

### 4. `db.updateRestaurantById(data, Id)`
Overwrites an existing restaurant with new data.

### 5. `db.deleteRestaurantById(Id)`
Permanently deletes a restaurant by ID.

## 📊 Data Model

### Restaurant Schema

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    borough: { type: String, trim: true }
  },
  borough: { type: String, trim: true },
  cuisine: {
    type: String,
    required: true,
    enum: ['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 'Japanese', 'Thai', 'Mediterranean', 'Other']
  },
  phone: {
    type: String,
    required: true,
    match: /^\(\d{3}\)\s\d{3}-\d{4}$/
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  website: {
    type: String,
    match: /^https?:\/\/.+/
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  hours: {
    monday: { type: String, default: 'Closed' },
    tuesday: { type: String, default: 'Closed' },
    wednesday: { type: String, default: 'Closed' },
    thursday: { type: String, default: 'Closed' },
    friday: { type: String, default: 'Closed' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  isActive: { type: Boolean, default: true }
}
```

### Supported Cuisine Types
- Italian, Chinese, Mexican, Indian, American, French, Japanese, Thai, Mediterranean, Other

### Phone Number Format
- Required format: `(XXX) XXX-XXXX` (e.g., "(212) 555-0123")

### Price Range Options
- `$` (Budget), `$$` (Moderate), `$$$` (Expensive), `$$$$` (Very Expensive)

## 🛡️ Validation & Error Handling

### Query Parameter Validation

#### Page Parameter:
- Must be a positive integer (1-10,000)
- Rejects non-numeric values, decimals, negative numbers

#### PerPage Parameter:
- Must be a positive integer (1-100)
- Prevents excessive data retrieval

#### Borough Parameter:
- Must be a non-empty string (1-50 characters)
- Only allows letters, spaces, hyphens, and apostrophes
- Trims whitespace automatically

### HTTP Status Codes

| Status Code | Usage | Description |
|-------------|-------|-------------|
| **200 OK** | GET, PUT success | Request successful with data |
| **201 Created** | POST success | New resource created |
| **204 No Content** | DELETE success | Resource deleted, no content returned |
| **400 Bad Request** | Validation errors | Invalid input or parameters |
| **404 Not Found** | Resource not found | Restaurant or route doesn't exist |
| **500 Internal Server Error** | Server errors | Database or server issues |

### Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Detailed error (development mode only)"
}
```

## 🏗️ Architecture

### Project Structure

```
restaurant-website/
├── models/
│   └── Restaurant.js          # Mongoose schema with validation
├── modules/
│   ├── db.js                  # Database connection & core functions
│   └── restaurantService.js   # Business logic layer
├── routes/
│   └── restaurants.js         # API routes with validation
├── scripts/
│   ├── insertSampleData.js    # Sample data insertion
│   └── insertSampleDataReplace.js
├── sample-data.json           # Sample restaurant data
├── server.js                  # Main server file
├── .env                       # Environment configuration
└── package.json               # Dependencies and scripts
```

### Component Responsibilities

#### Database Module (`modules/db.js`)
- MongoDB connection management
- Core CRUD operations
- Database-level error handling
- Connection status monitoring

#### Restaurant Routes (`routes/restaurants.js`)
- HTTP request handling
- Query parameter validation
- Response formatting
- Status code management
- Input sanitization

#### Restaurant Model (`models/Restaurant.js`)
- Mongoose schema definition
- Data validation rules
- Virtual fields and indexing
- Collection name specification

### Server Initialization Flow

1. **Environment Loading**: Load `.env` configuration
2. **Database Connection**: Initialize MongoDB Atlas connection
3. **Connection Validation**: Verify successful database connection
4. **Server Startup**: Start Express server only after DB success
5. **Error Handling**: Display detailed error messages on failure
6. **Graceful Shutdown**: Handle process termination signals

## 🧪 Testing

### Sample Data Scripts

```bash
# Insert sample data (preserves existing)
npm run seed

# Replace all data with fresh sample
npm run seed-replace

# Direct script execution
node scripts/insertSampleData.js
```

### Test Cases for Validation

#### Valid Requests:
```bash
curl "http://localhost:3000/api/restaurants"
curl "http://localhost:3000/api/restaurants?page=2&perPage=5"
curl "http://localhost:3000/api/restaurants?borough=Manhattan"
curl "http://localhost:3000/api/restaurants?page=1&perPage=3&borough=Brooklyn"
```

#### Invalid Requests (400 Bad Request):
```bash
curl "http://localhost:3000/api/restaurants?page=0"
curl "http://localhost:3000/api/restaurants?perPage=150"
curl "http://localhost:3000/api/restaurants?borough="
curl "http://localhost:3000/api/restaurants?invalidParam=value"
```

## 🚀 Development & Deployment

### Development Commands

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Check API health
curl http://localhost:3000/health

# Insert sample data
npm run seed
```

### Production Deployment

1. Set `NODE_ENV=production` environment variable
2. Use process manager (PM2 recommended)
3. Configure proper logging and monitoring
4. Set up health check monitoring on `/health` endpoint
5. Ensure MongoDB Atlas IP whitelist includes production server

### Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/restaurants?retryWrites=true&w=majority
PORT=3000
NODE_ENV=production
```

## 📋 API Testing Examples

### Using cURL

```bash
# Get all restaurants
curl -X GET "http://localhost:3000/api/restaurants"

# Get restaurants with pagination
curl -X GET "http://localhost:3000/api/restaurants?page=1&perPage=5"

# Filter by borough
curl -X GET "http://localhost:3000/api/restaurants?borough=Manhattan"

# Get specific restaurant
curl -X GET "http://localhost:3000/api/restaurants/507f1f77bcf86cd799439011"

# Create new restaurant
curl -X POST "http://localhost:3000/api/restaurants" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Restaurant","address":{"street":"123 Test St","city":"New York","state":"NY","zipCode":"10001","borough":"Manhattan"},"borough":"Manhattan","cuisine":"American","phone":"(212) 555-0123","email":"test@restaurant.com"}'

# Update restaurant
curl -X PUT "http://localhost:3000/api/restaurants/507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Restaurant Name","cuisine":"Italian"}'

# Delete restaurant
curl -X DELETE "http://localhost:3000/api/restaurants/507f1f77bcf86cd799439011"
```

## 📞 Support & Troubleshooting

### Common Issues

1. **Connection Failed**: Verify MongoDB Atlas connection string and IP whitelist
2. **Validation Errors**: Check required fields and data formats
3. **Invalid ObjectId**: Ensure restaurant IDs are valid 24-character hex strings
4. **Query Parameter Errors**: Verify parameter names and value formats

### Debugging

- Check server logs for detailed error messages
- Use `/health` endpoint to verify database connectivity
- Set `NODE_ENV=development` for detailed error responses

## 📄 License

MIT License

---

**Built with ❤️ using Express.js, MongoDB, and comprehensive validation practices.**