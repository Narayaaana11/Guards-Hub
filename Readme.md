# 🛡️ Guard Hub — Security Guard Management System (MERN Stack)

**Guard Hub** is a full-stack security guard management system developed for **Aditya University** to digitize daily guard operations.
It replaces error-prone manual registers with a modern real-time platform that manages:

* Guard profiles
* Attendance tracking
* Leave & OD workflows
* Shift scheduling & roster rotation
* Administrative dashboards

Built using the **MERN stack**, Guard Hub ensures scalability, accuracy, and smooth workflow for campus security operations.

---

## 🌐 Live Preview

https://guards.technicalhub.io/dashboard

---

## 📌 Overview

Guard Hub centralizes and automates all aspects of guard management.
It provides different functionalities for **Admins** and **Security Supervisors**, offering a seamless interface to monitor daily activities.

### ✔ Functional Highlights

* Guard profile creation & updates
* Day-wise & month-wise attendance charts
* Leave and on-duty (OD) request management
* Automated weekly shift roster
* Real-time operational dashboards

---

## 🛠️ Tech Stack

### **Frontend**

* React.js
* Tailwind CSS
* Axios
* React Router
* Chart.js / React Charts

### **Backend**

* Node.js
* Express.js

### **Database**

* MongoDB (Mongoose)

### **Utilities**

* JWT authentication
* Role-based access
* QR/Barcode support (optional)
* Date/time utilities (Moment.js or Day.js if used)

---

## 🚀 Features

### 🔹 **Guard Profiles**

* Create, edit, and manage guard information
* Store contact details, shift assignments, and guard IDs

### 🔹 **Attendance Management**

* **Day-wise attendance charts**
* **Month-wise activity insights**
* Admin can override/update attendance if required

### 🔹 **Leave & OD (On-Duty) Requests**

* Guards can request leave or OD through the system
* Admin can approve/reject requests
* Status synced across admin dashboard

### 🔹 **Shift Roster Automation**

* Automated weekly rotation for:

  * General Shift
  * A Shift
  * B Shift
  * C Shift
* Reduces manual scheduling conflicts
* Ensures fair and accurate weekly distribution

### 🔹 **Admin Dashboard**

* Track guard attendance trends
* Monitor leaves & OD status
* View shift allocations
* Insights on guard activity

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Narayaaana11/GuardHub.git
cd GuardHub
```

### 2️⃣ Install Frontend Dependencies

```bash
cd client
npm install
```

### 3️⃣ Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4️⃣ Add Environment Variables

Create a `.env` file in the backend:

```
MONGO_URI=your-mongodb-url
JWT_SECRET=your-secret-key
PORT=5000
```

### 5️⃣ Run Backend

```bash
cd server
npm run dev
```

### 6️⃣ Run Frontend

```bash
cd client
npm run dev
```

---

## 🧪 Future Enhancements

* Geolocation check-in/check-out for guards
* Push notifications for shift changes
* Face recognition–based attendance
* Advanced analytics dashboard
* Mobile app integration
* Exportable attendance/shift reports

---

## 👨‍💻 Author

**Veera Venkata Naga Satyanarayana Thota**
Full Stack / MERN Developer

🌐 Portfolio: [https://narayana-thota.vercel.app](https://narayana-thota.vercel.app)
🐙 GitHub: [https://github.com/Narayaaana11](https://github.com/Narayaaana11)
🔗 LinkedIn: [https://linkedin.com/in/narayaaana](https://linkedin.com/in/narayaaana)

---
