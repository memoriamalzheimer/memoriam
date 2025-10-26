const bcrypt = require('bcryptjs');

module.exports = function(app) {

    // Middleware para verificar login
    function verificarLogin(req, res, next) {
        if (!req.session.usuario) {
            return res.redirect('/');
        }
        next();
    }

    // Importa a factory de conexão configurada para banco remoto
    const connectMYSQL = require('../config/connectionFactory');

    // ROTAS PÚBLICAS
    app.get('/', (req, res) => {
        if (req.session.usuario) return res.redirect('/inicio');
        res.render('index.ejs');
    });

    app.get('/login', (req, res) => {
        res.render('usuarios/login.ejs', { erro: null });
    });

    app.post('/login', (req, res) => {
        const connection = connectMYSQL();
        const usuariosDAO = new app.infra.UsuariosDAO(connection);

        const { email, senha } = req.body;

        usuariosDAO.buscarPorEmail(email, (err, results) => {
            if (err) {
                connection.end();
                return res.send('Erro ao buscar usuário!');
            }

            if (results.length === 0) {
                connection.end();
                return res.render('usuarios/login.ejs', { erro: 'Usuário não encontrado!' });
            }

            const usuario = results[0];
            bcrypt.compare(senha, usuario.senha, (err, result) => {
                connection.end();
                if (result) {
                    req.session.usuario = usuario;
                    res.redirect('/inicio');
                } else {
                    res.render('usuarios/login.ejs', { erro: 'Usuário ou senha inválidos!' });
                }
            });
        });
    });

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });

    app.get('/registro', (req, res) => {
        res.render('usuarios/registro.ejs', { errosValidacao: [], usuario: {} });
    });

    app.post('/registro', (req, res) => {
        const connection = connectMYSQL();
        const usuariosDAO = new app.infra.UsuariosDAO(connection);
        const usuario = req.body;

        req.assert('nome', 'Nome é obrigatório!').notEmpty();
        req.assert('email', 'E-mail é obrigatório!').notEmpty();
        req.assert('senha', 'Senha é obrigatória!').notEmpty();
        req.assert('senhaConfirmacao', 'Confirmação de senha é obrigatória!').notEmpty();

        const erros = req.validationErrors();
        if (erros) {
            connection.end();
            return res.render('usuarios/registro.ejs', { errosValidacao: erros, usuario });
        }

        if (usuario.senha !== usuario.senhaConfirmacao) {
            connection.end();
            return res.render('usuarios/registro.ejs', { 
                errosValidacao: [{ msg: 'As senhas não coincidem!' }], 
                usuario 
            });
        }

        usuariosDAO.buscarPorEmail(usuario.email, (err, results) => {
            if (err) {
                connection.end();
                return res.send('Erro ao verificar e-mail!');
            }

            if (results.length > 0) {
                connection.end();
                return res.render('usuarios/registro.ejs', { 
                    errosValidacao: [{ msg: 'Esse e-mail já possui cadastro!' }], 
                    usuario 
                });
            }

            bcrypt.hash(usuario.senha, 12, (err, hash) => {
                if (err) {
                    connection.end();
                    return res.send('Erro ao criptografar a senha!');
                }

                usuario.senha = hash;
                delete usuario.senhaConfirmacao;

                usuariosDAO.salvar(usuario, (err, results) => {
                    connection.end();
                    if (err) {
                        console.log(err);
                        return res.send('Erro ao salvar o usuário!');
                    }
                    res.redirect('/login');
                });
            });
        });
    });

    // ROTAS ADICIONAIS
    app.get('/recuperar-senha', (req, res) => {
        res.render('usuarios/recuperar-senha.ejs', { mensagem: null });
    });

    app.get('/termos', (req, res) => res.render('usuarios/termos.ejs'));
    app.get('/privacidade', (req, res) => res.render('usuarios/privacidade.ejs'));
    app.get('/sobre', (req, res) => res.render('home/sobre.ejs', { usuario: req.session.usuario }));
    app.get('/faq', (req, res) => res.render('home/faq.ejs', { usuario: req.session.usuario }));

    // ROTAS PRIVADAS (precisam estar logado)
    app.get('/inicio', verificarLogin, (req, res) => {
        res.render('home/inicio.ejs', { usuario: req.session.usuario });
    });

    app.get('/jogos', verificarLogin, (req, res) => {
        res.render('home/jogos.ejs', { usuario: req.session.usuario });
    });

    app.get('/perfil', verificarLogin, (req, res) => {
        res.render('home/perfil.ejs', { usuario: req.session.usuario });
    });
};
