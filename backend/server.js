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

// Curtir um post
app.post('/likes', (req, res) => {
    const { user_id, photo_id } = req.body;
    const query = `INSERT INTO likes (user_id, photo_id) VALUES (?, ?)`;
    connection.query(query, [user_id, photo_id], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Você já curtiu este post.' });
            }
            return res.status(500).json({ success: false, message: 'Erro ao curtir post.' });
        }
        res.json({ success: true, message: 'Post curtido!' });
    });
});

// Descurtir
app.delete('/likes', (req, res) => {
    const { user_id, photo_id } = req.body;
    const query = `DELETE FROM likes WHERE user_id = ? AND photo_id = ?`;
    connection.query(query, [user_id, photo_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao descurtir.' });
        res.json({ success: true, message: 'Curtida removida.' });
    });
});

// Buscar posts curtidos por um usuário
app.get('/likes/:user_id', (req, res) => {
    const { user_id } = req.params;
    const query = `
        SELECT p.*, u.name AS author_name, u.profile_image
        FROM likes l
        JOIN photo p ON l.photo_id = p.id
        JOIN users u ON p.author_id = u.id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
    `;
    connection.query(query, [user_id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar curtidas.' });
        res.json(results);
    });
});


// Buscar dados de um usuário (para o perfil)
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT id, name, email, profile_image, created_at
        FROM users
        WHERE id = ?
    `;
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro ao carregar usuário.' });
        }
        res.json(results[0]);
    });
});

// Excluir usuário e seus posts
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { user_id } = req.body;

    console.log("Requisição DELETE recebida:", req.body); // <-- pra testar

    if (user_id && parseInt(user_id) !== userId) {
        return res.status(403).json({ success: false, message: 'Você só pode excluir sua própria conta.' });
    }

    const deletePosts = `DELETE FROM photo WHERE author_id = ?`;
    connection.query(deletePosts, [userId], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir posts do usuário.' });

        const deleteUser = `DELETE FROM users WHERE id = ?`;
        connection.query(deleteUser, [userId], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: 'Erro ao excluir usuário.' });
            res.json({ success: true, message: 'Conta excluída com sucesso!' });
        });
    });
});

app.put('/users/:id', upload.single('profile_image'), (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    let query = 'UPDATE users SET name = ?, email = ?';
    const values = [name, email];

    if (password) {
        query += ', password = ?';
        values.push(password);
    }

    if (profileImage) {
        query += ', profile_image = ?';
        values.push(profileImage);
    }

    query += ' WHERE id = ?';
    values.push(userId);

    connection.query(query, values, (err) => {
        if (err) {
            console.error('Erro ao atualizar perfil:', err);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar perfil.' });
        }
        res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
    });
});

// Listar todos os usuários (para o chat)
app.get('/all-users', (req, res) => {
    const query = 'SELECT id, name, profile_image FROM users';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Erro ao buscar todos os usuários:', err);
        return res.status(500).json({ success: false, message: 'Erro ao buscar usuários.' });
      }
      res.json(results);
    });
  });
  