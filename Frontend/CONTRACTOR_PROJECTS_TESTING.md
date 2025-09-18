# Contractor Projects Page Testing Guide

## Overview
This document provides comprehensive testing instructions for the newly implemented dynamic contractor projects page.

## Features Implemented

### ✅ **Dynamic Data Integration**
- **API Endpoint**: `/api/dashboard/contractor/projects-list`
- **Real-time Data**: Projects fetched from database instead of hardcoded
- **Pagination**: Server-side pagination with configurable page size
- **Filtering**: Dynamic filtering by project status (All, Active, Closed, Pending)

### ✅ **Enhanced UI/UX**
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: Graceful error handling with retry functionality
- **Fallback Data**: Mock data in development mode if API fails
- **Responsive Design**: Improved table layout and styling
- **Better Alignments**: Fixed table alignments and styling issues

### ✅ **Backend API**
- **Controller**: `DashboardController.GetContractorProjectsList`
- **Service**: `DashboardService.GetContractorProjectsListAsync`
- **DTOs**: `ContractorProjectsListDto`, `ContractorProjectListItemDto`, `ClientInfoDto`
- **Database Integration**: Real queries with proper relationships

## Testing Instructions

### 1. **Prerequisites**
```bash
# Run the sample data script first
# Execute: 08_Add_Sample_Contractor_Dashboard_Data.sql
# This creates 12 projects with different statuses for testing
```

### 2. **Authentication**
```bash
# Login as contractor
Email: contractor.test@example.com
Password: password123 (or configured password)
```

### 3. **Basic Functionality Tests**

#### **Test 1: Page Load**
- Navigate to `/contractor-projects`
- ✅ Should show loading state initially
- ✅ Should display projects table with data
- ✅ Should show filter options (All, Active, Closed, Pending)
- ✅ Should display pagination if more than 10 projects

#### **Test 2: Project Display**
- ✅ Each project should show:
  - Project name
  - Start date - End date (or "Ongoing")
  - Client name with avatar
  - Status badge with proper styling
  - Action menu (⋮) with View, Clone, Request Invoice options

#### **Test 3: Filtering**
- ✅ Click "All" - Should show all projects
- ✅ Click "Active" - Should show only active projects
- ✅ Click "Closed" - Should show only closed projects
- ✅ Click "Pending" - Should show only pending projects
- ✅ Page should reset to 1 when filter changes

#### **Test 4: Pagination**
- ✅ Should show pagination controls if more than 10 projects
- ✅ "Previous" button disabled on first page
- ✅ "Next" button disabled on last page
- ✅ Page numbers should be accurate
- ✅ Should show "Showing X of Y projects" correctly

#### **Test 5: Actions**
- ✅ Click action menu (⋮) on any project
- ✅ Should show dropdown with options
- ✅ Click "View" - Should navigate to project summary
- ✅ Other actions should be clickable (functionality depends on implementation)

### 4. **API Testing**

