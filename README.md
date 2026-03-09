# โครงสร้างและการทำงานของ Project CRUD-V2

## 📋 ภาพรวม Project

CRUD-V2 เป็น IoT Dashboard Application ที่พัฒนาด้วย React (Frontend) และ Node.js (Backend) สำหรับจัดการและแสดงผลข้อมูลจากอุปกรณ์ IoT แบบ real-time

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    gRPC     ┌─────────────────┐
│   React Frontend│◄────────────────►│ Express Backend │◄───────────►│   MongoDB       │
│   (Port 3000)   │                  │   (Port 3001)   │             │   (Port 27017)  │
└─────────────────┘                  └─────────────────┘             └─────────────────┘
         │                                   │                               │
         │                                   │                               │
         ▼                                   ▼                               ▼
   Material-UI Components              JWT Authentication              Mongoose ODM
   Recharts Visualization              Passport.js Strategy            Device/User Schemas
   React Router Navigation             RESTful APIs                    Data History
```

---

# 🎨 Frontend Structure & Functionality

## 📁 `/frontend/`

### `package.json`
**หน้าที่**: Dependencies และ scripts ของ React application
**Dependencies หลัก**:
- `react`: UI framework
- `react-dom`: React DOM rendering
- `@mui/material`: Material-UI components
- `recharts`: Data visualization charts
- `react-router-dom`: Client-side routing
- `axios`: HTTP client สำหรับ API calls

### `public/`
**Static assets ที่ serve โดย web server**

#### `index.html`
- HTML template หลักของ React app
- รวม `<div id="root">` สำหรับ React mounting
- Meta tags และ favicon

#### `manifest.json`
- PWA (Progressive Web App) configuration
- App icons, name, และ display mode

### `src/`

#### `index.js`
**จุดเริ่มต้นของ React application**
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './providers/Theme'
import { ConfigProvider } from './providers/Config'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <ConfigProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ConfigProvider>
  </BrowserRouter>
)
```

#### `App.js`
**Main App Component**
- จัดการ routing และ layout
- รวม context providers
- Handle authentication state

## 📁 Components (`src/components/`)

### `AuthorizedRoute.js` & `UnauthorizedRoute.js`
**Route Protection Components**
- `AuthorizedRoute`: ตรวจสอบ authentication ก่อนเข้าถึง protected routes
- `UnauthorizedRoute`: Redirect authenticated users ออกจาก login/signup pages

### `Loading/Loading.js`
**Loading Spinner Component**
- แสดง loading state ขณะรอข้อมูล
- ใช้ Material-UI CircularProgress

### `Menu/`
#### `MenuContent.js`
- จัดการ menu items และ navigation
- Handle menu state (open/close)

#### `MenuHeader/`
- Header section ของ menu
- Logo และ user info

### `QuestionDialog/`
**Confirmation Dialog Component**
- แสดง dialog สำหรับ confirm actions
- Yes/No หรือ custom buttons

### `Scrollbar/`
**Custom Scrollbar Component**
- Override default scrollbar styling
- Cross-browser compatibility

### `CustomPaper/`
**Styled Paper Component**
- Wrapper สำหรับ Material-UI Paper
- Consistent styling across app

## 📁 Containers (`src/containers/`)

### `App/App.js`
**Main Application Container**
- จัดการ global state
- Handle app initialization

### `Layout/`
#### `Layout.js`
- Main layout structure
- รวม sidebar, header, content area

#### `LayoutContainer.js`
- Container logic สำหรับ layout
- Responsive behavior

### `Menu/`
#### `Menu.js` & `Menu-.js`
- Menu container components
- จัดการ menu state และ interactions

### `Page/`
#### `ListPage.js`
- Generic list page component
- CRUD operations UI

#### `Page.js`
- Base page component
- Common page structure

### `ResponsiveMenu/`
**Responsive Menu Container**
- Handle mobile/desktop menu behavior
- Drawer/sidebar logic

### `SelectableMenuList/`
**Menu Selection Logic**
- จัดการ selected menu items
- Navigation state

### `UpdateContainer/`
**Data Update Container**
- Handle real-time data updates
- Polling และ WebSocket logic

## 📁 Pages (`src/pages/`)

