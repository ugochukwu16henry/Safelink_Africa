#!/bin/bash

# SafeLink Africa API Testing Script
# Tests all API endpoints to verify they work

echo "🧪 Testing SafeLink Africa APIs..."
echo ""

BASE_URL="http://localhost"
AUTH_TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
            ${AUTH_TOKEN:+-H "Authorization: Bearer $AUTH_TOKEN"})
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$url" \
            -H "Content-Type: application/json" \
            ${AUTH_TOKEN:+-H "Authorization: Bearer $AUTH_TOKEN"} \
            ${data:+-d "$data"})
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Check if services are running
echo "📡 Checking if services are running..."
services=("3001:auth" "3002:emergency" "3003:reporting" "3004:transport" "3005:notifications")

for service in "${services[@]}"; do
    port="${service%%:*}"
    name="${service##*:}"
    if curl -s "http://localhost:$port/health" > /dev/null; then
        echo -e "${GREEN}✓${NC} $name service (port $port) is running"
    else
        echo -e "${RED}✗${NC} $name service (port $port) is NOT running"
        echo "  Start it with: npm run dev:$name"
    fi
done

echo ""
echo "🔐 Testing Auth Service..."
echo ""

# Test Auth Service
test_endpoint "POST" "$BASE_URL:3001/api/auth/register" \
    '{"phoneNumber":"+2341234567890","firstName":"Test","lastName":"User","password":"password123","country":"NG"}' \
    "User Registration"

# Login to get token
echo -n "Logging in to get auth token... "
login_response=$(curl -s -X POST "$BASE_URL:3001/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"phoneNumber":"+2341234567890","password":"password123"}')

AUTH_TOKEN=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$AUTH_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} Token obtained"
else
    echo -e "${RED}✗${NC} Failed to get token"
    exit 1
fi

echo ""
echo "👤 Testing User Endpoints..."
test_endpoint "GET" "$BASE_URL:3001/api/users/me" "" "Get User Profile"

echo ""
echo "🚨 Testing Emergency Service..."
test_endpoint "POST" "$BASE_URL:3002/api/emergency/trigger" \
    '{"type":"security","latitude":6.5244,"longitude":3.3792,"message":"Test emergency"}' \
    "Trigger Emergency"

EMERGENCY_ID=$(curl -s -X POST "$BASE_URL:3002/api/emergency/trigger" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{"type":"security","latitude":6.5244,"longitude":3.3792}' | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$EMERGENCY_ID" ]; then
    test_endpoint "GET" "$BASE_URL:3002/api/emergency/$EMERGENCY_ID" "" "Get Emergency Details"
    test_endpoint "GET" "$BASE_URL:3002/api/emergency/history" "" "Get Emergency History"
fi

echo ""
echo "📝 Testing Reporting Service..."
test_endpoint "POST" "$BASE_URL:3003/api/reports" \
    '{"category":"crime","title":"Test Report","description":"This is a test incident report","latitude":6.5244,"longitude":3.3792,"anonymous":false}' \
    "Create Incident Report"

test_endpoint "GET" "$BASE_URL:3003/api/reports" "" "Get Reports"
test_endpoint "GET" "$BASE_URL:3003/api/reports/nearby?latitude=6.5244&longitude=3.3792&radius=5000" "" "Get Nearby Reports"

echo ""
echo "🚗 Testing Transport Service..."
test_endpoint "POST" "$BASE_URL:3004/api/transport/trips" \
    '{"startLatitude":6.5244,"startLongitude":3.3792,"endLatitude":6.4550,"endLongitude":3.3941}' \
    "Start Trip"

TRIP_ID=$(curl -s -X POST "$BASE_URL:3004/api/transport/trips" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{"startLatitude":6.5244,"startLongitude":3.3792,"endLatitude":6.4550,"endLongitude":3.3941}' | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$TRIP_ID" ]; then
    test_endpoint "POST" "$BASE_URL:3004/api/transport/trips/$TRIP_ID/location" \
        '{"latitude":6.5000,"longitude":3.3500}' \
        "Update Trip Location"
    test_endpoint "GET" "$BASE_URL:3004/api/transport/trips" "" "Get Trip History"
fi

echo ""
echo "📬 Testing Notifications Service..."
test_endpoint "POST" "$BASE_URL:3005/api/notifications/send" \
    '{"userId":"test-user","type":"system_notification","channel":"push","title":"Test","message":"Test notification"}' \
    "Send Notification"

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "Summary:"
echo "- All endpoints tested"
echo "- Check results above for any failures"

