# LeaveSchedulerOss 📅

<p align="center">
<img width="279" height="128" alt="image" src="https://github.com/user-attachments/assets/e882c31a-dad5-439a-919b-3f6ee6dd024a" />

</p>

LeaveScheduler is an open-source leave management system designed to streamline the process of requesting, approving, and tracking employee leave. This project adheres to open source principles, promoting collaboration, transparency, and community-driven development.

[![GitHub license](https://img.shields.io/github/license/Samaresh-16/LeaveSchedulerOss.svg)](https://github.com/Samaresh-16/LeaveSchedulerOss/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Samaresh-16/LeaveSchedulerOss.svg)](https://github.com/Samaresh-16/LeaveSchedulerOss/issues)
[![GitHub stars](https://img.shields.io/github/stars/Samaresh-16/LeaveSchedulerOss.svg)](https://github.com/Samaresh-16/LeaveSchedulerOss/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Samaresh-16/LeaveSchedulerOss.svg)](https://github.com/Samaresh-16/LeaveSchedulerOss/network)

## Features 🚀

- 🖥️ User-friendly interface for employees to request leave
- 📊 Dashboard for managers to approve or reject leave requests
- 🧮 Automatic leave balance calculation
- 🗓️ Holiday calendar integration
- 📧 Email notifications for leave status updates
- 📈 Reporting tools for HR and management

## Installation

### Prerequisites

- Node.js (v14 or later)
- Java Development Kit (JDK) 11 or later
- Maven
- MySQL

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/Samaresh-16/LeaveSchedulerOss.git
   cd LeaveSchedulerOss/LeaveScheduler
   ```

2. Create a `.env` file in the `LeaveScheduler` directory with the following content:
   ```
   APP_JWT_SECRET=<YOUR_JWT_SECRET>
   SPRING_DATASOURCE_USERNAME=<YOUR_H2_DB_USERNAME>
   SPRING_DATASOURCE_PASSWORD=<YOUR_H2_DB_PASSWORD>
   MYSQL_USERNAME=<YOUR_SQL_DB_USERNAME>
   MYSQL_PASSWORD=<YOUR_SQL_DB_PASSWORD>
   MYSQL_URL=<YOUR_SQL_DB_URL>
   SPRING_MAIL_USERNAME=<YOUR_SMTP_ENABLED_MAIL_USERNAME>
   SPRING_MAIL_PASSWORD=<YOUR_SMTP_ENABLED_MAIL_PASSWORD>
   ```

3. Build the backend:
   ```
   mvn clean install
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ../leave-scheduler-frontend
   ```

2. Create a `.env` file in the `leave-scheduler-frontend` directory with the following content:
   ```
   VITE_API_BASE_URL=<YOUR_BACKEND_HTTP_LINK_EG:http://{host}:{port}>
   ```

3. Install dependencies:
   ```
   npm install
   ```

## Usage

To start the application:

1. From the root folder of the project, run:
   ```
   npm run init:all && npm run start:all
   ```

2. Open your browser and navigate to `http://localhost:5173`

## How to Use LeaveSchedulerOss 📚

Here's a quick guide on how to use LeaveSchedulerOss:

1. Before login the user should be **Registered**. 
For Admin/Manager roles contact the admin. For dev testing use User Master (for creds contact any of the repo owners).
2. **Login**: Use your credentials to log in to the system.

3. **Request Leave**:
   - Navigate to the "Apply for Leave" section.
   - Select the leave type, start date, end date, and provide a reason.
   - Submit your request.

4. **View Leave Balance**: Check your current leave balance on the dashboard.

5. **Track Leave Status**: Monitor the status of your leave requests in the "My Leaves" section.

6. **For Managers**:
   - Access the "Approve Leaves" section to review and act on leave requests.
   - Use the "Team Calendar" to view team members' schedules.

7. **Notifications**: Receive email notifications for leave request updates.

8. **Reports**: HR and management can generate leave reports from the "Reports" section.

For more detailed instructions, please refer to our [User Guide](link-to-user-guide).

## Contributing 🤝

We welcome contributions to the LeaveSchedulerOss project! Here's how you can contribute:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 🚀 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

### Contribution Guidelines

- Ensure your code adheres to the existing style of the project to maintain consistency.
- Write and update tests as necessary. All new features should have associated unit tests.
- Update the documentation accordingly. This includes both in-code documentation and external docs such as this README.
- Your Pull Request should have a clear title and description of the changes made.
- Make sure your commits are atomic (one feature per commit).

---

### Code of Conduct

 - Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.
---
### Reporting Bugs 🐛

If you find a bug, please open an issue on the GitHub repository. When filing an issue, make sure to answer these questions:

1. What version of the project are you using?
2. What operating system and processor architecture are you using?
3. What did you do?
4. What did you expect to see?
5. What did you see instead?
---
### Suggesting Enhancements ✨

If you have an idea for a new feature or an improvement to existing functionality, we'd love to hear about it! Open an issue on GitHub and provide the following information:

1. Clear and descriptive title for the issue
2. Detailed description of the proposed enhancement
3. Examples of how the enhancement would be used
4. Any potential drawbacks or considerations

Thank you for contributing to LeaveSchedulerOss!
---
### 🌟 Top Contributors

<p align="left">

<a href="https://github.com/MainakMukherjee01/">
  <img src="https://avatars.githubusercontent.com/u/131389864?v=4" width="75" height="75" style="border-radius: 50%; margin-right: 10px;" />
</a>
<a href="https://github.com/Samaresh-16">
  <img src="https://avatars.githubusercontent.com/u/85400714?v=4" width="75" height="75" style="border-radius: 50%; margin-right: 10px;" />
</a>
<a href="https://github.com/sampritibanerjee">
  <img src="https://avatars.githubusercontent.com/u/88034572?v=4" width="75" height="75" style="border-radius: 50%; margin-right: 10px;" />
</a>
<a href="https://github.com/hrishikeshrc02">
  <img src="https://avatars.githubusercontent.com/u/129333612?v=4" width="75" height="75" style="border-radius: 50%; margin-right: 10px;" />
</a>
<a href="https://github.com/Asmita-coder-ux">
  <img src="https://avatars.githubusercontent.com/u/129609862?v=4" width="75" height="75" style="border-radius: 50%; margin-right: 10px;" />
</a>

</p>

Want to be featured here?  
📌 Contribute to the project and open a pull request!
To see the full list of contributors, check out the [contributors page](https://github.com/Samaresh-16/LeaveSchedulerOss/graphs/contributors).


---
## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Screenshots

Here are some screenshots demonstrating key features of LeaveSchedulerOss:
### Employee Dashboard

<p align="center">
  <img 
    src="https://github.com/user-attachments/assets/8258d218-1d23-4560-8e98-31412ae41592" 
    alt="Employee Dashboard"
    width="80%"
  />
</p>

### Leave Request Form

<p align="center">
  <img 
    src="https://github.com/user-attachments/assets/0f25bcf6-78f4-47e8-9120-2444d0cb5214" 
    alt="Leave Request Form"
    width="300"
    height="500"
  />
</p>

### Manager Approval Interface
<p align="center">
  <img 
    src="https://github.com/user-attachments/assets/665b0e5c-87ee-4bb2-87b2-a048d5d814ff" 
    alt="Leave Request Form"
    width="80%"
  />
</p>

## Testimonials

will be added soon :)

## Important Links

- [Project Homepage](https://github.com/Samaresh-16/LeaveSchedulerOss)
- [Issue Tracker](https://github.com/Samaresh-16/LeaveSchedulerOss/issues)
- [Wiki](https://github.com/Samaresh-16/LeaveSchedulerOss/wiki)

## Support

If you need help or have questions, please open an issue on our [Issue Tracker](https://github.com/Samaresh-16/LeaveSchedulerOss/issues).

---
