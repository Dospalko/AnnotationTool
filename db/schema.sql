--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.2 (Homebrew)

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
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: annotation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annotation (
    id integer NOT NULL,
    text character varying(500),
    color character varying(10),
    favorite boolean
);


ALTER TABLE public.annotation OWNER TO postgres;

--
-- Name: annotation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.annotation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.annotation_id_seq OWNER TO postgres;

--
-- Name: annotation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.annotation_id_seq OWNED BY public.annotation.id;


--
-- Name: pdf_text; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pdf_text (
    id integer NOT NULL,
    text text NOT NULL,
    filename character varying(255) NOT NULL,
    project_id integer
);


ALTER TABLE public.pdf_text OWNER TO postgres;

--
-- Name: pdf_text_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pdf_text_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pdf_text_id_seq OWNER TO postgres;

--
-- Name: pdf_text_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pdf_text_id_seq OWNED BY public.pdf_text.id;


--
-- Name: project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.project OWNER TO postgres;

--
-- Name: project_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_id_seq OWNER TO postgres;

--
-- Name: project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_id_seq OWNED BY public.project.id;


--
-- Name: relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relation (
    id integer NOT NULL,
    source_token_id integer NOT NULL,
    target_token_id integer NOT NULL,
    relation_type character varying(50)
);


ALTER TABLE public.relation OWNER TO postgres;

--
-- Name: relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relation_id_seq OWNER TO postgres;

--
-- Name: relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relation_id_seq OWNED BY public.relation.id;


--
-- Name: token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token (
    id integer NOT NULL,
    word character varying(50) NOT NULL,
    start integer NOT NULL,
    "end" integer NOT NULL,
    pdf_text_id integer NOT NULL,
    annotation_id integer
);


ALTER TABLE public.token OWNER TO postgres;

--
-- Name: token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_id_seq OWNER TO postgres;

--
-- Name: token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.token_id_seq OWNED BY public.token.id;


--
-- Name: annotation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annotation ALTER COLUMN id SET DEFAULT nextval('public.annotation_id_seq'::regclass);


--
-- Name: pdf_text id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf_text ALTER COLUMN id SET DEFAULT nextval('public.pdf_text_id_seq'::regclass);


--
-- Name: project id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public.project_id_seq'::regclass);


--
-- Name: relation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relation ALTER COLUMN id SET DEFAULT nextval('public.relation_id_seq'::regclass);


--
-- Name: token id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token ALTER COLUMN id SET DEFAULT nextval('public.token_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: annotation annotation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annotation
    ADD CONSTRAINT annotation_pkey PRIMARY KEY (id);


--
-- Name: pdf_text pdf_text_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf_text
    ADD CONSTRAINT pdf_text_pkey PRIMARY KEY (id);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: relation relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_pkey PRIMARY KEY (id);


--
-- Name: token token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_pkey PRIMARY KEY (id);


--
-- Name: pdf_text pdf_text_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pdf_text
    ADD CONSTRAINT pdf_text_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id);


--
-- Name: relation relation_source_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_source_token_id_fkey FOREIGN KEY (source_token_id) REFERENCES public.token(id);


--
-- Name: relation relation_target_token_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relation
    ADD CONSTRAINT relation_target_token_id_fkey FOREIGN KEY (target_token_id) REFERENCES public.token(id);


--
-- Name: token token_annotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_annotation_id_fkey FOREIGN KEY (annotation_id) REFERENCES public.annotation(id);


--
-- Name: token token_pdf_text_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_pdf_text_id_fkey FOREIGN KEY (pdf_text_id) REFERENCES public.pdf_text(id);


--
-- PostgreSQL database dump complete
--

