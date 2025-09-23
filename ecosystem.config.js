module.exports = {
    apps: [
        {
        name: "report-system",
        script: "npm start",
        instances: "max", // ใช้ทุก core ที่มี
        exec_mode: "cluster", // โหมด cluster
            env: {
                NODE_ENV: "production",
                PORT: 4400,
                CORS_ORIGIN: "http://localhost:4400/",
                DATABASE_URL: "postgresql://secure_admin:very_secure_password123!@103.117.149.61:5432/report_system?schema=public",
                JWT_SECRET: "dev_secret_wJzU2rX5yL8sBvNcFpGk",
                REFRESH_TOKEN_SECRET: "dev_refresh_secret_aQ3tY7zP9vR1sW4e"
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 4400,
                CORS_ORIGIN: "http://localhost:4400/",
                DATABASE_URL: "postgresql://secure_admin:very_secure_password123!@103.117.149.61:5432/report_system?schema=public",
                JWT_SECRET: "dev_secret_wJzU2rX5yL8sBvNcFpGk",
                REFRESH_TOKEN_SECRET: "dev_refresh_secret_aQ3tY7zP9vR1sW4e"
            },
        },
    ],

    deploy: {
        production: {
            user: "xcoptech", // ชื่อ user บน server
            host: "103.117.148.20", // IP หรือ domain ของ server
            ref: "origin/main", // branch ที่จะใช้
            repo: "https://github.com/owariz/report-system.git",
            path: "/var/www/my-app",
            "post-deploy":
                "npm install && pm2 reload ecosystem.config.js --env production"
        }
    }
};
