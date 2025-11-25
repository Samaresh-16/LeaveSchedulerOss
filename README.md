In project Backend-Repo `LeaveScheduler` create a .env file with fields:

    APP_JWT_SECRET=<YOUR_JWT_SECRET>
    SPRING_DATASOURCE_USERNAME=<YOUR_H2_DB_USERNAME>
    SPRING_DATASOURCE_PASSWORD=<YOUR_H2_DB_PASSWORD>
    MYSQL_USERNAME=<YOUR_SQL_DB_USERNAME>
    MYSQL_PASSWORD=<YOUR_SQL_DB_PASSWORD>
    MYSQL_URL=<YOUR_SQL_DB_URL>
    SPRING_MAIL_USERNAME=<YOUR_SMTP_ENABLED_MAIL_USERNAME>
    SPRING_MAIL_PASSWORD=<YOUR_SMTP_ENABLED_MAIL_PASSWORD>

In project Frontend-Repo `leave-scheduler-frontend` create a .env file with fields:

    VITE_API_BASE_URL=<YOUR_BACKEND_HTTP_LINK_EG:http://{host}:{port}>

In project Root Folder, to start app

    npm run init:all && npm run start:all

Open http://localhost:5173
