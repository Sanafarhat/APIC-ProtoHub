# APIC ProtoHub

APIC ProtoHub is a state-of-the-art, cloud-based digital operating system that enables innovators, startups, MSMEs, students, and researchers to seamlessly access Advanced Prototyping & Innovation Centres (APICs) across Andhra Pradesh. Serving as the digital backbone of the "Prototyping as a Service (PaaS)" model, this platform modernizes the entire prototyping lifecycle—from idea submission to final prototype delivery.

## Features

### 🌟 Innovator Portal
- **Facility Discovery:** Browse and search for world-class prototyping facilities (e.g., 3D printing, CNC machining, PCB fabrication).
- **AI-Powered Quotes:** Upload your CAD designs or requirement documents and receive instant AI-driven cost estimates, machine match confidence, and time-to-fabrication projections.
- **Seamless Booking:** Frictionless end-to-end booking of equipment and consultations, coupled with dynamic payment tracking.
- **Live Telemetry & Tracking:** Real-time visibility into machine operations and project stages (Pending, Approved, In-Progress, Completed, Dispatched).

### ⚙️ Operator ERP System
- **Statewide Multi-Tenancy:** Facility operators are bound to their specific organization/college, enabling localized, secure management of their infrastructure.
- **Workflow Automation:** Operators can approve jobs, allocate machines, handle internal inventory, and manage shifts efficiently.
- **Digitized Feedback:** Direct line of communication with innovators to maintain high-quality service standards.

### 📊 Admin Dashboard
- **God-Eye Analytics:** Administrators get a comprehensive view of overall infrastructure utilization, statewide capacities, active projects, and revenue.
- **Platform Management:** Total oversight over all users (Innovators, Operators) and registered facilities across the AP tech park ecosystem.

## Technology Stack

### Frontend
- **React.js (Vite):** Blazing fast client-side application.
- **Modern UI/UX:** Built with a highly responsive, aesthetic design system featuring glassmorphism, dynamic micro-animations, and curated dark/light modes.
- **Lucide-React:** For beautiful, scalable vector icons.
- **Recharts:** For financial and utilization data visualization.

### Backend
- **Node.js & Express:** Scalable, non-blocking REST API architecture.
- **MongoDB (Mongoose):** Flexible NoSQL database for rapid schema iteration and multi-tenant scaling.
- **Firebase Authentication:** Secure, robust user identity management.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas cluster (or local instance)
- Firebase project credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sanafarhat/APIC-ProtoHub.git
   cd APIC-ProtoHub
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add your MongoDB URI and API keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```
   Start the backend server:
   ```bash
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory for Firebase configs:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:5000
   ```
   Start the client application:
   ```bash
   npm run dev
   ```

## Documentation
For an in-depth breakdown of the technical infrastructure and multi-tenant scaling approach, please see the [ARCHITECTURE.md](./ARCHITECTURE.md) file.

## License
This project is licensed under the MIT License.
