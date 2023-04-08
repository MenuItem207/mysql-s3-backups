require('dotenv').config()

const AWS = require('aws-sdk');
const mysqldump = require('mysqldump');
const cron = require('node-cron');
const fs = require('fs');

// Get environment variables
const {
    AWS_ACCESS_KEY_ID,
    AWS_S3_BUCKET,
    AWS_S3_REGION,
    AWS_SECRET_ACCESS_KEY,
    mysqlHost,
    mysqlPort,
    mysqlDatabase,
    mysqlUser,
    mysqlPassword,
    BACKUP_CRON_SCHEDULE,
} = process.env;

// Create an S3 client
const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_S3_REGION
});

async function backup() {
    try {
        // Get the current date and time
        const date = new Date();
        const dateString = date.toISOString().slice(0, 16).replace('T', '-').replace(':', '-');

        // Set up the filename for the backup file
        const backupFilename = `backup-${dateString}.sql`;

        // Use mysqldump to create a backup of the database
        await mysqldump({
            connection: {
                host: mysqlHost,
                user: mysqlUser,
                password: mysqlPassword,
                database: mysqlDatabase,
                port: mysqlPort,
            },
            dumpToFile: backupFilename
        });

        // Upload the backup file to S3
        const params = {
            Bucket: AWS_S3_BUCKET,
            Key: backupFilename,
            Body: backupFilename
        };

        await s3.upload(params).promise();

        console.log(`Backup uploaded to s3://${AWS_S3_BUCKET}/${backupFilename}`);

        // Delete the backup file
        await fs.promises.unlink(backupFilename);

        console.log(`Backup file ${backupFilename} deleted.`);
    } catch (error) {
        console.error(error);
    }
}

// Set up the cron job
cron.schedule(BACKUP_CRON_SCHEDULE, backup);

