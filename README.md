# 📚 BookLibrary – A Cloud-Based Reading Tracker & Book Manager

BookLibrary is a full-stack MERN application that allows users to upload books (cover image + PDF), track reading progress, and manage their personal digital library. Users can resume reading where they left off and store everything securely in the cloud with AWS S3.

---

## 🚀 Features

- ✅ **User Authentication** (JWT-secured)
- 📁 **Upload Books** with cover image & PDF
- 🔒 **User-specific library access**
- 📊 **Real-time progress tracking** (last page + total pages)
- 🔍 **Search, filter, and manage** books
- 📤 **AWS S3** for file storage
- 🧾 Clean UI with smart interactions (modals, filters, status updates)
- 📱 Responsive-ready frontend (Vite + React)

---

## 🖥️ Tech Stack

### 🔧 Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- Multer (file upload)
- AWS SDK (S3 uploads)
- JWT (auth)
- CORS + dotenv

### 🎨 Frontend

- React.js + Vite
- React Router
- react-pdf (PDF rendering & page tracking)
- Axios
- Tailwind CSS (or your chosen UI framework)

---

## 📂 Folder Structure

```
📦server
 ┣ 📂controllers
 ┃ ┣ 📂auth
 ┃ ┃ ┗ auth-controller.js
 ┃ ┣ 📂book
 ┃ ┃ ┗ bookController.js
 ┃ ┗ 📂user
 ┃ ┃ ┗ userController.js
 ┣ 📂routes
 ┃ ┣ auth-routes.js
 ┃ ┣ bookRoutes.js
 ┃ ┗ userRoutes.js
 ┣ 📂helpers
 ┃ ┣ upload.js
 ┃ ┗ uploadtos3.js
 ┣ 📂models
 ┃ ┣ Book.js
 ┃ ┗ User.js
 ┣ .env
 ┗ server.js

📦client
 ┣ 📂components
 ┣ 📂pages
 ┣ 📂utils
 ┣ 📂hooks
 ┗ main.jsx
```

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/booklibrary.git
cd booklibrary
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure `.env` files

In `/server/.env`:

```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_s3_region
AWS_BUCKET_NAME=your_s3_bucket
```

---

### 5. Start the app

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm run dev
```

---

## 📸 Screenshots

> _Add screenshots for: Home page, Book upload modal, PDF reader with progress, Profile image update, etc._

---

## 🧠 Upcoming Features

- ✅ Dark mode
- ✅ Genre & status filters
- 🔐 Role-based access control (Admin/Reader)
- 📝 Book notes & reviews
- 📱 Mobile optimization

---

## 🙋‍♂️ Author

Made with 💙 by [Your Name](https://github.com/your-username)

---

## 📃 License

This project is licensed under the MIT License.

team members:
surya
karthik
hardeep
sarvani
mehek
