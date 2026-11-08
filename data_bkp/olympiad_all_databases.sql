--
-- PostgreSQL database cluster dump
--

\restrict 06XUlR8oghIh2uIFO18WWGhkhwF3uKYwtUUVU0LtuoaDFt2fGYg2zleXbaH0V7t

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE olympiad_user;
ALTER ROLE olympiad_user WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:oHHz7EfO428crjhYI/+9fA==$rnOyPnDKWYYT0/1eGMdAxR8YXzPF1R6x6M3Rdq3Cvo8=:ol4ZS8GT0+rxwgBNTGIPB4NVs/6XqqGPB44T07VN9Ls=';

--
-- User Configurations
--








\unrestrict 06XUlR8oghIh2uIFO18WWGhkhwF3uKYwtUUVU0LtuoaDFt2fGYg2zleXbaH0V7t

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict tFkPuYfDGzXbwG7drpg9fTnG2mxWLHpBzoWPSWXIMeKyrV47b4vcaRcbYaIAmtu

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict tFkPuYfDGzXbwG7drpg9fTnG2mxWLHpBzoWPSWXIMeKyrV47b4vcaRcbYaIAmtu

--
-- Database "live_class_db" dump
--

--
-- PostgreSQL database dump
--

\restrict cqG3uWmxW9fncvofVOYWQMghSlaR8cTVaAQHJts2i0negQSbPZa5gggiZ9UnyEU

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: live_class_db; Type: DATABASE; Schema: -; Owner: olympiad_user
--

CREATE DATABASE live_class_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE live_class_db OWNER TO olympiad_user;

