--
-- PostgreSQL database dump
--

\restrict gLCUFKsSw4Ckhy1wPatAUegPXHbHvuAP1DYPBae1MBf1vr1FI7VwwyYbqBypQCT

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-07-02 23:25:55

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
-- TOC entry 222 (class 1259 OID 16544)
-- Name: guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guests (
    id integer NOT NULL,
    full_name character varying(160) NOT NULL,
    document_number character varying(60) NOT NULL,
    document_type character varying(60) NOT NULL,
    phone character varying(40),
    email character varying(120),
    nationality character varying(80),
    address text,
    birth_date timestamp without time zone,
    notes text,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.guests OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16543)
-- Name: guests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guests_id_seq OWNER TO postgres;

--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 221
-- Name: guests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guests_id_seq OWNED BY public.guests.id;


--
-- TOC entry 232 (class 1259 OID 16639)
-- Name: ocr_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ocr_documents (
    id integer NOT NULL,
    guest_id integer,
    filename character varying(255) NOT NULL,
    extracted_text text NOT NULL,
    detected_full_name character varying(160),
    detected_document_number character varying(60),
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.ocr_documents OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16638)
-- Name: ocr_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ocr_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ocr_documents_id_seq OWNER TO postgres;

--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 231
-- Name: ocr_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ocr_documents_id_seq OWNED BY public.ocr_documents.id;


--
-- TOC entry 224 (class 1259 OID 16563)
-- Name: product_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_services (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    category character varying(80) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock integer,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.product_services OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16562)
-- Name: product_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_services_id_seq OWNER TO postgres;

--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 223
-- Name: product_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_services_id_seq OWNED BY public.product_services.id;


--
-- TOC entry 234 (class 1259 OID 16658)
-- Name: purchase_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_details (
    id integer NOT NULL,
    purchase_id integer NOT NULL,
    item_name character varying(120) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.purchase_details OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16657)
-- Name: purchase_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_details_id_seq OWNER TO postgres;

--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 233
-- Name: purchase_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_details_id_seq OWNED BY public.purchase_details.id;


--
-- TOC entry 226 (class 1259 OID 16582)
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    supplier_name character varying(120) NOT NULL,
    purchase_date timestamp without time zone NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    notes text,
    is_cancelled boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16581)
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO postgres;

--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 225
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- TOC entry 220 (class 1259 OID 16533)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16532)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5020 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 236 (class 1259 OID 16677)
-- Name: sale_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_details (
    id integer NOT NULL,
    sale_id integer NOT NULL,
    product_service_id integer,
    description character varying(160) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.sale_details OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16676)
-- Name: sale_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_details_id_seq OWNER TO postgres;

--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 235
-- Name: sale_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_details_id_seq OWNED BY public.sale_details.id;


