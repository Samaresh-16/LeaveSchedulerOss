# Architecture Overview — LeaveSchedulerOss

## 1. Introduction

LeaveSchedulerOss is an open-source leave management system that enables employees to apply for leave, managers to approve/reject requests, and HR/admins to manage leave policies and reports.  
This document describes the architecture using the **C4 Model** (Context, Container, Deployment).

---

## 2. C4 Model Diagrams

### 2.1 System Context Diagram (Level 1)

> <img width="588" height="527" alt="image" src="https://github.com/user-attachments/assets/79600ca0-1a0d-4676-8d7a-e652f86f90c1" />


### Description  
The LeaveSchedulerOss system interacts with the following external actors:  
- **Employee** — applies for leave, views status and leave history.  
- **Manager** — reviews and approves/rejects leave requests.  
- **Admin/HR** — manages users, holidays, reports, and system configuration.  
- **Mail Server (SMTP)** — used to send notification emails.  
- **Database Server** — persists system data.

---

### 2.2 Container Diagram (Level 2)

> <img width="716" height="563" alt="image" src="https://github.com/user-attachments/assets/d777060d-7ad1-459e-859d-2e1717ffa7f2" />


### Containers Overview  
- **Frontend (React/Vite)**  
  - User interface for employees, managers, and admins.  
  - Communicates with backend via REST APIs.  

- **Backend (Spring Boot - Java)**  
  - Implements authentication, authorization, leave workflow logic, notifications, and reports.  
  - Provides REST APIs to frontend.  
  - Interacts with the database and SMTP server.  

- **Database (MySQL or H2)**  
  - Stores users, roles, leave requests, balances, holidays, and audit information.  

- **Mail/Notification Service**  
  - Sends leave-related emails using configured SMTP server.  

---

### 2.3 Deployment Diagram (Infra View)

> <img width="600" height="563" alt="image" src="https://github.com/user-attachments/assets/5d918b4c-694c-40b4-9d9e-96d3789f190f" />


### Deployment Summary  
- **Frontend Hosting**  
  - Deployed as static files (e.g., Nginx, Apache, or cloud hosting).  

- **Backend Service**  
  - Runs as a Spring Boot application (jar, Docker container, or any Java-compatible server).  

- **Database Server**  
  - MySQL in production, H2 during development/testing.  

- **SMTP Server**  
  - External SMTP service used for email notifications.  

- **Environment Configuration**  
  - JWT secret  
  - Database credentials  
  - SMTP credentials  
  - API base URLs  

---

## 3. Design Principles & Rationale

- Clear separation of concerns between UI and backend services.  
- Environment-driven configuration for flexibility.  
- Modular design for easier feature extensions.  
- Developer-friendly setup with H2 for quick testing.

---

## 4. Key Backend Components

- Auth Module  
- Leave Management Module  
- Holiday Management  
- User & Role Management  
- Notification Service  
- Reporting Module  

---

## 5. Key Frontend Components

- Login & Registration  
- Employee Dashboard  
- Leave Application Form  
- Leave History  
- Manager Approval  
- Admin Controls  

---

## 6. Data Model Summary

Entities:  
- User  
- LeaveRequest  
- Holiday  
- LeaveBalance  

---

## 7. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript |
| Backend | Java, Spring Boot, Spring Security, JPA |
| Database | MySQL (prod), H2 (dev/test) |
| Notifications | SMTP |
| Build/Deploy | Maven, Docker |

---

## 8. Deployment Considerations

- HTTPS recommended  
- JWT secret must be secured  
- SMTP credentials must be hidden  
- Database backups required in prod  
- CDN/load balancing recommended  

---

## 9. Future Improvements

- Multi-level approvals  
- HRMS/Payroll integrations  
- Audit logging  
- Role-based dashboards  
- Mobile-first UI  
- Kubernetes support  
