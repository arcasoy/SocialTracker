const mysql = require('mysql');
const auth = require('../auth/auth.json');
const yt = require('./yt_modules.js');

const pool = mysql.createPool(auth.dbLogin);

module.exports = {
    newAccount: async function newAccouts(dbName, social, user, callback) {
        let table = 'accounts';
        pool.getConnection((err, con) => {
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
                                con.release();
                                callback(result.affectedRows);
                            }
                        )
                    })
                })
            });
        })
    },
    getYT: async function getYT(callback) {
        let accounts = []

        async function query(databases, count) {
            //Hopeful to get rid of recursive function and promisify the stuff in the if.
            //probably have to promisfy the con.query function so you can .then() and return the final result to a database.
            if(count > 0) {
                currentPos = databases.length - count
                pool.getConnection((err, con) => {
                    con.query(`USE \`${databases[currentPos]}\``, (err, result) => {
                        if (err) throw (err)
                        con.query(`SELECT * FROM accounts`, (err, results) => {
                            if (err) throw (err);
                            accounts.push(results[0].user)
                            count = count - 1;
                            query(databases, count);
                            con.release();
                        })
                    })
                })
            } else {
                let data = accounts.map(async(account) => { // map instead of forEach
                    const result = await yt.getData(account);
                    return {"database": databases[accounts.indexOf(account)], "user": account, "subs": result}
                });
                callback(resolvedSubsArray = await Promise.all(data)); // resolving all promises
            }
        }
        pool.getConnection(function(err, con) {
            if (err) throw err;
            console.log("Getting Accounts");
            con.query(`SELECT DISTINCT SCHEMA_NAME AS 'database'
            FROM information_schema.SCHEMATA
            WHERE  SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
            ORDER BY SCHEMA_NAME`, (err, result) => {
                if (err) throw err;
                databases = result.map(a => ([a.database])).flat()
                query(databases, databases.length)
                con.release()                
            })
        })
    },
    insert: async function insert(dbName, table, data) {
        pool.getConnection((err, con) => {
            if (err) throw err;
            console.log("Inserting into MySQL Server");
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
                                SELECT dt FROM ${table} WHERE DATE(dt) = CURDATE()
                            ) LIMIT 1;`, (err, result) => {
                                if (err) throw err;
                                con.release();
                            }
                        )
                    })
                })
            });
        })
    },
    transferInsert: async function transferInsert(dbName, table, data) { //Used for instagram tracking for TDS. Temp and will be removed when instagram tracking is on this bot
        pool.getConnection((err, con) => {
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
        pool.getConnection((err, con) => {
            if (err) throw err;
            console.log("Querying MySQL Server");
            con.query(`USE \`${dbName}\``, (err, result) => {
                if (err) callback(err.code)
                con.query(`SELECT * FROM ${table}`, (err, results) => {
                    if (err) callback(err.code);
                    con.release();
                    callback(results);
                })
            })
        })
    },
    feedback: async function feedback(dbName, table, feedback, user) {
        pool.getConnection((err, con) => {
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
                                con.release();
                            }
                        )
                    })
                })
            });
        })
    },
}

/*
TODO:
*/