--
-- TOC entry 228 (class 1259 OID 16600)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    customer_name character varying(120) NOT NULL,
    sale_date timestamp without time zone NOT NULL,
    payment_method character varying(60) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    notes text,
    status character varying(30) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16599)
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 227
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- TOC entry 230 (class 1259 OID 16620)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16619)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4796 (class 2604 OID 16547)
-- Name: guests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests ALTER COLUMN id SET DEFAULT nextval('public.guests_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16642)
-- Name: ocr_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_documents ALTER COLUMN id SET DEFAULT nextval('public.ocr_documents_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 16566)
-- Name: product_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_services ALTER COLUMN id SET DEFAULT nextval('public.product_services_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 16661)
-- Name: purchase_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details ALTER COLUMN id SET DEFAULT nextval('public.purchase_details_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 16585)
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 16536)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 16680)
-- Name: sale_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details ALTER COLUMN id SET DEFAULT nextval('public.sale_details_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 16603)
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 16623)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4995 (class 0 OID 16544)
-- Dependencies: 222
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guests (id, full_name, document_number, document_type, phone, email, nationality, address, birth_date, notes, is_active, created_at, updated_at) FROM stdin;
1	Carlos Abel Vargas Banos	8536202	CI	70479841	cr552242@gmail.com	Boliviana	B/LA PAMPA AV. LA PAZ - TARIJA	1996-04-03 00:00:00	Registro asistido por OCR: a2c992746793464fb86411e7741094e8.jpg, 4c02eb2280784513b9b94cf5331d6b8c.jpg	t	2026-07-02 16:03:39.897633	2026-07-02 16:03:39.897637
\.


--
-- TOC entry 5005 (class 0 OID 16639)
-- Dependencies: 232
-- Data for Name: ocr_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ocr_documents (id, guest_id, filename, extracted_text, detected_full_name, detected_document_number, created_at) FROM stdin;
1	\N	11ee3a09ff254759965d92504880f894.jpg	c Ry # ~*~ ‘ ' ff\n4 Pa o *\\ ra ™\\ f\n\nSERVICIO GENERAL DE IDENTIFICACION PERSONAL\nCERTIFICA: Que la firma, fotografia\nssen02~—S«@ Impresion pertenece 260898\n\nCARLOS ABEL VARGAS BANOS\n\nD\n\ncido el 3 de Abril de 1996\nPOTOSI - SUD CHICHAS - nipbic\n\n© Estado Civil SOLTERO\n= Profesidn/Ocupacion ESTUDIANTE UNIVERSITARIO\n\nDomicilio 8/LA PAMPA AV. LA PAZ-TARWA\n\n5\n\nLIVIA - CEDULA DE IDENTIDA\n>\n\nESTADO PLURINACION:\n\nAB0S\n\nDOCUMENTOS REGISTR\n\noe eee\n\nernest at ni\n\n	Servicio General De Identificacion Personal	260898	2026-07-02 14:48:03.048897
2	\N	6c4fd147a20f4b729fb1bc60cb88c5f9.jpg	.\ny f\n%. i\n/\n4\n7\nJ\n"4\nf\nf F\nr,\n¥\ns\n/\n¥.\nf\n»~\n. ™s\n*\n/\n\nbg A\n\nESTADO\n\nCEDU\n\nMh\n\nee\n\nEd\n\n.. CLONAL DE BOLIVIA\n= IDENTIDAD\n\nBliO\n\na %\n\nus COAL\n\n— 465\n\nSy qa i AOE se\n\né bee QOMALOE BOL\nA) OF BD yan NAtbe Bae\n“Gp\n\nit haw y lONAOR\nthE STALIOP LUM\n\nsFaBb ms a NAG EOIAS OF O\n\n“ ‘\n\na\n	.. Clonal De Bolivia	\N	2026-07-02 14:48:03.048902
3	\N	70ac4ea51d4245dbaf2182c8d5f73b29.jpg	ee tee KF Xf" are . , /-, ‘ . ¢ 4\noe —_ pa a a sy ay ae ; > r di i. 4 ; a 4 a y. y ee y be % a\neS . an : an agai a a? cyte 3 * _— ; hoe\n* a : ; a 7 ; : moe woo. Apia. he mpleipar ices a, fee i ?\n| MEI HEEECUIOEE IWTAES TADOPLURINAL ee one a eS 2 adage aaa, |\nBees co ee gt i et OOP LURINACogssnenaty MOLSVIAE: AL COEADLiV LACHES EE a od ae fo\nOR Ey a ee gg Be BM Sa - er aoe ce > ee 8 6¢ 2s\noe Rags i oe ROLIV! ES : , eg Boot tars i eres ear. af Sg\nog eed aan ay Be OT OE a ‘0 x,\nta. 2 ee So NI Gi a e .£.8.2 2 2S\né Fu id Oe ALTE ss . 1 oR. sae ei -— . ne Fue ar oe a oe m FS ‘< ar °- e te . gd he : pas a dacthicee eg a. Sr meal ay : Se ~ bs ‘\na = - ee AGN ALY aaa Be. , -— 27oo oe - a)..” Geeneee a oe aoe WEES TABDOP LEE ‘+ @ See ao \\ do yw\newrunee . eye Te eee Cin) ‘oa a a aa Age he ae egies Ney IOWA OL RE seg 5 a 3 ‘ Pa\n4 _ 2 Pree 8 eee Wy Be ae RHQuALDEGOLY AES. . Gee é\n" 9 - tal YH ee ‘eo Mag” | ORME Ol SR é f\ni AC. | a. ae BE MPCLVERRE STAC OF. oo § Ge. 4 :\nx ON ee Oe a) AS en 2 2 ! f\n: = ei in: Re woe SEE ES E. Be ee —_ ‘\n: a fa : ° Vir es. th a ; : a = aa * rr a F : :\na. AC eas yt 4 Sorte |. ea , F\nPS 7 SS eo 9 ee é\n9 ON , ES OTR Beem ;\n- ’. a | OI aat ReatcV Abe ROOM 3 Se .\n” | ta an a A agg Vesper ah ¢ PONAL D6: oo” 3 Bee e™\n4 ol ep) Sets one SUN DROOL AES TACO sce e\n‘ad a} Jee 9 be ee aad DROME. ADF URINACIONA: 22M NOR Seb f\nsid lhew —_ ‘ OOP Ceara fi POP LURINAC EBOU.NIAES T AQOPEEN SS Ae og YF.\n“ 1. OF 008 Aa recur NASEON. HEBOLIVIARRE OF URNA: HOA ES Maas it al ‘d .\n5 Eee RRIL aS HROUEL VEINS Seo VIA S ROORR US 4 Pe\ni eae gli ; ; — , f “Ss\n: eo . ™ —— . a. ee sok ai . . a £ .\n. : / foN a, ' . a es ea _~ ? wt, ii	\N	\N	2026-07-02 14:53:18.193813
4	\N	d0af4c30ec484055b9601f33051ef2e7.jpg	‘a ra ¥\n~ . r we f : 4 ‘ rs /\na — f f / } / ay\n3 f ‘ ¥\n~~ “J . ed ) Z sa! aS —\nan < : | eos\n: ESTAGS 2 ws. CIONAL DE BOLIVIA st\n. __ . ] es - a,\n, ye 4 , Se dl ~\nRy a ee ey i gt\nae 6 6BIO\nSf ig | oy sefle . i, |\na Oy / if Bic ye Oe |\nne Dank i | ree | Sw yey Oe\na ES errr. | CRINACIONALOE aE IVIAR TAD P| Lens wee\n. a on, " a mr 8 as % , aoe Np LS BOL VIAEST. WAIT Be aa fe cio rad 140 ae et - a : - :\n‘re REI STAD GPL NACH . reas a ar an / 4 : ae\nee. Pog at MR NAC ONALOEBCL VIAI | a ante 2 RS\n= WLAn 60 fg’ a Pe id NIA OPLURINAG ty (se |\n>» . ie ee ee :\na < wees\n. Re “Nias = ‘ ao ee EN Oe mt Nig i) a eats, La : * . 1. a a. "i ee: = CAN v	\N	ONALOE	2026-07-02 14:53:18.193818
5	\N	80dab1abf2d9488b9ffd079f748d1321.jpg	‘a ra ¥\n~ . r we f : 4 ‘ rs /\na — f f / } / ay\n3 f ‘ ¥\n~~ “J . ed ) Z sa! aS —\nan < : | eos\n: ESTAGS 2 ws. CIONAL DE BOLIVIA st\n. __ . ] es - a,\n, ye 4 , Se dl ~\nRy a ee ey i gt\nae 6 6BIO\nSf ig | oy sefle . i, |\na Oy / if Bic ye Oe |\nne Dank i | ree | Sw yey Oe\na ES errr. | CRINACIONALOE aE IVIAR TAD P| Lens wee\n. a on, " a mr 8 as % , aoe Np LS BOL VIAEST. WAIT Be aa fe cio rad 140 ae et - a : - :\n‘re REI STAD GPL NACH . reas a ar an / 4 : ae\nee. Pog at MR NAC ONALOEBCL VIAI | a ante 2 RS\n= WLAn 60 fg’ a Pe id NIA OPLURINAG ty (se |\n>» . ie ee ee :\na < wees\n. Re “Nias = ‘ ao ee EN Oe mt Nig i) a eats, La : * . 1. a a. "i ee: = CAN v	A Ra	ONALOE	2026-07-02 14:58:40.429806
6	\N	813383c10f4d48a9bd26d490b61b5401.jpg	ee tee KF Xf" are . , /-, ‘ . ¢ 4\noe —_ pa a a sy ay ae ; > r di i. 4 ; a 4 a y. y ee y be % a\neS . an : an agai a a? cyte 3 * _— ; hoe\n* a : ; a 7 ; : moe woo. Apia. he mpleipar ices a, fee i ?\n| MEI HEEECUIOEE IWTAES TADOPLURINAL ee one a eS 2 adage aaa, |\nBees co ee gt i et OOP LURINACogssnenaty MOLSVIAE: AL COEADLiV LACHES EE a od ae fo\nOR Ey a ee gg Be BM Sa - er aoe ce > ee 8 6¢ 2s\noe Rags i oe ROLIV! ES : , eg Boot tars i eres ear. af Sg\nog eed aan ay Be OT OE a ‘0 x,\nta. 2 ee So NI Gi a e .£.8.2 2 2S\né Fu id Oe ALTE ss . 1 oR. sae ei -— . ne Fue ar oe a oe m FS ‘< ar °- e te . gd he : pas a dacthicee eg a. Sr meal ay : Se ~ bs ‘\na = - ee AGN ALY aaa Be. , -— 27oo oe - a)..” Geeneee a oe aoe WEES TABDOP LEE ‘+ @ See ao \\ do yw\newrunee . eye Te eee Cin) ‘oa a a aa Age he ae egies Ney IOWA OL RE seg 5 a 3 ‘ Pa\n4 _ 2 Pree 8 eee Wy Be ae RHQuALDEGOLY AES. . Gee é\n" 9 - tal YH ee ‘eo Mag” | ORME Ol SR é f\ni AC. | a. ae BE MPCLVERRE STAC OF. oo § Ge. 4 :\nx ON ee Oe a) AS en 2 2 ! f\n: = ei in: Re woe SEE ES E. Be ee —_ ‘\n: a fa : ° Vir es. th a ; : a = aa * rr a F : :\na. AC eas yt 4 Sorte |. ea , F\nPS 7 SS eo 9 ee é\n9 ON , ES OTR Beem ;\n- ’. a | OI aat ReatcV Abe ROOM 3 Se .\n” | ta an a A agg Vesper ah ¢ PONAL D6: oo” 3 Bee e™\n4 ol ep) Sets one SUN DROOL AES TACO sce e\n‘ad a} Jee 9 be ee aad DROME. ADF URINACIONA: 22M NOR Seb f\nsid lhew —_ ‘ OOP Ceara fi POP LURINAC EBOU.NIAES T AQOPEEN SS Ae og YF.\n“ 1. OF 008 Aa recur NASEON. HEBOLIVIARRE OF URNA: HOA ES Maas it al ‘d .\n5 Eee RRIL aS HROUEL VEINS Seo VIA S ROORR US 4 Pe\ni eae gli ; ; — , f “Ss\n: eo . ™ —— . a. ee sok ai . . a £ .\n. : / foN a, ' . a es ea _~ ? wt, ii	Ee Tee Kf Xf Are	\N	2026-07-02 14:58:40.429812
7	\N	8dce1f74abf941b0ac015e8db594cdef.jpg	/ 4 ESTADO Vi. <i.. SACIONAL DE BOLIVIA 7\nPs ] ee i =\nte CEDUl/“ BE IDENTIDAD pe\nx A BIO ud\ny the Whe Wel PN Pia “% Kia vf! ti \\ J\n> No. 8536202 —— Emitidael 21deDiciembrede 2020\n. ago or A NASER OL AES AOC LR MAE ONAL a ae i Fenner\nx . ‘Fowe ae BS eS IR Nt RMON\n7 “a 7 he villi “eee “GRA IGRALOEED mage : BRB Om: AES TADOPL IR NALYDHAL OF 8	\N	8536202	2026-07-02 15:22:58.382048
8	\N	4c95892cf1ef4aad8fd0b7f31a586766.jpg	at\nPonte\nS\n2 EL SERVICIO GENERAL DE IDENTIFICACION PERSONAL\n® |CN\nas\n-\nCERTIFICA: Que la firma, fotografia\ne impresion pertenece\nw 8536202\n260898\nSA:\nCARLOS ABEL VARGAS BANOS\n_\no\n< Nacido el\n3 de Abril de 1996\n5 En\nPOTOSI - SUD CHICHAS - TUPIZA\n=\n. Estado Civil SOLTERO\nje\nProfesion/Ocupacion ESTUDIANTE UNIVERSITARIO\nDomicilio 8/LA PAMPAAV. LA PAZ-TARWA\n2. er\nSe Sain\nQnr ODD\nPATRIC!\nPAMELA HERMOSA GUTERREZ\nDIREC\n‘ORA GENERAL | EJECUTIVA ai.\nSERVI\nFant ALT) pte\nFAVRENAALE\neX\na	Carlos Abel Vargas Banos	8536202	2026-07-02 15:22:58.382055
9	\N	4bb13a77071d413083b2297d38ca617f.jpg	/ 4 ESTADO Vi. <i.. SACIONAL DE BOLIVIA 7\nPs ] ee i =\nte CEDUl/“ BE IDENTIDAD pe\nx A BIO ud\ny the Whe Wel PN Pia “% Kia vf! ti \\ J\n> No. 8536202 —— Emitidael 21deDiciembrede 2020\n. ago or A NASER OL AES AOC LR MAE ONAL a ae i Fenner\nx . ‘Fowe ae BS eS IR Nt RMON\n7 “a 7 he villi “eee “GRA IGRALOEED mage : BRB Om: AES TADOPL IR NALYDHAL OF 8	\N	8536202	2026-07-02 15:33:42.23167
10	\N	317ac42161bf47bb99629e28bf9f1653.jpg	at\nPonte\nS\n2 EL SERVICIO GENERAL DE IDENTIFICACION PERSONAL\n® |CN\nas\n-\nCERTIFICA: Que la firma, fotografia\ne impresion pertenece\nw 8536202\n260898\nSA:\nCARLOS ABEL VARGAS BANOS\n_\no\n< Nacido el\n3 de Abril de 1996\n5 En\nPOTOSI - SUD CHICHAS - TUPIZA\n=\n. Estado Civil SOLTERO\nje\nProfesion/Ocupacion ESTUDIANTE UNIVERSITARIO\nDomicilio 8/LA PAMPAAV. LA PAZ-TARWA\n2. er\nSe Sain\nQnr ODD\nPATRIC!\nPAMELA HERMOSA GUTERREZ\nDIREC\n‘ORA GENERAL | EJECUTIVA ai.\nSERVI\nFant ALT) pte\nFAVRENAALE\neX\na	Carlos Abel Vargas Banos	8536202	2026-07-02 15:33:42.231675
11	\N	0b6e342b66694d0c91d89a1f354ddc4e.jpg	/ 4 ESTADO Vi. <i.. SACIONAL DE BOLIVIA 7\nPs ] ee i =\nte CEDUl/“ BE IDENTIDAD pe\nx A BIO ud\ny the Whe Wel PN Pia “% Kia vf! ti \\ J\n> No. 8536202 —— Emitidael 21deDiciembrede 2020\n. ago or A NASER OL AES AOC LR MAE ONAL a ae i Fenner\nx . ‘Fowe ae BS eS IR Nt RMON\n7 “a 7 he villi “eee “GRA IGRALOEED mage : BRB Om: AES TADOPL IR NALYDHAL OF 8	\N	8536202	2026-07-02 15:50:14.670685
12	\N	11776cccd2104f15ad3a89c707566b93.jpg	at\nPonte\nS\n2 EL SERVICIO GENERAL DE IDENTIFICACION PERSONAL\n® |CN\nas\n-\nCERTIFICA: Que la firma, fotografia\ne impresion pertenece\nw 8536202\n260898\nSA:\nCARLOS ABEL VARGAS BANOS\n_\no\n< Nacido el\n3 de Abril de 1996\n5 En\nPOTOSI - SUD CHICHAS - TUPIZA\n=\n. Estado Civil SOLTERO\nje\nProfesion/Ocupacion ESTUDIANTE UNIVERSITARIO\nDomicilio 8/LA PAMPAAV. LA PAZ-TARWA\n2. er\nSe Sain\nQnr ODD\nPATRIC!\nPAMELA HERMOSA GUTERREZ\nDIREC\n‘ORA GENERAL | EJECUTIVA ai.\nSERVI\nFant ALT) pte\nFAVRENAALE\neX\na	Carlos Abel Vargas Banos	8536202	2026-07-02 15:50:14.670689
13	\N	83aaf8c48e924c09b54a0c4a26300d78.jpg	/ 4 ESTADO Vi. <i.. SACIONAL DE BOLIVIA 7\nPs ] ee i =\nte CEDUl/“ BE IDENTIDAD pe\nx A BIO ud\ny the Whe Wel PN Pia “% Kia vf! ti \\ J\n> No. 8536202 —— Emitidael 21deDiciembrede 2020\n. ago or A NASER OL AES AOC LR MAE ONAL a ae i Fenner\nx . ‘Fowe ae BS eS IR Nt RMON\n7 “a 7 he villi “eee “GRA IGRALOEED mage : BRB Om: AES TADOPL IR NALYDHAL OF 8	\N	8536202	2026-07-02 15:55:09.209786
14	\N	68ad6451469b45e4ba6f7e34804a80f1.jpg	at\nPonte\nS\n2 EL SERVICIO GENERAL DE IDENTIFICACION PERSONAL\n® |CN\nas\n-\nCERTIFICA: Que la firma, fotografia\ne impresion pertenece\nw 8536202\n260898\nSA:\nCARLOS ABEL VARGAS BANOS\n_\no\n< Nacido el\n3 de Abril de 1996\n5 En\nPOTOSI - SUD CHICHAS - TUPIZA\n=\n. Estado Civil SOLTERO\nje\nProfesion/Ocupacion ESTUDIANTE UNIVERSITARIO\nDomicilio 8/LA PAMPAAV. LA PAZ-TARWA\n2. er\nSe Sain\nQnr ODD\nPATRIC!\nPAMELA HERMOSA GUTERREZ\nDIREC\n‘ORA GENERAL | EJECUTIVA ai.\nSERVI\nFant ALT) pte\nFAVRENAALE\neX\na	Carlos Abel Vargas Banos	8536202	2026-07-02 15:55:09.209799
15	\N	12724e0bf21f475aa63904ffc3aa3069.jpg	/ 4 ESTADO Vi. <i.. SACIONAL DE BOLIVIA 7\nPs ] ee i =\nte CEDUl/“ BE IDENTIDAD pe\nx A BIO ud\ny the Whe Wel PN Pia “% Kia vf! ti \\ J\n> No. 8536202 —— Emitidael 21deDiciembrede 2020\n. ago or A NASER OL AES AOC LR MAE ONAL a ae i Fenner\nx . ‘Fowe ae BS eS IR Nt RMON\n7 “a 7 he villi “eee “GRA IGRALOEED mage : BRB Om: AES TADOPL IR NALYDHAL OF 8	\N	8536202	2026-07-02 15:55:39.066907
16	\N	c463acf3b290460cbd55697605ab3899.jpg	at\nPonte\nS\n2 EL SERVICIO GENERAL DE IDENTIFICACION PERSONAL\n® |CN\nas\n-\nCERTIFICA: Que la firma, fotografia\ne impresion pertenece\nw 8536202\n260898\nSA:\nCARLOS ABEL VARGAS BANOS\n_\no\n< Nacido el\n3 de Abril de 1996\n5 En\nPOTOSI - SUD CHICHAS - TUPIZA\n=\n. Estado Civil SOLTERO\nje\nProfesion/Ocupacion ESTUDIANTE UNIVERSITARIO\nDomicilio 8/LA PAMPAAV. LA PAZ-TARWA\n2. er\nSe Sain\nQnr ODD\nPATRIC!\nPAMELA HERMOSA GUTERREZ\nDIREC\n‘ORA GENERAL | EJECUTIVA ai.\nSERVI\nFant ALT) pte\nFAVRENAALE\neX\na	Carlos Abel Vargas Banos	8536202	2026-07-02 15:55:39.066911
17	\N	a2c992746793464fb86411e7741094e8.jpg	/ 4 ESTADO Vi. <i.. SACIONAL DE BOLIVIA 7\nPs ] ee i =\nte CEDUl/“ BE IDENTIDAD pe\nx A BIO ud\ny the Whe Wel PN Pia “% Kia vf! ti \\ J\n> No. 8536202 —— Emitidael 21deDiciembrede 2020\n. ago or A NASER OL AES AOC LR MAE ONAL a ae i Fenner\nx . ‘Fowe ae BS eS IR Nt RMON\n7 “a 7 he villi “eee “GRA IGRALOEED mage : BRB Om: AES TADOPL IR NALYDHAL OF 8	\N	8536202	2026-07-02 16:03:08.768033
18	\N	4c02eb2280784513b9b94cf5331d6b8c.jpg	at\nPonte\nS\n2 EL SERVICIO GENERAL DE IDENTIFICACION PERSONAL\n® |CN\nas\n-\nCERTIFICA: Que la firma, fotografia\ne impresion pertenece\nw 8536202\n260898\nSA:\nCARLOS ABEL VARGAS BANOS\n_\no\n< Nacido el\n3 de Abril de 1996\n5 En\nPOTOSI - SUD CHICHAS - TUPIZA\n=\n. Estado Civil SOLTERO\nje\nProfesion/Ocupacion ESTUDIANTE UNIVERSITARIO\nDomicilio 8/LA PAMPAAV. LA PAZ-TARWA\n2. er\nSe Sain\nQnr ODD\nPATRIC!\nPAMELA HERMOSA GUTERREZ\nDIREC\n‘ORA GENERAL | EJECUTIVA ai.\nSERVI\nFant ALT) pte\nFAVRENAALE\neX\na	Carlos Abel Vargas Banos	8536202	2026-07-02 16:03:08.768038
\.


