const bcrypt = require('bcryptjs');

module.exports = function(app) {

    function verificarLogin(req, res, next) {
        if (!req.session.usuario) {
            return res.redirect('/');
        }
        next();
    }
 
    app.get('/', function(req, res) {
        if (req.session.usuario) {
            return res.redirect('/inicio');
        }
        res.render('index.ejs');
    });

     app.get('/login', function(req, res) {
        res.render('usuarios/login.ejs', { erro: null });
    });

    app.post('/login', function(req, res) {
        const connection = app.infra.connectionFactory();
        const usuariosDAO = new app.infra.UsuariosDAO(connection);

        const email = req.body.email;
        const senha = req.body.senha;

        usuariosDAO.buscarPorEmail(email, function(err, results) {
            if (err) {
                connection.end();
                return res.send('Erro ao buscar usuário!');
            }

            if (results.length === 0) {
                connection.end();
                return res.render('usuarios/login.ejs', { erro: 'Usuário não encontrado!' });
            }

            const usuario = results[0];

            bcrypt.compare(senha, usuario.senha, function(err, result) {
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

     app.get('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/');
    });

     app.get('/registro', function(req, res) {
        res.render('usuarios/registro.ejs', { errosValidacao: [], usuario: {} });
    });

    app.post('/registro', function(req, res) {
        const connection = app.infra.connectionFactory();
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

         usuariosDAO.buscarPorEmail(usuario.email, function(err, results) {
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

             bcrypt.hash(usuario.senha, 12, function(err, hash) {
                if (err) {
                    connection.end();
                    return res.send('Erro ao criptografar a senha!');
                }

                usuario.senha = hash;
                delete usuario.senhaConfirmacao;

                usuariosDAO.salvar(usuario, function(err, results) {
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

     app.get('/recuperar-senha', function(req, res) {
        res.render('usuarios/recuperar-senha.ejs', { mensagem: null });
    });

     app.get('/termos', function(req, res) {
        res.render('usuarios/termos.ejs');
    });

    app.get('/privacidade', function(req, res) {
        res.render('usuarios/privacidade.ejs');
    });
   app.get('/sobre', function(req, res){
    res.render('home/sobre.ejs', { usuario: req.session.usuario });
});
    app.get('/jogos', function(req, res){
    res.render('home/jogos.ejs', { usuario: req.session.usuario });
});
    app.get('/faq', function (req,res){
        res.render('home/faq.ejs',{usuario:req.session.usuario});
    })

    
    app.get('/inicio', verificarLogin, function(req, res) {
        res.render('home/inicio.ejs', { usuario: req.session.usuario });
    });

     app.get('/jogos', verificarLogin, function(req, res) {
        res.render('home/jogos.ejs', { usuario: req.session.usuario });
    });

    app.get('/perfil', verificarLogin, function(req, res) {
        res.render('home/perfil.ejs', { usuario: req.session.usuario });
    });

};