### `Dashboard/Dashboard.js`
**Main Dashboard Page - ไฟล์หลัก**
**หน้าที่**: จัดการ dashboard รวม charts, devices, และ real-time data
**ฟีเจอร์หลัก**:
- Device management (CRUD)
- Chart creation และ configuration
- Real-time data visualization
- Tag scripting สำหรับ data generation

**State Management**:
```javascript
const [liveVals, setLiveVals] = useState([])        // Real-time data values
const [charts, setCharts] = useState([])           // Chart configurations
const [widgets, setWidgets] = useState([])         // Dashboard widgets
const [devices, setDevices] = useState([])         // Device list
const [selectedDevice, setSelectedDevice] = useState(null)
```

**Key Functions**:
- `loadDevices()`: โหลดรายการอุปกรณ์
- `loadCharts()`: โหลดการตั้งค่า charts
- `jsexe(script)`: Execute JavaScript สำหรับ data generation
- `updateChart()`: อัปเดต chart configuration
- `addSeries()`: เพิ่ม data series ใน chart

### `Home/Home.js`
**Home Page**
- Landing page content
- Welcome message และ overview

### `About/About.js`
**About Page**
- Application information
- Version และ credits

### `SignIn/SignIn.js` & `SignUp/SignUp.js`
**Authentication Pages**
- User login/signup forms
- JWT token handling

### `PasswordReset/PasswordReset.js`
**Password Reset Page**
- Forgot password functionality

### `MyAccount/MyAccount.js`
**User Profile Page**
- Account settings และ preferences

### `Users/`
#### `Users.js`
- User management page (admin)
- List all users

#### `AddUser.js`
- Add new user form

#### `EditUser.js`
- Edit existing user

#### `UserChangePassword.js`
- Change password functionality

### `Da/` (อาจเป็น Device Admin)
- Device administration pages

### `LandingPage/`
- Public landing page

### `PageNotFound/`
- 404 error page

## 📁 Providers (`src/providers/`)

### `Auth/`
**Authentication Context**
- JWT token management
- Login/logout state
- Protected route logic

### `Config/`
**Application Configuration**
- App settings และ preferences
- Environment variables

### `Theme/`
**Theme Provider**
- Material-UI theme configuration
- Dark/light mode switching

### `Locale/`
**Internationalization**
- Multi-language support
- Translation management

### `Menu/`
**Menu State Management**
- Active menu tracking
- Navigation state

### `Filter/`
**Data Filtering**
- Search และ filter logic
- Query building

### `Online/`
**Online Status**
- Network connectivity monitoring

### `SimpleValues/`
**Simple Data Storage**
- Local state management

### `Update/`
**Data Update Context**
- Real-time update coordination

### `VirtualLists/`
**Virtual Scrolling**
- Performance optimization สำหรับ large lists

### `AddToHomeScreen/`
**PWA Features**
- Add to home screen functionality

### `Dialogs/Question/`
**Dialog Management**
- Modal dialog state

## 📁 Utils (`src/utils/`)

### `config.js`
**Configuration Utilities**
- Environment detection
- API endpoints configuration

### `locale.js`
**Localization Utilities**
- Translation functions
- Language switching

### `theme.js`
**Theme Utilities**
- Theme creation และ customization

## 📁 Config (`src/config/`)

### `config.js`
**Main Configuration**
- App constants และ settings

### `defaultRoutes.js`
**Default Routing Configuration**
- Route definitions

### `menuItems.js`
**Menu Structure**
- Navigation menu items

### `routes.js`
**Route Configuration**
- React Router setup

### `themes.js`
**Theme Definitions**
- Material-UI theme objects

### `locales/`
- Translation files (de.js, en.js, ru.js)

---

# ⚙️ Backend Structure & Functionality

## 📁 `/backend/`

### `package.json`
**Backend Dependencies**
- `express`: Web framework
- `grpc`: gRPC client/server
- `@grpc/proto-loader`: Protocol buffer loading
- `mongoose`: MongoDB ODM
- `passport`: Authentication middleware
- `passport-jwt`: JWT strategy
- `bcrypt`: Password hashing
- `cors`: Cross-origin resource sharing

### `app.js`
**Main Backend Server**
**หน้าที่**: จุดเริ่มต้นของ backend server
**ฟีเจอร์**:
- Express app initialization
- Middleware setup (JSON parsing, CORS)
- gRPC client connection
- Database readiness check
- Static file serving
- HTTPS/HTTP server setup

**Key Functions**:
- `main()`: Server startup logic
- Database connection waiting loop
- Route mounting
- Server listening

