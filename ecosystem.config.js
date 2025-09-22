module.exports = {
    apps: [
        {
        name: "my-app",
        script: "app.js",
        instances: "max", // ใช้ทุก core ที่มี
        exec_mode: "cluster", // โหมด cluster
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
};
