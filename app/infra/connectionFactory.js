var mysql = require('mysql');

var connectMYSQL = function(){
    return mysql.createConnection({
        host: 'localhost',
        database: 'login',
        user: 'root',
        password: ''
    });
}

module.exports = function(){
    return connectMYSQL;
}