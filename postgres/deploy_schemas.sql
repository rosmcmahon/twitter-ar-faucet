create user dbowner with password 'dbowner';
grant all privileges on database twittercannon to dbowner;

-- Deploy fresh database tables
\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/preclaim.sql'
\i '/docker-entrypoint-initdb.d/tables/blacklist.sql'