--
-- TOC entry 4997 (class 0 OID 16563)
-- Dependencies: 224
-- Data for Name: product_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_services (id, name, description, category, price, stock, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5007 (class 0 OID 16658)
-- Dependencies: 234
-- Data for Name: purchase_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_details (id, purchase_id, item_name, quantity, unit_price, subtotal) FROM stdin;
\.


--
-- TOC entry 4999 (class 0 OID 16582)
-- Dependencies: 226
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, supplier_name, purchase_date, total_amount, notes, is_cancelled, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4993 (class 0 OID 16533)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	Administrador
2	Recepcionista
3	Consulta
\.


--
-- TOC entry 5009 (class 0 OID 16677)
-- Dependencies: 236
-- Data for Name: sale_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_details (id, sale_id, product_service_id, description, quantity, unit_price, subtotal) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 16600)
-- Dependencies: 228
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, customer_name, sale_date, payment_method, total_amount, notes, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5003 (class 0 OID 16620)
-- Dependencies: 230
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, hashed_password, is_active, role_id) FROM stdin;
1	admin	$2b$12$lAJDSDd/I2gkanSqmnWcqed3W1mxS80k2erfRGjGXj436Bdk7cXpu	t	1
\.


--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 221
-- Name: guests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guests_id_seq', 1, true);


