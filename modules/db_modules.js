const mysql = require('mysql');
const auth = require('../auth/auth.json');
const yt = require('./yt_modules.js');

const pool = mysql.createPool(auth.dbLogin);

module.exports = {
    newAccount: async function newAccouts(dbName, social, user, callback) {
        pool.getConnection((err, con) => {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, function (err, result) {
                if (err) throw err;
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS accounts (
                        id INT auto_increment PRIMARY KEY,
                        social TEXT NOT NULL,
                        user TEXT NOT NULL
                    ) ENGINE=InnoDB;`, (err, result) => {
                        if (err) throw err;
                        con.query(
                            `INSERT INTO accounts (social, user)
                            SELECT * FROM (SELECT '${social}' AS social, '${user}' AS user) AS tmp
                            WHERE NOT EXISTS (
                                SELECT social FROM accounts WHERE social = '${social}'
                            ) LIMIT 1;`, (err, result) => {
                                if (err) throw err;
                                con.destroy();
                                callback(result.affectedRows);
                            }
                        )
                    })
                })
            });
        })
    },
    removeAccount: async function removeAccount(dbName, social) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, con) => {
                if (err) reject(err);
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) reject(err); // need return if they try to do with without any server made.
                    con.query(`DELETE FROM accounts
                    WHERE social = '${social}';`, (err, result) => {
                        if (err) reject(err);
                        con.query(`DROP TABLE ${social};`, (err, result) => {
                            if (err) reject(err);
                            con.destroy();
                            resolve(result);
                        })
                    })
                })
            })
        })
    },
    getOneAccount: async function getOneAccount(dbName, social) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, con) => {
                if (err) reject (err)
                con.query(`USE \`${dbName}\``, (err, result) => {
                    if (err) reject(err);
                    con.query(`SELECT * FROM accounts
                    WHERE social = '${social}'`, (err, result) => {
                        if (!result[0]) reject(new Error('No Tracked Account'))
                        resolve(result[0]);
                    })
                })
            })
        })
    }, 
    getAccounts: async function getAccounts(social, callback) {
        pool.getConnection(function(err, con) {
            if (err) throw err;
            console.log("Getting Accounts");
            con.query(`SELECT DISTINCT SCHEMA_NAME AS 'database'
            FROM information_schema.SCHEMATA
            WHERE  SCHEMA_NAME NOT IN ('information_schema', 'performance_schema', 'mysql', 'sys')
            ORDER BY SCHEMA_NAME`, async (err, result) => {
                if (err) throw err;
                let databases = await result.map(a => ([a.database])).flat();
                await Promise.allSettled(databases.map( database => {
                    return new Promise((resolve, reject) => {
                        pool.getConnection((err, subCon) => {
                            subCon.query(`USE \`${database}\``, (err, result) => {
                                if (err) reject(new Error(err));
                                subCon.query(`SELECT * FROM accounts
                                WHERE social = "${social}"`, (err, results) => {
                                    if (err) reject(new Error(err));
                                    subCon.destroy();
                                    //console.log(results) //Use this one to tell if there are empty results. May be bug in grabbing
                                    if (Array.isArray(results) && results.length) {
                                        resolve({ 'database': database, 'user': results[0].user });
                                    } else {
                                        reject(new Error(`Empty or undefined Array for Database: ${database}, Social: ${social}`))
                                    }
                                })
                            })
                        })  
                    })
                }))
                .then(promises => {
                    con.destroy();
                    //console.log(promises) //shows all promises, including those rejected

                    //filter out rejected responses
                    let res = promises.filter(promise => promise.status === 'fulfilled').map(promise => {
                        return promise.value;
                    })
                    callback(res)
                })
                .catch(err => {
                    con.destroy();
                    console.log(err)
                })              
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
                                con.destroy();
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
                    con.destroy();
                    callback(results);
                })
            })
        })
    },
    feedback: async function feedback(dbName, table, feedback, user) {
        pool.getConnection((err, con) => {
            if (err) throw err;
            console.log("Inserting Feedback into MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS feedback`, function (err, result) {
                if (err) throw err;
                con.query(`USE feedback`, (err, result) => {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS ${table} (
                        id INT auto_increment PRIMARY KEY,
                        submitTime DATETIME DEFAULT now(),
                        feedback TEXT NOT NULL,
                        user TEXT NOT NULL,
                        serverID TEXT NOT NULL
                    ) ENGINE=InnoDB;`, (err, result) => {
                        if (err) throw err;
                        con.query(
                            `INSERT INTO ${table} (feedback, user, serverID)
                            SELECT * FROM (SELECT '${feedback}' AS feedback, '${user}' AS user, '${dbName}' as serverID) AS tmp
                            WHERE NOT EXISTS (
                                SELECT feedback FROM ${table} WHERE feedback = '${feedback}'
                            ) LIMIT 1;`, (err, result) => {
                                if (err) throw err;
                                con.destroy();
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