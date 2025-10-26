var app = require('./config/express')();
require('./app/routes/usuarios')(app);

// Usa a porta do Render ou 3000 como fallback
const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log(`Servidor rodando na porta ${PORT}`);
});