--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 231
-- Name: ocr_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ocr_documents_id_seq', 18, true);


--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 223
-- Name: product_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_services_id_seq', 1, false);


--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 233
-- Name: purchase_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_details_id_seq', 1, false);


--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 225
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, false);


--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 235
-- Name: sale_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_details_id_seq', 1, false);


--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 227
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 1, false);


--
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 229
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- TOC entry 4809 (class 2606 OID 16558)
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 16650)
-- Name: ocr_documents ocr_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_documents
    ADD CONSTRAINT ocr_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4817 (class 2606 OID 16577)
-- Name: product_services product_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_services
    ADD CONSTRAINT product_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 16669)
-- Name: purchase_details purchase_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT purchase_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 16596)
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 16540)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 16688)
-- Name: sale_details sale_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 16615)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 16630)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 1259 OID 16560)
-- Name: ix_guests_document_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_guests_document_number ON public.guests USING btree (document_number);


--
-- TOC entry 4811 (class 1259 OID 16559)
-- Name: ix_guests_full_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_guests_full_name ON public.guests USING btree (full_name);


--
-- TOC entry 4812 (class 1259 OID 16561)
-- Name: ix_guests_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_guests_id ON public.guests USING btree (id);


--
-- TOC entry 4831 (class 1259 OID 16656)
-- Name: ix_ocr_documents_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_ocr_documents_id ON public.ocr_documents USING btree (id);


