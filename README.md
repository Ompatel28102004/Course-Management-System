
---

# **Course Management System**

Welcome to the **Course Management System**! This robust software has been meticulously designed to simplify and streamline academic management processes for students, faculty, and administrators. From managing attendance and assignments to handling quizzes and admin activities, our system is tailored to meet all your educational and administrative needs.  

---

## **Features**

### **General Features**
- **Secure Authentication**:
  - Role-based authentication and access control for students, faculty, academic admin, finance admin, and master admin.
  - Multi-layered security with hashed passwords and security codes.

- **Responsive Design**:
  - Fully responsive and intuitive interface that adapts seamlessly to desktops, tablets, and mobile devices.
  - A clean, purple-themed UI for better user experience.

- **Robust Backend**:
  - Built with Node.js and Express.js for high performance and scalability.
  - Secure API integration with role-based access controls.

- **Scalable Database**:
  - MongoDB is used to handle complex data structures for courses, attendance, quizzes, and admin activities.
  - Designed for optimized queries and performance.

---

### **For Students**
- **Attendance Tracker**:
  - View your attendance in a monthly calendar format with color-coded indicators:  
    - Green: Present  
    - Red: Absent  
    - Dark Gray: Leave  
    - Light Gray: No Record.
  - Attendance summary for the entire semester with detailed statistics.

- **Assignment Management**:
  - Submit assignments and track submission status.
  - Access feedback provided by faculty.

- **Quiz Management**:
  - View upcoming quizzes and navigate to quiz details directly.
  - Participate in MCQ-based quizzes with instant result generation.

- **Course Overview**:
  - See all enrolled courses.
  - Navigate to specific course details with one click.

---

### **For Faculty**
- **Attendance Management**:
  - Mark attendance for students with ease.
  - Update attendance records with live geolocation-based attendance marking.

- **Assignment and Quiz Creation**:
  - Create, update, and publish assignments and quizzes for students.
  - Real-time result and feedback generation for quizzes.

- **Course Insights**:
  - Monitor enrolled students and provide personalized feedback.
  - Export student performance reports.

---

### **For Admins**
- **Master Admin**:
  - View and manage all admin activities in real-time.
  - Accept or reject faculty and student enrollment requests.
  - Access detailed logs of admin activities for accountability.

- **Academic Admin**:
  - Manage faculty and student profiles.
  - Assign courses to faculty and oversee academic schedules.

- **Finance Admin**:
  - Handle fee payments and overdue collections.
  - Generate detailed financial reports.

---

### **And Many More Features...**
- Integrated **toast notifications** for real-time feedback.  
- Modular and scalable architecture for future feature additions.  
- Highly optimized **attendance model** for quick retrieval and updates.  

---

## **How to Set Up the Project**

### **Prerequisites**
Make sure you have the following installed:  
- Node.js  
- MongoDB  

---

### **Backend Setup**
1. **Navigate to the Server Directory**:
   ```bash
   cd server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:  
   Create a `.env` file in the `server` directory and add:  
   ```env
   MONGO_URI=your_mongo_database_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

The server will run on [http://localhost:5000](http://localhost:5000).  

---

### **Frontend Setup**
1. **Navigate to the Client Directory**:
   ```bash
   cd client
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Frontend**:
   ```bash
   npm run dev
   ```

The frontend will be accessible at [http://localhost:3000](http://localhost:3000).  

---

### **Screenshots**
Explore the screenshots below to get a glimpse of the system's features:  

- **Landing Pages**:   
  ![Landing Page](Image_of_CMS/LandingPages)

- **Student**:  
  ![Student Dashboard](Image_of_CMS/Student)

- **Faculty**:  
  ![Faculty Page](Image_of_CMS/Faculty)

- **Master Admin**:  
  ![Master Admin Dashboard](Image_of_CMS/MasterAdmin)

- **Finance Admin**:  
  ![Finance Admin Dashboard](Image_of_CMS/FinanceAdmin)

- **Academic Admin**:  
  ![Academic Admin Dashboard](Image_of_CMS/AcademicAdmin)  

---

### **Contributing**
We appreciate suggestions to this project. However, **this software is copyrighted, and unauthorized use is strictly prohibited.** If you wish to contribute, feel free to open a pull request or issue on GitHub.

---

### **License**
**© 2024 StudySync. All rights reserved.**  
This software is copyrighted, and its use, distribution, or modification without prior permission is strictly prohibited.  

--- 
