CREATE TABLE blacklist (
    ip character varying(50) NOT NULL PRIMARY KEY,
    times_blocked integer NOT NULL,
		CONSTRAINT cc_times_blocked CHECK ((times_blocked > 0)) NOT VALID
);

ALTER TABLE blacklist OWNER TO dbowner;
