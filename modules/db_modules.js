const mysql = require('mysql');
const auth = require('../auth/auth.json');
const yt = require('./yt_modules.js');

module.exports = {
    newAccount: async function newAccouts(dbName, social, user) {
        var con = mysql.createConnection(auth.dbLogin)
        let table = 'accounts';
        con.connect((err) => {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, function (err, result) {
                if (err) throw err;
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS ${table} (
                        id INT auto_increment PRIMARY KEY,
                        social TEXT NOT NULL,
                        user TEXT NOT NULL
                    ) ENGINE=InnoDB;`, (err, result) => {
                        if (err) throw err;
                        con.query(
                            `INSERT INTO ${table} (social, user)
                            SELECT * FROM (SELECT '${social}' AS social, '${user}' AS user) AS tmp
                            WHERE NOT EXISTS (
                                SELECT social FROM ${table} WHERE social = '${social}'
                            ) LIMIT 1;`, (err, result) => {
                                if (err) throw err;
                            }
                        )
                    })
                })
            });
        })
    },
    getYT: async function getYT(callback) {
        var con = mysql.createConnection(auth.dbLogin)
        let accounts = []
        let data = []

        function query(databases, count) {
            if(count > 0) {
                currentPos = databases.length - count
                con.query(`USE \`${databases[currentPos]}\``, (err, result) => {
                    if (err) callback(err.code)
                    con.query(`SELECT * FROM accounts`, (err, results) => {
                        if (err) callback(err.code);
                        accounts.push(results[0].user)
                        count = count - 1;
                        query(databases, count);
                    })
                })
            } else {
                for (account of accounts) {
                    yt.getData(account)
                    .then(subs => {
                        let temp = {"database": databases[data.length], "user": account, "subs": subs};
                        data.push(temp)
                        if (data.length === databases.length) {
                            callback(data);
                        }
                    })
                }
            }
        }

        con.connect(function(err) {
            if (err) throw err;
            console.log("Getting Accounts");
            con.query(`SELECT DISTINCT SCHEMA_NAME AS 'database'
            FROM information_schema.SCHEMATA
            WHERE  SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
            ORDER BY SCHEMA_NAME`, (err, result) => {
                databases = result.map(a => ([a.database])).flat()
                query(databases, databases.length)                
            })
        })
    },
    insert: async function insert(dbName, table, data) {
        var con = mysql.createConnection(auth.dbLogin)
        con.connect((err) => {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, function (err, result) {
                if (err) throw err;
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS ${table} (
                        id INT auto_increment PRIMARY KEY,
                        dt DATETIME DEFAULT now(),
                        followers INT SIGNED NOT NULL
                    ) ENGINE=InnoDB;`, (err, result) => {
                        if (err) throw err;
                        con.query(
                            `INSERT INTO ${table} (followers)
                            SELECT * FROM (SELECT ${data} AS followers) AS tmp
                            WHERE NOT EXISTS (
                                SELECT dt FROM ${table} WHERE dt = dt
                            ) LIMIT 1;`, (err, result) => {
                                if (err) throw err;
                            }
                        )
                    })
                })
            });
        })
    },
    transferInsert: async function transferInsert(dbName, table, data) { //Used for instagram tracking for TDS. Temp and will be removed when instagram tracking is on this bot
        var con = mysql.createConnection(auth.dbLogin)
        con.connect((err) => {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, function (err, result) {
                if (err) throw err;
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS ${table} (
                        id INT auto_increment PRIMARY KEY,
                        dt DATETIME DEFAULT now(),
                        followers INT SIGNED NOT NULL
                    ) ENGINE=InnoDB;`, (err, result) => {
                        if (err) throw err;
                        for (entry of data) {
                            con.query(
                                `INSERT INTO ${table} (dt, followers)
                                SELECT * FROM (SELECT '${entry[0]}' AS dt, ${entry[1]} AS followers) AS tmp
                                WHERE NOT EXISTS (
                                    SELECT dt FROM ${table} WHERE dt = '${entry[0]}'
                                ) LIMIT 1;`, (err, result) => {
                                    if (err) throw err;
                                }
                            )
                        }
                    })
                })
            });
        })
    },
    query: async function query(dbName, table, callback) {
        var con = mysql.createConnection(auth.dbLogin)
        con.connect(function(err) {
            if (err) throw err;
            console.log("Querying MySQL Server");
            con.query(`USE \`${dbName}\``, (err, result) => {
                if (err) callback(err.code)
                con.query(`SELECT * FROM ${table}`, (err, results) => {
                    if (err) callback(err.code);
                    callback(results);
                })
            })
        })
    },
    feedback: async function feedback(dbName, table, feedback, user) {
        var con = mysql.createConnection(auth.dbLogin)
        con.connect((err) => {
            if (err) throw err;
            console.log("Inserting Feedback into MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, function (err, result) {
                if (err) throw err;
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS ${table} (
                        id INT auto_increment PRIMARY KEY,
                        submitTime DATETIME DEFAULT now(),
                        feedback TEXT NOT NULL,
                        user TEXT NOT NULL
                    ) ENGINE=InnoDB;`, (err, result) => {
                        if (err) throw err;
                        con.query(
                            `INSERT INTO ${table} (feedback, user)
                            SELECT * FROM (SELECT '${feedback}' AS feedback, '${user}' AS user) AS tmp
                            WHERE NOT EXISTS (
                                SELECT feedback FROM ${table} WHERE feedback = '${feedback}'
                            ) LIMIT 1;`, (err, result) => {
                                if (err) throw err;
                            }
                        )
                    })
                })
            });
        })
    },
}