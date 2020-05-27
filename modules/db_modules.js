const mysql = require('mysql');
const auth = require('../auth/auth.json');

module.exports = {
    insert: async function insert(dbName, table, data) {
        var con = mysql.createConnection(auth.dbLogin)
    
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, function (err, result) {
                if (err) throw err;
                con.query(`USE ${dbName}`, function (err, result) {
                    if (err) throw err;
                    //A table must have at least 1 column error
                    con.query(`CREATE TABLE IF NOT EXISTS ${table}`, function (err, result) {
                        if (err) throw err;
                    })
                })
            });
        })
    }
}