create database app_pp;
use app_pp;

-- Tabela de usuários
create table users (
    id int primary key auto_increment,
    name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    profile_image varchar(255),
    created_at timestamp default current_timestamp
);

-- Tabela de seguidores (relacionamento N:N entre usuários)
create table follow (
    follower_id int,
    following_id int,
    foreign key (follower_id) references users(id),
    foreign key (following_id) references users(id),
    primary key (follower_id, following_id)
);

-- Tabela de fotos
create table photo (
    id int primary key auto_increment,
    title varchar(255) not null,
    description varchar(255) null,
    url varchar(255) null,
    likes int default 0,
    average_rating float default 0,
    author_id int,
    created_at timestamp default current_timestamp,
    foreign key (author_id) references users(id)
);

-- Tabela de comentários
create table comment (
    id int primary key auto_increment,
    text varchar(255) not null,
    photo_id int,
    author_id int,
    created_at timestamp default current_timestamp,
    foreign key (photo_id) references photo(id),
    foreign key (author_id) references users(id)
);

drop database app_pp;

select * from photo;

select * from users;