# Asset Management System

A desktop-based IT asset management application developed for the **Sri Lanka Tea Board** to manage and track organizational IT equipment in one place.

![Electron](https://img.shields.io/badge/Electron-Desktop%20App-47848F?logo=electron&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3&logoColor=white)

## Overview

The Asset Management System was created to support internal IT asset tracking and record management at the Sri Lanka Tea Board. The application provides separate modules for common asset categories and allows staff to maintain asset details, update records, track repair information, and generate PDF reports.

The system is implemented as a Windows desktop application using **Electron** with a **MySQL** database.

## Key Features

- Manage multiple IT asset categories from a single desktop application
- Create, view, update, and delete asset records
- Store asset information such as brand, model, serial number, division, assigned user, PRN, and year
- Record hardware details including RAM, storage capacity, processor information, and operating system details where applicable
- Maintain repair history for supported asset categories
- Generate PDF reports using **jsPDF**
- Desktop-based interface designed for internal organizational use
- MySQL-backed persistent data storage
- Electron IPC-based communication between the desktop interface and database layer

## Asset Modules

The current application includes modules for:

- Desktop Computers
- Laptops
- Scanners
- UPS Units
- Printers
- Photocopiers

## Tech Stack

| Area | Technologies |
| --- | --- |
| Desktop Application | Electron |
| Frontend | HTML5, CSS3, JavaScript |
| Database | MySQL |
| Database Driver | mysql2 |
| Reporting | jsPDF |
| Packaging | electron-builder / NSIS |

## Project Structure

```text
Asset-Management-System/
├── src/
│   ├── main/
│   │   ├── main.js
│   │   ├── preload.js
│   │   └── db.js
│   └── renderer/
│       ├── index.html
│       ├── renderer.js
│       ├── style.css
│       ├── tealogo.jpg
│       ├── desktop.html / desktop.js
│       ├── laptop.html / laptop.js
│       ├── scanner.html / scanner.js
│       ├── upspage.html / upspage.js
│       ├── printers.html / printers.js
│       └── photocopy.html / photocopy.js
├── docs/
│   ├── EDIT_PROGRESS.md
│   └── TODO.md
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MySQL Server

### Installation

1. Clone the repository.

```bash
git clone https://github.com/Chathumadura/Asset-Management-System.git
cd Asset-Management-System
```

2. Install dependencies.

```bash
npm install
```

3. Configure the MySQL connection in `src/main/db.js` for your local environment and make sure the required database tables are available.

4. Start the desktop application.

```bash
npm start
```

## Build for Windows

To create a Windows installer:

```bash
npm run dist
```

The project uses **electron-builder** with an **NSIS** installer configuration.

## Project Context

This project was developed during my internship at the **Sri Lanka Tea Board** as an internal software solution for improving the organization and tracking of IT and office assets.

The development work included requirement analysis, frontend and backend implementation, database integration, CRUD functionality, report generation, and application testing.

## Future Improvements

- Move database configuration to environment variables
- Add role-based authentication and access control
- Add advanced search, filtering, and dashboard analytics
- Add automated database backup and restore options
- Improve reporting and export functionality
- Add centralized deployment and update support

## Author

**Kavishka Chathumadura**

GitHub: [Chathumadura](https://github.com/Chathumadura)
