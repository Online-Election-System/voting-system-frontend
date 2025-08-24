# 🗳️ Online Election System – Voting System Frontend

Welcome to the **Online Election System – Voting System Frontend** repository! This project powers the user-facing experience of a secure, modern, and scalable online election platform. Designed with TypeScript and built for reliability, transparency, and accessibility, it enables voters, candidates, and administrators to interact seamlessly in digital elections.

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

---

## 🏛️ Introduction

The Online Election System aims to modernize how organizations, institutions, and communities conduct elections by leveraging the power of web technologies. This frontend project provides a robust interface for casting votes, managing candidates, displaying results, and handling all election-related user interactions.

### ⚡ Why Use This System?

Traditional voting systems can be inefficient, inaccessible, and prone to errors or manipulation. Moving elections online increases participation, improves transparency, and streamlines the entire process for both voters and administrators.

Our frontend application is designed to:
- Be accessible to all eligible voters
- Ensure security and privacy of votes
- Provide real-time updates and results
- Offer a smooth and user-friendly voting experience

---

## ✨ Features

- **Secure Voter Registration**: Ensures only eligible users can register through a comprehensive process.
- **Secure Voter Authentication**: Ensures only eligible users can vote.
- **Intuitive Ballot UI**: Clean, accessible ballot design for desktop and mobile.
- **Real-time Vote Counting**: Instant updates as votes are cast (when permitted).
- **Candidate Management**: View candidate profiles, manifestos, and more.
- **Admin Dashboard**: Tools for election setup, monitoring, and result publication.
- **Accessibility**: WCAG-compliant UI supporting keyboard and screen readers.
- **Audit Trails**: Transparent logs for review (admin only).
- **Responsive Design**: Seamless experience on all device sizes.

---

## 🧰 Technology Stack

- **TypeScript**: Strongly-typed superset of JavaScript for safer, scalable code.
- **Next.JS**: For building dynamic user interfaces.
- **Axios / Fetch API**: For secure and robust communication with the backend.
- **CSS Modules / Styled Components**: Modular, maintainable styling.
- **Testing**: Jest, React Testing Library (or similar) for unit and integration tests.
- **CI/CD**: (e.g., GitHub Actions) for automated building and deployment.

---

## 🖥️ Installation

### Prerequisites

- **Node.js** (v16 or newer recommended)
- **npm** or **yarn** package manager
- Access to the backend API server (check `.env.example` for configuration)

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Online-Election-System/voting-system-frontend.git
   cd voting-system-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**

   Copy the example environment file and fill in your API endpoints and other keys.

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to specify:
   - `REACT_APP_API_URL` – URL for your backend voting system API
   - Any other integration keys as needed

4. **Run the Application**
   ```bash
   npm start
   # or
   yarn start
   ```
   This will start the development server at [http://localhost:3000](http://localhost:3000) by default.

5. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```
   Outputs a production build to the `build/` directory.

---

## 🚀 Usage

- Visit the app in your browser (default: [http://localhost:3000](http://localhost:3000))
- Sign in using your credentials (check with your election administrator for details)
- Navigate through ongoing elections, cast your vote, and view results as permitted
- Admins can log in to access management dashboards for creating and configuring elections

---

## 📁 Project Structure

```plaintext
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout component
│   │   ├── page.tsx              # Main landing page
│   │   ├── globals.css           # Global styles (Tailwind, customizations)
│   │   ├── providers.tsx         # App-level providers (React Query, etc.)
│   │   └── ...                   # Role/functionality-based folders and route files (e.g., /admin, /user, /voter, /results, etc.)
│   ├── lib/
│   │   ├── axios.ts              # Axios instance for API calls
│   │   ├── utils.ts              # Utility functions (classnames, etc.)
│   │   ├── cookies.ts            # Session and cookie helpers
│   │   └── storage/
│   │       └── supabase.ts       # Supabase storage client
│   └── ...                       # Other utility or feature folders
├── components/
│   └── ui/
│       ├── toast.tsx             # Toast notification system
│       ├── resizable.tsx         # Resizable UI panel components
│       ├── header.tsx            # App header/navigation (referenced in layout)
│       ├── footer.tsx            # App footer (referenced in layout)
│       └── ...                   # UI components (cards, badges, etc.)
├── public/
│   └── ...                       # Static assets (favicon, images, etc.)
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Project documentation
└── ...                           # Other config and supporting files
```
> **Note:** Only main files/folders are shown (including all major files in `src/app/`). Many feature implementations are further divided into subfolders under `src/app/` for roles and functionalities.  
For the complete structure, see [GitHub code search](https://github.com/Online-Election-System/voting-system-frontend/search).

---

## 👨‍💻 Contributors

- **G.D. Punchihewa**: [Cookie-based Authentication, RBAC Authorization, Admin Module, Election Module, Candidate Module]
- **A.M.A.D. Weerasinghe**: [Voting Module]
- **W.H.P. Anuththara**: [Voter Verification Module]
- **R.A.D.P. Ranasinghe**: [Results Module]
- **J.G.J.M.R.K. Bandara**: [Voter Registration Module]

Feel free to contribute to the project by submitting pull requests or reporting issues!

---

## 🙏 Acknowledgments

- Special thanks to [WSO2](https://wso2.com/) & [University of Moratuwa](https://uom.lk) Faculty of Information Technology for supporting this project.
- This project architecture is inspired by best practices in secure, modern e-voting systems.

---

> **Disclaimer:** This frontend is intended for demonstration and educational use. For real-world elections, always consult with cybersecurity and legal professionals to ensure compliance and security.
