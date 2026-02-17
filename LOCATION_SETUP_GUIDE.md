# Location-Based Item Visibility System

## Overview
The system now implements a **10km radius filtering** where waste items are only visible to collectors within 10km of the seller's location.

---

## How It Works

### For Sellers:

#### 1. **Set Your Location** (First Time or Update)
   - Click **"📍 Set Location"** button in the Seller Dashboard header
   - Choose location using the interactive map:
     - **Search**: Type your area name (e.g., "Koti, Hyderabad")
     - **Click**: Click directly on the map to pin your exact location
   - System automatically fetches area name from the map
   - Click **"Confirm Location"** to save

#### 2. **View Your Location**
   - Your location is displayed in the header under your name
   - Shows area name (e.g., "Koti, Hyderabad") or coordinates
   - Button changes to **"📍 Update Location"** after first setup

#### 3. **Add Items**
   - When you add items, collectors will only see them if they're within 10km
   - Items are linked to your stored location
   - Each item shows distance from collector

---

### For Collectors:

#### 1. **Set Your Search Location** (Similar to Seller)
   - Click **"Update Your Location"** button in Collector Dashboard
   - Set your location using the map interface
   - Set your search radius (default: 10km, max: 50km)

#### 2. **See Available Items**
   - **Only items within 10km of your location are visible**
   - System calculates distance from:
     - Your location (collector) 
     - Seller's stored location (or item address if seller location not set)
   - Items show `distance_km` field
   - Items beyond 10km are automatically filtered out

#### 3. **Item Visibility Logic**
```
IF (seller_has_location_set) THEN
    use_seller_location
ELSE
    use_item_address_coordinates
END

IF (distance_from_collector_to_seller < 10km) THEN
    show_item_to_collector
ELSE
    hide_item
END
```

---

## Database Structure

### Seller Profile
```json
{
  "id": "seller_id",
  "name": "Seller Name",
  "user_type": "seller",
  "location": {
    "latitude": 17.3850,
    "longitude": 78.4867,
    "area_name": "Koti, Hyderabad"
  }
}
```

### Item Data
```json
{
  "id": "item_id",
  "seller_id": "seller_id",
  "category": "plastic",
  "address": {
    "street": "...",
    "city": "Hyderabad",
    "coordinates": {
      "lat": 17.3850,
      "lng": 78.4867
    }
  },
  "status": "pending",
  "distance_km": 2.5  // Calculated when fetched
}
```

---

## Backend Endpoints

### Seller Location
```
PUT  /api/seller/location/{seller_id}
GET  /api/seller/location/{seller_id}
```

**Request Body (PUT)**:
```json
{
  "latitude": 17.3850,
  "longitude": 78.4867,
  "area_name": "Koti, Hyderabad"
}
```

**Response**:
```json
{
  "message": "Location updated successfully",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "area_name": "Koti, Hyderabad"
}
```

### Get Available Items (Filtering)
```
GET /api/collector/items
```

**Query Parameters**:
- `collector_id` (required)  
- `latitude` (auto-fetched if not provided)
- `longitude` (auto-fetched if not provided)
- `category` (optional)
- `radius_km` (optional, max 50)

**Filtering Logic**:
1. Get collector's location
2. Get all pending items
3. For each item:
   - Get seller's stored location (or use item's address)
   - Calculate distance from collector to seller
   - **Only include if distance ≤ 10km**
4. Return filtered items with distance

---

## Frontend Components

### GLocationPicker.jsx
- Reusable map component using Leaflet.js
- Search by location name
- Click on map to select
- Returns: `{ latitude, longitude, areaName }`

### SellerDashboard.jsx
- Location setup button
- Display current location
- Location picker modal

### CollectorDashboard.jsx
- Location update modal
- Shows distance for each item
- Auto-filters by 10km

---

## Distance Calculation

Using **Haversine Formula** (backend):
```python
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    # ... calculates great-circle distance
    return distance_in_km
```

**Example**:
- Seller in Koti (17.3700, 78.4750)
- Collector in Somajiguda (17.3850, 78.4867)
- Distance: ~2.5 km ✓ (visible)

- Collector in Secunderabad (17.3750, 78.5125)
- Distance: ~3.5 km ✓ (visible)

- Collector in Kukatpally (17.4475, 78.4385)
- Distance: ~11.5 km ✗ (not visible)

---

## Features Implemented

✅ **Seller Location Setup**
- Set during dashboard
- Set when adding items (optional)
- Update anytime

✅ **10km Radius Filtering**
- Automatic distance calculation
- Server-side filtering (secure)
- Distance displayed to collector

✅ **Interactive Map**
- Search by location name
- Click to select exact point
- Area name autocomplete
- Free (OpenStreetMap + Nominatim)

✅ **User Experience**
- Location shown in header
- Easy update mechanism
- Clear distance info
- No API keys needed

---

## Testing Checklist

- [ ] Seller sets location successfully
- [ ] Location displays in header  
- [ ] Collector location update works
- [ ] Items appear within 10km only
- [ ] Items beyond 10km are hidden
- [ ] Distance calculation is accurate
- [ ] Map search works
- [ ] Location can be updated anytime
- [ ] Works on mobile browsers
- [ ] Works offline (map tiles cached)

