# Contractor Project View Testing Guide

## Overview
This document provides comprehensive testing instructions for the newly implemented dynamic contractor project view page based on the reference image.

## Features Implemented

### ✅ **Dynamic Data Integration**
- **API Endpoint**: `/api/dashboard/contractor/project/{projectId}`
- **Real-time Data**: Project details fetched from database instead of hardcoded
- **Security**: Proper authentication and authorization checks
- **Error Handling**: Graceful error handling with fallback data

### ✅ **Enhanced Database Schema**
- **New Fields**: Added `ExpertiseRequired` and `SoftwareTools` fields to Projects table
- **Migration Script**: `09_Add_Project_Expertise_And_Software_Fields.sql`
- **Sample Data**: Updated existing projects with expertise and software tools

### ✅ **UI/UX Matching Reference Image**
- **Layout**: Two-column layout matching the reference design
- **Project Details**: Left column with project information
- **Requirements**: Right column with requirements and expectations
- **Badges**: Expertise, certification, and software tools displayed as badges
- **Styling**: Clean, professional appearance matching the reference

### ✅ **Backend API**
- **Controller**: `DashboardController.GetContractorProjectDetails`
- **Service**: `DashboardService.GetContractorProjectDetailsAsync`
- **DTO**: `ContractorProjectDetailsDto` with comprehensive project information
- **Security**: Validates contractor access to specific projects

## Testing Instructions

### 1. **Prerequisites**
```bash
# Run the database migration script first
# Execute: 09_Add_Project_Expertise_And_Software_Fields.sql
# This adds the new fields and updates existing projects with sample data

# Run the original sample data script if needed
# Execute: 08_Add_Sample_Contractor_Dashboard_Data.sql
```

### 2. **Authentication**
```bash
# Login as contractor
Email: contractor.test@example.com
Password: password123 (or configured password)
```

### 3. **Navigation Flow**
1. Navigate to `/contractor-projects`
2. Click "View" (eye icon) on any project in the action menu
3. Should navigate to `/contractor-project-summary/{projectId}`
4. Should display the project details page

### 4. **Page Layout Tests**

#### **Test 1: Header Section**
- ✅ Should display "Project Summary" title
- ✅ Should show three action buttons: "← Back", "Chat with Client", "Submit Invoice"
- ✅ "Back" button should navigate to projects list
- ✅ "Submit Invoice" button should have blue styling

#### **Test 2: Left Column - Project Details**
- ✅ Should display project name with status badge
- ✅ Should show project information in labeled rows:
  - Start Date
  - Work Model
  - Location
  - Hourly Rate
  - Project Type
- ✅ Should display client profile with avatar and name
- ✅ Client avatar should show client initials

#### **Test 3: Right Column - Requirements**
- ✅ Should display project description (if available)
- ✅ Should show "Requirements & Expectations" section
- ✅ Should display expertise required as badges
- ✅ Should display certification needed as badges
- ✅ Should display software tools as badges
- ✅ Should show "Add Hours" section with input and submit button

### 5. **Dynamic Data Tests**

#### **Test 1: Project Information**
- ✅ Project name should match database record
- ✅ Status should be displayed correctly (Active, Pending, Closed)
- ✅ Dates should be formatted as DD/MM/YYYY
- ✅ Hourly rate should be formatted as currency
- ✅ Location should combine state and country

#### **Test 2: Client Information**
- ✅ Client name should be constructed from first and last name
- ✅ Client avatar should show initials (first letter of first + last name)
- ✅ Client information should match the assigned client

#### **Test 3: Requirements Badges**
- ✅ Expertise required should be parsed from comma-separated string
- ✅ Certifications should be parsed from comma-separated string
- ✅ Software tools should be parsed from comma-separated string
- ✅ Empty fields should not display badges

### 6. **API Testing**

