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

// Configuração de armazenamento do multer
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

// Cadastro de usuário
app.post('/cadastro', upload.single('profile_image'), (req, res) => {
    const { name, email, password } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const userQuery = `
        INSERT INTO users (name, email, password, profile_image) 
        VALUES (?, ?, ?, ?)
    `;

    connection.query(userQuery, [name, email, password, profileImage], (err) => {
        if (err) {
            console.error("Erro do MySQL:", err);
            return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.', error: err.sqlMessage });
        }
        res.json({ success: true, message: 'Cadastro realizado com sucesso!'});
    });
});

// Login de usuário
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Erro no login:', err);
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }
        if (results.length > 0) {
            res.json({ 
                success: true, 
                message: 'Login bem-sucedido!', 
                usuario_id: results[0].id 
            });
        } else {
            res.json({ success: false, message: 'Usuário ou senha incorretos!' });
        }
    });
});

// Criar post
app.post('/posts', upload.single('image'), (req, res) => {
    console.log('REQ BODY LOGIN:', req.body);
    const { title, description, author_id } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null; 

    const query = `
        INSERT INTO photo (title, description, url, author_id) 
        VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [title, description, imagePath, author_id], (err, result) => {
        if (err) {
            console.error("Erro ao salvar post:", err);
            return res.status(500).json({ success: false, message: 'Erro ao criar post.' });
        }
        res.json({ success: true, message: 'Post criado com sucesso!', id: result.insertId });
    });
});


// Listar posts
app.get('/posts', (req, res) => {
    const query = `
        SELECT p.*, u.name AS author_name, u.profile_image 
        FROM photo p
        JOIN users u ON p.author_id = u.id
        ORDER BY p.created_at DESC
    `;
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

//entrar no post
app.get('/posts/:id', (req, res) => {
    const postId = req.params.id;
    const query = `
        SELECT p.*, u.name AS author_name, u.profile_image 
        FROM photo p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = ?
    `;
    connection.query(query, [postId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar post.' });
        res.json(results[0]);
    });
});

//comentar no post
app.post('/comments', (req, res) => {
    const { text, photo_id, author_id } = req.body;
    const query = `INSERT INTO comment (text, photo_id, author_id) VALUES (?, ?, ?)`;
    connection.query(query, [text, photo_id, author_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao comentar.' });
        res.json({ success: true, message: 'Comentário adicionado!' });
    });
});

//get nos comentarios
app.get('/comments/:photo_id', (req, res) => {
    const { photo_id } = req.params;
    const query = `
        SELECT c.*, u.name AS author_name, u.profile_image 
        FROM comment c
        JOIN users u ON c.author_id = u.id
        WHERE c.photo_id = ?
        ORDER BY c.created_at DESC
    `;
    connection.query(query, [photo_id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao carregar comentários.' });
        res.json(results);
    });
});