\unrestrict cqG3uWmxW9fncvofVOYWQMghSlaR8cTVaAQHJts2i0negQSbPZa5gggiZ9UnyEU
\connect live_class_db
\restrict cqG3uWmxW9fncvofVOYWQMghSlaR8cTVaAQHJts2i0negQSbPZa5gggiZ9UnyEU

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.chat_messages (
    id uuid NOT NULL,
    live_class_id uuid NOT NULL,
    sender_user_id uuid NOT NULL,
    recipient_user_id uuid,
    content text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO olympiad_user;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO olympiad_user;

--
-- Name: live_class_answers; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.live_class_answers (
    id uuid NOT NULL,
    question_session_id uuid NOT NULL,
    student_user_id uuid NOT NULL,
    option_index integer,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_correct boolean,
    points_awarded integer DEFAULT 0
);


ALTER TABLE public.live_class_answers OWNER TO olympiad_user;

--
-- Name: live_class_assignments; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.live_class_assignments (
    id uuid NOT NULL,
    live_class_id uuid NOT NULL,
    student_id uuid NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(20) DEFAULT 'ASSIGNED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.live_class_assignments OWNER TO olympiad_user;

--
-- Name: live_class_question_sessions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.live_class_question_sessions (
    id uuid NOT NULL,
    live_class_id uuid NOT NULL,
    question_id uuid NOT NULL,
    started_by uuid NOT NULL,
    started_at timestamp with time zone,
    duration_seconds integer DEFAULT 300 NOT NULL,
    ends_at timestamp with time zone,
    status character varying(20) DEFAULT 'NOT_STARTED'::character varying NOT NULL,
    answer_revealed_at timestamp with time zone,
    CONSTRAINT chk_session_duration CHECK (((duration_seconds > 0) AND (duration_seconds <= 3600))),
    CONSTRAINT chk_session_status CHECK (((status)::text = ANY ((ARRAY['NOT_STARTED'::character varying, 'ACTIVE'::character varying, 'ENDED'::character varying, 'ANSWER_REVEALED'::character varying])::text[])))
);


ALTER TABLE public.live_class_question_sessions OWNER TO olympiad_user;

--
-- Name: live_class_questions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.live_class_questions (
    id uuid NOT NULL,
    live_class_id uuid,
    subject character varying(100) NOT NULL,
    topic character varying(100) NOT NULL,
    statement text NOT NULL,
    options text NOT NULL,
    correct_option integer,
    explanation text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_question_options CHECK ((options IS NOT NULL))
);


ALTER TABLE public.live_class_questions OWNER TO olympiad_user;

--
-- Name: live_classes; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.live_classes (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    scheduled_start timestamp with time zone NOT NULL,
    scheduled_end timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'SCHEDULED'::character varying NOT NULL,
    room_name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_live_class_status CHECK (((status)::text = ANY ((ARRAY['SCHEDULED'::character varying, 'LIVE'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT chk_live_class_time CHECK ((scheduled_end > scheduled_start))
);


ALTER TABLE public.live_classes OWNER TO olympiad_user;

--
-- Name: moderation_audit; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.moderation_audit (
    id uuid NOT NULL,
    live_class_id uuid NOT NULL,
    teacher_user_id uuid NOT NULL,
    target_user_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    success boolean NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.moderation_audit OWNER TO olympiad_user;

--
-- Name: raised_hands; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.raised_hands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    live_class_id uuid NOT NULL,
    user_id uuid NOT NULL,
    raised_at timestamp without time zone DEFAULT now() NOT NULL,
    cleared_at timestamp without time zone,
    accepted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.raised_hands OWNER TO olympiad_user;

--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.chat_messages (id, live_class_id, sender_user_id, recipient_user_id, content, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	create live classes	SQL	V1__create_live_classes.sql	-1479840751	olympiad_user	2026-10-25 16:42:53.304394	41	t
2	2	create chat messages	SQL	V2__create_chat_messages.sql	-1275065142	olympiad_user	2026-11-04 19:24:46.99982	143	t
3	3	moderation audit	SQL	V3__moderation_audit.sql	-56543218	olympiad_user	2026-11-04 23:55:20.10161	63	t
4	4	live class assignments	SQL	V4__live_class_assignments.sql	543786027	olympiad_user	2026-11-04 23:55:20.450737	35	t
5	5	create live class questions	SQL	V5__create_live_class_questions.sql	1533511931	olympiad_user	2026-11-05 13:12:25.747544	657	t
6	6	create live class question sessions	SQL	V6__create_live_class_question_sessions.sql	1050015041	olympiad_user	2026-11-05 13:12:26.635578	42	t
7	7	create live class answers	SQL	V7__create_live_class_answers.sql	974695858	olympiad_user	2026-11-05 13:12:26.781549	25	t
8	8	create raised hands	SQL	V8__create_raised_hands.sql	1593128208	olympiad_user	2026-11-07 13:20:05.174906	531	t
\.


--
-- Data for Name: live_class_answers; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.live_class_answers (id, question_session_id, student_user_id, option_index, submitted_at, is_correct, points_awarded) FROM stdin;
\.


--
-- Data for Name: live_class_assignments; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.live_class_assignments (id, live_class_id, student_id, assigned_by, assigned_at, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: live_class_question_sessions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.live_class_question_sessions (id, live_class_id, question_id, started_by, started_at, duration_seconds, ends_at, status, answer_revealed_at) FROM stdin;
\.


--
-- Data for Name: live_class_questions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.live_class_questions (id, live_class_id, subject, topic, statement, options, correct_option, explanation, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: live_classes; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.live_classes (id, course_id, teacher_id, title, description, scheduled_start, scheduled_end, status, room_name, created_at, updated_at) FROM stdin;
5225a17b-0454-4fd2-9c46-6e7068251a19	85433441-4310-4b00-b29d-0eda01bc48cb	504aecb9-7c33-44bc-8a46-ff5ff473f841	Teacher Ownership Security Test	Testing authenticated teacher ownership	2026-10-27 10:00:00+00	2026-10-27 11:00:00+00	SCHEDULED	class-3335f37a-c35a-40b1-81ac-7272ef47c6ba	2026-10-25 14:46:46.291042+00	2026-10-25 14:46:46.291042+00
b4acea57-a0b0-48c5-a999-9e01ab2390e0	85433441-4310-4b00-b29d-0eda01bc48cb	504aecb9-7c33-44bc-8a46-ff5ff473f841	Olympiad Mathematics - Live Session 1	Problem-solving practice	2026-11-01 08:50:00+00	2026-11-01 09:25:00+00	CANCELLED	class-73da9692-33a3-47e0-9315-eaf36abbc350	2026-10-25 12:39:54.23601+00	2026-11-05 06:06:30.267134+00
7f5f4eb8-a31b-4ae0-acb6-a0be13c7f972	85433441-4310-4b00-b29d-0eda01bc48cb	504aecb9-7c33-44bc-8a46-ff5ff473f841	test	test num	2026-11-07 06:45:00+00	2026-11-07 16:30:00+00	SCHEDULED	class-92e1eead-bf40-491f-acb2-801308923c65	2026-11-04 18:00:26.952326+00	2026-11-07 14:45:48.966658+00
1f02cdba-33bf-4fb5-909c-155d516cdf36	c7e8950e-2801-43d5-b4af-38a9f166cc1a	504aecb9-7c33-44bc-8a46-ff5ff473f841	python	python class	2026-11-08 00:37:00+00	2026-11-08 01:37:00+00	SCHEDULED	class-61d15e41-9b0a-42da-a6ac-0b4a925434ac	2026-11-08 00:38:01.872648+00	2026-11-08 00:38:01.872648+00
\.


--
-- Data for Name: moderation_audit; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.moderation_audit (id, live_class_id, teacher_user_id, target_user_id, action, success, created_at) FROM stdin;
\.


--
-- Data for Name: raised_hands; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.raised_hands (id, live_class_id, user_id, raised_at, cleared_at, accepted) FROM stdin;
\.


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: live_class_answers live_class_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_answers
    ADD CONSTRAINT live_class_answers_pkey PRIMARY KEY (id);


--
-- Name: live_class_assignments live_class_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_assignments
    ADD CONSTRAINT live_class_assignments_pkey PRIMARY KEY (id);


--
-- Name: live_class_question_sessions live_class_question_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_question_sessions
    ADD CONSTRAINT live_class_question_sessions_pkey PRIMARY KEY (id);


--
-- Name: live_class_questions live_class_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_questions
    ADD CONSTRAINT live_class_questions_pkey PRIMARY KEY (id);


--
-- Name: live_classes live_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_classes
    ADD CONSTRAINT live_classes_pkey PRIMARY KEY (id);


--
-- Name: live_classes live_classes_room_name_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_classes
    ADD CONSTRAINT live_classes_room_name_key UNIQUE (room_name);


--
-- Name: moderation_audit moderation_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.moderation_audit
    ADD CONSTRAINT moderation_audit_pkey PRIMARY KEY (id);


--
-- Name: raised_hands raised_hands_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.raised_hands
    ADD CONSTRAINT raised_hands_pkey PRIMARY KEY (id);


--
-- Name: live_class_answers uq_answer_student_session; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_answers
    ADD CONSTRAINT uq_answer_student_session UNIQUE (question_session_id, student_user_id);


--
-- Name: live_class_assignments uq_live_class_student; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_assignments
    ADD CONSTRAINT uq_live_class_student UNIQUE (live_class_id, student_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_answers_session; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_answers_session ON public.live_class_answers USING btree (question_session_id);


--
-- Name: idx_answers_student; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_answers_student ON public.live_class_answers USING btree (student_user_id);


--
-- Name: idx_chat_messages_class; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_chat_messages_class ON public.chat_messages USING btree (live_class_id);


--
-- Name: idx_chat_messages_recipient; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_chat_messages_recipient ON public.chat_messages USING btree (recipient_user_id);


--
-- Name: idx_chat_messages_sender; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_user_id);


--
-- Name: idx_lca_class; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_lca_class ON public.live_class_assignments USING btree (live_class_id);


--
-- Name: idx_lca_student; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_lca_student ON public.live_class_assignments USING btree (student_id);


--
-- Name: idx_live_classes_course; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_live_classes_course ON public.live_classes USING btree (course_id);


--
-- Name: idx_live_classes_schedule; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_live_classes_schedule ON public.live_classes USING btree (scheduled_start);


--
-- Name: idx_live_classes_teacher; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_live_classes_teacher ON public.live_classes USING btree (teacher_id);


--
-- Name: idx_questions_class; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_questions_class ON public.live_class_questions USING btree (live_class_id);


--
-- Name: idx_questions_subject; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_questions_subject ON public.live_class_questions USING btree (subject);


--
-- Name: idx_raised_hands_live_class; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_raised_hands_live_class ON public.raised_hands USING btree (live_class_id);


--
-- Name: idx_raised_hands_user; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_raised_hands_user ON public.raised_hands USING btree (user_id);


--
-- Name: idx_sessions_class; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_sessions_class ON public.live_class_question_sessions USING btree (live_class_id);


--
-- Name: idx_sessions_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_sessions_status ON public.live_class_question_sessions USING btree (status);


--
-- Name: chat_messages chat_messages_live_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES public.live_classes(id) ON DELETE CASCADE;


--
-- Name: live_class_answers live_class_answers_question_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_answers
    ADD CONSTRAINT live_class_answers_question_session_id_fkey FOREIGN KEY (question_session_id) REFERENCES public.live_class_question_sessions(id) ON DELETE CASCADE;


--
-- Name: live_class_assignments live_class_assignments_live_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_assignments
    ADD CONSTRAINT live_class_assignments_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES public.live_classes(id) ON DELETE CASCADE;


--
-- Name: live_class_question_sessions live_class_question_sessions_live_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_question_sessions
    ADD CONSTRAINT live_class_question_sessions_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES public.live_classes(id) ON DELETE CASCADE;


--
-- Name: live_class_question_sessions live_class_question_sessions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_question_sessions
    ADD CONSTRAINT live_class_question_sessions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.live_class_questions(id) ON DELETE CASCADE;


--
-- Name: live_class_questions live_class_questions_live_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.live_class_questions
    ADD CONSTRAINT live_class_questions_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES public.live_classes(id) ON DELETE CASCADE;


--
-- Name: raised_hands raised_hands_live_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.raised_hands
    ADD CONSTRAINT raised_hands_live_class_id_fkey FOREIGN KEY (live_class_id) REFERENCES public.live_classes(id);


--
-- PostgreSQL database dump complete
--

\unrestrict cqG3uWmxW9fncvofVOYWQMghSlaR8cTVaAQHJts2i0negQSbPZa5gggiZ9UnyEU

--
-- Database "olympiad_content_db" dump
--

--
-- PostgreSQL database dump
--

\restrict mMgNyoZeldXgdDnLlBix8W6LUuKVU3cu49ubHZwtnFPbQ4o7mS7XLZPGFAXV4mW

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: olympiad_content_db; Type: DATABASE; Schema: -; Owner: olympiad_user
--

CREATE DATABASE olympiad_content_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE olympiad_content_db OWNER TO olympiad_user;

\unrestrict mMgNyoZeldXgdDnLlBix8W6LUuKVU3cu49ubHZwtnFPbQ4o7mS7XLZPGFAXV4mW
\connect olympiad_content_db
\restrict mMgNyoZeldXgdDnLlBix8W6LUuKVU3cu49ubHZwtnFPbQ4o7mS7XLZPGFAXV4mW

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: olympiad_user
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO olympiad_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: content_resources; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.content_resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    type character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    url text NOT NULL,
    display_order integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_content_resource_display_order CHECK ((display_order > 0)),
    CONSTRAINT content_resources_type_check CHECK (((type)::text = ANY ((ARRAY['VIDEO'::character varying, 'PDF'::character varying, 'NOTE'::character varying, 'LINK'::character varying])::text[])))
);


ALTER TABLE public.content_resources OWNER TO olympiad_user;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    subject character varying(150) NOT NULL,
    grade character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    chapter_number integer NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_lessons_chapter_number CHECK ((chapter_number > 0)),
    CONSTRAINT lessons_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.lessons OWNER TO olympiad_user;

--
-- Data for Name: content_resources; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.content_resources (id, lesson_id, type, title, url, display_order, created_at, updated_at) FROM stdin;
dc72db6a-8f19-4c8d-91c8-fd60673b684c	1044fdda-e3f6-451a-962f-6badc14228e9	PDF	Fractions Practice Worksheet	https://example.com/fractions-worksheet.pdf	1	2026-10-23 07:43:08.31335+00	2026-10-23 07:43:08.31335+00
5c52e474-8b17-4f07-8662-155ebdf46805	1044fdda-e3f6-451a-962f-6badc14228e9	PDF	Fractions Practice Worksheet	s3://olympiad-content/fractions-worksheet.pdf	1	2026-10-23 08:00:28.900468+00	2026-10-23 08:00:28.900468+00
5442917e-9742-42ee-ad8d-fa0998540946	55a7895e-fa5f-4be4-98ce-512f56a174a5	PDF	Fractions	http://localhost:8888/buckets/olympiad-content/fractions-worksheet.pdf	1	2026-11-08 00:43:04.002183+00	2026-11-08 00:43:04.002183+00
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.lessons (id, course_id, subject, grade, title, description, chapter_number, status, created_by, created_at, updated_at) FROM stdin;
55a7895e-fa5f-4be4-98ce-512f56a174a5	85433441-4310-4b00-b29d-0eda01bc48cb	Mathematics	Grade 6	Introduction to Number Theory	An introductory Olympiad lesson	1	DRAFT	7ee66c9c-df86-45e5-9152-6b6b85ef4170	2026-10-23 07:30:53.232979+00	2026-10-23 07:30:53.232979+00
1044fdda-e3f6-451a-962f-6badc14228e9	c7e8950e-2801-43d5-b4af-38a9f166cc1a	Mathematics	Grade 6	Introduction to Number Theory	An introductory Olympiad lesson	1	DRAFT	7ee66c9c-df86-45e5-9152-6b6b85ef4170	2026-10-23 07:36:09.72701+00	2026-10-23 07:36:09.72701+00
\.


--
-- Name: content_resources content_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_resources
    ADD CONSTRAINT content_resources_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: lessons uq_lesson_course_chapter; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT uq_lesson_course_chapter UNIQUE (course_id, chapter_number);


--
-- Name: idx_content_resources_lesson_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_content_resources_lesson_id ON public.content_resources USING btree (lesson_id);


--
-- Name: idx_content_resources_type; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_content_resources_type ON public.content_resources USING btree (type);


--
-- Name: idx_lessons_course_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_lessons_course_id ON public.lessons USING btree (course_id);


--
-- Name: idx_lessons_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_lessons_status ON public.lessons USING btree (status);


--
-- Name: idx_lessons_subject_grade; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_lessons_subject_grade ON public.lessons USING btree (subject, grade);


--
-- Name: content_resources trg_content_resources_updated_at; Type: TRIGGER; Schema: public; Owner: olympiad_user
--

CREATE TRIGGER trg_content_resources_updated_at BEFORE UPDATE ON public.content_resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: lessons trg_lessons_updated_at; Type: TRIGGER; Schema: public; Owner: olympiad_user
--

CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: content_resources fk_content_resources_lesson; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_resources
    ADD CONSTRAINT fk_content_resources_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict mMgNyoZeldXgdDnLlBix8W6LUuKVU3cu49ubHZwtnFPbQ4o7mS7XLZPGFAXV4mW

--
-- Database "olympiad_course" dump
--

--
-- PostgreSQL database dump
--

\restrict U2hSVFRPLHv2gH5I73V1kFjF0y8XMi9sEsXoMWhYkM0DYsfXlTI6RXzIq7v5N7E

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: olympiad_course; Type: DATABASE; Schema: -; Owner: olympiad_user
--

CREATE DATABASE olympiad_course WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE olympiad_course OWNER TO olympiad_user;

\unrestrict U2hSVFRPLHv2gH5I73V1kFjF0y8XMi9sEsXoMWhYkM0DYsfXlTI6RXzIq7v5N7E
\connect olympiad_course
\restrict U2hSVFRPLHv2gH5I73V1kFjF0y8XMi9sEsXoMWhYkM0DYsfXlTI6RXzIq7v5N7E

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: courses; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.courses (
    id uuid NOT NULL,
    code character varying(30) NOT NULL,
    title character varying(150) NOT NULL,
    description character varying(2000),
    subject character varying(100) NOT NULL,
    grade_level character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT chk_courses_status CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.courses OWNER TO olympiad_user;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO olympiad_user;

--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.courses (id, code, title, description, subject, grade_level, status, created_at, updated_at) FROM stdin;
85433441-4310-4b00-b29d-0eda01bc48cb	MATH-OLY-002	Mathematics Olympiad Foundation	Foundational mathematics concepts and problem-solving practice.	Mathematics	Grade 3	PUBLISHED	2026-10-21 13:26:14.643146+00	2026-10-21 13:26:14.643146+00
1a7f343f-2655-459b-9424-48764ec7cdbf	MATH-OLY-004	Maths Junior	Maths Junior	Mathematics	Grade 3	DRAFT	2026-10-24 11:46:18.609419+00	2026-10-24 11:46:18.609419+00
c7e8950e-2801-43d5-b4af-38a9f166cc1a	MATH-OLY-001	Mathematics Olympiad Foundation	Foundational mathematics concepts and problem-solving practice.	Mathematics	Grade 6	PUBLISHED	2026-10-21 08:51:22.670375+00	2026-11-08 00:39:38.890845+00
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	create courses table	SQL	V1__create_courses_table.sql	556729128	olympiad_user	2026-10-21 12:47:52.786303	32	t
\.


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: courses uk_courses_code; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT uk_courses_code UNIQUE (code);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_courses_grade_level; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_grade_level ON public.courses USING btree (grade_level);


--
-- Name: idx_courses_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_status ON public.courses USING btree (status);


--
-- Name: idx_courses_subject; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_subject ON public.courses USING btree (subject);


--
-- PostgreSQL database dump complete
--

\unrestrict U2hSVFRPLHv2gH5I73V1kFjF0y8XMi9sEsXoMWhYkM0DYsfXlTI6RXzIq7v5N7E

--
-- Database "olympiad_db" dump
--

--
-- PostgreSQL database dump
--

\restrict uSRTXp5WafRfyL2StTcVjFvLISgMgZCbHJN8IyPtQdQjmURURHORc4zYb1fSZc2

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: olympiad_db; Type: DATABASE; Schema: -; Owner: olympiad_user
--

CREATE DATABASE olympiad_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE olympiad_db OWNER TO olympiad_user;

\unrestrict uSRTXp5WafRfyL2StTcVjFvLISgMgZCbHJN8IyPtQdQjmURURHORc4zYb1fSZc2
\connect olympiad_db
\restrict uSRTXp5WafRfyL2StTcVjFvLISgMgZCbHJN8IyPtQdQjmURURHORc4zYb1fSZc2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.attendance_records (
    id bigint NOT NULL,
    session_id bigint NOT NULL,
    student_id bigint NOT NULL,
    joined_at timestamp with time zone,
    left_at timestamp with time zone,
    total_duration_minutes integer DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'PRESENT'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT attendance_records_status_check CHECK (((status)::text = ANY ((ARRAY['PRESENT'::character varying, 'LATE'::character varying, 'ABSENT'::character varying, 'EXCUSED'::character varying])::text[])))
);


ALTER TABLE public.attendance_records OWNER TO olympiad_user;

--
-- Name: attendance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.attendance_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_records_id_seq OWNER TO olympiad_user;

--
-- Name: attendance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.attendance_records_id_seq OWNED BY public.attendance_records.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    actor_email character varying(255),
    action character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100),
    details jsonb,
    ip_address character varying(50),
    user_agent character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO olympiad_user;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO olympiad_user;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: class_sessions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.class_sessions (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    instructor_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    time_zone character varying(50) DEFAULT 'UTC'::character varying NOT NULL,
    status character varying(30) DEFAULT 'UPCOMING'::character varying NOT NULL,
    provider_room_id character varying(150),
    recording_url text,
    recording_status character varying(30) DEFAULT 'NONE'::character varying,
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT class_sessions_recording_status_check CHECK (((recording_status)::text = ANY ((ARRAY['NONE'::character varying, 'PROCESSING'::character varying, 'AVAILABLE'::character varying, 'FAILED'::character varying])::text[]))),
    CONSTRAINT class_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['UPCOMING'::character varying, 'JOIN_AVAILABLE'::character varying, 'LIVE'::character varying, 'ENDED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.class_sessions OWNER TO olympiad_user;

--
-- Name: class_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.class_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_sessions_id_seq OWNER TO olympiad_user;

--
-- Name: class_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.class_sessions_id_seq OWNED BY public.class_sessions.id;


--
-- Name: content_documents; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.content_documents (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    content_type character varying(50) NOT NULL,
    subject_id bigint NOT NULL,
    grade_id bigint NOT NULL,
    olympiad_program_id bigint,
    topic_id bigint,
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    description text,
    author_id bigint NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    published_version_id bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT content_documents_content_type_check CHECK (((content_type)::text = ANY ((ARRAY['LESSON_NOTE'::character varying, 'WORKSHEET'::character varying, 'REVISION_PACK'::character varying, 'STUDY_MATERIAL'::character varying])::text[]))),
    CONSTRAINT content_documents_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PENDING_REVIEW'::character varying, 'CHANGES_REQUESTED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.content_documents OWNER TO olympiad_user;

--
-- Name: content_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.content_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_documents_id_seq OWNER TO olympiad_user;

--
-- Name: content_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.content_documents_id_seq OWNED BY public.content_documents.id;


--
-- Name: content_review_assignments; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.content_review_assignments (
    id bigint NOT NULL,
    document_version_id bigint NOT NULL,
    reviewer_id bigint NOT NULL,
    assigned_by bigint NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT content_review_assignments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_REVIEW'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.content_review_assignments OWNER TO olympiad_user;

--
-- Name: content_review_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.content_review_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_review_assignments_id_seq OWNER TO olympiad_user;

--
-- Name: content_review_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.content_review_assignments_id_seq OWNED BY public.content_review_assignments.id;


--
-- Name: content_review_comments; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.content_review_comments (
    id bigint NOT NULL,
    document_version_id bigint NOT NULL,
    author_id bigint NOT NULL,
    page_number integer,
    is_internal_only boolean DEFAULT false NOT NULL,
    comment_text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.content_review_comments OWNER TO olympiad_user;

--
-- Name: content_review_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.content_review_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_review_comments_id_seq OWNER TO olympiad_user;

--
-- Name: content_review_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.content_review_comments_id_seq OWNED BY public.content_review_comments.id;


--
-- Name: content_review_decisions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.content_review_decisions (
    id bigint NOT NULL,
    document_version_id bigint NOT NULL,
    reviewer_id bigint NOT NULL,
    decision character varying(30) NOT NULL,
    checklist_results jsonb,
    feedback_notes text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT content_review_decisions_decision_check CHECK (((decision)::text = ANY ((ARRAY['APPROVED'::character varying, 'CHANGES_REQUESTED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.content_review_decisions OWNER TO olympiad_user;

--
-- Name: content_review_decisions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.content_review_decisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_review_decisions_id_seq OWNER TO olympiad_user;

--
-- Name: content_review_decisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.content_review_decisions_id_seq OWNED BY public.content_review_decisions.id;


--
-- Name: content_versions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.content_versions (
    id bigint NOT NULL,
    document_id bigint NOT NULL,
    version_number integer NOT NULL,
    file_storage_key character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size_bytes bigint NOT NULL,
    page_count integer,
    sha256_checksum character varying(64) NOT NULL,
    source_attribution character varying(255),
    license character varying(100),
    uploaded_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.content_versions OWNER TO olympiad_user;

--
-- Name: content_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.content_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_versions_id_seq OWNER TO olympiad_user;

--
-- Name: content_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.content_versions_id_seq OWNED BY public.content_versions.id;


--
-- Name: course_instructors; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.course_instructors (
    course_id bigint NOT NULL,
    instructor_id bigint NOT NULL,
    role_in_course character varying(50) DEFAULT 'CO_INSTRUCTOR'::character varying
);


ALTER TABLE public.course_instructors OWNER TO olympiad_user;

--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.course_modules (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    sequence_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.course_modules OWNER TO olympiad_user;

--
-- Name: course_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.course_modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_modules_id_seq OWNER TO olympiad_user;

--
-- Name: course_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.course_modules_id_seq OWNED BY public.course_modules.id;


--
-- Name: course_resources; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.course_resources (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    module_id bigint,
    title character varying(200) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_url text NOT NULL,
    file_size_bytes bigint,
    is_downloadable boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT course_resources_resource_type_check CHECK (((resource_type)::text = ANY ((ARRAY['PDF'::character varying, 'LINK'::character varying, 'VIDEO'::character varying, 'DOCUMENT'::character varying])::text[])))
);


ALTER TABLE public.course_resources OWNER TO olympiad_user;

--
-- Name: course_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.course_resources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_resources_id_seq OWNER TO olympiad_user;

--
-- Name: course_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.course_resources_id_seq OWNED BY public.course_resources.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.courses (
    id bigint NOT NULL,
    slug character varying(150) NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    subject_id bigint NOT NULL,
    grade_id bigint NOT NULL,
    olympiad_program_id bigint,
    primary_instructor_id bigint,
    duration_weeks integer DEFAULT 12 NOT NULL,
    capacity integer DEFAULT 50 NOT NULL,
    price_cents bigint DEFAULT 0 NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    learning_objectives jsonb,
    prerequisites text,
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT courses_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.courses OWNER TO olympiad_user;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.courses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO olympiad_user;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.email_verification_tokens (
    id bigint NOT NULL,
    token_hash character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_verification_tokens OWNER TO olympiad_user;

--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.email_verification_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_verification_tokens_id_seq OWNER TO olympiad_user;

--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.email_verification_tokens_id_seq OWNED BY public.email_verification_tokens.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.enrollments (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    course_id bigint NOT NULL,
    status character varying(30) DEFAULT 'ENROLLED'::character varying NOT NULL,
    enrolled_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['ENROLLED'::character varying, 'COMPLETED'::character varying, 'DROPPED'::character varying, 'SUSPENDED'::character varying])::text[])))
);


ALTER TABLE public.enrollments OWNER TO olympiad_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO olympiad_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO olympiad_user;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.grades (
    id bigint NOT NULL,
    code character varying(20) NOT NULL,
    display_name character varying(50) NOT NULL,
    level_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.grades OWNER TO olympiad_user;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_id_seq OWNER TO olympiad_user;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(150) NOT NULL,
    content text NOT NULL,
    type character varying(50) NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    link_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO olympiad_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO olympiad_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: olympiad_programs; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.olympiad_programs (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(150) NOT NULL,
    organizer character varying(150),
    country_scope character varying(50) DEFAULT 'INTERNATIONAL'::character varying,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.olympiad_programs OWNER TO olympiad_user;

--
-- Name: olympiad_programs_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.olympiad_programs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.olympiad_programs_id_seq OWNER TO olympiad_user;

--
-- Name: olympiad_programs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.olympiad_programs_id_seq OWNED BY public.olympiad_programs.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.password_reset_tokens (
    id bigint NOT NULL,
    token_hash character varying(255) NOT NULL,
    user_id bigint NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO olympiad_user;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO olympiad_user;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: payment_webhook_events; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.payment_webhook_events (
    id bigint NOT NULL,
    provider character varying(50) NOT NULL,
    provider_event_id character varying(150) NOT NULL,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    processed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payment_webhook_events OWNER TO olympiad_user;

--
-- Name: payment_webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.payment_webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_webhook_events_id_seq OWNER TO olympiad_user;

--
-- Name: payment_webhook_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.payment_webhook_events_id_seq OWNED BY public.payment_webhook_events.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    transaction_reference character varying(100) NOT NULL,
    user_id bigint NOT NULL,
    course_id bigint,
    subscription_id bigint,
    amount_cents bigint NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    provider character varying(50) DEFAULT 'MOCK'::character varying NOT NULL,
    provider_payment_id character varying(150),
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    idempotency_key character varying(100),
    failure_reason text,
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SUCCESS'::character varying, 'FAILED'::character varying, 'CANCELLED'::character varying, 'REFUNDED'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO olympiad_user;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO olympiad_user;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    description character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO olympiad_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO olympiad_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: question_import_jobs; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.question_import_jobs (
    id bigint NOT NULL,
    file_name character varying(255) NOT NULL,
    file_format character varying(10) NOT NULL,
    uploaded_by bigint NOT NULL,
    is_dry_run boolean DEFAULT false NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    total_rows integer DEFAULT 0 NOT NULL,
    created_count integer DEFAULT 0 NOT NULL,
    updated_count integer DEFAULT 0 NOT NULL,
    skipped_count integer DEFAULT 0 NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    finished_at timestamp with time zone,
    CONSTRAINT question_import_jobs_file_format_check CHECK (((file_format)::text = ANY ((ARRAY['CSV'::character varying, 'XLSX'::character varying])::text[]))),
    CONSTRAINT question_import_jobs_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying])::text[])))
);


ALTER TABLE public.question_import_jobs OWNER TO olympiad_user;

--
-- Name: question_import_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.question_import_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_import_jobs_id_seq OWNER TO olympiad_user;

--
-- Name: question_import_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.question_import_jobs_id_seq OWNED BY public.question_import_jobs.id;


--
-- Name: question_import_rows; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.question_import_rows (
    id bigint NOT NULL,
    job_id bigint NOT NULL,
    row_number integer NOT NULL,
    external_id character varying(100),
    status character varying(30) NOT NULL,
    raw_data jsonb NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT question_import_rows_status_check CHECK (((status)::text = ANY ((ARRAY['SUCCESS'::character varying, 'SKIPPED'::character varying, 'ERROR'::character varying])::text[])))
);


ALTER TABLE public.question_import_rows OWNER TO olympiad_user;

--
-- Name: question_import_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.question_import_rows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_import_rows_id_seq OWNER TO olympiad_user;

--
-- Name: question_import_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.question_import_rows_id_seq OWNED BY public.question_import_rows.id;


--
-- Name: question_options; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.question_options (
    id bigint NOT NULL,
    question_version_id bigint NOT NULL,
    option_order integer NOT NULL,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    explanation text
);


ALTER TABLE public.question_options OWNER TO olympiad_user;

--
-- Name: question_options_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.question_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_options_id_seq OWNER TO olympiad_user;

--
-- Name: question_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.question_options_id_seq OWNED BY public.question_options.id;


--
-- Name: question_review_decisions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.question_review_decisions (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    question_version_id bigint NOT NULL,
    reviewer_id bigint NOT NULL,
    decision character varying(30) NOT NULL,
    comments text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT question_review_decisions_decision_check CHECK (((decision)::text = ANY ((ARRAY['APPROVED'::character varying, 'CHANGES_REQUESTED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.question_review_decisions OWNER TO olympiad_user;

--
-- Name: question_review_decisions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.question_review_decisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_review_decisions_id_seq OWNER TO olympiad_user;

--
-- Name: question_review_decisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.question_review_decisions_id_seq OWNED BY public.question_review_decisions.id;


--
-- Name: question_versions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.question_versions (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    version_number integer NOT NULL,
    prompt text NOT NULL,
    explanation text,
    points integer DEFAULT 1 NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    image_url text,
    source_attribution character varying(255),
    license character varying(100),
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.question_versions OWNER TO olympiad_user;

--
-- Name: question_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.question_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_versions_id_seq OWNER TO olympiad_user;

--
-- Name: question_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.question_versions_id_seq OWNED BY public.question_versions.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.questions (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    subject_id bigint NOT NULL,
    grade_id bigint NOT NULL,
    olympiad_program_id bigint,
    topic_id bigint,
    question_type character varying(30) NOT NULL,
    difficulty character varying(30) NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    active_version_id bigint,
    author_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT questions_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['EASY'::character varying, 'MEDIUM'::character varying, 'HARD'::character varying, 'OLYMPIAD'::character varying])::text[]))),
    CONSTRAINT questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['MCQ'::character varying, 'TRUE_FALSE'::character varying])::text[]))),
    CONSTRAINT questions_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PENDING_REVIEW'::character varying, 'CHANGES_REQUESTED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.questions OWNER TO olympiad_user;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO olympiad_user;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: quiz_answers; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.quiz_answers (
    id bigint NOT NULL,
    submission_id bigint NOT NULL,
    question_id bigint NOT NULL,
    selected_option_id bigint,
    is_correct boolean NOT NULL,
    awarded_points integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quiz_answers OWNER TO olympiad_user;

--
-- Name: quiz_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.quiz_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_answers_id_seq OWNER TO olympiad_user;

--
-- Name: quiz_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.quiz_answers_id_seq OWNED BY public.quiz_answers.id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.quiz_questions (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    question_id bigint NOT NULL,
    sequence_order integer NOT NULL,
    custom_points integer
);


ALTER TABLE public.quiz_questions OWNER TO olympiad_user;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.quiz_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_id_seq OWNER TO olympiad_user;

--
-- Name: quiz_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.quiz_questions_id_seq OWNED BY public.quiz_questions.id;


--
-- Name: quiz_runs; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.quiz_runs (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    session_id bigint,
    pushed_by bigint NOT NULL,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp with time zone,
    CONSTRAINT quiz_runs_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'CLOSED'::character varying])::text[])))
);


ALTER TABLE public.quiz_runs OWNER TO olympiad_user;

--
-- Name: quiz_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.quiz_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_runs_id_seq OWNER TO olympiad_user;

--
-- Name: quiz_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.quiz_runs_id_seq OWNED BY public.quiz_runs.id;


--
-- Name: quiz_submissions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.quiz_submissions (
    id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    quiz_run_id bigint,
    student_id bigint NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    total_possible_score integer NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone NOT NULL,
    submitted_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.quiz_submissions OWNER TO olympiad_user;

--
-- Name: quiz_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.quiz_submissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_submissions_id_seq OWNER TO olympiad_user;

--
-- Name: quiz_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.quiz_submissions_id_seq OWNED BY public.quiz_submissions.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.quizzes (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    created_by bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    duration_minutes integer DEFAULT 30 NOT NULL,
    max_attempts integer DEFAULT 1 NOT NULL,
    shuffle_questions boolean DEFAULT true NOT NULL,
    shuffle_options boolean DEFAULT true NOT NULL,
    reveal_answers_immediately boolean DEFAULT false NOT NULL,
    points_to_pass integer DEFAULT 60 NOT NULL,
    status character varying(30) DEFAULT 'DRAFT'::character varying NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT quizzes_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'PUBLISHED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.quizzes OWNER TO olympiad_user;

--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.quizzes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_id_seq OWNER TO olympiad_user;

--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.role_permissions (
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO olympiad_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    description character varying(255),
    is_system_role boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO olympiad_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO olympiad_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.subjects (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subjects OWNER TO olympiad_user;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subjects_id_seq OWNER TO olympiad_user;

--
-- Name: subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.subjects_id_seq OWNED BY public.subjects.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.subscription_plans (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    billing_period_days integer DEFAULT 30 NOT NULL,
    price_cents bigint NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    features jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO olympiad_user;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.subscription_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO olympiad_user;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.subscriptions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    auto_renew boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'EXPIRED'::character varying, 'CANCELLED'::character varying, 'PAST_DUE'::character varying])::text[])))
);


ALTER TABLE public.subscriptions OWNER TO olympiad_user;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO olympiad_user;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.topics (
    id bigint NOT NULL,
    subject_id bigint NOT NULL,
    parent_topic_id bigint,
    name character varying(150) NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.topics OWNER TO olympiad_user;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.topics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO olympiad_user;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.user_roles OWNER TO olympiad_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone_number character varying(30),
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    time_zone character varying(50) DEFAULT 'UTC'::character varying NOT NULL,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    version bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['INVITED'::character varying, 'ACTIVE'::character varying, 'SUSPENDED'::character varying, 'DEACTIVATED'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO olympiad_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO olympiad_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: olympiad_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: attendance_records id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.attendance_records ALTER COLUMN id SET DEFAULT nextval('public.attendance_records_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: class_sessions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.class_sessions ALTER COLUMN id SET DEFAULT nextval('public.class_sessions_id_seq'::regclass);


--
-- Name: content_documents id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents ALTER COLUMN id SET DEFAULT nextval('public.content_documents_id_seq'::regclass);


--
-- Name: content_review_assignments id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_assignments ALTER COLUMN id SET DEFAULT nextval('public.content_review_assignments_id_seq'::regclass);


--
-- Name: content_review_comments id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_comments ALTER COLUMN id SET DEFAULT nextval('public.content_review_comments_id_seq'::regclass);


--
-- Name: content_review_decisions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_decisions ALTER COLUMN id SET DEFAULT nextval('public.content_review_decisions_id_seq'::regclass);


--
-- Name: content_versions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_versions ALTER COLUMN id SET DEFAULT nextval('public.content_versions_id_seq'::regclass);


--
-- Name: course_modules id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_modules ALTER COLUMN id SET DEFAULT nextval('public.course_modules_id_seq'::regclass);


--
-- Name: course_resources id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_resources ALTER COLUMN id SET DEFAULT nextval('public.course_resources_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: email_verification_tokens id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.email_verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.email_verification_tokens_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: olympiad_programs id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.olympiad_programs ALTER COLUMN id SET DEFAULT nextval('public.olympiad_programs_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: payment_webhook_events id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payment_webhook_events ALTER COLUMN id SET DEFAULT nextval('public.payment_webhook_events_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: question_import_jobs id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_import_jobs ALTER COLUMN id SET DEFAULT nextval('public.question_import_jobs_id_seq'::regclass);


--
-- Name: question_import_rows id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_import_rows ALTER COLUMN id SET DEFAULT nextval('public.question_import_rows_id_seq'::regclass);


--
-- Name: question_options id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_options ALTER COLUMN id SET DEFAULT nextval('public.question_options_id_seq'::regclass);


--
-- Name: question_review_decisions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_review_decisions ALTER COLUMN id SET DEFAULT nextval('public.question_review_decisions_id_seq'::regclass);


--
-- Name: question_versions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_versions ALTER COLUMN id SET DEFAULT nextval('public.question_versions_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: quiz_answers id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_answers ALTER COLUMN id SET DEFAULT nextval('public.quiz_answers_id_seq'::regclass);


--
-- Name: quiz_questions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN id SET DEFAULT nextval('public.quiz_questions_id_seq'::regclass);


--
-- Name: quiz_runs id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_runs ALTER COLUMN id SET DEFAULT nextval('public.quiz_runs_id_seq'::regclass);


--
-- Name: quiz_submissions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_submissions ALTER COLUMN id SET DEFAULT nextval('public.quiz_submissions_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: subjects id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subjects ALTER COLUMN id SET DEFAULT nextval('public.subjects_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.attendance_records (id, session_id, student_id, joined_at, left_at, total_duration_minutes, status, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.audit_logs (id, user_id, actor_email, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: class_sessions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.class_sessions (id, course_id, instructor_id, title, description, start_time, end_time, time_zone, status, provider_room_id, recording_url, recording_status, version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: content_documents; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.content_documents (id, title, content_type, subject_id, grade_id, olympiad_program_id, topic_id, language, description, author_id, status, published_version_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: content_review_assignments; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.content_review_assignments (id, document_version_id, reviewer_id, assigned_by, status, created_at) FROM stdin;
\.


--
-- Data for Name: content_review_comments; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.content_review_comments (id, document_version_id, author_id, page_number, is_internal_only, comment_text, created_at) FROM stdin;
\.


--
-- Data for Name: content_review_decisions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.content_review_decisions (id, document_version_id, reviewer_id, decision, checklist_results, feedback_notes, created_at) FROM stdin;
\.


--
-- Data for Name: content_versions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.content_versions (id, document_id, version_number, file_storage_key, file_name, file_size_bytes, page_count, sha256_checksum, source_attribution, license, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: course_instructors; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.course_instructors (course_id, instructor_id, role_in_course) FROM stdin;
\.


--
-- Data for Name: course_modules; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.course_modules (id, course_id, title, description, sequence_order, created_at) FROM stdin;
\.


--
-- Data for Name: course_resources; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.course_resources (id, course_id, module_id, title, resource_type, resource_url, file_size_bytes, is_downloadable, created_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.courses (id, slug, title, description, subject_id, grade_id, olympiad_program_id, primary_instructor_id, duration_weeks, capacity, price_cents, currency, status, learning_objectives, prerequisites, version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.email_verification_tokens (id, token_hash, user_id, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.enrollments (id, user_id, course_id, status, enrolled_at, expires_at) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init schema	SQL	V1__init_schema.sql	1516673762	olympiad_user	2026-10-18 16:16:06.379485	411	t
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.grades (id, code, display_name, level_order, created_at) FROM stdin;
1	GRADE_5_6	Primary / Middle (Grades 5-6)	1	2026-10-18 16:16:06.507729+00
2	GRADE_7_8	Junior (Grades 7-8)	2	2026-10-18 16:16:06.507729+00
3	GRADE_9_10	Intermediate (Grades 9-10)	3	2026-10-18 16:16:06.507729+00
4	GRADE_11_12	Senior (Grades 11-12)	4	2026-10-18 16:16:06.507729+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.notifications (id, user_id, title, content, type, is_read, link_url, created_at) FROM stdin;
\.


--
-- Data for Name: olympiad_programs; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.olympiad_programs (id, code, name, organizer, country_scope, description, created_at) FROM stdin;
1	IOQM_INMO	IOQM & INMO	MTA / HBCSE (India)	NATIONAL	Indian Olympiad Qualifier in Mathematics leading to INMO and IMO training camp	2026-10-18 16:16:06.507729+00
2	SOF_IMO	SOF International Mathematics Olympiad	Science Olympiad Foundation	INTERNATIONAL	School level competitive math olympiad with Level 1 and Level 2 stages	2026-10-18 16:16:06.507729+00
3	KANGAROO	Mathematical Kangaroo	Association Kangourou sans Fronti├¿res	INTERNATIONAL	Largest international mathematical competition across 70+ countries	2026-10-18 16:16:06.507729+00
4	NMTC	National Mathematics Talent Contest	AMTI	NATIONAL	Premier Indian talent search across Primary, Sub-Junior, Junior and Inter levels	2026-10-18 16:16:06.507729+00
5	SASMO	Singapore and Asian Schools Math Olympiad	SIMCC	INTERNATIONAL	One of the largest math competitions in Asia targeting deep problem-solving skills	2026-10-18 16:16:06.507729+00
6	CBSE_MATH	CBSE Advanced Mathematics	CBSE	NATIONAL	Rigorous foundation aligned to CBSE board advanced curriculum	2026-10-18 16:16:06.507729+00
7	SCIENCE_OLYMPIAD	National & International Science Olympiad	Various / HBCSE	INTERNATIONAL	NSEJS, IJSO and National Science Olympiad training	2026-10-18 16:16:06.507729+00
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.password_reset_tokens (id, token_hash, user_id, expires_at, used_at, created_at) FROM stdin;
\.


--
-- Data for Name: payment_webhook_events; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.payment_webhook_events (id, provider, provider_event_id, event_type, payload, processed, processed_at, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.payments (id, transaction_reference, user_id, course_id, subscription_id, amount_cents, currency, provider, provider_payment_id, status, idempotency_key, failure_reason, version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.permissions (id, name, category, description, created_at) FROM stdin;
1	USER_READ	USER	View user profiles	2026-10-18 16:16:06.507729+00
2	USER_WRITE	USER	Create and modify users	2026-10-18 16:16:06.507729+00
3	ROLE_MANAGE	ADMIN	Manage roles and assign permissions	2026-10-18 16:16:06.507729+00
4	COURSE_READ	COURSE	Browse and view courses	2026-10-18 16:16:06.507729+00
5	COURSE_WRITE	COURSE	Create and modify courses	2026-10-18 16:16:06.507729+00
6	COURSE_PUBLISH	COURSE	Publish or archive courses	2026-10-18 16:16:06.507729+00
7	SESSION_SCHEDULE	SCHEDULING	Schedule and manage class sessions	2026-10-18 16:16:06.507729+00
8	SESSION_JOIN_HOST	CLASSROOM	Join session as host/instructor	2026-10-18 16:16:06.507729+00
9	SESSION_JOIN_STUDENT	CLASSROOM	Join session as student	2026-10-18 16:16:06.507729+00
10	QUIZ_CREATE	QUIZ	Create and edit quizzes	2026-10-18 16:16:06.507729+00
11	QUIZ_PUSH	QUIZ	Launch a live quiz for students	2026-10-18 16:16:06.507729+00
12	QUIZ_SUBMIT	QUIZ	Submit quiz answers	2026-10-18 16:16:06.507729+00
13	QUESTION_READ	QUESTION_BANK	View questions in the bank	2026-10-18 16:16:06.507729+00
14	QUESTION_WRITE	QUESTION_BANK	Create and edit questions	2026-10-18 16:16:06.507729+00
15	QUESTION_IMPORT	QUESTION_BANK	Import questions via CSV/XLSX	2026-10-18 16:16:06.507729+00
16	QUESTION_REVIEW	QUESTION_BANK	Approve or reject questions	2026-10-18 16:16:06.507729+00
17	CONTENT_UPLOAD	CONTENT	Upload PDF and study materials	2026-10-18 16:16:06.507729+00
18	CONTENT_REVIEW	CONTENT	Review and approve educational content	2026-10-18 16:16:06.507729+00
19	CONTENT_PUBLISH	CONTENT	Publish approved educational content	2026-10-18 16:16:06.507729+00
20	PAYMENT_VIEW	PAYMENT	View payment records and reports	2026-10-18 16:16:06.507729+00
21	AUDIT_VIEW	ADMIN	View security audit logs	2026-10-18 16:16:06.507729+00
\.


--
-- Data for Name: question_import_jobs; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.question_import_jobs (id, file_name, file_format, uploaded_by, is_dry_run, status, total_rows, created_count, updated_count, skipped_count, error_count, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: question_import_rows; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.question_import_rows (id, job_id, row_number, external_id, status, raw_data, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: question_options; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.question_options (id, question_version_id, option_order, option_text, is_correct, explanation) FROM stdin;
\.


--
-- Data for Name: question_review_decisions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.question_review_decisions (id, question_id, question_version_id, reviewer_id, decision, comments, created_at) FROM stdin;
\.


--
-- Data for Name: question_versions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.question_versions (id, question_id, version_number, prompt, explanation, points, language, image_url, source_attribution, license, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.questions (id, uuid, subject_id, grade_id, olympiad_program_id, topic_id, question_type, difficulty, status, active_version_id, author_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_answers; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.quiz_answers (id, submission_id, question_id, selected_option_id, is_correct, awarded_points, created_at) FROM stdin;
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.quiz_questions (id, quiz_id, question_id, sequence_order, custom_points) FROM stdin;
\.


--
-- Data for Name: quiz_runs; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.quiz_runs (id, quiz_id, session_id, pushed_by, status, started_at, closed_at) FROM stdin;
\.


--
-- Data for Name: quiz_submissions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.quiz_submissions (id, quiz_id, quiz_run_id, student_id, attempt_number, score, total_possible_score, passed, started_at, submitted_at, created_at) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.quizzes (id, course_id, created_by, title, description, duration_minutes, max_attempts, shuffle_questions, shuffle_options, reveal_answers_immediately, points_to_pass, status, version, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
3	1
3	2
3	3
3	4
3	5
3	6
3	7
3	8
3	9
3	10
3	11
3	12
3	13
3	14
3	15
3	16
3	17
3	18
3	19
3	20
3	21
1	4
1	9
1	12
2	4
2	7
2	8
2	10
2	11
2	17
4	13
4	14
4	15
5	13
5	16
6	18
6	19
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.roles (id, name, display_name, description, is_system_role, created_at, updated_at) FROM stdin;
1	ROLE_STUDENT	Student	Learner enrolled in Olympiad courses	t	2026-10-18 16:16:06.507729+00	2026-10-18 16:16:06.507729+00
2	ROLE_TEACHER	Teacher	Instructor conducting classes and quizzes	t	2026-10-18 16:16:06.507729+00	2026-10-18 16:16:06.507729+00
3	ROLE_ADMINISTRATOR	Administrator	Full system management access	t	2026-10-18 16:16:06.507729+00	2026-10-18 16:16:06.507729+00
4	ROLE_QUESTION_BANK_MANAGER	Question Bank Manager	Manages and imports competition question bank	t	2026-10-18 16:16:06.507729+00	2026-10-18 16:16:06.507729+00
5	ROLE_QUESTION_REVIEWER	Question Reviewer	Academically reviews and approves questions	t	2026-10-18 16:16:06.507729+00	2026-10-18 16:16:06.507729+00
6	ROLE_CONTENT_REVIEWER	Content Reviewer	Reviews and approves PDF documents and notes	t	2026-10-18 16:16:06.507729+00	2026-10-18 16:16:06.507729+00
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.subjects (id, code, name, description, created_at) FROM stdin;
1	MATH	Mathematics	Pure and Olympiad Mathematics	2026-10-18 16:16:06.507729+00
2	PHYSICS	Physics	Theoretical and Experimental Physics Olympiad	2026-10-18 16:16:06.507729+00
3	CHEMISTRY	Chemistry	Junior and Senior Science/Chemistry Olympiads	2026-10-18 16:16:06.507729+00
4	ASTRONOMY	Astronomy & Astrophysics	IOAA and National Astronomy Olympiads	2026-10-18 16:16:06.507729+00
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.subscription_plans (id, code, name, description, billing_period_days, price_cents, currency, is_active, features, created_at) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.subscriptions (id, user_id, plan_id, status, starts_at, expires_at, auto_renew, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.topics (id, subject_id, parent_topic_id, name, code, description, created_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.user_roles (user_id, role_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.users (id, email, password_hash, first_name, last_name, phone_number, status, email_verified, time_zone, failed_login_attempts, locked_until, version, created_at, updated_at) FROM stdin;
\.


--
-- Name: attendance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.attendance_records_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: class_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.class_sessions_id_seq', 1, false);


--
-- Name: content_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.content_documents_id_seq', 1, false);


--
-- Name: content_review_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.content_review_assignments_id_seq', 1, false);


--
-- Name: content_review_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.content_review_comments_id_seq', 1, false);


--
-- Name: content_review_decisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.content_review_decisions_id_seq', 1, false);


--
-- Name: content_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.content_versions_id_seq', 1, false);


--
-- Name: course_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.course_modules_id_seq', 1, false);


--
-- Name: course_resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.course_resources_id_seq', 1, false);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.courses_id_seq', 1, false);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 1, false);


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 1, false);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.grades_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: olympiad_programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.olympiad_programs_id_seq', 7, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: payment_webhook_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.payment_webhook_events_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.permissions_id_seq', 21, true);


--
-- Name: question_import_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.question_import_jobs_id_seq', 1, false);


--
-- Name: question_import_rows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.question_import_rows_id_seq', 1, false);


--
-- Name: question_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.question_options_id_seq', 1, false);


--
-- Name: question_review_decisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.question_review_decisions_id_seq', 1, false);


--
-- Name: question_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.question_versions_id_seq', 1, false);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.questions_id_seq', 1, false);


--
-- Name: quiz_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.quiz_answers_id_seq', 1, false);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 1, false);


--
-- Name: quiz_runs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.quiz_runs_id_seq', 1, false);


--
-- Name: quiz_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.quiz_submissions_id_seq', 1, false);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.subjects_id_seq', 4, true);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 1, false);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.topics_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: class_sessions class_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_pkey PRIMARY KEY (id);


--
-- Name: content_documents content_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents
    ADD CONSTRAINT content_documents_pkey PRIMARY KEY (id);


--
-- Name: content_review_assignments content_review_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_assignments
    ADD CONSTRAINT content_review_assignments_pkey PRIMARY KEY (id);


--
-- Name: content_review_comments content_review_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_comments
    ADD CONSTRAINT content_review_comments_pkey PRIMARY KEY (id);


--
-- Name: content_review_decisions content_review_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_decisions
    ADD CONSTRAINT content_review_decisions_pkey PRIMARY KEY (id);


--
-- Name: content_versions content_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_pkey PRIMARY KEY (id);


--
-- Name: course_instructors course_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_pkey PRIMARY KEY (course_id, instructor_id);


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: course_resources course_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: courses courses_slug_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_key UNIQUE (slug);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: grades grades_code_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_code_key UNIQUE (code);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: olympiad_programs olympiad_programs_code_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.olympiad_programs
    ADD CONSTRAINT olympiad_programs_code_key UNIQUE (code);


--
-- Name: olympiad_programs olympiad_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.olympiad_programs
    ADD CONSTRAINT olympiad_programs_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: payment_webhook_events payment_webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payment_webhook_events
    ADD CONSTRAINT payment_webhook_events_pkey PRIMARY KEY (id);


--
-- Name: payment_webhook_events payment_webhook_events_provider_event_id_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payment_webhook_events
    ADD CONSTRAINT payment_webhook_events_provider_event_id_key UNIQUE (provider_event_id);


--
-- Name: payments payments_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_reference_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_reference_key UNIQUE (transaction_reference);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: question_import_jobs question_import_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_import_jobs
    ADD CONSTRAINT question_import_jobs_pkey PRIMARY KEY (id);


--
-- Name: question_import_rows question_import_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_import_rows
    ADD CONSTRAINT question_import_rows_pkey PRIMARY KEY (id);


--
-- Name: question_options question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (id);


--
-- Name: question_review_decisions question_review_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_review_decisions
    ADD CONSTRAINT question_review_decisions_pkey PRIMARY KEY (id);


--
-- Name: question_versions question_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_versions
    ADD CONSTRAINT question_versions_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: questions questions_uuid_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_uuid_key UNIQUE (uuid);


--
-- Name: quiz_answers quiz_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_pkey PRIMARY KEY (id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_runs quiz_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_runs
    ADD CONSTRAINT quiz_runs_pkey PRIMARY KEY (id);


--
-- Name: quiz_submissions quiz_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_submissions
    ADD CONSTRAINT quiz_submissions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_code_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_code_key UNIQUE (code);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: topics topics_code_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_code_key UNIQUE (code);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: content_versions uk_content_document_version; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT uk_content_document_version UNIQUE (document_id, version_number);


--
-- Name: question_options uk_question_option_order; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT uk_question_option_order UNIQUE (question_version_id, option_order);


--
-- Name: question_versions uk_question_version; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_versions
    ADD CONSTRAINT uk_question_version UNIQUE (question_id, version_number);


--
-- Name: quiz_questions uk_quiz_question; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT uk_quiz_question UNIQUE (quiz_id, question_id);


--
-- Name: attendance_records uk_session_student_attendance; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT uk_session_student_attendance UNIQUE (session_id, student_id);


--
-- Name: quiz_submissions uk_student_quiz_attempt; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_submissions
    ADD CONSTRAINT uk_student_quiz_attempt UNIQUE (quiz_id, student_id, attempt_number);


--
-- Name: quiz_answers uk_submission_question_answer; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT uk_submission_question_answer UNIQUE (submission_id, question_id);


--
-- Name: enrollments uk_user_course_enrollment; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT uk_user_course_enrollment UNIQUE (user_id, course_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_class_sessions_course; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_class_sessions_course ON public.class_sessions USING btree (course_id);


--
-- Name: idx_class_sessions_instructor; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_class_sessions_instructor ON public.class_sessions USING btree (instructor_id);


--
-- Name: idx_class_sessions_start_time; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_class_sessions_start_time ON public.class_sessions USING btree (start_time);


--
-- Name: idx_class_sessions_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_class_sessions_status ON public.class_sessions USING btree (status);


--
-- Name: idx_content_docs_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_content_docs_status ON public.content_documents USING btree (status);


--
-- Name: idx_content_docs_subject; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_content_docs_subject ON public.content_documents USING btree (subject_id);


--
-- Name: idx_course_modules_course; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_course_modules_course ON public.course_modules USING btree (course_id);


--
-- Name: idx_courses_grade; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_grade ON public.courses USING btree (grade_id);


--
-- Name: idx_courses_olympiad; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_olympiad ON public.courses USING btree (olympiad_program_id);


--
-- Name: idx_courses_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_status ON public.courses USING btree (status);


--
-- Name: idx_courses_subject; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_courses_subject ON public.courses USING btree (subject_id);


--
-- Name: idx_email_verification_token_hash; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_email_verification_token_hash ON public.email_verification_tokens USING btree (token_hash);


--
-- Name: idx_enrollments_course; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_enrollments_course ON public.enrollments USING btree (course_id);


--
-- Name: idx_enrollments_user; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_enrollments_user ON public.enrollments USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_password_reset_token_hash; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_password_reset_token_hash ON public.password_reset_tokens USING btree (token_hash);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_user; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_payments_user ON public.payments USING btree (user_id);


--
-- Name: idx_question_import_rows_job; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_question_import_rows_job ON public.question_import_rows USING btree (job_id);


--
-- Name: idx_question_review_decisions_question; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_question_review_decisions_question ON public.question_review_decisions USING btree (question_id);


--
-- Name: idx_questions_difficulty; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_questions_difficulty ON public.questions USING btree (difficulty);


--
-- Name: idx_questions_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_questions_status ON public.questions USING btree (status);


--
-- Name: idx_questions_subject; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_questions_subject ON public.questions USING btree (subject_id);


--
-- Name: idx_questions_topic; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_questions_topic ON public.questions USING btree (topic_id);


--
-- Name: idx_quiz_submissions_student; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_quiz_submissions_student ON public.quiz_submissions USING btree (student_id);


--
-- Name: idx_subscriptions_user_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);


--
-- Name: idx_topics_subject; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_topics_subject ON public.topics USING btree (subject_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: attendance_records attendance_records_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions(id) ON DELETE CASCADE;


--
-- Name: attendance_records attendance_records_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: class_sessions class_sessions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: class_sessions class_sessions_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.class_sessions
    ADD CONSTRAINT class_sessions_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: content_documents content_documents_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents
    ADD CONSTRAINT content_documents_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: content_documents content_documents_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents
    ADD CONSTRAINT content_documents_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(id) ON DELETE RESTRICT;


--
-- Name: content_documents content_documents_olympiad_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents
    ADD CONSTRAINT content_documents_olympiad_program_id_fkey FOREIGN KEY (olympiad_program_id) REFERENCES public.olympiad_programs(id) ON DELETE SET NULL;


--
-- Name: content_documents content_documents_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents
    ADD CONSTRAINT content_documents_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: content_documents content_documents_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_documents
    ADD CONSTRAINT content_documents_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: content_review_assignments content_review_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_assignments
    ADD CONSTRAINT content_review_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: content_review_assignments content_review_assignments_document_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_assignments
    ADD CONSTRAINT content_review_assignments_document_version_id_fkey FOREIGN KEY (document_version_id) REFERENCES public.content_versions(id) ON DELETE CASCADE;


--
-- Name: content_review_assignments content_review_assignments_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_assignments
    ADD CONSTRAINT content_review_assignments_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: content_review_comments content_review_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_comments
    ADD CONSTRAINT content_review_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: content_review_comments content_review_comments_document_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_comments
    ADD CONSTRAINT content_review_comments_document_version_id_fkey FOREIGN KEY (document_version_id) REFERENCES public.content_versions(id) ON DELETE CASCADE;


--
-- Name: content_review_decisions content_review_decisions_document_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_decisions
    ADD CONSTRAINT content_review_decisions_document_version_id_fkey FOREIGN KEY (document_version_id) REFERENCES public.content_versions(id) ON DELETE CASCADE;


--
-- Name: content_review_decisions content_review_decisions_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_review_decisions
    ADD CONSTRAINT content_review_decisions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: content_versions content_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.content_documents(id) ON DELETE CASCADE;


--
-- Name: content_versions content_versions_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: course_instructors course_instructors_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_instructors course_instructors_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: course_modules course_modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_resources course_resources_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: course_resources course_resources_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.course_resources
    ADD CONSTRAINT course_resources_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE SET NULL;


--
-- Name: courses courses_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(id) ON DELETE RESTRICT;


--
-- Name: courses courses_olympiad_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_olympiad_program_id_fkey FOREIGN KEY (olympiad_program_id) REFERENCES public.olympiad_programs(id) ON DELETE SET NULL;


--
-- Name: courses courses_primary_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_primary_instructor_id_fkey FOREIGN KEY (primary_instructor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: courses courses_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: email_verification_tokens email_verification_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;


--
-- Name: payments payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: question_import_jobs question_import_jobs_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_import_jobs
    ADD CONSTRAINT question_import_jobs_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: question_import_rows question_import_rows_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_import_rows
    ADD CONSTRAINT question_import_rows_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.question_import_jobs(id) ON DELETE CASCADE;


--
-- Name: question_options question_options_question_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_version_id_fkey FOREIGN KEY (question_version_id) REFERENCES public.question_versions(id) ON DELETE CASCADE;


--
-- Name: question_review_decisions question_review_decisions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_review_decisions
    ADD CONSTRAINT question_review_decisions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: question_review_decisions question_review_decisions_question_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_review_decisions
    ADD CONSTRAINT question_review_decisions_question_version_id_fkey FOREIGN KEY (question_version_id) REFERENCES public.question_versions(id) ON DELETE CASCADE;


--
-- Name: question_review_decisions question_review_decisions_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_review_decisions
    ADD CONSTRAINT question_review_decisions_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: question_versions question_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_versions
    ADD CONSTRAINT question_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: question_versions question_versions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.question_versions
    ADD CONSTRAINT question_versions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: questions questions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: questions questions_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES public.grades(id) ON DELETE RESTRICT;


--
-- Name: questions questions_olympiad_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_olympiad_program_id_fkey FOREIGN KEY (olympiad_program_id) REFERENCES public.olympiad_programs(id) ON DELETE SET NULL;


--
-- Name: questions questions_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: questions questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: quiz_answers quiz_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE RESTRICT;


--
-- Name: quiz_answers quiz_answers_selected_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_selected_option_id_fkey FOREIGN KEY (selected_option_id) REFERENCES public.question_options(id) ON DELETE SET NULL;


--
-- Name: quiz_answers quiz_answers_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_answers
    ADD CONSTRAINT quiz_answers_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.quiz_submissions(id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE RESTRICT;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_runs quiz_runs_pushed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_runs
    ADD CONSTRAINT quiz_runs_pushed_by_fkey FOREIGN KEY (pushed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: quiz_runs quiz_runs_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_runs
    ADD CONSTRAINT quiz_runs_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_runs quiz_runs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_runs
    ADD CONSTRAINT quiz_runs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.class_sessions(id) ON DELETE SET NULL;


--
-- Name: quiz_submissions quiz_submissions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_submissions
    ADD CONSTRAINT quiz_submissions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quiz_submissions quiz_submissions_quiz_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_submissions
    ADD CONSTRAINT quiz_submissions_quiz_run_id_fkey FOREIGN KEY (quiz_run_id) REFERENCES public.quiz_runs(id) ON DELETE SET NULL;


--
-- Name: quiz_submissions quiz_submissions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quiz_submissions
    ADD CONSTRAINT quiz_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: topics topics_parent_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_parent_topic_id_fkey FOREIGN KEY (parent_topic_id) REFERENCES public.topics(id) ON DELETE SET NULL;


--
-- Name: topics topics_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE RESTRICT;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict uSRTXp5WafRfyL2StTcVjFvLISgMgZCbHJN8IyPtQdQjmURURHORc4zYb1fSZc2

--
-- Database "olympiad_identity" dump
--

--
-- PostgreSQL database dump
--

\restrict a2gHU6nag5qTmyNElrLA6TrOyz7E5qscAJTYdZBvrnO78egbPT3yNDN8i6DADed

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: olympiad_identity; Type: DATABASE; Schema: -; Owner: olympiad_user
--

CREATE DATABASE olympiad_identity WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE olympiad_identity OWNER TO olympiad_user;

\unrestrict a2gHU6nag5qTmyNElrLA6TrOyz7E5qscAJTYdZBvrnO78egbPT3yNDN8i6DADed
\connect olympiad_identity
\restrict a2gHU6nag5qTmyNElrLA6TrOyz7E5qscAJTYdZBvrnO78egbPT3yNDN8i6DADed

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO olympiad_user;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.password_reset_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO olympiad_user;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    code character varying(100) NOT NULL,
    description character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.permissions OWNER TO olympiad_user;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.role_permissions (
    id uuid NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO olympiad_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO olympiad_user;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.user_roles (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_at timestamp with time zone NOT NULL
);


ALTER TABLE public.user_roles OWNER TO olympiad_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    status character varying(30) DEFAULT 'ACTIVE'::character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO olympiad_user;

--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init schema	SQL	V1__init_schema.sql	-387801586	olympiad_user	2026-10-19 12:58:05.418564	113	t
2	2	seed initial rbac	SQL	V2__seed_initial_rbac.sql	-1910151749	olympiad_user	2026-10-19 12:58:05.644003	16	t
3	3	password reset tokens	SQL	V3__password_reset_tokens.sql	-335322342	olympiad_user	2026-10-20 19:55:35.372824	468	t
4	4	seed live class permissions	SQL	V4__seed_live_class_permissions.sql	1360588255	olympiad_user	2026-11-01 14:15:47.49928	222	t
5	5	seed live class chat question permissions	SQL	V5__seed_live_class_chat_question_permissions.sql	-351822872	olympiad_user	2026-11-05 19:28:50.969061	815	t
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
7eba4eea-bf76-4168-a85e-2ad1f1f4ae4a	7ee66c9c-df86-45e5-9152-6b6b85ef4170	903f752abc6b3d0cf225b507a4e3a3c6211d525c376ded676e0b5a2e4da3fa69	2026-10-20 15:45:42.58947+00	\N	2026-10-20 14:45:42.590854+00
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.permissions (id, code, description, active, created_at) FROM stdin;
0ce9d372-d9e2-4d53-9775-23004013f6ac	USER_READ	Read user details	t	2026-10-19 07:28:05.659657+00
308e0516-b30c-4a02-a60e-478c3debff74	USER_CREATE	Create users	t	2026-10-19 07:28:05.659657+00
6c8ad3eb-bd88-45c1-9afc-6e4a44c1b89e	USER_UPDATE	Update users	t	2026-10-19 07:28:05.659657+00
9545d52b-dbc1-427c-a82b-481d4de3e9df	USER_DELETE	Delete users	t	2026-10-19 07:28:05.659657+00
e6ba3ae4-1e3e-499c-868b-2ce123c41c01	ROLE_ASSIGN	Assign roles to users	t	2026-10-19 07:28:05.659657+00
acf6713a-1250-48fe-bb9a-97da8ad6a639	PERMISSION_MANAGE	Manage role permissions	t	2026-10-19 07:28:05.659657+00
3ecb7bd8-7d47-4680-8662-f395e3e23e91	COURSE_READ	Allows viewing course records	t	2026-10-21 09:37:14.969122+00
baf3366a-189a-4c41-a793-012016248054	COURSE_CREATE	Allows creating course records	t	2026-10-21 09:37:35.917793+00
66b1e558-aac6-42cb-90d5-3bc5bc868a3b	COURSE_UPDATE	Allows updating course records	t	2026-10-21 09:37:45.674021+00
a1d95b8a-dfb2-4b65-a82a-2d8c79b4d3d7	COURSE_DELETE	Delete courses	t	2026-10-21 10:52:38.316969+00
317b6035-0d92-4e4b-8ef0-602cf65e2e65	LIVE_CLASS_READ	Read authorized live classes	t	2026-10-25 08:50:38.813035+00
5bb42d99-abc9-487d-8152-45883ea90bba	LIVE_CLASS_CREATE	Create and schedule live classes	t	2026-10-25 08:50:38.813035+00
3d08ac44-9cca-477a-845e-e9ea66c7b5ea	LIVE_CLASS_UPDATE	Update authorized live classes	t	2026-10-25 08:50:38.813035+00
4162c5e1-2a55-404e-ae82-8e26a5e7b097	LIVE_CLASS_CANCEL	Cancel authorized live classes	t	2026-10-25 08:50:38.813035+00
16b7e80b-189c-47ac-a66a-104efd7ff5c3	LIVE_CLASS_JOIN	Join authorized live classes	t	2026-10-25 08:50:38.813035+00
820bc0ab-8f18-4e04-9442-df06b8adb651	LIVE_CLASS_ATTENDANCE_READ	Read authorized live class attendance	t	2026-10-25 08:50:38.813035+00
0fe879fa-a541-4908-87ee-44554a270e61	LIVE_CLASS_CHAT_READ	Read live class chat messages	t	2026-11-05 13:58:51.049939+00
f469fb73-ee23-4ce5-84b7-1080dee104e9	LIVE_CLASS_CHAT_SEND	Send live class chat messages	t	2026-11-05 13:58:51.049939+00
33d5331c-a85a-4009-a813-4d40cd8b9319	LIVE_CLASS_QUESTION_READ	Read live class questions	t	2026-11-05 13:58:51.049939+00
61f85d9c-9afe-4061-9a5b-524b3b300a7d	LIVE_CLASS_QUESTION_CONTROL	Start, end, and control live class questions	t	2026-11-05 13:58:51.049939+00
82967984-1fb2-4a38-8a24-6bae2dbca8b3	LIVE_CLASS_ANSWER_REVEAL	Reveal live class question answers	t	2026-11-05 13:58:51.049939+00
fee69764-8ba1-415d-bc30-e0329076a52d	LIVE_CLASS_ANSWER_SUBMIT	Submit answers to live class questions	t	2026-11-05 13:58:51.049939+00
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.role_permissions (id, role_id, permission_id, assigned_at) FROM stdin;
621708b8-77a7-41fb-820d-917289b4faf9	1607f179-942d-454f-a327-0854a02b5d68	0ce9d372-d9e2-4d53-9775-23004013f6ac	2026-10-19 09:07:52.483488+00
97dc7ecc-0eec-43d7-9b8b-77c593096c01	1607f179-942d-454f-a327-0854a02b5d68	308e0516-b30c-4a02-a60e-478c3debff74	2026-10-19 09:07:52.483488+00
e64bb577-555d-4020-a6dc-d6f00c7d648b	1607f179-942d-454f-a327-0854a02b5d68	6c8ad3eb-bd88-45c1-9afc-6e4a44c1b89e	2026-10-19 09:07:52.483488+00
ffe23345-f859-43ed-8946-df32bd4e1c08	1607f179-942d-454f-a327-0854a02b5d68	9545d52b-dbc1-427c-a82b-481d4de3e9df	2026-10-19 09:07:52.483488+00
7ceed37e-22e1-4bff-affc-54bff33b8e92	1607f179-942d-454f-a327-0854a02b5d68	e6ba3ae4-1e3e-499c-868b-2ce123c41c01	2026-10-19 09:07:52.483488+00
189f1ef6-930d-4f68-944a-3dccb2b758ec	1607f179-942d-454f-a327-0854a02b5d68	acf6713a-1250-48fe-bb9a-97da8ad6a639	2026-10-19 09:07:52.483488+00
c2a46ebb-52f8-45d3-9720-fd9548e2b595	1607f179-942d-454f-a327-0854a02b5d68	66b1e558-aac6-42cb-90d5-3bc5bc868a3b	2026-10-21 09:44:21.621552+00
b511b0e0-6aed-43ae-bd97-111f3a135592	1607f179-942d-454f-a327-0854a02b5d68	3ecb7bd8-7d47-4680-8662-f395e3e23e91	2026-10-21 09:58:33.626653+00
27d5a924-87d8-40a0-a393-f38aab96e46e	1607f179-942d-454f-a327-0854a02b5d68	baf3366a-189a-4c41-a793-012016248054	2026-10-21 09:58:56.195188+00
07c51fcc-4a94-485e-9f40-d41d767f776b	ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	baf3366a-189a-4c41-a793-012016248054	2026-10-21 10:02:51.900094+00
cd51e819-2f0d-420e-a55d-4e62a58c8cf7	ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	66b1e558-aac6-42cb-90d5-3bc5bc868a3b	2026-10-21 10:03:19.033959+00
9611e0da-82f6-4866-ad19-1721bdb1186f	ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	3ecb7bd8-7d47-4680-8662-f395e3e23e91	2026-10-21 10:03:41.764574+00
dc8b4c1a-6de3-431b-85de-09d40cc4b830	73e94c36-8cf8-4247-b5a6-db6599a04c23	3ecb7bd8-7d47-4680-8662-f395e3e23e91	2026-10-21 10:07:01.584678+00
b95add9f-1671-4116-9693-4e6af660c0a5	1607f179-942d-454f-a327-0854a02b5d68	a1d95b8a-dfb2-4b65-a82a-2d8c79b4d3d7	2026-10-21 10:52:38.658983+00
678c5a71-0b11-4026-b546-5b04a5ab7b42	ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	a1d95b8a-dfb2-4b65-a82a-2d8c79b4d3d7	2026-10-21 10:52:38.89333+00
8bb8e440-9b89-47e7-bbe3-795255eff07c	1607f179-942d-454f-a327-0854a02b5d68	317b6035-0d92-4e4b-8ef0-602cf65e2e65	2026-10-25 08:52:37.692313+00
9c9c0f16-e384-43e3-841a-ad97fcb9433b	31f29d52-11b0-4681-b3fb-02b0a8872d5f	317b6035-0d92-4e4b-8ef0-602cf65e2e65	2026-10-25 08:52:37.692313+00
c38824c6-3427-44bc-8b5c-556cecfa7ec1	73e94c36-8cf8-4247-b5a6-db6599a04c23	317b6035-0d92-4e4b-8ef0-602cf65e2e65	2026-10-25 08:52:37.692313+00
9b431f6c-40f5-4297-86ef-94a3003eb769	1607f179-942d-454f-a327-0854a02b5d68	5bb42d99-abc9-487d-8152-45883ea90bba	2026-10-25 08:52:37.692313+00
af2cc89c-1445-4d55-85d9-09e4340cda84	31f29d52-11b0-4681-b3fb-02b0a8872d5f	5bb42d99-abc9-487d-8152-45883ea90bba	2026-10-25 08:52:37.692313+00
f3ba2336-d60b-416f-935d-8cf52a6dba5e	1607f179-942d-454f-a327-0854a02b5d68	3d08ac44-9cca-477a-845e-e9ea66c7b5ea	2026-10-25 08:52:37.692313+00
6693fe89-e0a2-4a0d-a8c5-e487238d1912	31f29d52-11b0-4681-b3fb-02b0a8872d5f	3d08ac44-9cca-477a-845e-e9ea66c7b5ea	2026-10-25 08:52:37.692313+00
d6246fd1-0983-41bf-b791-e3ac62de5bb9	1607f179-942d-454f-a327-0854a02b5d68	4162c5e1-2a55-404e-ae82-8e26a5e7b097	2026-10-25 08:52:37.692313+00
2181f7b5-0c68-4cce-a604-c1814faf9197	31f29d52-11b0-4681-b3fb-02b0a8872d5f	4162c5e1-2a55-404e-ae82-8e26a5e7b097	2026-10-25 08:52:37.692313+00
c76a676c-0983-469d-b65c-b68d048f7858	1607f179-942d-454f-a327-0854a02b5d68	16b7e80b-189c-47ac-a66a-104efd7ff5c3	2026-10-25 08:52:37.692313+00
45e7a722-3238-4964-81ee-fe910cda5016	31f29d52-11b0-4681-b3fb-02b0a8872d5f	16b7e80b-189c-47ac-a66a-104efd7ff5c3	2026-10-25 08:52:37.692313+00
a0e43d47-70d5-4ada-a3f0-67864d269633	73e94c36-8cf8-4247-b5a6-db6599a04c23	16b7e80b-189c-47ac-a66a-104efd7ff5c3	2026-10-25 08:52:37.692313+00
3b5a829d-688f-43c3-aab2-ad4daaae8224	1607f179-942d-454f-a327-0854a02b5d68	820bc0ab-8f18-4e04-9442-df06b8adb651	2026-10-25 08:52:37.692313+00
8d317323-9cf6-40ed-af0e-230c5dacc678	31f29d52-11b0-4681-b3fb-02b0a8872d5f	820bc0ab-8f18-4e04-9442-df06b8adb651	2026-10-25 08:52:37.692313+00
da0da1b7-3f47-49e5-8b2e-b62b03f43c83	31f29d52-11b0-4681-b3fb-02b0a8872d5f	3ecb7bd8-7d47-4680-8662-f395e3e23e91	2026-11-05 09:23:53.727029+00
849fc154-4f65-4b3b-b5f7-f0080d7eaecb	73e94c36-8cf8-4247-b5a6-db6599a04c23	0fe879fa-a541-4908-87ee-44554a270e61	2026-11-05 13:58:51.049939+00
46044689-49cd-4c15-859d-38f66586d691	73e94c36-8cf8-4247-b5a6-db6599a04c23	f469fb73-ee23-4ce5-84b7-1080dee104e9	2026-11-05 13:58:51.049939+00
61d70a65-ad5b-4014-b1e3-db1614398dd8	73e94c36-8cf8-4247-b5a6-db6599a04c23	33d5331c-a85a-4009-a813-4d40cd8b9319	2026-11-05 13:58:51.049939+00
a9851f4e-6473-4606-845d-8c0a1e93d1c2	73e94c36-8cf8-4247-b5a6-db6599a04c23	fee69764-8ba1-415d-bc30-e0329076a52d	2026-11-05 13:58:51.049939+00
c63ab7eb-cf59-487a-b5d9-23bb0e4634e4	31f29d52-11b0-4681-b3fb-02b0a8872d5f	0fe879fa-a541-4908-87ee-44554a270e61	2026-11-05 13:58:51.049939+00
5dd3ced3-95d2-4da6-beed-46c222c9ec0d	31f29d52-11b0-4681-b3fb-02b0a8872d5f	f469fb73-ee23-4ce5-84b7-1080dee104e9	2026-11-05 13:58:51.049939+00
121f8f2b-b86e-4feb-a0e2-58e75758b81d	31f29d52-11b0-4681-b3fb-02b0a8872d5f	33d5331c-a85a-4009-a813-4d40cd8b9319	2026-11-05 13:58:51.049939+00
4ce54692-3d59-4e81-abba-4c4fbc3ca3ab	31f29d52-11b0-4681-b3fb-02b0a8872d5f	61f85d9c-9afe-4061-9a5b-524b3b300a7d	2026-11-05 13:58:51.049939+00
ff5b86c7-1bc9-4cab-9048-831a4364ad93	31f29d52-11b0-4681-b3fb-02b0a8872d5f	82967984-1fb2-4a38-8a24-6bae2dbca8b3	2026-11-05 13:58:51.049939+00
9bf55f9d-db33-40c1-9d8f-75203658bd55	31f29d52-11b0-4681-b3fb-02b0a8872d5f	fee69764-8ba1-415d-bc30-e0329076a52d	2026-11-05 13:58:51.049939+00
91ca8c0d-f2ec-4e7c-b643-0f34153725b2	1607f179-942d-454f-a327-0854a02b5d68	0fe879fa-a541-4908-87ee-44554a270e61	2026-11-05 13:58:51.049939+00
de074e3a-03a4-4f8b-b4fc-aa9d536d5578	1607f179-942d-454f-a327-0854a02b5d68	f469fb73-ee23-4ce5-84b7-1080dee104e9	2026-11-05 13:58:51.049939+00
c5dcd254-3fe4-4035-9d7b-528443698113	1607f179-942d-454f-a327-0854a02b5d68	33d5331c-a85a-4009-a813-4d40cd8b9319	2026-11-05 13:58:51.049939+00
7dc80073-5b87-4c22-90dd-e0b28abd8f60	1607f179-942d-454f-a327-0854a02b5d68	61f85d9c-9afe-4061-9a5b-524b3b300a7d	2026-11-05 13:58:51.049939+00
029bde3e-2b5c-4dac-8d0d-2efaec16f51b	1607f179-942d-454f-a327-0854a02b5d68	82967984-1fb2-4a38-8a24-6bae2dbca8b3	2026-11-05 13:58:51.049939+00
e164b839-1e78-437b-8cf0-6a78bfb68885	1607f179-942d-454f-a327-0854a02b5d68	fee69764-8ba1-415d-bc30-e0329076a52d	2026-11-05 13:58:51.049939+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.roles (id, name, description, active, created_at) FROM stdin;
73e94c36-8cf8-4247-b5a6-db6599a04c23	STUDENT	Student access	t	2026-10-19 07:28:05.659657+00
31f29d52-11b0-4681-b3fb-02b0a8872d5f	TEACHER	Teacher access	t	2026-10-19 07:28:05.659657+00
1607f179-942d-454f-a327-0854a02b5d68	ADMIN	Administrator access	t	2026-10-19 07:28:05.659657+00
ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	COURSE_MANAGER	Manages courses in the Olympiad Learning Academy	t	2026-10-21 08:41:34.919539+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.user_roles (id, user_id, role_id, assigned_at) FROM stdin;
77c2ffeb-909c-4090-87af-6eaa3e8eaa4c	7ee66c9c-df86-45e5-9152-6b6b85ef4170	1607f179-942d-454f-a327-0854a02b5d68	2026-10-19 09:21:47.519063+00
a31be72b-3f77-4a4a-a19a-96f11190cd3b	16270d39-f2a0-4bf8-a623-37db9593e984	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-19 17:18:23.14059+00
c9d2f1fb-b463-4d1b-a482-76d0e6576d4a	81c088a9-8e83-4f9a-ab38-aec86111870a	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-19 17:23:48.895363+00
130a2372-ddd6-4775-8a30-e86ed60f5476	af357bf7-4771-4895-b7fe-d473b39f6189	1607f179-942d-454f-a327-0854a02b5d68	2026-10-20 14:38:23.51296+00
23198593-1321-4549-b506-0287a6a2b3b0	1110aad3-25ec-4a30-be8b-302f2d8c9e01	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-20 15:55:42.084417+00
eb553fb5-04fa-4206-a650-0f285c97fda8	1110aad3-25ec-4a30-be8b-302f2d8c9e01	ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	2026-10-21 08:45:39.466772+00
97ce717b-e248-408e-9f87-cd75702218e3	9782a814-ca7a-49ca-9b48-dd99603e305f	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-21 10:50:29.85319+00
66f88373-b5ce-450b-9b9a-bc2a67df435e	b8db30cb-64f9-451e-98b5-e0915177ce9e	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-21 10:51:23.410246+00
6f3a91b6-e0a2-4a48-9444-a945025de691	5cc575ad-b6f7-4cd8-9666-8e92e8c0d78b	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-21 10:51:52.680867+00
d518f185-baab-4a43-a7fd-89136da5f24b	5cc575ad-b6f7-4cd8-9666-8e92e8c0d78b	ff6dfed6-9aa4-476d-abe9-11c7db1d3a6c	2026-10-21 10:52:39.135024+00
f9765572-9bd4-4824-99d4-14c443d6075f	4a45e1df-8aea-4e0d-bae0-c724122bbcb2	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-21 11:05:43.592344+00
443a851b-9739-4016-9537-745d0bbf24e5	63af3921-8d9b-40d1-8898-8ecef6a2467b	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-21 11:06:00.859186+00
1fc63b15-2e67-4526-a807-8343b323f705	e09fc212-5e5c-42c2-b433-ad5d075065f2	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-22 06:51:15.169694+00
7819206b-3811-4df5-8375-e5bd22210276	831017a2-7cb1-4310-a790-41ac9226e396	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-22 11:39:07.93191+00
c17e4aee-3b6e-4d5a-885e-e7c0413baae9	504aecb9-7c33-44bc-8a46-ff5ff473f841	31f29d52-11b0-4681-b3fb-02b0a8872d5f	2026-10-25 12:34:54.849375+00
d5bddb62-c1ed-4d93-8fd6-0d276cd9a7ab	3a14f592-950d-45b6-bb59-92e7f1c9c221	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-10-25 15:09:44.293487+00
06920de3-dd4b-49be-a04e-9f61ad342844	0a78755c-798d-4688-8dc5-6857998b76e5	73e94c36-8cf8-4247-b5a6-db6599a04c23	2026-11-08 01:43:32.245675+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.users (id, email, password_hash, first_name, last_name, status, email_verified, created_at, updated_at) FROM stdin;
16270d39-f2a0-4bf8-a623-37db9593e984	student2@example.com	$2a$10$RRgOnv0nmem7JPQqLLzMr.uKa0iTX0rgkyMulFbDLPSkZg/kib.MG	Test	Student	ACTIVE	f	2026-10-19 17:18:23.128923+00	2026-10-19 17:18:23.128923+00
81c088a9-8e83-4f9a-ab38-aec86111870a	manu@example.com	$2a$10$KosqE4nQZaF0PF0D33hhfu0zIGGGP5zkoZEX1s5XpR.D0yCro7qQi	Manu	R	ACTIVE	f	2026-10-19 17:23:48.893349+00	2026-10-19 17:23:48.893349+00
1110aad3-25ec-4a30-be8b-302f2d8c9e01	dhruva@gmail.com	$2a$10$wP2NpF6fIVwXl9QO4H0dLuHmhmm6uZoN.ZnlG3Yax0Rd2VJM/u1lW	Dhruva	R	ACTIVE	f	2026-10-20 15:55:42.067068+00	2026-10-20 15:55:42.067068+00
5cc575ad-b6f7-4cd8-9666-8e92e8c0d78b	course.manager@example.com	$2a$10$WhlWcQbpmdRUfMpYpqeswO8j6IMprQTK7jbSGzN3Mozup7wlToiki	Course	Manager	ACTIVE	f	2026-10-21 10:51:52.67885+00	2026-10-21 10:51:52.67885+00
e09fc212-5e5c-42c2-b433-ad5d075065f2	alice@example.com	$2a$10$ldGnFPooDCNOEBbkxIurBubzjwutT3Baap8lE00d2H240MTumTxLq	Alice	Smith	ACTIVE	f	2026-10-22 06:44:53.250575+00	2026-10-22 06:44:53.250575+00
504aecb9-7c33-44bc-8a46-ff5ff473f841	teacher1@example.com	$2a$10$JT9413932bSL3YcehcBQ4.40XUsc/O1t7DalxVfx1L2GhJDA72pH.	Raghav	Veeru	ACTIVE	f	2026-10-25 12:31:21.9693+00	2026-10-25 12:31:21.9693+00
3a14f592-950d-45b6-bb59-92e7f1c9c221	teacher2@example.com	$2a$10$o6hZ2LlNiHDfvXsdMt2uYuWjHMJKx7TImey1Eaqc/sT5SZdC1Z7bi	Kundan	Kumar	ACTIVE	f	2026-10-25 15:09:44.280104+00	2026-10-25 15:09:44.280104+00
831017a2-7cb1-4310-a790-41ac9226e396	frontend.verify@example.com	$2a$10$6wloz4G7fjpworUOY2UUmukZhRXz.8yfL58a9k9XZRjzTH03UX23m	Frontend	Verify	INACTIVE	f	2026-10-22 11:39:07.888836+00	2026-11-08 01:25:31.106469+00
af357bf7-4771-4895-b7fe-d473b39f6189	postman.student@example.com	$2a$10$9bQzzp9qFw28naJMRDOlFOquYB7vEr/KocnovWog8LLsq3SIsORDO	Raghav	Veeru	INACTIVE	f	2026-10-20 13:53:56.582861+00	2026-11-08 01:25:45.535654+00
9782a814-ca7a-49ca-9b48-dd99603e305f	course.probe.1792579829365@example.com	$2a$10$MBEW2Bcc73ZHLrioa8GRQOa7rDcCrsjEB0qC7y26GOL5Fa23LYyOC	Course	Probe	INACTIVE	f	2026-10-21 10:50:29.837559+00	2026-11-08 01:25:49.015182+00
b8db30cb-64f9-451e-98b5-e0915177ce9e	course.probe.1792579883195@example.com	$2a$10$js6aDUM8kdA3ByPZXDUC9eQdKqb7DlU6N7QaaD5s3RwGF1kdRlu7i	Course	Probe	INACTIVE	f	2026-10-21 10:51:23.408229+00	2026-11-08 01:25:52.047434+00
4a45e1df-8aea-4e0d-bae0-c724122bbcb2	student.e2e.1792580743303@example.com	$2a$10$zDgn.XHqpu4iy34D072SheKtDEuMl/4Me9kgRpQTIYGAY8AWaTSla	Student	E2E	INACTIVE	f	2026-10-21 11:05:43.591338+00	2026-11-08 01:25:57.348515+00
63af3921-8d9b-40d1-8898-8ecef6a2467b	student.e2e.1792580760569@example.com	$2a$10$HOZFBCskjFlV9LjNDmmbreCTbje2/zi5IQNHkXHFWjECyYCeeGcpC	Student	E2E	INACTIVE	f	2026-10-21 11:06:00.858224+00	2026-11-08 01:25:59.396407+00
0a78755c-798d-4688-8dc5-6857998b76e5	pooja@gmail.com	$2a$10$MRiY41KQnSWyrOTwhdOjLe/ZNspt0ukwoVxKqP8I62puFDslPNVNi	Pooja	Jain	ACTIVE	f	2026-11-08 01:31:09.153718+00	2026-11-08 01:31:09.153718+00
7ee66c9c-df86-45e5-9152-6b6b85ef4170	admin@example.com	$2a$10$sfvgPrVyrwwfVysKBeRezeKUqZgkqzGSFF7tg9Q9eUVT7yTPTNv0C	Admin	R	ACTIVE	f	2026-10-19 08:40:26.69628+00	2026-11-08 02:22:21.502768+00
\.


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens uk_password_reset_tokens_token_hash; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT uk_password_reset_tokens_token_hash UNIQUE (token_hash);


--
-- Name: permissions uk_permissions_code; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT uk_permissions_code UNIQUE (code);


--
-- Name: role_permissions uk_role_permissions_role_permission; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT uk_role_permissions_role_permission UNIQUE (role_id, permission_id);


--
-- Name: roles uk_roles_name; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_roles_name UNIQUE (name);


--
-- Name: user_roles uk_user_roles_user_role; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT uk_user_roles_user_role UNIQUE (user_id, role_id);


--
-- Name: users uk_users_email; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_users_email UNIQUE (email);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: password_reset_tokens fk_password_reset_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: role_permissions fk_role_permissions_permission; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: role_permissions fk_role_permissions_role; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles fk_user_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles fk_user_roles_user; Type: FK CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict a2gHU6nag5qTmyNElrLA6TrOyz7E5qscAJTYdZBvrnO78egbPT3yNDN8i6DADed

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict r5XdJr8Rx5IWdNp8c1Nqrd96P0EicoNm0glqwYjek1NHaFbk1TQtsdAe9XrUuoU

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict r5XdJr8Rx5IWdNp8c1Nqrd96P0EicoNm0glqwYjek1NHaFbk1TQtsdAe9XrUuoU

--
-- Database "student_db" dump
--

--
-- PostgreSQL database dump
--

\restrict 7Twl53abpFwfj5sYcNge0WeAKKfAZTebF2ScRdAYvkTc7mHIjN7VDNF62cVxssY

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: student_db; Type: DATABASE; Schema: -; Owner: olympiad_user
--

CREATE DATABASE student_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE student_db OWNER TO olympiad_user;

\unrestrict 7Twl53abpFwfj5sYcNge0WeAKKfAZTebF2ScRdAYvkTc7mHIjN7VDNF62cVxssY
\connect student_db
\restrict 7Twl53abpFwfj5sYcNge0WeAKKfAZTebF2ScRdAYvkTc7mHIjN7VDNF62cVxssY

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: enrollments; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.enrollments (
    id bigint NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    identity_user_id character varying(64) NOT NULL,
    status character varying(20) NOT NULL,
    student_profile_id bigint,
    updated_at timestamp(6) with time zone NOT NULL,
    CONSTRAINT enrollments_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE public.enrollments OWNER TO olympiad_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

ALTER TABLE public.enrollments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: students; Type: TABLE; Schema: public; Owner: olympiad_user
--

CREATE TABLE public.students (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    full_name character varying(255) NOT NULL,
    grade character varying(255),
    identity_user_id character varying(255) NOT NULL,
    phone character varying(255),
    school_name character varying(255),
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.students OWNER TO olympiad_user;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: olympiad_user
--

ALTER TABLE public.students ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.enrollments (id, course_id, created_at, identity_user_id, status, student_profile_id, updated_at) FROM stdin;
2	85433441-4310-4b00-b29d-0eda01bc48cb	2026-10-24 11:46:58.407264+00	81c088a9-8e83-4f9a-ab38-aec86111870a	ACTIVE	\N	2026-10-24 13:14:34.217025+00
3	85433441-4310-4b00-b29d-0eda01bc48cb	2026-10-31 09:02:22.676208+00	504aecb9-7c33-44bc-8a46-ff5ff473f841	ACTIVE	\N	2026-10-31 09:02:22.676208+00
1	85433441-4310-4b00-b29d-0eda01bc48cb	2026-10-22 08:48:36.190598+00	e09fc212-5e5c-42c2-b433-ad5d075065f2	ACTIVE	5	2026-11-04 18:03:28.446271+00
4	c7e8950e-2801-43d5-b4af-38a9f166cc1a	2026-11-08 01:49:31.070594+00	0a78755c-798d-4688-8dc5-6857998b76e5	ACTIVE	\N	2026-11-08 01:49:31.070594+00
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: olympiad_user
--

COPY public.students (id, created_at, full_name, grade, identity_user_id, phone, school_name, updated_at) FROM stdin;
1	2026-10-21 19:25:41.636909	Test Student	10	student-user-001	9000000000	Olympiad Academy School	2026-10-21 19:25:41.636909
3	2026-10-21 19:27:49.174901	Test Student	3	student-user-002	8000000000	Olympiad Academy School	2026-10-21 19:27:49.174901
4	2026-10-21 19:37:08.169172	Test Student	4	student-user-003	7000000000	Olympiad Academy School	2026-10-21 19:37:08.169172
5	2026-10-22 12:22:43.374334	Alice Smith	7	e09fc212-5e5c-42c2-b433-ad5d075065f2	555-123-4567	Olympiad Academy	2026-10-22 12:22:43.374334
6	2026-10-31 14:45:30.265311	Raghavendra V	8	504aecb9-7c33-44bc-8a46-ff5ff473f841	+919901567180	ICFAI	2026-10-31 14:45:30.265311
7	2026-11-08 07:20:32.094049	Pooja Jain	8	0a78755c-798d-4688-8dc5-6857998b76e5	+917259674953	DPS	2026-11-08 07:21:41.588785
\.


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 4, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: olympiad_user
--

SELECT pg_catalog.setval('public.students_id_seq', 7, true);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: enrollments uk_enrollment_student_course; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT uk_enrollment_student_course UNIQUE (identity_user_id, course_id);


--
-- Name: students uk_student_identity_user; Type: CONSTRAINT; Schema: public; Owner: olympiad_user
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uk_student_identity_user UNIQUE (identity_user_id);


--
-- Name: idx_enrollment_course_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_enrollment_course_id ON public.enrollments USING btree (course_id);


--
-- Name: idx_enrollment_identity_user_id; Type: INDEX; Schema: public; Owner: olympiad_user
--

CREATE INDEX idx_enrollment_identity_user_id ON public.enrollments USING btree (identity_user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 7Twl53abpFwfj5sYcNge0WeAKKfAZTebF2ScRdAYvkTc7mHIjN7VDNF62cVxssY

--
-- PostgreSQL database cluster dump complete
--

