const multer = require('multer');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connection = require('./src/db_config.js');
const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔧 Configuração de armazenamento do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

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

app.post('/posts', upload.single('image'), (req, res) => {
    const { title, description, author_id } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;
    
    const query = 'INSERT INTO photo (title, description, url, author_id) VALUES (?, ?, ?, ?)';
    connection.query(query, [title, description, imagePath, author_id], (err, result) => {
        if (err) {
            console.error("Erro ao salvar post:", err);
            return res.status(500).json({ success: false, message: 'Erro ao criar post.' });
        }
        res.json({ success: true, message: 'Post criado com sucesso!', id: result.insertId });
    });
});

app.get('/posts', (req, res) => {
    const query = 'SELECT * FROM photo ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Erro ao buscar posts:", err);
            return res.status(500).json({ success: false, message: 'Erro ao carregar posts.' });
        }
        res.json(results);
    });
});


app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});