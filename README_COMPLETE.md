# Ridit - Waste Collection Platform

A smart waste collection platform connecting sellers and collectors of recyclable materials.

## 🎯 Features

### For Sellers
- Register and login with phone/email
- List waste materials with images
- Set pickup slots and locations
- Get instant price estimates
- Track collection status (Pending → Accepted → Collected)
- View final prices paid

### For Collectors
- Register and login
- Set location and search radius (up to 50km)
- Browse available waste items by category
- Filter items by distance
- Accept collection requests
- Track collections and earnings
- Complete collections and record weights

## 🏗️ Architecture

```
ridit/
├── backend/           # FastAPI Backend
│   ├── app.py        # Main app with routes
│   ├── models.py     # Pydantic data models
│   ├── firebase_config.py
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py       # Authentication (register/login)
│       ├── seller.py     # Seller operations
│       ├── collector.py  # Collector operations
│       └── items.py      # Item management (deprecated)
│
└── frontend/          # React Frontend
    ├── public/
    ├── src/
    │   ├── api.js       # API client
    │   ├── App.js       # Main app with routing
    │   ├── index.js
    │   ├── components/
    │   │   └── AddItem.jsx
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── SellerDashboard.jsx
    │   │   └── CollectorDashboard.jsx
    │   └── styles/
    │       ├── Auth.css
    │       ├── Dashboard.css
    │       ├── AddItem.css
    │       ├── Home.css
    │       └── index.css
    └── package.json
```

## 🚀 Getting Started

### Backend Setup

1. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure Firebase**
- Add your `serviceAccountKey.json` to the backend directory
- Update `firebase_config.py` with your project ID

3. **Run the server**
```bash
# Development with auto-reload
python -m uvicorn app:app --reload

# Or simply
python app.py
```

The backend will run on `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Frontend Setup

1. **Install Node dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment**
Create `.env` file:
```bash
cp .env.example .env
# REACT_APP_API_URL=http://localhost:8000/api
```

3. **Run the development server**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/{user_id}` - Get user profile

### Seller Operations
- `POST /api/seller/items/add?seller_id={id}` - Add waste item
- `GET /api/seller/items/{seller_id}` - Get seller's items
- `GET /api/seller/items/{item_id}/status` - Check item status
- `PUT /api/seller/items/{item_id}/cancel` - Cancel item

### Collector Operations
- `PUT /api/collector/location/{collector_id}` - Set location
- `GET /api/collector/items` - Get available items
- `POST /api/collector/items/{item_id}/accept?collector_id={id}` - Accept item
- `POST /api/collector/items/{item_id}/complete` - Complete collection

### System
- `GET /` - Root endpoint
- `GET /health` - Health check

## 💾 Database Schema (Firestore)

### Collections

**users**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "user_type": "seller|collector",
  "password_hash": "hashed_password",
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "search_radius_km": 10
  },
  "total_collections": 5,
  "rating": 4.5,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**items**
```json
{
  "id": "item_id",
  "seller_id": "seller_user_id",
  "seller_name": "John Doe",
  "seller_phone": "9876543210",
  "category": "plastic|paper|metal|ewaste",
  "quantity": "10 units",
  "description": "Used plastic bottles",
  "image_url": "base64_or_url",
  "estimated_price": 150,
  "final_price": 180,
  "actual_weight": 12,
  "status": "pending|accepted|collected|cancelled",
  "address": {
    "street": "Street Name",
    "city": "Bangalore",
    "zip_code": "560001",
    "coordinates": {
      "lat": 12.9716,
      "lng": 77.5946
    }
  },
  "pickup_slot": {
    "date": "2024-02-15",
    "start_time": "10:00",
    "end_time": "12:00"
  },
  "accepted_by": "collector_user_id",
  "collector_name": "Jane Collector",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## 💰 Pricing Model

- **Plastic**: ₹15 per unit
- **Paper**: ₹10 per unit
- **Metal**: ₹40 per unit
- **E-Waste**: ₹60 per unit

**Note**: Estimated price is based on quantity. Final price is calculated after weighing.

## 🔐 Security Features

- Password hashing (SHA-256)
- Phone number validation
- User type verification
- Location-based filtering
- Transaction tracking

## 📱 User Flows

### Seller Flow
1. Register with phone and password
2. Add waste item with category, quantity, description, image
3. Set pickup location and preferred time slot
4. Get instant price estimate
5. Wait for collector to accept
6. Hand over waste and receive payment
7. Track collection status

### Collector Flow
1. Register with phone and password
2. Set current location and search radius
3. Browse available items in your area
4. Filter by waste category
5. Accept item to get seller details
6. Visit seller location during pickup slot
7. Weigh the waste
8. Pay based on actual weight
9. Mark as collected

## 🔄 Collection Status Flow

```
Item Listed
    ↓
Pending (Waiting for collector)
    ↓
Accepted (Collector assigned)
    ↓
Collected (Waste collected, payment done)
    ↓
Complete
```

Alternative:
```
Item Listed → Pending → Cancelled (if seller cancels)
```

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### Test Item Addition
```bash
curl -X POST "http://localhost:8000/api/seller/items/add?seller_id=USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "plastic",
    "quantity": "10",
    "description": "Plastic bottles and containers",
    "image_url": "base64_image_data",
    "address": {
      "street": "123 Main St",
      "city": "Bangalore",
      "zip_code": "560001",
      "coordinates": {"lat": 12.9716, "lng": 77.5946}
    },
    "pickup_slot": {
      "date": "2024-02-15",
      "start_time": "10:00",
      "end_time": "12:00"
    }
  }'
```

## 📊 Monitoring

Health check endpoint provides:
- API status
- Uptime
- Database connectivity
- Service status
- Response times

```bash
curl http://localhost:8000/health
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Check Firebase credentials
- Verify `serviceAccountKey.json` exists

### Frontend can't connect to backend
- Check if backend is running on port 8000
- Verify `REACT_APP_API_URL` in `.env`
- Check CORS settings in backend

### CORS errors
- Backend has CORS enabled for all origins
- Check browser console for specific errors

## 📝 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

### Backend
Firebase configuration via `serviceAccountKey.json`

## 🚢 Deployment

### Backend Deployment
- Use Gunicorn or similar ASGI server
- Set `reload=False` in production
- Configure proper logging
- Use environment variables for secrets

### Frontend Deployment
- Build: `npm run build`
- Serve static files from `/build` directory
- Set `REACT_APP_API_URL` to production backend

## 📚 Dependencies

### Backend
- FastAPI
- Uvicorn
- Firebase Admin
- Pydantic
- Python-dotenv

### Frontend
- React 18
- React Router
- Axios
- React Icons

## 📄 License

MIT

## 👥 Support

For issues and questions, please contact the development team.

---

**Happy Waste Collecting! ♻️**
