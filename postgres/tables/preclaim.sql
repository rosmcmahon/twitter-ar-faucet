CREATE TABLE preclaim (
    secode uuid NOT NULL PRIMARY KEY,
    address character(1) NOT NULL,
    CONSTRAINT cc_address CHECK ((char_length(address) = 43))
);

ALTER TABLE preclaim OWNER TO dbowner;
GRANT ALL ON TABLE preclaim TO dbowner;

