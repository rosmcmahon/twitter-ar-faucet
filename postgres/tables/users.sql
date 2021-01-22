CREATE TABLE users (
    "twitterId" text NOT NULL PRIMARY KEY,
    handle text NOT NULL,
    date_handled timestamp with time zone DEFAULT CURRENT_DATE NOT NULL,
    bot_score real NOT NULL,
    address character(43) UNIQUE NOT NULL,
    approved boolean NOT NULL,
    reason text NOT NULL,
    CONSTRAINT cc_address CHECK ((char_length(address) = 43))
);

ALTER TABLE users OWNER TO dbowner;

