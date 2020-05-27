const mysql = require('mysql');

module.exports = {
    insert: async function insert(dbName, table, data) {
        var con = mysql.createConnection({
            host: "35.221.52.192",
            user: "root",
            password: "bot"
        })
    
        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to MySQL Server");
            con.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, function (err, result) {
                if (err) throw err;
                //select database here, none selected.
                con.query(`CREATE TABLE IF NOT EXISTS ${table}`, function (err, result) {
                    if (err) throw err;
                })
            });
        })
    }
}