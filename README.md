#                                                     Visitor Pass Management System


## Postman Docs Link : https://documenter.getpostman.com/view/49477121/2sBXitCSp4


## Project Structure

`backend/` = Express API + MongoDB
`frontend/` = React ui

## Setup

### 1. Backend : http://localhost:5000/api || https://visitor-pass-management-system-sw19.onrender.com

Go to backend folder:

  cd backend
  npm install


* Copy `backend/.env.example` to `backend/.env` and fill value

* Run backend:

  npm run seed 
  npm start


### 2. Frontend : 

Go to frontend folder:

  cd /frontend
  npm install


Create `.env` in `frontend/`:

  REACT_APP_API_URL=http://localhost:5000/api


Run frontend:

  npm start


## How this App Works 

### Visitor (Self-service)

- Open Visitor Portal
- Register as visitor (name, email, phone, password, optional photo)
- Verify OTP from email
- Login and view their Pass
- After staff approves + schedules + issues pass, visitor can download the PDF pass

### Staff (Dashboard)

- Staff login:
  - Employee/Admin:
    - View visitors list
    - Search by name and filter by status
    - Approve /Reject
    - Schedule appointment
  - Security/Admin:
    - Issue pass after schedule
    - Scan QR for check-in and check-out
  - Admin:
    - Export CSV
    - Manage staff users

### Security (QR Scan)

- Open Scan QR from dashboard
- Select Check-In or Check-Out mode
- Scan the QR from visitor pass PDF


## Notes

- The API uses rate limiting for auth routes to reduce brute-force attacks.
- The API sanitizes request body and query using `express-mongo-sanitize` to protect from NoSQL injection.



#                                    Screensorts / Demo video Link


![ Admin Dashboard        ](/screenshots/admin-dashboard.png)
![ Security Scanner       ](/screenshots/sceurity-scanner.png)
![ Security Dashboard     ](/screenshots/security-dashboard.png)
![ Staff Dashboard        ](/screenshots/staff-dashboard.png)
![ Staff Login            ](/screenshots/staff-login.png)
![ Staff Registeration    ](/screenshots/staff-registeration.png)
![ Visitor Pass           ](/screenshots/visitor-pass.png)
![ Visitor Registeration  ](/screenshots/visitor-registeration.png)
![ Visitor Verify & Login ](/screenshots/visitor-verify-login.png)



## Demo video Link : https://drive.google.com/file/d/1JboFK8fZdv0RhpbpyVnklgS31b1t82zF/view?usp=sharing