#### **Test API Endpoint Manually**
```bash
# Get specific project details
curl -X GET "http://localhost:54193/api/dashboard/contractor/project/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### **Expected API Response**
```json
{
  "id": 1,
  "name": "Q3 Financial Audit",
  "status": "Active",
  "startDate": "22/05/2024",
  "endDate": "19/06/2024",
  "workModel": "Remote",
  "location": "US Based",
  "hourlyRate": "$75.00",
  "color": "#4EC1EF",
  "description": "Comprehensive quarterly financial audit...",
  "projectType": "Audit",
  "client": {
    "id": 2,
    "name": "Jane Client",
    "avatar": "JC",
    "email": "client.test@example.com"
  },
  "expertiseRequired": ["TAX", "SOX"],
  "certificationNeeded": ["CPA", "CFA"],
  "softwareTools": ["QuickBooks", "Xero"],
  "budget": 3000.00,
  "estimatedHours": 40,
  "workedHours": 36,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T15:45:00Z"
}
```

### 7. **Error Handling Tests**

#### **Test 1: Invalid Project ID**
- Navigate to `/contractor-project-summary/999999`
- ✅ Should show "Project not found" error message
- ✅ Should provide "Back to Projects" button

#### **Test 2: Access Denied**
- Try to access project assigned to different contractor
- ✅ Should show "Project not found or access denied" message
- ✅ Should not expose sensitive information

#### **Test 3: Network Error**
- Disable network/backend
- ✅ Should show error message with retry button
- ✅ Should fallback to mock data in development mode

#### **Test 4: Authentication Error**
- Use invalid token
- ✅ Should redirect to login page
- ✅ Should not show project details

### 8. **UI/UX Tests**

#### **Test 1: Responsive Design**
- ✅ Should work on different screen sizes
- ✅ Should stack columns on mobile devices
- ✅ Action buttons should be accessible on mobile

#### **Test 2: Visual Consistency**
- ✅ Status badges should have consistent styling
- ✅ Requirement badges should be properly styled
- ✅ Client avatar should match design
- ✅ Cards should have consistent spacing and shadows

#### **Test 3: Accessibility**
- ✅ Should be keyboard accessible
- ✅ Should have proper heading hierarchy
- ✅ Should have sufficient color contrast

### 9. **Integration Tests**

#### **Test 1: Projects List Integration**
- ✅ Clicking "View" from projects list should navigate correctly
- ✅ Project ID should be passed correctly in URL
- ✅ Data should match between list and detail views

#### **Test 2: Dashboard Integration**
- ✅ Should integrate with contractor dashboard layout
- ✅ Sidebar navigation should work correctly
- ✅ Should maintain authentication state

#### **Test 3: Action Buttons**
- ✅ "Back" button should return to projects list
- ✅ "Chat with Client" should navigate to messages (if implemented)
- ✅ "Submit Invoice" should navigate to invoice submission
- ✅ "Add Hours" functionality should work (if implemented)

### 10. **Database Tests**

#### **Verify Database Schema**
```sql
-- Check if new fields were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Projects' 
  AND COLUMN_NAME IN ('ExpertiseRequired', 'SoftwareTools');

-- Check sample data
SELECT Id, Name, Status, ExpertiseRequired, SoftwareTools, Certifications
FROM Projects
WHERE AssignedContractorId = (SELECT Id FROM Users WHERE Email = 'contractor.test@example.com');
```

#### **Sample Data Verification**
- ✅ ExpertiseRequired field should contain comma-separated values
- ✅ SoftwareTools field should contain comma-separated values
- ✅ Existing projects should have sample data populated

### 11. **Performance Tests**

#### **Test 1: Loading Time**
- ✅ Page should load within 2 seconds
- ✅ API response should be under 500ms
- ✅ Images and assets should load quickly

#### **Test 2: Database Queries**
- ✅ Should use efficient queries with proper joins
- ✅ Should not have N+1 query problems
- ✅ Should include proper error handling

## Success Criteria

### ✅ **Functional Requirements**
- Project details display correctly with real data
- All fields match the reference image layout
- Navigation works correctly between pages
- Error handling works gracefully
- Security checks prevent unauthorized access

### ✅ **UI/UX Requirements**
- Layout matches the reference image
- Badges display correctly for requirements
- Responsive design works on all devices
- Professional appearance with consistent styling

### ✅ **Performance Requirements**
- Page loads within 2 seconds
- API responses within 500ms
- No memory leaks or performance issues

### ✅ **Security Requirements**
- Proper authentication checks
- Authorization validates contractor access
- No sensitive data exposure
- Secure API endpoints

## Database Changes

### ✅ **New Fields Added**
- `ExpertiseRequired` (NVARCHAR(500)) - Comma-separated expertise tags
- `SoftwareTools` (NVARCHAR(500)) - Comma-separated software tools

### ✅ **Migration Script**
- **File**: `09_Add_Project_Expertise_And_Software_Fields.sql`
- **Purpose**: Adds new fields and populates sample data
- **Backward Compatible**: Existing functionality unchanged

### ✅ **Sample Data**
- Updated existing projects with expertise and software tools
- Comma-separated format for easy parsing
- Realistic data for testing

## API Endpoints

### ✅ **New Endpoint**
- **URL**: `GET /api/dashboard/contractor/project/{projectId}`
- **Authentication**: Bearer token required
- **Authorization**: Contractor role required
- **Validation**: Project must be assigned to requesting contractor

### ✅ **Response Format**
- **Success**: 200 OK with project details
- **Not Found**: 404 with error message
- **Forbidden**: 403 with access denied message
- **Unauthorized**: 401 redirects to login

## Known Limitations

### **Current Limitations**
1. **Add Hours Functionality**: UI is present but backend not implemented
2. **Real-time Updates**: No WebSocket integration for live updates
3. **File Attachments**: No support for project documents
4. **Comments**: No commenting system on projects

### **Future Enhancements**
1. **Time Tracking**: Implement actual hours logging
2. **File Management**: Add document upload/download
3. **Activity Timeline**: Show project history and updates
4. **Notifications**: Real-time notifications for project updates

## Troubleshooting

### **Common Issues**
1. **"Project not found"** - Check if project is assigned to contractor
2. **"API request failed"** - Check authentication and API server
3. **"Loading forever"** - Check network connection and database
4. **Missing badges** - Check if database fields are populated

### **Debug Steps**
1. Check browser console for errors
2. Verify API response in Network tab
3. Check authentication token validity
4. Verify database has sample data
5. Check API server is running on correct port

This comprehensive testing guide ensures that the contractor project view is fully functional, secure, and matches the reference image design.