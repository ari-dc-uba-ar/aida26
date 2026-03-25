create user aida26_owner nologin;

create user aida26_user password 'CambiaEsta!';

create database aida26_db owner aida26_owner;

grant connect on database aida26_db to aida26_user;
