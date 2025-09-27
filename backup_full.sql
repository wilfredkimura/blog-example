--
-- PostgreSQL database dump
--

\restrict IgGv67OTAydCoqa0FC7K9KpPJkugJSzfbIbQwHHWn0RfCRsZro8UXycE5Brv3un

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    "postId" text NOT NULL,
    author text NOT NULL,
    content text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    "userId" text
);


--
-- Name: Like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Like" (
    id text NOT NULL,
    "postId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "imageUrl" text,
    "videoUrl" text,
    "kiswahiliTitle" text,
    "kiswahiliContent" text,
    published boolean DEFAULT true NOT NULL,
    "authorId" text NOT NULL,
    likes integer DEFAULT 0 NOT NULL
);


--
-- Name: PostCategory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PostCategory" (
    "postId" text NOT NULL,
    "categoryId" text NOT NULL
);


--
-- Name: PostImage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PostImage" (
    id text NOT NULL,
    "postId" text NOT NULL,
    url text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);


--
-- Name: PostTag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PostTag" (
    "postId" text NOT NULL,
    "tagId" text NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    email text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "passwordHash" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Category" (id, name) FROM stdin;
cmg0sygt10000v65k7xvmywr7	Politics
cmg0sygta0001v65k0988l2d4	Human Rights
cmg0sygtn0003v65kfuoxxw3w	News
cmg0whao10000v6dc2sot39gk	Women's Rights
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Comment" (id, "postId", author, content, date, approved, "userId") FROM stdin;
cmg0y1ffa0006v6dc522o10dr	cmg0x6j3s0003v6dcg1caj84r	admin	test	2025-09-26 14:35:01.079	t	\N
cmg0zrr330002v6kgp4j03g1v	cmg0sygvd000bv65khqqt88yi	Kimura	This is very informative	2025-09-26 15:23:28.863	t	\N
cmg0zs75e0004v6kgsevfetxm	cmg0sygvd000bv65khqqt88yi	Anonymous	Kasongo Must GO	2025-09-26 15:23:49.682	t	\N
cmg194tnt0005v6gcdj66yi59	cmg0sygvd000bv65khqqt88yi	Admin	Test Comment 12 12	2025-09-26 19:45:35.272	t	\N
cmg2h77yr000ev6dkoq6wzue8	cmg1b1p1y000bv6gcwyi2ppns	Admin	Test Comment :)	2025-09-27 16:19:10.226	t	\N
\.