--
-- TOC entry 4813 (class 1259 OID 16578)
-- Name: ix_product_services_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_product_services_category ON public.product_services USING btree (category);


--
-- TOC entry 4814 (class 1259 OID 16580)
-- Name: ix_product_services_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_product_services_id ON public.product_services USING btree (id);


--
-- TOC entry 4815 (class 1259 OID 16579)
-- Name: ix_product_services_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_product_services_name ON public.product_services USING btree (name);


--
-- TOC entry 4834 (class 1259 OID 16675)
-- Name: ix_purchase_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchase_details_id ON public.purchase_details USING btree (id);


--
-- TOC entry 4818 (class 1259 OID 16597)
-- Name: ix_purchases_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchases_id ON public.purchases USING btree (id);


--
-- TOC entry 4819 (class 1259 OID 16598)
-- Name: ix_purchases_supplier_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_purchases_supplier_name ON public.purchases USING btree (supplier_name);


--
-- TOC entry 4804 (class 1259 OID 16542)
-- Name: ix_roles_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_roles_id ON public.roles USING btree (id);


--
-- TOC entry 4805 (class 1259 OID 16541)
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- TOC entry 4837 (class 1259 OID 16699)
-- Name: ix_sale_details_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sale_details_id ON public.sale_details USING btree (id);


