--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blacklist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blacklist (
    ip character varying(50) NOT NULL,
    times_blocked integer NOT NULL,
    urls text[] NOT NULL
);


ALTER TABLE public.blacklist OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    handle text NOT NULL,
    date_handled timestamp with time zone DEFAULT CURRENT_DATE NOT NULL,
    bot_score real NOT NULL,
    address character(43) NOT NULL,
    approved boolean NOT NULL,
    reason text NOT NULL,
    CONSTRAINT cc_address CHECK ((char_length(address) = 43))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: blacklist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blacklist (ip, times_blocked, urls) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (handle, date_handled, bot_score, address, approved, reason) FROM stdin;
Mr_Robot	2020-12-07 09:50:43+00	5	mr_robot-address123412345678901234567890123	f	not null
TestyMcTestface	2020-11-11 00:00:00+00	0.8	address-90123456789012345678901234567890123	t	test reason
TestInsert	2020-12-17 11:11:49+00	5	search-address-1234013245678901234567890123	f	test reason
rosmcmahon_real	2021-01-07 11:12:26+00	0.6	GVgI1-TV_GLQvjJbqjFLclIbksvTAp2oD6zep4Uixe8	t	OK 0.6
\.


--
-- Name: users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (handle);


--
-- Name: blacklist blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blacklist
    ADD CONSTRAINT blacklist_pkey PRIMARY KEY (ip);


--
-- Name: blacklist cc_times_blocked; Type: CHECK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.blacklist
    ADD CONSTRAINT cc_times_blocked CHECK ((times_blocked > 0)) NOT VALID;


--
-- Name: users uc_address; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uc_address UNIQUE (address);


--
-- PostgreSQL database dump complete
--