--
-- Data for Name: Like; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Like" (id, "postId", "userId", "createdAt") FROM stdin;
cmg2kebkj0006v63s44uomr1l	cmg0sygvd000bv65khqqt88yi	cmg0sygv40009v65kdj139shx	2025-09-27 17:48:40.339
cmg2keee50008v63s1air35s7	cmg0x6j3s0003v6dcg1caj84r	cmg0sygv40009v65kdj139shx	2025-09-27 17:48:43.997
cmg2ken4w000cv63sygnopmcd	cmg1b1p1y000bv6gcwyi2ppns	cmg0sygv40009v65kdj139shx	2025-09-27 17:48:55.328
cmg2l14ba000ev63s1j9lvocj	cmg1arqof0007v6gcsskxxeis	cmg0sygv40009v65kdj139shx	2025-09-27 18:06:24.022
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, title, content, date, "imageUrl", "videoUrl", "kiswahiliTitle", "kiswahiliContent", published, "authorId", likes) FROM stdin;
cmg0sygvd000bv65khqqt88yi	Youth Activism and Electoral Reforms	<p>Kenya's youth are driving change through grassroots movements and sustained civic engagement. This report explores strategies, challenges, and the road ahead for electoral reforms.</p>	2025-09-26 12:12:44.905	\N	\N	\N	\N	t	cmg0sygv40009v65kdj139shx	1
cmg0x6j3s0003v6dcg1caj84r	test	*test*\n\n\n```\n//example of code snippet\nnpm run dev\n```\n	2025-09-26 14:10:59.512	\N	\N	\N	\N	t	cmg0sygv40009v65kdj139shx	1
cmg1b1p1y000bv6gcwyi2ppns	Changing Hands: What Tullow Oil's Exit Means for Kenya's Oil Dreams	\n\nThis week, a significant development quietly unfolded in Kenya's energy sector, one that has been years in the making and carries profound implications for the nation's economic future: **Tullow Oil officially exited Kenya, selling its entire stake in the long-gestating Turkana oil project.**\n\nAfter 14 years at the helm of Kenya's most ambitious petroleum endeavor, the British oil and gas giant handed over the reins to **Gulf Energy** in a deal reportedly worth approximately Ksh. 16 billion (though the immediate payout was a portion of this, around \\$40 million). On the surface, it might seem like just another corporate transaction, but for Kenya, this changing of the guard could be the catalyst needed to finally bring the dream of commercial oil production closer to reality.\n\n### A Long and Winding Road: The Turkana Project's History\n\nTullow Oil's journey in Kenya began with much fanfare. The discovery of commercially viable oil in Turkana County in **2012** sparked widespread excitement, promising to transform Kenya into an oil-producing nation. Optimism was high, with projections of significant revenue that could fund infrastructure, education, and healthcare.\n\nHowever, the path from discovery to production proved to be far more arduous than anticipated. A confluence of factors contributed to repeated delays:\n\n* **Infrastructure Challenges:** The remote location of the Turkana fields necessitated the construction of a costly 820-kilometer pipeline to the port of Lamu, a project that faced numerous hurdles.\n* **Funding Issues:** Securing the massive investment required for full commercialization proved difficult amidst fluctuating global oil prices and investor caution.\n* **Local Community Concerns:** Negotiations with local communities over land rights, revenue sharing, and environmental impacts were complex and time-consuming.\n* **Operational Hurdles:** Technical challenges and the sheer scale of developing a new oil basin added to the complexity.\n\nThese persistent delays led to frustration both for the government and for Tullow, which found itself increasingly constrained by the project's slow pace and capital requirements.\n\n### Why Now? The Significance of Tullow's Departure\n\nTullow's exit, therefore, isn't just an end; it's potentially a new beginning. For Tullow, it allows them to streamline their portfolio and focus on other assets. For Kenya, it opens the door for a fresh approach.\n\n**What does this mean for Kenya's oil dreams?**\n\n1.  **Renewed Momentum?** Gulf Energy, as the new operator, may bring renewed focus and a different strategy to fast-track the project. As a more localized entity, they might be better positioned to navigate some of the domestic complexities that international firms sometimes struggle with.\n2.  **Investment Opportunities:** This transaction could signal to other investors that the project is moving forward, potentially attracting new capital infusions necessary for the substantial infrastructure development still required.\n3.  **Government Focus:** With a new operator, the Kenyan government might intensify its efforts to provide the necessary support and regulatory framework to push the project to commercialization. The long-awaited Final Investment Decision (FID) is now more critical than ever.\n4.  **Local Impact:** The promise of jobs, local content development, and revenue sharing for Turkana County remains a central tenet of the project. A streamlined path to production could finally deliver on these long-held expectations.\n\n### The Road Ahead: Cautious Optimism\n\nWhile there's a fresh sense of anticipation, the path to commercial oil production in Turkana is still not without its challenges. The need for significant further investment, the construction of the pipeline, and careful management of environmental and community relations remain paramount.\n\nHowever, this week's news marks a pivotal moment. The changing of hands from Tullow Oil to Gulf Energy injects a new dynamic into Kenya's oil narrative. It signifies a potential shift from prolonged anticipation to actionable progression. Kenyans will be watching closely to see if this development finally unlocks the black gold that has long been tantalizingly close, yet frustratingly out of reach.\n\n`\n	2025-09-26 20:39:08.565	\N	\N	\N	\N	t	cmg0sygv40009v65kdj139shx	1
cmg1arqof0007v6gcsskxxeis	A Quiet Revolution: The Ongoing Fight for Women's Rights in Kenya	\n****\nThe story of Kenya is inextricably linked to the struggle for justice, and at the heart of that narrative is the enduring, often challenging, fight for women's rights. From pre-colonial autonomy to the progressive legal framework of today, Kenyan women have been tireless architects of change, chipping away at patriarchal structures to claim their rightful space in society.\n\n### A History of Resilience and Advocacy\n\nKenyan women have a powerful legacy of activism. Before colonialism, women in many communities held significant social and economic influence. However, British rule marginalized women, confining them largely to the domestic sphere and eroding their access to land and resources.\n\nDespite this, women were at the forefront of the fight for independence, with figures like **Mekatilili wa Menza** and **Muthoni wa Kirima** fighting alongside men. Post-independence, the struggle continued, shifting towards political participation and legal reform. A key milestone came in **1963** when Kenyan women gained the right to vote and run for office.\n\nDecades of tireless advocacy by organizations like the **National Council of Women of Kenya (NCWK)** and the **Federation of Women Lawyers in Kenya (FIDA-K)** laid the groundwork for significant legal advancements.\n\n### The Constitutional Turning Point: A Progressive Framework\n\nThe most transformative leap came with the promulgation of the **2010 Constitution of Kenya**. This document is a beacon of gender equality, explicitly guaranteeing non-discrimination and enshrining principles that protect women's rights in various spheres.\n\nKey legal safeguards include:\n\n* **The Two-Thirds Gender Rule:** This constitutional provision mandates that no more than two-thirds of members in elective and appointive bodies shall be of the same gender, aiming to increase women's political representation. While its full implementation in Parliament remains a challenge, it has catalyzed increased participation.\n* **Protection Against Violence:** Laws like the **Sexual Offences Act (2006)** and the **Protection Against Domestic Violence Act (2015)** criminalize various forms of gender-based violence (GBV), offering victims a legal avenue for justice.\n* **Property and Succession:** Legislation such as the **Matrimonial Property Act** and the **Land Act** have sought to correct historical injustices by guaranteeing women equal rights to land ownership, property acquisition, and inheritance.\n\n### The Battle Beyond the Statute Book\n\nDespite this strong legal backbone, a significant gap persists between law and reality. Progress is undeniable, but it is often met with the stubborn resistance of deeply entrenched **patriarchal norms and retrogressive cultural practices.**\n\n#### Major Ongoing Challenges:\n\n1.  **Political Representation:** The full implementation of the two-thirds gender rule remains a contentious political issue. While women's representation in various sectors and county governments has improved, achieving parity in the National Assembly and Senate is a persistent struggle.\n2.  **Gender-Based Violence (GBV):** GBV remains a major crisis. Cultural silence, victim-blaming, and a backlog in the justice system often hinder the prosecution of perpetrators, leaving many women and girls vulnerable.\n3.  **Harmful Cultural Practices:** Practices like **Female Genital Mutilation (FGM)** and **early/child marriage**, particularly in marginalized communities, continue to deny girls their rights to health, education, and bodily autonomy, despite being outlawed.\n4.  **Economic Disparity:** Women, especially those in rural areas, still face unequal access to financial resources, credit, and decision-making power over land and family assets, which stifles their economic empowerment.\n\n### The Way Forward: Collective Action and Unwavering Hope\n\nThe quiet revolution for women's rights in Kenya is far from over, but the momentum is strong. Progress is driven by a vibrant community of civil society organizations, grassroots movements, and dedicated government champions.\n\nThe future of gender equality in Kenya lies in:\n\n* **Sustained Legal Enforcement:** Ensuring that constitutional and legislative provisions are actively implemented, particularly at the community level.\n* **Civic Education:** Empowering women, especially those in rural and marginalized areas, with the knowledge of their rights and the legal tools available to them.\n* **Challenging Patriarchy:** A concerted effort to shift cultural attitudes and dismantle the patriarchal structures that underpin discrimination.\n* **Empowering Grassroots Activists:** Supporting the tireless women and men working on the frontlines to end FGM, child marriage, and GBV.\n\n\n\n\nThe Kenyan woman is a force of resilience, a builder, an activist, and a leader. Her fight for equality is not just a fight for half the population; it is a fight for a more just, prosperous, and equitable Kenya for everyone. The journey is long, but with every challenge, the resolve to reach the constitutional promise of equality only strengthens.\n\n\n\n	2025-09-26 20:31:23.922	/uploads/1758989386277_202012wrd__protest__kenya.jpg	\N	\N	\N	t	cmg0sygv40009v65kdj139shx	1
\.


