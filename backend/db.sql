create database app_pp;
use app_pp;

-- TABELA DE USUÁRIOS
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- TABELA DE SEGUIDORES (N:N)
-- ===============================
CREATE TABLE follow (
    follower_id INT,
    following_id INT,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- TABELA DE FOTOS (POSTS)
-- ===============================
CREATE TABLE photo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    url VARCHAR(255) NULL,
    likes INT DEFAULT 0,
    average_rating FLOAT DEFAULT 0,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- TABELA DE COMENTÁRIOS
-- ===============================
CREATE TABLE comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text VARCHAR(255) NOT NULL,
    photo_id INT,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (photo_id) REFERENCES photo(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- TABELA DE CURTIDAS
-- ===============================
CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    photo_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (photo_id) REFERENCES photo(id) ON DELETE CASCADE,
    UNIQUE (user_id, photo_id) -- garante que um usuário curta uma vez só
);


drop database app_pp;

select * from photo;

select * from users;

select * from likes;
