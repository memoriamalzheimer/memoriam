const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { enviarEmail } = require('../services/emailService');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

module.exports = function(app) {

     function verificarLogin(req, res, next) {
        if (!req.session.usuario) {
            return res.redirect('/');
        }
        next();
    }

     app.get('/', function(req, res) {
        if (req.session.usuario) return res.redirect('/inicio');
        res.render('index.ejs');
    });

     app.get('/login', function(req, res) {
        res.render('usuarios/login.ejs', { erro: null });
    });

  app.post('/login', function(req, res) {
    const connection = app.infra.connectionFactory();
    const usuariosDAO = new app.infra.UsuariosDAO(connection);
    const { email, senha, cuidador } = req.body;   

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
            if (!result) {
                return res.render('usuarios/login.ejs', { erro: 'Usuário ou senha inválidos!' });
            }

             req.session.usuario = usuario;
            
            req.session.save(() => {  
                 if (cuidador) {
                    return res.redirect('/cuidador');
                } else {
                    return res.redirect('/inicio');
                }
            });
        });
    });
});

    app.get('/cuidador', verificarLogin, function(req, res) {
        res.render('usuarios/cuidador.ejs', { usuario: req.session.usuario });
    });

     
  app.get('/videochamada', (req, res) => {
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    res.render('home/videochamada', { usuario: req.session.usuario });
  });


     app.get('/logout', function(req, res) {
        req.session.destroy(() => {
            res.redirect('/');
        });
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

                usuariosDAO.salvar(usuario, function(err) {
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

     app.get('/inicio', verificarLogin, function(req, res) {
        res.render('home/inicio.ejs', { usuario: req.session.usuario });
    });
 function verificarLogin(req, res, next) {
  if (!req.session.usuario) {
     return res.render('usuarios/login.ejs', { 
      erro: 'Você precisa fazer login para acessar esta página.' 
    });
  }
  next();
}

app.get('/convite', verificarLogin, (req, res) => {
  res.render('home/convite.ejs', { usuario: req.session.usuario });
});



     app.get('/termos', function(req, res) {
        res.render('usuarios/termos.ejs');
    });

    app.get('/sobre', function(req, res) {
        res.render('home/sobre.ejs', { usuario: req.session.usuario });
    });

    
    app.get('/dama', function(req, res) {
        res.render('home/dama.ejs', { usuario: req.session.usuario });
    });

    app.get('/jogos', function(req, res) {
        res.render('home/jogos.ejs', { usuario: req.session.usuario });
    });

    app.get('/faq', function(req, res) {
        res.render('home/faq.ejs', { usuario: req.session.usuario });
    });

    app.get('/perfil', function(req, res) {
        res.render('home/perfil.ejs', { usuario: req.session.usuario });
    });
app.get('/recuperar-senha', function(req, res) {
    res.render('usuarios/recuperar-senha.ejs', { mensagem: null });
});

   app.post('/recuperar-senha', function(req, res) {
    const connection = app.infra.connectionFactory();
    const usuariosDAO = new app.infra.UsuariosDAO(connection);
    const { email } = req.body;

    if (!email) {
        connection.end();
        return res.render('usuarios/recuperar-senha.ejs', { mensagem: 'Informe seu e-mail.' });
    }

    usuariosDAO.buscarPorEmail(email, async function(err, results) {
        if (err) {
            connection.end();
            console.error(err);
            return res.render('usuarios/recuperar-senha.ejs', { mensagem: 'Erro ao buscar usuário.' });
        }

        if (results.length === 0) {
            connection.end();
             return res.render('usuarios/recuperar-senha.ejs', { mensagem: 'Se o e-mail existir, você receberá instruções para redefinir a senha.' });
        }

        const usuario = results[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expira = new Date(Date.now() + 1000 * 60 * 60);

        usuariosDAO.setResetToken(email, token, expira, async function(err2) {
            connection.end();
            if (err2) {
                console.error(err2);
                return res.render('usuarios/recuperar-senha.ejs', { mensagem: 'Erro ao gerar token.' });
            }

            const link = `${process.env.BASE_URL}/redefinir-senha/${token}`;
            const html = `
                <p>Olá ${usuario.nome || ''},</p>
                <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha (válido por 1 hora):</p>
                <p><a href="${link}">${link}</a></p>
                <p>Se você não solicitou, ignore este e-mail.</p>
            `;

            const enviado = await enviarEmail(email, 'Redefinir sua senha', html);
            if (enviado) {
                return res.render('usuarios/recuperar-senha.ejs', { mensagem: 'Se o e-mail existir, você receberá instruções para redefinir a senha.' });
            } else {
                return res.render('usuarios/recuperar-senha.ejs', { mensagem: 'Não foi possível enviar o e-mail. Tente novamente mais tarde.' });
            }
        });
    });
});
app.get('/redefinir-senha/:token', function(req, res) {
    const token = req.params.token;
    const connection = app.infra.connectionFactory();
    const usuariosDAO = new app.infra.UsuariosDAO(connection);

    usuariosDAO.buscarPorResetToken(token, function(err, results) {
        connection.end();
        if (err) {
            console.error(err);
            return res.send('Erro ao processar requisição.');
        }

        if (results.length === 0) {
            return res.send('Token inválido ou expirado.');
        }

        const usuario = results[0];
        const agora = new Date();
        if (!usuario.reset_token_expira || agora > new Date(usuario.reset_token_expira)) {
            return res.send('Token expirado. Solicite recuperação novamente.');
        }

         res.render('usuarios/redefinir-senha.ejs', { token, mensagem: null });
    });
});

app.post('/redefinir-senha/:token', function(req, res) {
    const token = req.params.token;
    const { senha, senhaConfirmacao } = req.body;

    if (!senha || !senhaConfirmacao) {
        return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'Preencha os campos de senha.' });
    }
    if (senha !== senhaConfirmacao) {
        return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'As senhas não coincidem.' });
    }

    const connection = app.infra.connectionFactory();
    const usuariosDAO = new app.infra.UsuariosDAO(connection);

    usuariosDAO.buscarPorResetToken(token, function(err, results) {
        if (err) {
            connection.end();
            console.error(err);
            return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'Erro ao processar.' });
        }

        if (results.length === 0) {
            connection.end();
            return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'Token inválido ou expirado.' });
        }

        const usuario = results[0];
        const agora = new Date();
        if (!usuario.reset_token_expira || agora > new Date(usuario.reset_token_expira)) {
            connection.end();
            return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'Token expirado. Solicite recuperação novamente.' });
        }

         bcrypt.hash(senha, 12, function(errHash, hash) {
            if (errHash) {
                connection.end();
                console.error(errHash);
                return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'Erro ao criptografar senha.' });
            }

            usuariosDAO.atualizarSenhaPorId(usuario.id, hash, function(errUpdate) {
                connection.end();
                if (errUpdate) {
                    console.error(errUpdate);
                    return res.render('usuarios/redefinir-senha.ejs', { token, mensagem: 'Erro ao atualizar senha.' });
                }

                 return res.render('usuarios/login.ejs', { erro: 'Senha alterada com sucesso. Faça login.' });
            });
        });
    });
});


    app.get('/privacidade', function(req, res) {
        res.render('usuarios/privacidade.ejs');
    });

     app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        const connection = app.infra.connectionFactory();
        const usuariosDAO = new app.infra.UsuariosDAO(connection);

        const email = profile.emails[0].value;
        const nome = profile.displayName;

        usuariosDAO.buscarPorEmail(email, function(err, results) {
            if (err) {
                connection.end();
                return done(err);
            }

            if (results.length === 0) {
                const novoUsuario = { nome, email, senha: '' };
                usuariosDAO.salvar(novoUsuario, function(err) {
                    connection.end();
                    if (err) return done(err);
                    return done(null, novoUsuario);
                });
            } else {
                connection.end();
                return done(null, results[0]);
            }
        });
    }));

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
         req.session.usuario = {
            id: req.user.id,  
            nome: req.user.nome || req.user.displayName,
            email: req.user.email || req.user.emails?.[0]?.value
        };

        req.session.save(() => {  
            res.redirect('/inicio');
        });
    }
);

};
