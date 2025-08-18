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
├── components/              # Reusable React components
│   ├── auth/                              # Authentication components
│   │   └── RoleGuard.tsx                  # Role-based access control
│   ├── shared/                            # Reusable components
│   │   └── table/                         # Table utilities
│   │       ├── index.ts                   # Table exports
│   │       └── [various table components] # Search, filter, pagination
│   └── ui/                                # Base UI components (shadcn/ui)
│       ├── alert.tsx                      # Alert component
│       ├── badge.tsx                      # Badge component
│       ├── button.tsx                     # Button component
│       ├── card.tsx                       # Card component
│       ├── dialog.tsx                     # Dialog/Modal component
│       ├── input.tsx                      # Input component
│       ├── table.tsx                      # Table component
│       └── [other UI components]          # Various UI primitives
├── public/
├── src/
│   ├── __tests__/
│   ├── app/
│   │   ├── admin/                              # Admin Dashboard & Management
│   │   │   ├── activity-log/                   # System Activity Monitoring
│   │   │   │   └── page.tsx                    # Activity logs dashboard
│   │   │   ├── components/                     # Admin-specific components
│   │   │   │   ├── activity-modal.tsx          # Activity detail modal
│   │   │   │   └── activity-table.tsx          # Activity logs table
│   │   │   ├── dashboard/                      # Main admin dashboard
│   │   │   │   └── page.tsx                    # Admin dashboard page
│   │   │   ├── hooks/                          # Admin-specific hooks
│   │   │   │   └── use-activity-logs.ts        # Activity logging hooks
│   │   │   └── layout.tsx                      # Admin layout wrapper
│   │   │
│   │   ├── chief-occupant/                     # Chief Occupant Portal
│   │   │   ├── dashboard/                      # Chief occupant dashboard
│   │   │   │   └── page.tsx                    # Main dashboard
│   │   │   └── household-management/           # Household member management
│   │   │       ├── manage/                     # Member management forms
│   │   │       │   ├── addform.tsx             # Add household member
│   │   │       │   ├── removeform.tsx          # Remove household member
│   │   │       │   └── updateform.tsx          # Update member info
│   │   │       ├── page.tsx                    # Household management main page
│   │   │       └── types.ts                    # Type definitions
│   │   │
│   │   ├── election-commission/                # Election Commission Portal
│   │   │   ├── candidates/                     # Candidate Management System
│   │   │   │   ├── components/                 # Candidate UI components
│   │   │   │   │   ├── candidate-dialog.tsx    # Add/edit candidate form
│   │   │   │   │   └── candidate-table.tsx     # Candidates listing table
│   │   │   │   ├── hooks/                      # Candidate-specific hooks
│   │   │   │   │   ├── query-keys.ts           # React Query keys
│   │   │   │   │   ├── use-candidate-dialog.ts # Dialog state management
│   │   │   │   │   ├── use-candidate-form.ts   # Form validation & state
│   │   │   │   │   ├── use-candidates.ts       # CRUD operations
│   │   │   │   │   └── use-party-suggestions.ts # Party autocomplete
│   │   │   │   ├── services/                   # API services
│   │   │   │   │   └── candidateService.ts     # Candidate API calls
│   │   │   │   ├── utils/                      # Utility functions
│   │   │   │   │   ├── data-merge-utils.ts     # Data transformation
│   │   │   │   │   ├── formatters.ts           # Text formatting
│   │   │   │   │   ├── helpers.ts              # General utilities
│   │   │   │   │   └── validation.ts           # Form validation
│   │   │   │   ├── candidate-constants.ts      # Constants & config
│   │   │   │   ├── candidate.types.ts          # TypeScript interfaces
│   │   │   │   └── page.tsx                    # Candidates main page
│   │   │   │
│   │   │   ├── dashboard/                      # Election Commission Dashboard
│   │   │   │   └── page.tsx                    # Main dashboard with stats
│   │   │   │
│   │   │   ├── elections/                      # Election Management System
│   │   │   │   ├── (pages)/                    # Dynamic routing pages
│   │   │   │   │   ├── [id]/                   # Edit election page
│   │   │   │   │   │   └── page.tsx            # Edit specific election
│   │   │   │   │   └── add/                    # Create new election
│   │   │   │   │       └── page.tsx            # Create election form
│   │   │   │   ├── components/                 # Election UI components
│   │   │   │   │   ├── candidate-selection-dialog.tsx    # Select candidates for election
│   │   │   │   │   ├── compact-candidates-table.tsx      # Compact candidate view
│   │   │   │   │   ├── delete-election.tsx               # Delete confirmation
│   │   │   │   │   ├── elec-com-header.tsx               # Header component
│   │   │   │   │   ├── election-dialog.tsx               # Election details modal
│   │   │   │   │   ├── election-form.tsx                 # Add/edit election form
│   │   │   │   │   ├── election-status-badge.tsx         # Status indicator
│   │   │   │   │   ├── elections-table.tsx               # Elections listing
│   │   │   │   │   └── enhanced-candidate-statistics-panel.tsx # Analytics panel
│   │   │   │   ├── hooks/                      # Election-specific hooks
│   │   │   │   │   ├── query-keys.ts           # React Query cache keys
│   │   │   │   │   ├── use-election-comparison.ts # Compare elections
│   │   │   │   │   └── use-elections.ts        # Election CRUD operations
│   │   │   │   ├── services/                   # API services
│   │   │   │   │   └── electionService.ts      # Election API calls
│   │   │   │   ├── utils/                      # Utility functions
│   │   │   │   │   ├── date-utils.ts           # Date manipulation
│   │   │   │   │   ├── election-status-utils.ts # Status calculation
│   │   │   │   │   └── time-utils.ts           # Time formatting
│   │   │   │   ├── election-constants.ts       # Constants & configuration
│   │   │   │   ├── election.types.ts           # TypeScript interfaces
│   │   │   │   └── page.tsx                    # Elections main page
│   │   │   │
│   │   │   └── layout.tsx                      # Election Commission layout
│   │   │
│   │   ├── government-official/
│   │   │   ├── add-members/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── households/
│   │   │   │   └── page.tsx
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   └── types.ts
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── registrations/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── removal-requests/
│   │   │   │   └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   └── update-members/
│   │   │       ├── [id]/
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   │
│   │   ├── household-member/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── login/
│   │   │   ├── change-password/
│   │   │   │   └── page.tsx
│   │   │   ├── changepassword.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── polling-station/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── vote/
│   │   │       ├── components/
│   │   │       │   ├── candidate-card.tsx
│   │   │       │   ├── header.tsx
│   │   │       │   ├── success-message.tsx
│   │   │       │   ├── vote-confirmation.tsx
│   │   │       │   ├── voter-profile.tsx
│   │   │       │   ├── voter-search.tsx
│   │   │       │   └── voting-interface.tsx
│   │   │       ├── hooks/
│   │   │       │   └── useVote.ts
│   │   │       ├── lib/
│   │   │       │   ├── config/
│   │   │       │   │   └── api.ts
│   │   │       │   └── utils.ts
│   │   │       ├── page.tsx
│   │   │       ├── service/
│   │   │       │   └── voteService.ts
│   │   │       └── types/
│   │   │           └── voter.ts
│   │   │
│   │   ├── register/
│   │   │   ├── components/
│   │   │   │   ├── ChiefOccupantForm.tsx
│   │   │   │   ├── HouseholdDetailsForm.tsx
│   │   │   │   ├── HouseholdMembersForm.tsx
│   │   │   │   └── HouseholdRegistrationForm.tsx
│   │   │   ├── constants.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-file-upload-hook.ts
│   │   │   │   └── use-household-form.ts
│   │   │   ├── page.tsx
│   │   │   ├── services/
│   │   │   │   └── householdRegistrationServices.ts
│   │   │   ├── types.ts
│   │   │   └── utils/
│   │   │       └── password-validation-util.ts
│   │   │
│   │   ├── results/
│   │   │   ├── (components)/
│   │   │   │   ├── CandidateResultsCard.tsx
│   │   │   │   ├── DistrictAnalysisCard.tsx
│   │   │   │   ├── DistrictMapView.tsx
│   │   │   │   ├── ElectionSummaryCard.tsx
│   │   │   │   └── VoteDistributionChart.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useReslult.ts
│   │   │   │   └── useSimpleElections.ts
│   │   │   ├── lib/
│   │   │   │   └── config/
│   │   │   │       └── api.ts
│   │   │   ├── page.tsx
│   │   │   ├── service/
│   │   │   │   └── resultService.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   │
│   │   ├── unauthorized/
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx                       # Global providers (React Query, etc.)
│   └── lib/
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx          # Mobile breakpoint detection hook
│   │   │   └── use-toast.ts            # Toast notification system
│   │   ├── services/
│   │   │   └── authService.ts          # Authentication service (login, register, logout)
│   │   ├── storage/
│   │   │   └── supabase.ts             # Supabase client configuration
│   │   ├── axios.ts                    # Axios HTTP client with interceptors
│   │   ├── cookies.ts                  # Cookie management utilities
│   │   ├── election-data.ts            # Static election data (2016, 2020, 2024)
│   │   └── utils.ts                    # Utility functions (cn for class merging)
├── .env.example             # Sample environment config
├── package.json
├── tsconfig.json
└── README.md                # This README file
```

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

- Special thanks to [University of Moratuwa](https://uom.lk) Faculty of Information Technology for supporting this project.
- This project architecture is inspired by best practices in secure, modern e-voting systems.

---

> **Disclaimer:** This frontend is intended for demonstration and educational use. For real-world elections, always consult with cybersecurity and legal professionals to ensure compliance and security.
