const winston = require('winston');

winston.configure({
    level: "debug",
    format: winston.format.combine(
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ level: 'error' }),
        new winston.transports.File({
            filename: 'Server.log',
            level: 'error'
        })
    ]
});