#### **Test API Endpoints Manually**
```bash
# Get all projects
curl -X GET "http://localhost:54193/api/dashboard/contractor/projects-list" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get active projects only
curl -X GET "http://localhost:54193/api/dashboard/contractor/projects-list?status=active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get with pagination
curl -X GET "http://localhost:54193/api/dashboard/contractor/projects-list?page=1&pageSize=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### **Expected API Response**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Q3 Financial Audit",
      "status": "Active",
      "startDate": "22/05/2024",
      "endDate": "19/06/2024",
      "color": "#4EC1EF",
      "client": {
        "id": 2,
        "name": "Jane Client",
        "avatar": "JC",
        "email": "client.test@example.com"
      },
      "workedHours": "36 Hrs",
      "estimatedHours": "40 Hrs",
      "hourlyRate": 75.00,
      "description": "Comprehensive quarterly financial audit",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T15:45:00Z"
    }
  ],
  "totalCount": 12,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

### 5. **Error Handling Tests**

#### **Test 1: Network Error**
- Disable network/backend
- ✅ Should show error message with retry button
- ✅ Should fallback to mock data in development mode

#### **Test 2: Authentication Error**
- Use invalid token
- ✅ Should redirect to login page
- ✅ Should not show sensitive data

#### **Test 3: No Data**
- Test with contractor who has no projects
- ✅ Should show "No projects found" message
- ✅ Should not crash or show errors

### 6. **Performance Tests**

#### **Test 1: Loading Time**
- ✅ Initial page load should be under 2 seconds
- ✅ Filter changes should be under 1 second
- ✅ Pagination should be under 1 second

#### **Test 2: Large Data Sets**
- Create 100+ projects in database
- ✅ Pagination should work correctly
- ✅ Performance should remain acceptable

### 7. **UI/UX Tests**

#### **Test 1: Responsive Design**
- ✅ Table should be readable on different screen sizes
- ✅ Filter options should be accessible on mobile
- ✅ Pagination should work on mobile devices

#### **Test 2: Accessibility**
- ✅ Filter options should be keyboard accessible
- ✅ Action menus should be keyboard accessible
- ✅ Table should have proper ARIA labels

#### **Test 3: Visual Consistency**
- ✅ Status badges should have consistent colors
- ✅ Client avatars should be properly generated
- ✅ Action menus should appear on hover/click

### 8. **Browser Console Tests**

#### **Check Console for:**
- ✅ No JavaScript errors
- ✅ Proper API request logging
- ✅ No memory leaks
- ✅ Proper state management

#### **Network Tab:**
- ✅ API calls should have proper headers
- ✅ Response times should be reasonable
- ✅ No unnecessary duplicate requests

### 9. **Database Integration Tests**

#### **Verify Database Queries:**
```sql
-- Check projects assigned to contractor
SELECT p.*, u.FirstName + ' ' + u.LastName as ClientName, 
       (SELECT SUM(HoursWorked) FROM Invoices WHERE ProjectId = p.Id) as WorkedHours
FROM Projects p
JOIN Users u ON p.ClientId = u.Id
WHERE p.AssignedContractorId = (SELECT Id FROM Users WHERE Email = 'contractor.test@example.com')
ORDER BY p.UpdatedAt DESC;

-- Check project counts by status
SELECT Status, COUNT(*) as Count
FROM Projects
WHERE AssignedContractorId = (SELECT Id FROM Users WHERE Email = 'contractor.test@example.com')
GROUP BY Status;
```

### 10. **Integration Tests**

#### **Test 1: Dashboard Integration**
- ✅ "View All" button on dashboard should navigate to projects page
- ✅ Projects page should show consistent data with dashboard

#### **Test 2: Project Summary Integration**
- ✅ Clicking "View" should navigate to correct project summary
- ✅ Project summary should show consistent data

## Success Criteria

### ✅ **Functional Requirements**
- All projects display correctly with real data
- Filtering works for all status types
- Pagination works correctly
- Actions menu functions properly
- Error handling works gracefully

### ✅ **Performance Requirements**
- Page loads within 2 seconds
- Filter/pagination changes within 1 second
- No memory leaks or performance issues

### ✅ **UI/UX Requirements**
- Clean, professional appearance
- Responsive design
- Proper loading states
- Intuitive navigation

### ✅ **Security Requirements**
- Proper authentication checks
- No sensitive data exposure
- Secure API endpoints

## Known Issues & Limitations

### **Current Limitations:**
1. **Messages System**: Not implemented in database (uses mock data)
2. **Real-time Updates**: No WebSocket integration for live updates
3. **Advanced Filters**: No advanced search/filter options
4. **Bulk Actions**: No bulk operations on projects

### **Future Enhancements:**
1. **Search Functionality**: Add search by project name
2. **Advanced Filters**: Date range, client, project type filters
3. **Sorting**: Column-based sorting
4. **Export**: CSV/PDF export functionality
5. **Real-time Updates**: WebSocket integration for live data

## Troubleshooting

### **Common Issues:**
1. **"No projects found"** - Check if contractor has assigned projects
2. **"Error loading projects"** - Check API endpoint and authentication
3. **Loading forever** - Check network connection and API server
4. **Pagination not showing** - Check if total projects > page size

### **Debug Steps:**
1. Check browser console for errors
2. Verify API response in Network tab
3. Check authentication token validity
4. Verify database has sample data
5. Check API server is running on correct port

## Test Data

The sample data script creates:
- **12 Projects Total**
- **5 Active Projects**
- **4 Closed Projects**
- **3 Pending Projects**
- **Various Client Assignments**
- **Different Date Ranges**
- **Diverse Project Types**

This provides comprehensive test coverage for all filtering and pagination scenarios.