### `common.js`
**Utility Functions**
**ฟังก์ชันหลัก**:
- `sleep(ms)`: Delay execution
- `readcfg(flag)`: Load configuration
- `grpcInit()`: Initialize gRPC connection
- `isDbReady(dbase)`: Check database status
- `createPassword(password)`: Hash passwords

### `db.js`
**gRPC Database Service**
**หน้าที่**: Interface ระหว่าง REST API และ MongoDB ผ่าน gRPC
**ฟังก์ชันหลัก**:
- `baseConnect(name)`: MongoDB connection
- `createDocument()`: Create operations
- `readDocument()`: Read operations
- `updateDocument()`: Update operations
- `deleteDocument()`: Delete operations

### `config.js`
**Configuration File**
- Server settings
- Database connection details
- JWT secrets
- Environment variables

## 📁 Routes (`routes/`)

### `preferences.js`
**Device & Data Management API**
**Endpoints**:
- `POST /createDocument`: Create devices/data
- `POST /readDocument`: Read devices/data
- `POST /updateDocument`: Update devices/data
- `POST /deleteDocument`: Delete devices/data

**Authentication**: JWT required
**Features**: CRUD operations สำหรับ devices และ preferences

### `users.js`
**User Authentication API**
**Endpoints**:
- `POST /login`: User authentication
- `POST /register`: User registration
- `GET /profile`: Get user profile

**Authentication**: JWT strategy
**Features**: Login/logout, user registration, profile management

## 📁 Libraries (`libs/`)

### `passport.js`
**Authentication Strategy**
- JWT token verification
- User authentication middleware
- Passport.js configuration

### `schema.js`
**MongoDB Schemas**
**Schemas**:
- `userSchema`: User accounts
- `deviceSchema`: IoT devices
- `historySchema`: Data history

**Features**:
- Data validation
- Indexing
- Relationships

## 📁 Protocol (`proto/`)

### `db.proto`
**gRPC Protocol Definition**
- Service definitions
- Message structures
- RPC method signatures

**Services**:
- `DbaseProject`: Database operations
- Messages: DocumentRequest, DocumentResponse, etc.

---

# 🔄 Data Flow & Communication

## 1. Frontend → Backend (HTTP/REST)
```
User Action → React Component → Axios → Express Route → JWT Auth → gRPC Call → MongoDB
```

## 2. Real-time Data Updates
```
Device Data → gRPC → Express → WebSocket/SSE → React Component → Chart Update
```

## 3. Authentication Flow
```
Login Form → POST /login → JWT Generation → Token Storage → Protected Routes
```

## 4. CRUD Operations
```
UI Action → API Call → Route Handler → gRPC Service → Database → Response → UI Update
```

---

# 📊 Database Schema Overview

## User Collection
```javascript
{
  _id: ObjectId,
  userName: String,
  password: String (hashed),
  email: String,
  role: String (admin/user/viewer),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Device Collection
```javascript
{
  _id: String,
  code: String,
  connection: String,
  name: String,
  status: String,
  tags: [{
    label: String,
    script: String,
    updateInterval: String,
    record: Boolean,
    // ... other tag properties
  }],
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## History Collection
```javascript
{
  deviceId: String,
  tagLabel: String,
  value: Mixed,
  timestamp: Date,
  createdAt: Date
}
```

---

# 🚀 Key Features & Workflows

## 1. Device Management
- Add/Edit/Delete devices
- Configure device connections
- Tag scripting สำหรับ data generation

## 2. Real-time Dashboard
- Live data visualization
- Chart configuration
- Series management

## 3. User Authentication
- JWT-based authentication
- Role-based access control
- Password hashing และ security

## 4. Data Persistence
- MongoDB storage
- gRPC communication
- Schema validation

## 5. Responsive UI
- Material-UI components
- Mobile-friendly design
- Progressive Web App features

---

# 🔧 Development & Deployment

## Development Setup
- Frontend: `npm start` (Port 3000)
- Backend: `node app.js` (Port 3001)
- Database: MongoDB (Port 27017)

## Build Process
- Frontend: `npm run build` → Static files
- Backend: Direct Node.js execution

## Environment Variables
- `NODE_ENV`: development/production
- `DBASE_URL`: MongoDB connection string
- `JWT_SECRET`: JWT signing key
- `PORT`: Server port configuration