--
-- Data for Name: PostCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PostCategory" ("postId", "categoryId") FROM stdin;
cmg0sygvd000bv65khqqt88yi	cmg0sygt10000v65k7xvmywr7
cmg0sygvd000bv65khqqt88yi	cmg0sygta0001v65k0988l2d4
cmg1b1p1y000bv6gcwyi2ppns	cmg0sygtn0003v65kfuoxxw3w
cmg0x6j3s0003v6dcg1caj84r	cmg0sygt10000v65k7xvmywr7
cmg1arqof0007v6gcsskxxeis	cmg0whao10000v6dc2sot39gk
\.


--
-- Data for Name: PostImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PostImage" (id, "postId", url, "position") FROM stdin;
cmg2h12ai000av6dkjkoyz0zv	cmg1arqof0007v6gcsskxxeis	/uploads/1758989386277_202012wrd__protest__kenya.jpg	0
\.


--
-- Data for Name: PostTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PostTag" ("postId", "tagId") FROM stdin;
cmg0sygvd000bv65khqqt88yi	cmg0syguw0008v65k6ee834er
cmg0x6j3s0003v6dcg1caj84r	cmg0whsxg0001v6dcnioghpxq
cmg1arqof0007v6gcsskxxeis	cmg2g7m2d0000v6o4tr8pzb0w
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subscription" (id, email, date) FROM stdin;
cmg0xr6ej0004v6dcdqygkt5d	kimuramutahi@protonmail.com	2025-09-26 14:27:02.827
cmg2jcuit0000v63ssa8zwsej	test@gmail.com	2025-09-27 17:19:31.971
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tag" (id, name) FROM stdin;
cmg0sygui0006v65kiwnyvvlf	Land Rights
cmg0sygup0007v65kjxfm2mta	Police Reform
cmg0syguw0008v65k6ee834er	Governance
cmg0whsxg0001v6dcnioghpxq	2027 Elections
cmg2g7m2d0000v6o4tr8pzb0w	Gender Violence
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, "emailVerified", image, role, "passwordHash", "createdAt", "updatedAt") FROM stdin;
cmg0sygv40009v65kdj139shx	Admin	admin@example.com	\N	\N	ADMIN	$2b$10$tDb6.c6fhtABrlRiGzc3ke28vjtrHEfVVtErXqXpMIy2j8GjG4Jzm	2025-09-26 12:12:44.896	2025-09-26 12:32:11.106
cmg0zptvs0000v6kgc9maig3b	Kimura	kimura@gmail.com	\N	\N	ADMIN	$2b$10$1fkyi/gK3V8FBj3qpUSZZ.LtzmnRHuFWEI1FOd2Leidc64uhha3Ae	2025-09-26 15:21:59.177	2025-09-26 20:48:28.411
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
23875ed0-7e70-458e-b204-af4c09a8308a	6e720612ac75c45e7f7a3818dcc65afe1a74cf8360dd12037b8b265e6f514f67	2025-09-26 21:33:03.30024+03	20250926183303_init	\N	\N	2025-09-26 21:33:03.217198+03	1
080b3701-a82b-4ea4-b157-9b10e1bde71f	c03028cb0bc5d950121629dbec0d1fbbc7d9419ca8df954cf5c60eddfc57b643	2025-09-26 22:42:54.25239+03	20250926194254_add_likes	\N	\N	2025-09-26 22:42:54.160179+03	1
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Like Like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_pkey" PRIMARY KEY (id);


