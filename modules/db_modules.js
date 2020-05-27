const mysql = require('mysql');
const auth = require('../auth/auth.json');

module.exports = {
    insert: async function insert(dbName, table, data) {
        var con = mysql.createConnection(auth.dbLogin)
        data.shift(); //remove the column headers
    
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, function (err, result) {
                if (err) throw err;
                con.query(`USE \`${dbName}\``, function (err, result) {
                    if (err) throw err;
                    con.query(`CREATE TABLE IF NOT EXISTS ${table} (
                        id INT auto_increment PRIMARY KEY,
                        date TEXT NOT NULL,
                        time TIME NOT NULL,
                        followers INT SIGNED NOT NULL,
                        chng INT SIGNED NOT NULL
                    ) ENGINE=InnoDB;`, function (err, result) {
                        if (err) throw err;
                        for (entry of data) {
                            con.query(
                                `INSERT INTO ${table} (date, time, followers, chng)
                                SELECT * FROM (SELECT '${entry[0]}' AS date, '${entry[1]}' AS time, ${entry[2]} AS followers, ${entry[3]} AS chng) AS tmp
                                WHERE NOT EXISTS (
                                    SELECT date FROM ${table} WHERE date = '${entry[0]}'
                                ) LIMIT 1;`, function (err, result) {
                                    if (err) throw err;
                                }
                            )
                        }
                    })
                })
            });
        })
    }
}