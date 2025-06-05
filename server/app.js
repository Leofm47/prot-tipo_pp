const express = require('express');
const cors = require('cors');
const connection = require('./connection.js');
const app = express();

app.use(cors());
app.use(express.json());

const port = 3030;

app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    const userQuery = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
    connection.query(userQuery, [nome, email, senha], (err) => {
        if (err) {
            console.error("Erro do MySQL:", err);
            return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.', error: err.sqlMessage });
        }
        res.json({ success: true, message: 'Cadastro realizado com sucesso!'});
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND senha = ?';
    connection.query(query, [email, senha], (err, results) => {
        if (err) {
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }
        if (results.length > 0) {
            res.json({ success: true, message: 'Login bem-sucedido!', usuario_id: results[0].id });
        } else {
            res.json({ success: false, message: 'Usuário ou senha incorretos!' });
        }
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});