--
-- Name: PostCategory PostCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostCategory"
    ADD CONSTRAINT "PostCategory_pkey" PRIMARY KEY ("postId", "categoryId");


--
-- Name: PostImage PostImage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostImage"
    ADD CONSTRAINT "PostImage_pkey" PRIMARY KEY (id);


--
-- Name: PostTag PostTag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostTag"
    ADD CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId", "tagId");


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Like_postId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Like_postId_idx" ON public."Like" USING btree ("postId");


--
-- Name: Like_postId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Like_postId_userId_key" ON public."Like" USING btree ("postId", "userId");


--
-- Name: PostImage_postId_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PostImage_postId_position_idx" ON public."PostImage" USING btree ("postId", "position");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Subscription_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Subscription_email_key" ON public."Subscription" USING btree (email);


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Comment Comment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Like Like_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Like Like_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Like"
    ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PostCategory PostCategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostCategory"
    ADD CONSTRAINT "PostCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostCategory PostCategory_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostCategory"
    ADD CONSTRAINT "PostCategory_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostImage PostImage_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostImage"
    ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostTag PostTag_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostTag"
    ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PostTag PostTag_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostTag"
    ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict IgGv67OTAydCoqa0FC7K9KpPJkugJSzfbIbQwHHWn0RfCRsZro8UXycE5Brv3un

