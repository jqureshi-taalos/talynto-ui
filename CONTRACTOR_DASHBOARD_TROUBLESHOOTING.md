# Contractor Dashboard Troubleshooting Guide

## Current Issue
Error: "Unexpected token '<', '<!DOCTYPE'..." indicates the API is returning HTML instead of JSON.

## Step-by-Step Debugging Process

### 1. Check Browser Console
Open browser Developer Tools (F12) and check the Console tab for:
- API request URL being called
- Response status codes
- Any network errors
- Token information

### 2. Check Network Tab
In Developer Tools, go to Network tab:
- Look for the request to `/dashboard/contractor`
- Check the response content
- Verify the request headers include Authorization

### 3. Verify API Base URL
Check if the API server is running on the correct port:
- Default URL: `http://localhost:54193/api`
- Check `.env` file: `REACT_APP_API_BASE_URL=http://localhost:54193/api`

### 4. Test API Endpoints Manually

#### Test 1: Basic Connectivity
```bash
curl -X GET "http://localhost:54193/api/auth/test" \
  -H "Content-Type: application/json"
```

#### Test 2: Authentication Check
```bash
curl -X POST "http://localhost:54193/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor.test@example.com",
    "password": "password123"
  }'
```

#### Test 3: Dashboard Endpoint
```bash
curl -X GET "http://localhost:54193/api/dashboard/contractor" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 5. Common Issues and Solutions

#### Issue: API Server Not Running
**Symptoms:** Network error, connection refused
**Solution:** 
1. Start the backend server
2. Verify it's running on port 54193
3. Check for any startup errors

#### Issue: Wrong API URL
**Symptoms:** 404 Not Found, HTML response
**Solution:**
1. Check `.env` file for correct API base URL
2. Verify backend is running on expected port
3. Check proxy configuration in `package.json`

#### Issue: CORS Problems
**Symptoms:** CORS policy errors in console
**Solution:**
1. Ensure backend has CORS configured for frontend URL
2. Check if API allows the frontend origin
3. Verify headers are being sent correctly

#### Issue: Authentication Token Issues
**Symptoms:** 401 Unauthorized, invalid token errors
**Solution:**
1. Check if token exists in localStorage
2. Verify token format (should be JWT)
3. Check token expiration
4. Try logging in again

#### Issue: Route Not Found
**Symptoms:** 404 error, HTML response
**Solution:**
1. Verify the dashboard controller has the contractor endpoints
2. Check if the routes are properly registered
3. Ensure the controller is being loaded

### 6. Debugging Code Added

The ContractorDashboard component now includes:
- Detailed console logging
- API request debugging
- Fallback mock data in development
- Better error handling

### 7. Quick Fix: Use Fallback Data

If the API isn't working, the component will automatically fall back to mock data in development mode. This allows you to:
1. See the UI working with sample data
2. Verify the frontend implementation
3. Isolate backend issues

### 8. Manual Testing Steps

1. **Login as Contractor:**
   - Use email: `contractor.test@example.com`
   - Use password: `password123` (or whatever password was set)

2. **Navigate to Dashboard:**
   - Should automatically redirect after login
   - Or navigate to `/contractor-dashboard`

3. **Check Browser Console:**
   - Look for API request logs
   - Check for any errors or warnings
   - Verify token is being sent

4. **Test with Mock Data:**
   - If API fails, mock data should display
   - This confirms UI is working correctly

### 9. Next Steps Based on Console Output

#### If you see "Using fallback mock data":
- Backend is not responding correctly
- Check if backend server is running
- Verify API endpoint exists

#### If you see "API request failed":
- Check the specific error message
- Verify authentication token
- Test endpoint manually with curl

#### If you see "Dashboard data received":
- API is working but data might be malformed
- Check backend response format
- Verify DTOs match expected structure

### 10. Expected API Response Format

The contractor dashboard endpoint should return:
```json
{
  "stats": {
    "totalProjects": 6,
    "activeProjects": 3,
    "completedProjects": 2,
    "totalHoursLogged": 162
  },
  "recentProjects": [
    {
      "id": 1,
      "name": "Q3 Financial Audit",
      "status": "Active",
      "workedHours": "36 Hrs",
      "estimatedHours": "40 Hrs",
      "color": "#4EC1EF",
      "clientName": "Jane Client"
    }
  ],
  "recentInvoices": [
    {
      "id": 1,
      "name": "Q3 Financial Audit",
      "status": "Approved",
      "amount": "$5000.00",
      "color": "#4EC1EF",
      "clientName": "Jane Client"
    }
  ],
  "profileInfo": {
    "name": "John Contractor",
    "status": "Approved",
    "availability": "30 Hrs/Week",
    "rating": 4.8,
    "reviewCount": 25,
    "jobTitle": "Senior Financial Analyst",
    "isVerified": true
  }
}
```

## Let me know what you see in the browser console and I can help you debug further!