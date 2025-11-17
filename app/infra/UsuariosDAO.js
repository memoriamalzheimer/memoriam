function UsuariosDAO(connection) {
    this._connection = connection;
}

UsuariosDAO.prototype.salvar = function (usuario, callback) {
    this._connection.query('INSERT INTO usuarios SET ?', usuario, callback);
};

UsuariosDAO.prototype.buscarPorEmail = function (email, callback) {
    this._connection.query('SELECT * FROM usuarios WHERE email = ?', [email], callback);
};
UsuariosDAO.prototype.setResetToken = function (email, token, expira, callback) {
    this._connection.query(
        'UPDATE usuarios SET reset_token = ?, reset_token_expira = ? WHERE email = ?',
        [token, expira, email],
        callback
    );
};

UsuariosDAO.prototype.buscarPorResetToken = function (token, callback) {
    this._connection.query(
        'SELECT * FROM usuarios WHERE reset_token = ?',
        [token],
        callback
    );
};

UsuariosDAO.prototype.atualizarSenhaPorId = function (id, novaSenha, callback) {
    this._connection.query(
        'UPDATE usuarios SET senha = ?, reset_token = NULL, reset_token_expira = NULL WHERE id = ?',
        [novaSenha, id],
        callback
    );
};


module.exports = function () {
    return UsuariosDAO;
};