--
-- TOC entry 4822 (class 1259 OID 16616)
-- Name: ix_sales_customer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sales_customer_name ON public.sales USING btree (customer_name);


--
-- TOC entry 4823 (class 1259 OID 16618)
-- Name: ix_sales_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sales_id ON public.sales USING btree (id);


--
-- TOC entry 4824 (class 1259 OID 16617)
-- Name: ix_sales_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_sales_status ON public.sales USING btree (status);


--
-- TOC entry 4827 (class 1259 OID 16636)
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- TOC entry 4828 (class 1259 OID 16637)
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- TOC entry 4841 (class 2606 OID 16651)
-- Name: ocr_documents ocr_documents_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ocr_documents
    ADD CONSTRAINT ocr_documents_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id);


--
-- TOC entry 4842 (class 2606 OID 16670)
-- Name: purchase_details purchase_details_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_details
    ADD CONSTRAINT purchase_details_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id);


--
-- TOC entry 4843 (class 2606 OID 16694)
-- Name: sale_details sale_details_product_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_product_service_id_fkey FOREIGN KEY (product_service_id) REFERENCES public.product_services(id);


--
-- TOC entry 4844 (class 2606 OID 16689)
-- Name: sale_details sale_details_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_details
    ADD CONSTRAINT sale_details_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- TOC entry 4840 (class 2606 OID 16631)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2026-07-02 23:25:56

--
-- PostgreSQL database dump complete
--

\unrestrict gLCUFKsSw4Ckhy1wPatAUegPXHbHvuAP1DYPBae1MBf1vr1FI7VwwyYbqBypQCT

