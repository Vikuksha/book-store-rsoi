--
-- PostgreSQL database dump
--

\restrict kSGJ9HZ8xqT0NUQ7mVr4PJFE7eOFY0x7GNvaySUHLwSykRMl5EoZc3E5MlV3O5r

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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

--
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: vladislavlatfulin
--

CREATE TYPE public.order_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public.order_status_enum OWNER TO vladislavlatfulin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: vladislavlatfulin
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO vladislavlatfulin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Basket; Type: TABLE; Schema: public; Owner: vladislavlatfulin
--

CREATE TABLE public."Basket" (
    "ID" bigint NOT NULL,
    "Books_number" integer DEFAULT 1 NOT NULL,
    "Payment" integer DEFAULT 0 NOT NULL,
    "Discount_payment" integer DEFAULT 0 NOT NULL,
    "ID_User" bigint NOT NULL,
    "ID_Book" bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Basket" OWNER TO vladislavlatfulin;

--
-- Name: Basket_ID_seq; Type: SEQUENCE; Schema: public; Owner: vladislavlatfulin
--

CREATE SEQUENCE public."Basket_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Basket_ID_seq" OWNER TO vladislavlatfulin;

--
-- Name: Basket_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vladislavlatfulin
--

ALTER SEQUENCE public."Basket_ID_seq" OWNED BY public."Basket"."ID";


--
-- Name: Book; Type: TABLE; Schema: public; Owner: vladislavlatfulin
--

CREATE TABLE public."Book" (
    "ID" bigint NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Author" character varying(255) NOT NULL,
    "Price" numeric(10,2) NOT NULL,
    "Stock_quantity" integer DEFAULT 0 NOT NULL,
    "Publishing_year" integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Description" text
);


ALTER TABLE public."Book" OWNER TO vladislavlatfulin;

--
-- Name: Book_ID_seq; Type: SEQUENCE; Schema: public; Owner: vladislavlatfulin
--

CREATE SEQUENCE public."Book_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Book_ID_seq" OWNER TO vladislavlatfulin;

--
-- Name: Book_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vladislavlatfulin
--

ALTER SEQUENCE public."Book_ID_seq" OWNED BY public."Book"."ID";


--
-- Name: Order; Type: TABLE; Schema: public; Owner: vladislavlatfulin
--

CREATE TABLE public."Order" (
    "ID" bigint NOT NULL,
    "Total_order_quantity" integer NOT NULL,
    "Order_date" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Currency" integer DEFAULT 1 NOT NULL,
    "Order_status" character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "Tracking_number" character varying(255),
    "ID_User" bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Order" OWNER TO vladislavlatfulin;

--
-- Name: Order_ID_seq; Type: SEQUENCE; Schema: public; Owner: vladislavlatfulin
--

CREATE SEQUENCE public."Order_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_ID_seq" OWNER TO vladislavlatfulin;

--
-- Name: Order_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vladislavlatfulin
--

ALTER SEQUENCE public."Order_ID_seq" OWNED BY public."Order"."ID";


--
-- Name: Order_composition; Type: TABLE; Schema: public; Owner: vladislavlatfulin
--

CREATE TABLE public."Order_composition" (
    "ID" bigint NOT NULL,
    "Books_number" integer DEFAULT 1 NOT NULL,
    "ID_Order" bigint NOT NULL,
    "ID_Book" bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."Order_composition" OWNER TO vladislavlatfulin;

--
-- Name: Order_composition_ID_seq; Type: SEQUENCE; Schema: public; Owner: vladislavlatfulin
--

CREATE SEQUENCE public."Order_composition_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_composition_ID_seq" OWNER TO vladislavlatfulin;

--
-- Name: Order_composition_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vladislavlatfulin
--

ALTER SEQUENCE public."Order_composition_ID_seq" OWNED BY public."Order_composition"."ID";


--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: vladislavlatfulin
--

CREATE TABLE public."Reviews" (
    "ID" bigint NOT NULL,
    "Grade" double precision NOT NULL,
    "Id_Book" bigint NOT NULL,
    "id_User" bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Review" text,
    CONSTRAINT "Reviews_Grade_check" CHECK ((("Grade" >= (1)::double precision) AND ("Grade" <= (5)::double precision)))
);


ALTER TABLE public."Reviews" OWNER TO vladislavlatfulin;

--
-- Name: Reviews_ID_seq; Type: SEQUENCE; Schema: public; Owner: vladislavlatfulin
--

CREATE SEQUENCE public."Reviews_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Reviews_ID_seq" OWNER TO vladislavlatfulin;

--
-- Name: Reviews_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vladislavlatfulin
--

ALTER SEQUENCE public."Reviews_ID_seq" OWNED BY public."Reviews"."ID";


--
-- Name: Users; Type: TABLE; Schema: public; Owner: vladislavlatfulin
--

CREATE TABLE public."Users" (
    "ID" bigint NOT NULL,
    "Email" character varying(500) NOT NULL,
    "Password" character varying(255) NOT NULL,
    "First_name" character varying(255) NOT NULL,
    "Last_name" character varying(255) NOT NULL,
    "Phone" character varying(255) NOT NULL,
    "Address" character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "Role" character varying(255) DEFAULT 'customer'::character varying NOT NULL
);


ALTER TABLE public."Users" OWNER TO vladislavlatfulin;

--
-- Name: Users_ID_seq; Type: SEQUENCE; Schema: public; Owner: vladislavlatfulin
--

CREATE SEQUENCE public."Users_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Users_ID_seq" OWNER TO vladislavlatfulin;

--
-- Name: Users_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: vladislavlatfulin
--

ALTER SEQUENCE public."Users_ID_seq" OWNED BY public."Users"."ID";


--
-- Name: Basket ID; Type: DEFAULT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Basket" ALTER COLUMN "ID" SET DEFAULT nextval('public."Basket_ID_seq"'::regclass);


--
-- Name: Book ID; Type: DEFAULT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Book" ALTER COLUMN "ID" SET DEFAULT nextval('public."Book_ID_seq"'::regclass);


--
-- Name: Order ID; Type: DEFAULT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order" ALTER COLUMN "ID" SET DEFAULT nextval('public."Order_ID_seq"'::regclass);


--
-- Name: Order_composition ID; Type: DEFAULT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order_composition" ALTER COLUMN "ID" SET DEFAULT nextval('public."Order_composition_ID_seq"'::regclass);


--
-- Name: Reviews ID; Type: DEFAULT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Reviews" ALTER COLUMN "ID" SET DEFAULT nextval('public."Reviews_ID_seq"'::regclass);


--
-- Name: Users ID; Type: DEFAULT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Users" ALTER COLUMN "ID" SET DEFAULT nextval('public."Users_ID_seq"'::regclass);


--
-- Data for Name: Basket; Type: TABLE DATA; Schema: public; Owner: vladislavlatfulin
--

COPY public."Basket" ("ID", "Books_number", "Payment", "Discount_payment", "ID_User", "ID_Book", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Book; Type: TABLE DATA; Schema: public; Owner: vladislavlatfulin
--

COPY public."Book" ("ID", "Title", "Author", "Price", "Stock_quantity", "Publishing_year", created_at, updated_at, "Description") FROM stdin;
1	Родныя дзеці. Сказ пра Лысую гару	Ніл Гілевіч	10.56	5	2016	2025-11-09 18:18:43.633271	2025-11-10 01:37:20.102624	По заданию короля-тирана Селена Сардотин, величайшая в Адарланском королевстве женщина-ассасин, отправляется на континент, где магия еще сохранилась, а не исчезла, как в ее родной Эрилее. В планы Селены вовсе не входит исполнять преступные замыслы короля. Она ищет встречи с Маэвой – королевой народа фэ, ведь королева – единственная, кто может ей рассказать о таинственных Ключах Вэрда, созданных расой демонов, чтобы овладеть миром. Но встреча с королевой не приносит разгадки тайны, Селена должна сама ее разгадать, а для этого ей следует обучиться управлять магией...
2	Убийства по алфавиту	Агата Кристи	12.77	10	2019	2025-11-10 01:10:54.725632	2025-11-10 01:49:21.014344	К знаменитому сыщику Эркюлю Пуаро обращается молодая женщина по имени Карла, мать которой шестнадцать лет назад была осуждена за убийство собственного мужа. Ныне Карла собирается выйти замуж и опасается, что дела давно минувших лет могут разрушить ее личную жизнь. При этом она утверждает, что мать никогда не стала бы лгать ей. А та еще шестнадцать лет назад сказала, что невиновна...\nПуаро, увлеченный сложностью загадки, берется за дело – и выясняет, что подозревать в убийстве можно еще пять человек. И хотя прошло столько времени, а вина матери Карлы считается доказанной, мощный интеллект Пуаро берется за работу...
3	Наследница огня	Сара Маас	34.82	10	2024	2025-11-10 01:14:51.701722	2025-11-10 01:50:20.898407	По заданию короля-тирана Селена Сардотин, величайшая в Адарланском королевстве женщина-ассасин, отправляется на континент, где магия еще сохранилась, а не исчезла, как в ее родной Эрилее. В планы Селены вовсе не входит исполнять преступные замыслы короля. Она ищет встречи с Маэвой – королевой народа фэ, ведь королева – единственная, кто может ей рассказать о таинственных Ключах Вэрда, созданных расой демонов, чтобы овладеть миром. Но встреча с королевой не приносит разгадки тайны, Селена должна сама ее разгадать, а для этого ей следует обучиться управлять магией...
4	Стеклянный трон	Сара Маас	30.64	10	2022	2025-11-11 01:41:12.872925	2025-11-11 01:42:59.547648	С детских лет ее учили убивать. К восемнадцати она стала самой известной женщиной-ассасином во всем королевстве. И даже из мрачных каторжных подземелий, куда она была сослана, ее имя продолжает вызывать страх и трепет. Селена Сардотин. Хладнокровная преступница и очаровательная пленница, чьи сила и способности могут понадобиться ее врагам.\n\nНо сначала она должна доказать свое превосходство на турнире в стеклянном замке.\n\nЭто единственный путь к свободе в стране, где по приказу короля уничтожены древние знания и жестоко карается даже простое упоминание о магии. Но магию не вытравить по принуждению, она способна проявляться неожиданно. Как и любовь.
5	Корона полуночи	Сара Маас	33.51	10	2022	2025-11-11 01:46:36.376984	2025-11-11 01:46:36.376984	Победив в жестком состязании, Селена Сардотин, самая известная женщина-ассасин в Ардаланском королевстве, получает титул королевской защитницы. Эта должность почетная и опасная, ведь душа короля чернее смолы, а его железная рука не знает пощады. Селене хорошо это известно, но тайная цель, которую она скрывает даже от самых близких друзей и ради которой одержала победу, превыше любой опасности...
7	Королева теней	Сара Маас	34.82	10	2022	2025-11-11 01:50:22.270836	2025-11-11 01:50:22.270836	Селена Сардотин, наследница террасенского престола, любимица богов, потомок народа фэ, лучшая в мире женщина-ассасин, возвращается под чужим именем в столицу Адарланского королевства, чтобы продолжить борьбу с королем-тираном, поработившим ее страну. Оружие Селены не только верный клинок, она способна управлять магией. Но магия ушла с Эрилейского континента, и первое, что Селене предстоит сделать – высвободить запретные силы, способные помочь ей в справедливой борьбе.
6	Империя бурь	Сара Маас	34.82	10	2023	2025-11-11 01:51:47.930445	2025-11-11 01:51:47.930445	Наследница трона, потомок богини огня, искуснейший в мире ассасин, двадцатилетняя Селена Сардотин под именем Аэлины Галатинии странствует по всему свету в поисках союзников в борьбе с темным властителем Эраваном. Она единственная, кто еще способен противостоять тирану, задумавшему наполнить мир своими чудовищами. Но разве может девушка знать, что Эраван, чтобы сохранить могущество, обратит против Селены ее же прошлое?..
8	Башня рассвета	Сара Маас	34.82	10	2021	2025-11-11 01:52:34.672533	2025-11-11 01:52:34.672533	Шаол Эстфол, капитан королевской гвардии Адарлана и ближайший друг Селены Сардотин, в битве с демонами, захватившими столицу королевства и разрушившими стеклянный замок, получает серьезные увечья.\nЕдинственное, что ему может помочь, – поездка в далекую Аттику, столицу могущественной империи, где в высокой башне обитают искусные целительницы, способные творить чудеса.\nПомимо этого, у Шаола и другая задача – в наступившие тяжелые времена убедить правителя Южного континента объединится с ним в союз против демонов и оказать поддержку соседям. Иначе тьма падет не только на Эрилею, но охватит все земли и континенты.
9	Королевство пепла	Сара Маас	41.78	10	2021	2025-11-11 01:53:39.097773	2025-11-11 01:53:39.097773	Эрилея в опасности. Король демонов Эраван поверг континент в хаос. Селена Сардотин, а ныне Аэлина Галатиния, королева Террасена, поклявшаяся спасти свой народ, стала жертвой королевы Маэвы из рода демонов. Фэйская властительница пленила Аэлину и заточила в железный гроб. Цель Маэвы – выпытать у пленницы, где находятся Ключи Вэрда, древние артефакты, открывающие Врата между миром демонов и миром людей. Но если пленница покорится, и Ключи попадут в руки Маэвы, толпы демонов захлестнут мир и всех, кто дорог Аэлине, ждет неминуемая гибель. Сознание этого придает ей силы, и она решается пойти на крайние меры...
12	Убийство у алтаря	Питер Боланд	23.38	10	2025	2025-11-11 02:00:52.704545	2025-11-11 02:00:52.704545	В одном из зеленых районов Лондона все знают милую старушку Элли Квик, работающую в благотворительном магазинчике. Недавно овдовев, она целыми днями смотрит в окно. Пока в один из вечеров миссис Доуз, которую не так-то легко вывести из равновесия, буквально врывается в дом Элли. Но на то есть веская причина – труп перед церковным алтарем…\nПолиция и мать погибшего убеждены, что Элли видела гораздо больше в ночь убийства, чем говорит. Но бедная старушка никак не может понять, к чему они клонят. Отбиваясь от чересчур назойливого внимания пастора, любящего заботиться о новоиспеченных вдовах, она решает защитить от детективов свою соседку, которую сделали главной подозреваемой, и выяснить правду.\nТолько Элли не знает, что ей стоит быть осторожной. За ней уже следят и готовят ловушку…
13	Круассаны… и парочка убийств	Питер Боланд	24.98	10	2025	2025-11-11 02:01:46.043803	2025-11-11 02:01:46.043803	Рецепт идеального отпуска: круассаны, вино и… убийства!\nДевять месяцев назад Сэйди Грин бросила унылую работу в офисе в пригороде Чикаго и купила французскую компанию по организации велотуров ПеДАли. Теперь она живет жизнью своей мечты в живописной французской деревушке и готова показать друзьям, включая бывшего босса Дома Эпплтона, красоту Франции и велоспорта. Ее тщательно спланированный девятидневный маршрут обещает потрясающие морские пейзажи, восхитительные дегустации вин, горные деревушки и, конечно же, частые остановки на круассаны.\nОднако в самом начале тура Дом, отклонившись от маршрута, погибает и Сэйди чувствует огромную вину. Узнав, что его смерть была не случайностью, а хладнокровным убийством, и понимая, что над ПеДАлями сгущаются тучи, она начинает собственное расследование. Но вскоре погибает еще один турист…\nНеужели среди ее гостей убийца?
14	Рождество Эркюля Пуаро	Агата Кристи	12.55	10	2025	2025-11-11 02:04:53.911427	2025-11-11 02:04:53.911427	На празднование Рождества престарелый миллионер Симеон Ли в кои-то веки решил собрать всю свою многочисленную родню. Но праздник был неожиданно прерван грохотом мебели, за которым последовал ужасный крик. Сбежавшиеся на шум домочадцы обнаружили главу семейства, лежащим в луже крови посреди своего кабинета. На место преступления вызван инспектор Сагден, у которого по счастливой случайности в то время гостил непревзойденный детектив Эркюль Пуаро. Естественно, он тоже приехал в дом Ли, где обнаружил атмосферу всеобщей подозрительности. Миллионера мог убить кто угодно – ибо вся родня втайне ненавидела этого семейного тирана. Улик много, но ни одна из них не указывает ни на кого из присутствующих.
15	Дзікае паляванне караля Стаха	Уладзімір Караткевіч	24.51	10	2025	2025-11-11 02:07:23.324108	2025-11-11 02:07:23.324108	Гістарычны дэтэктыў – адзін з найбольш папулярных твораў класіка беларускай літаратуры Уладзіміра Караткевіча. Створаная паводле класічных канонаў прыгодніцкай рамантыкі, гэтая аповесць мае і нешта сваё, адметнае, нейкую ўласцівую ёй таямніцу-загадку, якую нават цяжка растлумачыць, а можна хіба адчуць.
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: vladislavlatfulin
--

COPY public."Order" ("ID", "Total_order_quantity", "Order_date", "Currency", "Order_status", "Tracking_number", "ID_User", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Order_composition; Type: TABLE DATA; Schema: public; Owner: vladislavlatfulin
--

COPY public."Order_composition" ("ID", "Books_number", "ID_Order", "ID_Book", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: vladislavlatfulin
--

COPY public."Reviews" ("ID", "Grade", "Id_Book", "id_User", created_at, updated_at, "Review") FROM stdin;
1	4.5	1	2	2025-11-11 23:28:10.832226	2025-11-11 23:31:09.760174	Книга 'Родныя дзеці. Сказ пра Лысую гару' захватывает атмосферой мистики и теплой народной мудростью. История читается легко, персонажи живые, а язык передает аутентичность белорусской культуры. Произведение оставляет приятное послевкусие и желание перечитать отдельные моменты.
2	4.8	1	11	2025-11-12 00:12:31.411445	2025-11-12 00:12:31.411445	Поэтичный сказ о родной земле, традициях и душе народа. Книга наполняет теплом, мистикой и ощущением корней.
3	4.8	2	12	2025-11-12 00:16:18.76748	2025-11-12 00:16:18.76748	Захватывающий детектив Агаты Кристи: блестящий ум Пуаро, интрига до последней страницы и мастерски выстроенная логика расследования. Классика жанра!
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: vladislavlatfulin
--

COPY public."Users" ("ID", "Email", "Password", "First_name", "Last_name", "Phone", "Address", created_at, updated_at, "Role") FROM stdin;
1	test@example.com	$2b$10$sShebEYGm5/P2XGIKnrGmOWKiw2hsVr8cnoZ1ygECVNoJquCnOOYG	Тест	Пользователь	+7-999-123-45-67	Москва, ул. Тестовая, 1	2025-10-27 23:20:46.274235	2025-10-27 23:20:46.274235	customer
2	latfulinvladislav@gmail.com	$2b$10$nv5M//lZRtp.7KCaFiRZZOIxw.9RnUTLrcQDZKZIgSU7pG3GqoHAu	vlad	Latfulin	+375298020899	Ymanskaya	2025-10-27 23:24:50.579099	2025-10-27 23:24:50.579099	customer
3	test2@example.com	$2b$10$thjSa6wvBgE62DAnvj5xquZ.bkeKl/3q.u7Qshe2hTIugwwqq7zuG	Тест2	Пользователь2	+7-999-123-45-68	Москва, ул. Тестовая, 2	2025-10-27 23:30:48.128963	2025-10-27 23:30:48.128963	customer
4	admin@bookstore.com	$2b$10$mXAyZIln9l.3LEmoosvyVu2IzrWmL1wg.NC5TpmHhbey7.NAKcKiO	Admin	User	+0-000-000-00-00	Admin Panel	2025-10-31 01:42:56.379376	2025-10-31 01:42:56.379376	customer
5	admin	$2b$10$mXAyZIln9l.3LEmoosvyVu2IzrWmL1wg.NC5TpmHhbey7.NAKcKiO	admin	admin	111111111	admin	2025-10-31 01:42:56.38547	2025-10-31 01:42:56.38547	customer
8	user1@bookstore.com	$2b$10$rQZ8K9vX7wE2nF3mG4hI5uV6xC7yD8zA9bB0cC1dD2eE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4	Иван	Иванов	+7-999-234-56-78	Санкт-Петербург, ул. Пользовательская, 2	2025-11-09 17:10:55.662694	2025-11-09 17:10:55.662694	customer
9	user2@bookstore.com	$2b$10$rQZ8K9vX7wE2nF3mG4hI5uV6xC7yD8zA9bB0cC1dD2eE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4	Мария	Петрова	+7-999-345-67-89	Казань, ул. Книжная, 3	2025-11-09 17:10:55.662694	2025-11-09 17:10:55.662694	customer
10	customer@bookstore.com	$2b$10$rQZ8K9vX7wE2nF3mG4hI5uV6xC7yD8zA9bB0cC1dD2eE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ4	Алексей	Сидоров	+7-999-456-78-90	Екатеринбург, ул. Покупательская, 4	2025-11-09 17:10:55.662694	2025-11-09 17:10:55.662694	customer
11	crisronalt@gmail.com	$2b$10$5sEb42RVzFUm7XINoASej.MZ9qRk1cE5REz1glphTQC6gbDWoa1d6	cris	ronalt	+375297569878	Minsk	2025-11-12 00:02:49.899364	2025-11-12 00:02:49.899364	customer
12	leonwilf@hmail.com	$2b$10$slNJ3VOIx4VfrH5ro6wMyuxsj/y.0YpgG73vYpiE8SEoVbQTcBWPO	leon	wilf	+375337752563	Brest	2025-11-12 00:04:08.616282	2025-11-12 00:04:08.616282	customer
13	maxmikhailov@gmail.com	$2b$10$VXK99uIXCFjaNL1WbEaRs.BYNtRezqcLlwXCVsezcQexpzFvxqB8i	max	mikhailov	+375443667844	Kazan	2025-11-12 00:05:11.472403	2025-11-12 00:05:11.472403	customer
\.


--
-- Name: Basket_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: vladislavlatfulin
--

SELECT pg_catalog.setval('public."Basket_ID_seq"', 1, false);


--
-- Name: Book_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: vladislavlatfulin
--

SELECT pg_catalog.setval('public."Book_ID_seq"', 16, true);


--
-- Name: Order_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: vladislavlatfulin
--

SELECT pg_catalog.setval('public."Order_ID_seq"', 1, false);


--
-- Name: Order_composition_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: vladislavlatfulin
--

SELECT pg_catalog.setval('public."Order_composition_ID_seq"', 1, false);


--
-- Name: Reviews_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: vladislavlatfulin
--

SELECT pg_catalog.setval('public."Reviews_ID_seq"', 1, false);


--
-- Name: Users_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: vladislavlatfulin
--

SELECT pg_catalog.setval('public."Users_ID_seq"', 13, true);


--
-- Name: Basket Basket_pkey; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_pkey" PRIMARY KEY ("ID");


--
-- Name: Book Book_pkey; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_pkey" PRIMARY KEY ("ID");


--
-- Name: Order_composition Order_composition_pkey; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order_composition"
    ADD CONSTRAINT "Order_composition_pkey" PRIMARY KEY ("ID");


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("ID");


--
-- Name: Reviews Reviews_Id_Book_id_User_key; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_Id_Book_id_User_key" UNIQUE ("Id_Book", "id_User");


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY ("ID");


--
-- Name: Users Users_Email_key; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_Email_key" UNIQUE ("Email");


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("ID");


--
-- Name: idx_basket_book; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_basket_book ON public."Basket" USING btree ("ID_Book");


--
-- Name: idx_basket_user; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_basket_user ON public."Basket" USING btree ("ID_User");


--
-- Name: idx_book_author; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_book_author ON public."Book" USING btree ("Author");


--
-- Name: idx_book_title; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_book_title ON public."Book" USING btree ("Title");


--
-- Name: idx_order_composition_book; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_order_composition_book ON public."Order_composition" USING btree ("ID_Book");


--
-- Name: idx_order_composition_order; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_order_composition_order ON public."Order_composition" USING btree ("ID_Order");


--
-- Name: idx_order_status; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_order_status ON public."Order" USING btree ("Order_status");


--
-- Name: idx_order_user; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_order_user ON public."Order" USING btree ("ID_User");


--
-- Name: idx_reviews_book; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_reviews_book ON public."Reviews" USING btree ("Id_Book");


--
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_reviews_user ON public."Reviews" USING btree ("id_User");


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_users_email ON public."Users" USING btree ("Email");


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: vladislavlatfulin
--

CREATE INDEX idx_users_phone ON public."Users" USING btree ("Phone");


--
-- Name: Basket update_basket_updated_at; Type: TRIGGER; Schema: public; Owner: vladislavlatfulin
--

CREATE TRIGGER update_basket_updated_at BEFORE UPDATE ON public."Basket" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Book update_book_updated_at; Type: TRIGGER; Schema: public; Owner: vladislavlatfulin
--

CREATE TRIGGER update_book_updated_at BEFORE UPDATE ON public."Book" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Order_composition update_order_composition_updated_at; Type: TRIGGER; Schema: public; Owner: vladislavlatfulin
--

CREATE TRIGGER update_order_composition_updated_at BEFORE UPDATE ON public."Order_composition" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Order update_order_updated_at; Type: TRIGGER; Schema: public; Owner: vladislavlatfulin
--

CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON public."Order" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Reviews update_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: vladislavlatfulin
--

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public."Reviews" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: vladislavlatfulin
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public."Users" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: Basket Basket_ID_Book_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_ID_Book_fkey" FOREIGN KEY ("ID_Book") REFERENCES public."Book"("ID") ON DELETE CASCADE;


--
-- Name: Basket Basket_ID_User_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Basket"
    ADD CONSTRAINT "Basket_ID_User_fkey" FOREIGN KEY ("ID_User") REFERENCES public."Users"("ID") ON DELETE CASCADE;


--
-- Name: Order Order_ID_User_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_ID_User_fkey" FOREIGN KEY ("ID_User") REFERENCES public."Users"("ID") ON DELETE CASCADE;


--
-- Name: Order_composition Order_composition_ID_Book_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order_composition"
    ADD CONSTRAINT "Order_composition_ID_Book_fkey" FOREIGN KEY ("ID_Book") REFERENCES public."Book"("ID") ON DELETE CASCADE;


--
-- Name: Order_composition Order_composition_ID_Order_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Order_composition"
    ADD CONSTRAINT "Order_composition_ID_Order_fkey" FOREIGN KEY ("ID_Order") REFERENCES public."Order"("ID") ON DELETE CASCADE;


--
-- Name: Reviews Reviews_Id_Book_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_Id_Book_fkey" FOREIGN KEY ("Id_Book") REFERENCES public."Book"("ID") ON DELETE CASCADE;


--
-- Name: Reviews Reviews_id_User_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vladislavlatfulin
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_id_User_fkey" FOREIGN KEY ("id_User") REFERENCES public."Users"("ID") ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict kSGJ9HZ8xqT0NUQ7mVr4PJFE7eOFY0x7GNvaySUHLwSykRMl5EoZc3E5MlV3O5r

