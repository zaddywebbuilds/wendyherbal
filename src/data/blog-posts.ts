/**
 * Blog post data for Wendy Herbals.
 *
 * Content targets the specific phrases Nigerians type into search engines
 * ("ewuro", "dongoyaro", "zobo", "atale pupa", etc.) while staying inside
 * the health-claims boundaries described in HANDOFF.md.
 *
 * To add a post, append to BLOG_POSTS and redeploy. For daily auto-posts,
 * a build-time script should insert new entries here and push a commit.
 *
 * Section types:
 *   p       — paragraph
 *   h2      — section heading
 *   h3      — sub-heading
 *   list    — bullet list (items[])
 *   callout — coloured aside (tone: note | caution | pending)
 *   cta     — product call-to-action card
 */

export type BlogSectionType = "p" | "h2" | "h3" | "list" | "callout" | "cta";

export interface BlogSection {
  type: BlogSectionType;
  content?: string;
  items?: string[];
  title?: string;
  tone?: "note" | "caution" | "pending";
  href?: string;
  ctaLabel?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverSrc: string;
  coverAlt: string;
  keywords: string[];
  sections: BlogSection[];
}

export const BLOG_CATEGORIES = [
  "Herb Guide",
  "Women's Wellness",
  "Men's Wellness",
  "Kitchen & Spices",
  "Body Care",
  "General Wellness",
] as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "bitter-leaf-ewuro-health-benefits-nigeria",
    title: "Bitter Leaf (Ewuro): Health Benefits and How Nigerians Use It",
    excerpt:
      "Bitter leaf — called ewuro in Yoruba, onugbu in Igbo, and shakwa shiwa in Hausa — is one of the most widely used medicinal plants in Nigeria. Here is what research says about how it works.",
    category: "Herb Guide",
    publishedAt: "2026-11-09",
    coverSrc: "/media/brand/dried-herbs-and-hibiscus-bowls.jpg",
    coverAlt: "Dried botanicals and hibiscus in steel bowls on a work surface",
    keywords: [
      "bitter leaf health benefits Nigeria",
      "ewuro uses",
      "bitter leaf for diabetes Nigeria",
      "onugbu benefits",
      "vernonia amygdalina Nigeria",
      "bitter leaf for malaria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Walk through any Nigerian market and you will find fresh bitter leaf bundled beside the tomatoes and peppers. Called ewuro in Yoruba, onugbu in Igbo, and shakwa shiwa in Hausa, Vernonia amygdalina is a small shrub whose leaves carry a distinctive sharp taste that softens when washed or squeezed. It goes into egusi soup, bitter leaf soup, and ofe onugbu, but Nigerians have used it medicinally for generations.",
      },
      {
        type: "h2",
        content: "What bitter leaf contains",
      },
      {
        type: "p",
        content:
          "Laboratory analyses show that bitter leaf leaves contain flavonoids, alkaloids, terpenes, and saponins. These are the same classes of compounds found in many plant-based medicines. The bitterness comes primarily from sesquiterpene lactones, which also appear to carry much of the plant's biological activity.",
      },
      {
        type: "h2",
        content: "How Nigerians use it traditionally",
      },
      {
        type: "list",
        items: [
          "Pressed juice: fresh leaves are washed, squeezed, and the dark-green juice is drunk directly or diluted with water.",
          "In soups: leaves are washed repeatedly to reduce bitterness, then cooked. The bitter compounds survive cooking in lower concentrations.",
          "As a tonic: dried leaves are steeped in water or local gin (ogogoro) overnight and drunk in small quantities.",
          "Topical: squeezed leaf paste is applied to skin to soothe rashes and wounds.",
        ],
      },
      {
        type: "h2",
        content: "What research suggests",
      },
      {
        type: "p",
        content:
          "Several peer-reviewed studies, many conducted in Nigerian universities, have explored bitter leaf in cell cultures and animal models. Research has looked at its effect on blood glucose regulation, its antimicrobial activity against common pathogens, and its antioxidant capacity. Results are promising but most work has not yet progressed to large-scale human clinical trials, so conclusions should be treated as preliminary.",
      },
      {
        type: "p",
        content:
          "Some studies have specifically examined bitter leaf's traditional use in managing symptoms associated with malaria and diabetes, two of the most prevalent health concerns in Nigeria. The activity observed in laboratory settings provides a scientific basis for why the plant has remained in use, though it does not confirm clinical effectiveness at the doses people typically consume.",
      },
      {
        type: "h2",
        content: "Bitter leaf and digestion",
      },
      {
        type: "p",
        content:
          "The bitter compounds in ewuro stimulate digestive secretions, which is part of why bitter leaf soup is considered good after a heavy meal. Many Nigerians use fresh bitter leaf juice to ease bloating, stomach cramps, and sluggish digestion. This use is consistent with the broader pharmacological class of bitters, which have a long history in both African and European herbal medicine.",
      },
      {
        type: "h2",
        content: "Fertility and reproductive health",
      },
      {
        type: "p",
        content:
          "Bitter leaf is widely associated with reproductive health in Nigeria. Women use it to encourage regular menstruation and ease discomfort around the cycle. The plant contains compounds that have shown uterine activity in animal studies, which may explain the traditional use — though this also means it is usually avoided during pregnancy.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "Important",
        content:
          "Bitter leaf should not be consumed in large medicinal quantities during pregnancy. If you are on medication for diabetes, hypertension, or any chronic condition, speak to a healthcare professional before adding bitter leaf as a supplement, as it may interact with your treatment.",
      },
      {
        type: "h2",
        content: "How to get the most from bitter leaf",
      },
      {
        type: "list",
        items: [
          "Fresh juice: wash leaves thoroughly, squeeze firmly into a cup, dilute with water to taste. Many people drink a small glass before breakfast.",
          "In cooking: wash the leaves several times before adding to soup — the washing removes excess bitterness and some of the more concentrated compounds.",
          "Dried powder: easier to store than fresh leaf. Used in smaller amounts since the flavour and potency are more concentrated.",
          "Combination: bitter leaf is often combined with scent leaf (efirin) in Nigerian tonic preparations.",
        ],
      },
      {
        type: "cta",
        title: "Browse our Herbal Collections",
        content:
          "Wendy Herbals carries botanical preparations for everyday Nigerian wellness, made in small batches.",
        href: "/shop?category=herbal-collections",
        ctaLabel: "Shop Herbal Collections",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This article is for general information only. It describes traditional use and published research; it is not medical advice and does not recommend any product as a treatment for any condition.",
      },
    ],
  },

  {
    slug: "moringa-benefits-nigeria-what-research-says",
    title: "Moringa: What Research Actually Says About Nigeria's Miracle Tree",
    excerpt:
      "Moringa oleifera — called the miracle tree, drumstick tree, or ewe ile in Yoruba — is one of the most studied plants in Africa. Here is what the science shows, and where it falls short.",
    category: "Herb Guide",
    publishedAt: "2026-11-08",
    coverSrc: "/media/brand/scent-leaf-plant.jpg",
    coverAlt: "Scent leaf, known as efirin in Nigeria, growing in full green leaf",
    keywords: [
      "moringa benefits Nigeria",
      "moringa oleifera Nigeria",
      "moringa for diabetes",
      "moringa for fertility",
      "ewe ile uses",
      "moringa leaves benefits",
      "miracle tree Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Moringa oleifera has been used in Nigeria and across sub-Saharan Africa for centuries. The leaves, seeds, bark, and roots all have traditional medicinal uses, and the nutritional profile of the leaves — high in vitamins A, C, and B6, plus calcium, iron, and protein — is remarkably dense for a leafy plant. That nutritional density is probably where the nickname 'miracle tree' began.",
      },
      {
        type: "h2",
        content: "What moringa leaves contain",
      },
      {
        type: "p",
        content:
          "Fresh moringa leaves are rich in antioxidants including quercetin, chlorogenic acid, and beta-carotene. Dried moringa powder concentrates these nutrients, making it a popular supplement. The plant also contains isothiocyanates, which are sulphur-containing compounds also found in broccoli and are under investigation for anti-inflammatory effects.",
      },
      {
        type: "h2",
        content: "What Nigerian researchers have studied",
      },
      {
        type: "list",
        items: [
          "Blood sugar management: several small studies in Nigeria and other countries have found that moringa leaf powder may reduce fasting blood glucose in people with type 2 diabetes, possibly by slowing carbohydrate digestion.",
          "Inflammation: laboratory work shows that moringa extracts inhibit inflammatory markers. Human studies are still limited.",
          "Liver health: animal studies show protective effects against liver damage caused by certain toxins.",
          "Breast milk production: moringa is widely used by nursing mothers in Nigeria to support milk supply. Some small clinical trials support this traditional use.",
          "Cholesterol: early evidence suggests moringa may lower LDL cholesterol, though large trials are needed.",
        ],
      },
      {
        type: "h2",
        content: "Moringa and fertility",
      },
      {
        type: "p",
        content:
          "Moringa is frequently mentioned in Nigerian discussions about fertility support, for both men and women. For men, some studies have looked at moringa seed oil's effect on sperm quality. For women, the high folate content in moringa leaves makes it nutritionally relevant during pre-conception and early pregnancy. However, moringa root and bark are traditionally associated with uterine stimulation and are advised against during pregnancy itself.",
      },
      {
        type: "h2",
        content: "How Nigerians use moringa",
      },
      {
        type: "list",
        items: [
          "Fresh leaves in soup: added like spinach at the end of cooking to preserve nutrients.",
          "Moringa powder: a teaspoon stirred into pap (akamu), smoothies, or water.",
          "Moringa tea: dried leaves steeped in hot water for 5–10 minutes.",
          "In egusi and vegetable soups: leaves added for nutritional value and flavour.",
        ],
      },
      {
        type: "h2",
        content: "What to watch for",
      },
      {
        type: "p",
        content:
          "Moringa leaves and powder are generally considered safe in food quantities. Concerns arise with high-dose supplements and with the root and bark, which have different — and stronger — biological activity than the leaves. Pregnant women are advised to avoid medicinal doses of moringa bark and root. People on diabetes or blood pressure medication should monitor carefully and inform their doctor, since moringa may add to the effect of those medicines.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "During pregnancy",
        content:
          "Moringa leaf in food amounts is generally considered safe, but medicinal-dose moringa supplements and moringa root or bark should be avoided during pregnancy. Always consult a healthcare professional.",
      },
      {
        type: "cta",
        title: "Natural wellness at Wendy Herbals",
        content:
          "Browse our botanical preparations, crafted in small batches using traditional Nigerian formulations.",
        href: "/shop?category=herbal-collections",
        ctaLabel: "Shop Herbal Collections",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information, not medical advice. It does not recommend any product as a treatment for any medical condition.",
      },
    ],
  },

  {
    slug: "zobo-hibiscus-blood-pressure-nigeria",
    title: "Zobo for Blood Pressure: What Nigerian Research Shows",
    excerpt:
      "Zobo — made from dried hibiscus calyces — is one of the most popular drinks in Nigeria. Research suggests it may support healthy blood pressure. Here is what the studies show and how to use it.",
    category: "General Wellness",
    publishedAt: "2026-11-07",
    coverSrc: "/media/brand/dried-herbs-and-hibiscus-bowls.jpg",
    coverAlt: "Dried hibiscus calyces in a steel bowl alongside other dried herbs",
    keywords: [
      "zobo for blood pressure",
      "zobo drink health benefits",
      "hibiscus tea blood pressure Nigeria",
      "zobo for hypertension Nigeria",
      "hibiscus for high blood pressure",
      "how to make zobo for blood pressure",
      "zobo benefits and side effects Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Zobo is made by steeping dried Hibiscus sabdariffa calyces in hot or cold water, then sweetening with sugar and spicing with ginger, pineapple, or cloves. It is tart, deep red, and common at Nigerian celebrations, roadside stalls, and in homes. What many people do not know is that of all the traditional Nigerian drinks, zobo has the most robust clinical evidence behind it — particularly for blood pressure.",
      },
      {
        type: "h2",
        content: "What is in zobo that affects blood pressure?",
      },
      {
        type: "p",
        content:
          "The red colour of zobo comes from anthocyanins, a class of polyphenol antioxidants. Hibiscus calyces are also rich in organic acids including citric, malic, and hibiscus acid. Research suggests these compounds may inhibit an enzyme called ACE (angiotensin-converting enzyme) — the same enzyme that many blood pressure drugs target. This is likely how hibiscus achieves its observed antihypertensive effect.",
      },
      {
        type: "h2",
        content: "What the clinical research shows",
      },
      {
        type: "p",
        content:
          "Several randomised controlled trials — the strongest type of human study — have found that drinking hibiscus tea daily lowers systolic blood pressure in people with mild to moderate hypertension. A 2010 study published in the Journal of Nutrition found a significant reduction in systolic blood pressure after six weeks. A Cochrane review of hibiscus tea and blood pressure concluded that the evidence is promising but that larger, more rigorous trials are still needed.",
      },
      {
        type: "p",
        content:
          "Nigerian studies conducted at teaching hospitals have also investigated zobo's antihypertensive effects in local populations, with generally consistent results. The effect appears modest compared to pharmaceutical antihypertensives and is not a substitute for prescribed medication.",
      },
      {
        type: "h2",
        content: "How to make zobo for blood pressure support",
      },
      {
        type: "list",
        items: [
          "Use dried hibiscus calyces, not the artificial zobo powder sachets sold in markets — the powder often contains very little actual hibiscus.",
          "Add a large handful (about 50g) of dried calyces to 1 litre of water.",
          "Bring to the boil, then simmer for 10 minutes.",
          "Allow to cool before straining.",
          "Sweeten lightly — excess sugar works against the cardiovascular benefit.",
          "Fresh ginger (a thumb-sized piece, sliced) adds flavour and additional anti-inflammatory compounds.",
          "Studies typically used about 2 cups (500ml) per day.",
        ],
      },
      {
        type: "h2",
        content: "Other health associations with zobo",
      },
      {
        type: "list",
        items: [
          "Cholesterol: some studies suggest zobo may lower LDL and total cholesterol.",
          "Antioxidant protection: the anthocyanins in hibiscus are potent free-radical scavengers.",
          "Liver health: animal research suggests hepatoprotective effects, though human evidence is limited.",
          "Weight management: zobo is low in calories and may help with fluid balance.",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Important interactions",
        content:
          "Hibiscus can interact with hydrochlorothiazide and other diuretics, as well as some diabetes medications. If you are on blood pressure or diabetes treatment, do not use zobo as a supplement without telling your doctor. It is not a substitute for prescribed antihypertensives.",
      },
      {
        type: "h2",
        content: "What to avoid when buying hibiscus",
      },
      {
        type: "p",
        content:
          "Dried hibiscus calyces sold in Nigerian markets vary enormously in quality. Look for a deep burgundy-red colour and a sharp, tart smell. Very dark brown or faded-pink calyces have usually been poorly stored. The artificial zobo drink powders sold in sachets typically contain food colouring, artificial flavour, and very little actual hibiscus — they will not give the same effect.",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information, not medical advice. It does not replace professional medical assessment or treatment.",
      },
    ],
  },

  {
    slug: "dongoyaro-neem-traditional-uses-nigeria",
    title: "Dongoyaro (Neem): Traditional Uses in Nigerian Homes",
    excerpt:
      "Dongoyaro is so common across Nigeria that many people have one growing in their compound without knowing its full range of traditional uses. Here is how it has been used and what science has found.",
    category: "Herb Guide",
    publishedAt: "2026-11-06",
    coverSrc: "/media/brand/ground-herb-powders.jpg",
    coverAlt: "Ground herb powders in red, turmeric yellow and green in a steel bowl",
    keywords: [
      "dongoyaro uses Nigeria",
      "neem tree benefits Nigeria",
      "dongoyaro for malaria",
      "neem leaf tea benefits Nigeria",
      "azadirachta indica Nigeria",
      "dongoyaro for skin",
      "neem for infections Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Azadirachta indica — called dongoyaro in Hausa and Yoruba, and known globally as neem — is one of the most recognisable trees in Nigeria. Its branches are sold in markets as chewing sticks for oral health, its leaves are boiled into tea, and its oil is pressed for skin and hair use. The tree is so prevalent and so well-regarded that it is often planted at the entrance of compounds as a protective and medicinal presence.",
      },
      {
        type: "h2",
        content: "What makes neem medicinally active",
      },
      {
        type: "p",
        content:
          "Neem contains more than 150 biologically active compounds, including azadirachtin, nimbin, nimbidin, and gedunin. These compounds show antibacterial, antifungal, antiviral, anti-inflammatory, and anthelmintic activity in laboratory studies. Neem is one of the few medicinal plants where the evidence spans from traditional use through laboratory research to some clinical investigation.",
      },
      {
        type: "h2",
        content: "How Nigerians use dongoyaro traditionally",
      },
      {
        type: "list",
        items: [
          "Malaria tea: fresh or dried leaves are boiled and the tea drunk for fever and malaria symptoms. This is one of the most widespread uses across all parts of Nigeria.",
          "Chewing stick: neem twigs are used to brush teeth. The antibacterial activity of neem is well-documented and is the basis for several commercial toothpastes.",
          "Skin conditions: leaf paste or neem oil applied to acne, ringworm, eczema, and scabies. Neem's antifungal and antibacterial properties support these uses.",
          "Internal parasites: dongoyaro leaf tea is used as an antiparasitic, particularly for intestinal worms.",
          "Wound healing: crushed leaves applied to cuts and bruises to prevent infection.",
          "Insect repellent: dried leaves stored with clothes and grains, or burned as a mosquito deterrent.",
        ],
      },
      {
        type: "h2",
        content: "Neem and malaria",
      },
      {
        type: "p",
        content:
          "The use of neem for malaria is so widespread in Nigeria that it has been studied extensively. Neem leaf compounds show activity against Plasmodium falciparum in laboratory settings, particularly gedunin and limonoids. However, neem tea is significantly less potent than artemisinin-based combination therapies (ACTs), which are the current standard of care for malaria. It is important not to delay proven treatment while trying herbal remedies for a confirmed or suspected malaria infection.",
      },
      {
        type: "h2",
        content: "Neem for skin problems",
      },
      {
        type: "p",
        content:
          "This is probably where neem's clinical evidence is strongest. Its antifungal activity against Candida species and its antibacterial action against Staphylococcus aureus and Streptococcus — two of the most common causes of skin infections — have been confirmed in multiple studies. Neem oil is a recognized component in several medically licensed dermatology preparations. For common skin conditions like pimples, dandruff, athlete's foot, and ringworm, the evidence is reasonably solid.",
      },
      {
        type: "h2",
        content: "How to prepare neem leaf tea",
      },
      {
        type: "list",
        items: [
          "Gather a handful of fresh neem leaves (about 20-25 leaves) or use dried leaves.",
          "Rinse well under running water.",
          "Add to 500ml of water and bring to a boil.",
          "Reduce heat and simmer for 10 minutes.",
          "Allow to cool, then strain.",
          "The tea is very bitter — this is normal. Honey can be added to taste.",
          "Traditional dosage is one small cup (about 100–150ml) once or twice daily during illness.",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Important cautions",
        content:
          "Neem should not be given to infants or young children — high doses have caused serious complications in small children. It should be avoided during pregnancy. Neem oil should not be taken internally. Do not use neem leaf tea as an alternative to malaria treatment — seek confirmed diagnosis and proper medication.",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information about traditional use, not medical advice or a treatment recommendation.",
      },
    ],
  },

  {
    slug: "herbs-for-female-fertility-nigeria",
    title: "Natural Herbs for Female Fertility: What Nigerians Use and What Research Shows",
    excerpt:
      "Many Nigerian women use herbal preparations alongside conventional care when trying to conceive. This guide covers the herbs most commonly used for female fertility support in Nigeria and what the evidence shows.",
    category: "Women's Wellness",
    publishedAt: "2026-11-05",
    coverSrc: "/media/brand/measuring-herbal-preparation.jpg",
    coverAlt: "Wendy measuring herbal preparation at her desk",
    keywords: [
      "herbs for female fertility Nigeria",
      "how to boost fertility naturally Nigeria",
      "herbal remedy for fertility Nigeria",
      "natural fertility herbs Nigeria",
      "herbs to get pregnant Nigeria",
      "herbal treatment for infertility Nigeria",
      "women fertility herbs Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Fertility is one of the most emotionally significant health concerns for many Nigerian women and families. The pressure is real, and it is not surprising that many women explore every available option, including traditional herbal preparations that have been used in Nigerian communities for generations. This article covers the herbs most commonly associated with female fertility support in Nigeria, what they contain, and what research has found about how they work.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Before you start",
        content:
          "Infertility has many causes. For the best outcome, speak to a gynaecologist to understand the specific cause in your case before choosing any herbal approach. Many conditions that affect fertility (blocked tubes, fibroids, hormonal imbalances, PCOS) respond differently to different interventions.",
      },
      {
        type: "h2",
        content: "Bitter leaf (Ewuro)",
      },
      {
        type: "p",
        content:
          "Bitter leaf is the herb most commonly recommended in Nigerian herbal practice for female fertility. The traditional use centres on regulating the menstrual cycle and supporting hormonal balance. Some animal studies have found that Vernonia amygdalina extracts influence estrogen activity and uterine function. The leaves contain phytoestrogens — plant compounds with mild estrogen-like activity — which may explain why the plant is so widely associated with reproductive health.",
      },
      {
        type: "h2",
        content: "Moringa (Ewe ile)",
      },
      {
        type: "p",
        content:
          "Moringa's relevance to fertility is primarily nutritional. Its exceptionally high folate content is relevant for women trying to conceive — folate is well-established as essential for preventing neural tube defects in early pregnancy. Moringa also contains zinc and iron, both important for reproductive health. Some practitioners recommend moringa as a nutritional foundation rather than a direct fertility stimulant.",
      },
      {
        type: "h2",
        content: "Ashwagandha (Indian ginseng)",
      },
      {
        type: "p",
        content:
          "Ashwagandha has become increasingly available in Nigerian herbal markets. It is an adaptogen — a herb that may help the body manage stress — and is associated with balancing cortisol, the stress hormone. Elevated cortisol can disrupt ovulation and menstruation. Small clinical studies have found that ashwagandha supplementation improves hormonal balance and sexual function in women, though more research is needed specifically for fertility.",
      },
      {
        type: "h2",
        content: "Vitex (Chaste tree berry)",
      },
      {
        type: "p",
        content:
          "Vitex agnus-castus is not traditionally Nigerian, but it has become widely used in Nigerian herbal practice over the last decade. It works on the pituitary gland to increase progesterone activity relative to estrogen, making it most relevant for women with luteal phase defects or irregular cycles. Several small clinical trials show improved cycle regularity and pregnancy rates in women with irregular cycles. It typically needs to be used for at least three months to show effect.",
      },
      {
        type: "h2",
        content: "Egungun-ogun (Costus afer)",
      },
      {
        type: "p",
        content:
          "Costus afer — called egungun-ogun or monkey sugar cane in some parts of Nigeria — is used in Yoruba herbal medicine for reproductive health. Research has found anti-inflammatory compounds in the plant that may support uterine health. It is often combined with other herbs in traditional tonic preparations.",
      },
      {
        type: "h2",
        content: "What actually works: managing expectations",
      },
      {
        type: "p",
        content:
          "The evidence for herbal fertility treatments in humans is generally preliminary — most studies are small, short-term, and do not meet the standards required for pharmaceutical approval. This does not mean the herbs do not work; it means the research has not yet proved that they do at the level required by modern medicine. Many women in Nigeria use herbal preparations alongside standard fertility treatment, not instead of it. If you are working with a gynaecologist or fertility specialist, tell them what you are taking.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "During early pregnancy",
        content:
          "Several herbs used to stimulate menstruation or regulate the cycle — including bitter leaf, moringa bark and root, and ginger in large amounts — should be used with caution or avoided once pregnancy is confirmed. When in doubt, stop any herbal supplement and consult a doctor.",
      },
      {
        type: "cta",
        title: "Women's Wellness at Wendy Herbals",
        content:
          "Browse our herbal preparations for women's health, formulated using traditional Nigerian botanicals.",
        href: "/shop?category=womens-wellness",
        ctaLabel: "Shop Women's Wellness",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information, not medical advice. It does not recommend any product as a treatment for infertility or any medical condition.",
      },
    ],
  },

  {
    slug: "herbs-for-male-fertility-low-sperm-count-nigeria",
    title: "Low Sperm Count: Nigerian Herbs for Male Fertility Support",
    excerpt:
      "Male fertility challenges affect more Nigerian men than many realise. This guide covers the herbs traditionally used in Nigeria for sperm count and male reproductive health, and what current research suggests about them.",
    category: "Men's Wellness",
    publishedAt: "2026-11-04",
    coverSrc: "/media/brand/ground-herb-powders.jpg",
    coverAlt: "Ground herb powders in a steel bowl",
    keywords: [
      "herbal remedy for low sperm count Nigeria",
      "how to increase sperm count naturally Nigeria",
      "male fertility herbs Nigeria",
      "herbs for sperm count Nigeria",
      "natural remedy for male infertility Nigeria",
      "herbal treatment for sperm count Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Male factor infertility is estimated to contribute to about half of all infertility cases globally, and Nigeria is no exception. Low sperm count (oligospermia), poor sperm motility, and abnormal morphology are the most common male fertility issues. Many Nigerian men prefer to explore herbal options first, partly for privacy and partly because traditional medicine has a long history in managing this concern.",
      },
      {
        type: "h2",
        content: "Moringa (Ewe ile)",
      },
      {
        type: "p",
        content:
          "Moringa is probably the herb most studied for male fertility in the Nigerian context. Animal studies conducted in Nigerian universities have found that moringa seed oil and leaf extracts improve sperm count, motility, and morphology in animals given the supplement. The proposed mechanism involves the plant's high antioxidant content protecting sperm from oxidative damage — sperm cells are particularly vulnerable to free-radical attack. Human clinical data is limited but the mechanistic case is strong.",
      },
      {
        type: "h2",
        content: "Ashwagandha",
      },
      {
        type: "p",
        content:
          "Ashwagandha is one of the few herbal supplements with actual published clinical trial data for male fertility. A 2010 randomised controlled trial published in the journal Fertility and Sterility found that ashwagandha root supplementation significantly improved sperm count, motility, and serum testosterone in infertile men compared to placebo. A 2015 study found similar results. The effect appears to involve reducing oxidative stress in semen and modulating hormones including LH and FSH.",
      },
      {
        type: "h2",
        content: "Tribulus terrestris",
      },
      {
        type: "p",
        content:
          "Known as puncture vine, Tribulus is sold in many Nigerian herbal shops for male vitality. It has traditionally been associated with testosterone support. While some studies show improvements in sexual desire and function, its effect on actual sperm parameters and testosterone levels in humans is inconsistent across trials — some show improvement, others show no significant effect. It appears safer than many alternatives, but the evidence is mixed.",
      },
      {
        type: "h2",
        content: "Ginseng",
      },
      {
        type: "p",
        content:
          "Both Asian (Panax) and West African (Mondia whitei, sometimes called African ginseng or white ginger) ginseng are used in Nigerian herbal practice for male reproductive health. Mondia whitei is native to West and Central Africa and has been shown in several studies to stimulate testosterone production and improve sperm parameters in animal models. It is sometimes sold under its local names in Nigerian markets.",
      },
      {
        type: "h2",
        content: "Zinc and selenium-rich plants",
      },
      {
        type: "p",
        content:
          "Some of the effect attributed to various herbs for male fertility may partly be explained by their mineral content. Zinc is essential for testosterone production and sperm formation — moringa leaves, pumpkin seeds, and sesame (which is used in Nigerian cooking) are all reasonable sources. Selenium is important for sperm motility. A deficiency in either mineral can impair fertility, and correcting a deficiency through diet or supplementation has clear evidence of benefit.",
      },
      {
        type: "h2",
        content: "Lifestyle factors matter as much as herbs",
      },
      {
        type: "list",
        items: [
          "Heat: keeping the testes cool is important. Tight clothing, long hot baths, and laptops on the lap all raise scrotal temperature and can reduce sperm count temporarily.",
          "Alcohol: heavy alcohol consumption reduces testosterone and impairs sperm production.",
          "Smoking: significantly damages sperm DNA and reduces sperm count and motility.",
          "Stress: elevated cortisol suppresses testosterone.",
          "Weight: both obesity and being significantly underweight affect sperm quality.",
        ],
      },
      {
        type: "cta",
        title: "Men's Wellness at Wendy Herbals",
        content:
          "Browse our herbal preparations for men's health and vitality, made using traditional Nigerian botanical formulations.",
        href: "/shop?category=mens-wellness",
        ctaLabel: "Shop Men's Wellness",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not replace a clinical evaluation. Persistent concerns about fertility should be assessed by a urologist or fertility specialist.",
      },
    ],
  },

  {
    slug: "ginger-garlic-high-blood-pressure-nigeria",
    title: "Ginger and Garlic for High Blood Pressure: A Nigerian Practical Guide",
    excerpt:
      "Hypertension affects millions of Nigerians, many of whom do not know they have it. Ginger and garlic are two of the most evidence-backed herbal options for blood pressure support — here is what the research shows and how to use them.",
    category: "General Wellness",
    publishedAt: "2026-11-03",
    coverSrc: "/media/brand/spiced-noodle-dish.jpg",
    coverAlt: "A plated dish cooked with Wendy Herbals spices including ginger and garlic",
    keywords: [
      "ginger garlic blood pressure Nigeria",
      "natural remedy for hypertension Nigeria",
      "herbal treatment for high blood pressure Nigeria",
      "how to lower blood pressure naturally Nigeria",
      "ginger for hypertension Nigeria",
      "garlic for blood pressure Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Hypertension (high blood pressure) is estimated to affect about 30% of Nigerian adults, and a significant proportion are undiagnosed. It is one of the leading risk factors for stroke and heart attack — both of which are increasingly common in Nigeria. While medication remains the most reliable way to control established hypertension, ginger and garlic are two spices with real evidence behind them for blood pressure support and are already central to Nigerian cooking.",
      },
      {
        type: "h2",
        content: "Garlic and blood pressure",
      },
      {
        type: "p",
        content:
          "Garlic contains allicin, a sulphur compound produced when garlic is crushed or chopped. Allicin has been the subject of hundreds of research papers. For blood pressure specifically, a 2016 meta-analysis of 20 randomised controlled trials — the highest quality evidence — found that garlic supplementation reduced systolic blood pressure by an average of 8.3 mmHg and diastolic by 5.5 mmHg in people with hypertension. That is a clinically meaningful reduction.",
      },
      {
        type: "p",
        content:
          "The mechanism involves allicin stimulating the production of hydrogen sulphide, which relaxes blood vessel walls. Garlic also inhibits platelet aggregation (clumping), which reduces the risk of blood clots. These effects appear strongest with aged garlic extract, but raw garlic and cooked garlic also contribute.",
      },
      {
        type: "h2",
        content: "Ginger and blood pressure",
      },
      {
        type: "p",
        content:
          "Ginger (Zingiber officinale) contains gingerols and shogaols, which act as natural calcium channel blockers and ACE inhibitors — mechanisms similar to two major classes of antihypertensive drugs. A 2019 meta-analysis found that ginger supplementation significantly reduced both systolic and diastolic blood pressure. The effect is strongest with doses of 2–3g of ginger daily over at least eight weeks.",
      },
      {
        type: "h2",
        content: "How to use ginger and garlic for blood pressure",
      },
      {
        type: "list",
        items: [
          "Fresh garlic: 2–4 raw cloves daily, crushed or chopped and allowed to stand for 10 minutes before eating — this gives allicin time to form. It can be added to food or swallowed like a tablet.",
          "Garlic tea: crush 2–3 cloves, steep in hot water for 5 minutes, strain, add honey to taste.",
          "Ginger tea: grate or thinly slice a thumb of fresh ginger, steep in boiling water for 10 minutes, strain. Drink 2–3 cups daily.",
          "Combined tonic: crush garlic and ginger together, steep in hot water, cool, add lemon juice and a little honey. This is a popular morning drink in many Nigerian homes.",
          "In cooking: both spices are most effective when used generously and regularly in everyday cooking.",
        ],
      },
      {
        type: "h2",
        content: "What these spices cannot do",
      },
      {
        type: "p",
        content:
          "Ginger and garlic are not substitutes for antihypertensive medication in people with established hypertension. Their effect, while real, is modest compared to prescription drugs. They are best used as a dietary complement — an additional tool that works alongside a healthy diet (less salt, more vegetables), regular exercise, and prescribed medication if needed. Never stop blood pressure medication without telling your doctor.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "Drug interactions",
        content:
          "Garlic has blood-thinning effects and can interact with anticoagulant drugs like warfarin. Ginger in high doses can lower blood sugar, which is relevant if you are on diabetes medication. Both can interact with antihypertensive drugs by adding to their effect and causing blood pressure to drop too low.",
      },
      {
        type: "cta",
        title: "Shop Wendy Herbals Food Spices",
        content:
          "Our food spice range includes freshly milled garlic, ginger, and other authentic Nigerian spices for everyday cooking.",
        href: "/shop?category=food-spices",
        ctaLabel: "Shop Food Spices",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information, not medical advice. It does not replace professional assessment or treatment for hypertension.",
      },
    ],
  },

  {
    slug: "turmeric-atale-pupa-benefits-nigeria",
    title: "Turmeric (Atale Pupa) in Nigerian Wellness: Traditional Use and Modern Research",
    excerpt:
      "Turmeric has been used in Yoruba herbal medicine — where it is called atale pupa or atale nla — for generations. Research on its active compound, curcumin, is now among the most extensive of any plant compound. Here is what it shows.",
    category: "Kitchen & Spices",
    publishedAt: "2026-11-02",
    coverSrc: "/media/brand/ground-herb-powders.jpg",
    coverAlt: "Ground herb powders including turmeric yellow in a steel mixing bowl",
    keywords: [
      "turmeric benefits Nigeria",
      "atale pupa uses",
      "atale nla Yoruba",
      "turmeric for inflammation Nigeria",
      "curcumin benefits Nigeria",
      "how to use turmeric in Nigeria",
      "turmeric for arthritis Nigeria",
      "turmeric and black pepper Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Turmeric (Curcuma longa) is called atale pupa or atale nla in Yoruba — literally 'the big or yellow atale'. It is used as a spice in Nigerian pepper soup, as a colourant in rice dishes, and as a traditional medicine for pain, inflammation, stomach complaints, and skin conditions. The bright yellow-orange colour comes from curcuminoids, a group of compounds dominated by curcumin, which is now one of the most studied plant compounds in the world.",
      },
      {
        type: "h2",
        content: "What curcumin does",
      },
      {
        type: "p",
        content:
          "Curcumin is a powerful anti-inflammatory compound that acts on multiple inflammatory pathways simultaneously. This is unusual — most anti-inflammatory drugs (like ibuprofen) work on one or two pathways. Curcumin also acts as an antioxidant, protecting cells from oxidative damage. These properties have made it a focus of research into conditions ranging from arthritis to Alzheimer's disease to cancer.",
      },
      {
        type: "h2",
        content: "What the research shows for specific conditions",
      },
      {
        type: "list",
        items: [
          "Arthritis: several well-designed trials show turmeric extract reduces joint pain and stiffness in osteoarthritis with similar effectiveness to some anti-inflammatory drugs, with fewer gastrointestinal side effects.",
          "Inflammation: curcumin lowers levels of C-reactive protein (CRP), a standard marker of inflammation, in multiple clinical studies.",
          "Digestion: turmeric stimulates bile production, which aids fat digestion. It is used traditionally for indigestion and bloating.",
          "Liver health: animal studies show curcumin protects the liver. Human trials for liver conditions are ongoing.",
          "Diabetes: some evidence that curcumin improves insulin sensitivity and lowers blood sugar, but human trials are still limited.",
        ],
      },
      {
        type: "h2",
        content: "The absorption problem — and how to solve it",
      },
      {
        type: "p",
        content:
          "Curcumin from food turmeric is poorly absorbed by the body. This is the main limitation of using cooking turmeric as a supplement — most of it passes through without being absorbed. The well-known remedy is to combine turmeric with black pepper: piperine in black pepper enhances curcumin absorption by up to 2,000%. Adding fat (oil, coconut milk, or ghee) also improves absorption since curcumin is fat-soluble.",
      },
      {
        type: "h2",
        content: "How to use turmeric in Nigerian cooking and as a wellness habit",
      },
      {
        type: "list",
        items: [
          "Golden milk: half a teaspoon of turmeric powder in warm full-cream milk with a pinch of black pepper, a little honey, and a small amount of coconut oil or butter.",
          "In pepper soup: a generous pinch of turmeric added to pepper soup enhances the colour and adds curcumin to an already anti-inflammatory dish.",
          "With eggs: scrambled eggs with turmeric and black pepper are an easy daily habit.",
          "In rice: a teaspoon of turmeric added to rice while cooking colours it golden and adds flavour.",
          "Fresh turmeric root: available in many Nigerian markets. Slice or grate and add to soups and stews. The fresh root has a more complex flavour than the dried powder.",
        ],
      },
      {
        type: "h2",
        content: "How much turmeric to use",
      },
      {
        type: "p",
        content:
          "Most research on turmeric uses standardised curcumin extracts at doses much higher than you would get from food alone. For general wellness, regular daily use of turmeric as a culinary spice — combined with black pepper and fat — is a reasonable approach. For therapeutic purposes (joint pain, significant inflammation), standardised supplements with higher curcumin content and enhanced bioavailability are more likely to reach effective concentrations.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "Before taking high-dose turmeric supplements",
        content:
          "High-dose curcumin supplements can interact with blood thinners, chemotherapy drugs, and some diabetes medications. People with gallstones should use turmeric with caution — it stimulates gallbladder contraction. At food amounts, turmeric is very safe.",
      },
      {
        type: "cta",
        title: "Food Spices at Wendy Herbals",
        content:
          "Our food spice range includes turmeric and other authentic Nigerian kitchen spices, freshly prepared.",
        href: "/shop?category=food-spices",
        ctaLabel: "Shop Food Spices",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This article is for general educational purposes and does not constitute medical advice.",
      },
    ],
  },

  {
    slug: "moringa-for-weight-loss-nigeria",
    title: "Moringa for Weight Loss: What You Should Know Before Starting",
    excerpt:
      "Moringa is frequently promoted for weight loss in Nigeria. Here is an honest look at what the evidence shows, what moringa actually does, and how to use it realistically.",
    category: "General Wellness",
    publishedAt: "2026-11-01",
    coverSrc: "/media/brand/scent-leaf-plant.jpg",
    coverAlt: "Green leaves of a herb plant growing outdoors",
    keywords: [
      "moringa for weight loss Nigeria",
      "moringa powder for weight loss",
      "herbs for weight loss Nigeria",
      "natural weight loss Nigeria",
      "how to use moringa for weight loss",
      "moringa weight loss evidence",
      "ewe ile for weight loss Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Walk through any Nigerian market or social media feed and you will encounter moringa being sold with strong weight-loss claims. Some of these claims are exaggerated. But moringa is genuinely nutritionally dense, and there are legitimate mechanisms by which it might support weight management. Here is a clear-eyed look at the evidence.",
      },
      {
        type: "h2",
        content: "What moringa actually does that is relevant to weight",
      },
      {
        type: "list",
        items: [
          "Blood sugar regulation: moringa may slow carbohydrate absorption, reducing blood sugar spikes after meals. This may reduce hunger and cravings triggered by rapid blood sugar swings.",
          "Nutrient density: moringa is very rich in vitamins and minerals per calorie. Adding it to a diet may help address nutritional deficiencies that contribute to fatigue and low activity levels.",
          "Anti-inflammatory: chronic low-grade inflammation is associated with obesity and metabolic syndrome. Moringa's anti-inflammatory compounds may support metabolic health.",
          "Thyroid function: some compounds in moringa may support thyroid function, which regulates metabolism, though research on this is very early.",
        ],
      },
      {
        type: "h2",
        content: "What the research actually shows",
      },
      {
        type: "p",
        content:
          "The honest answer is that direct human trials of moringa for weight loss are extremely limited. Most evidence comes from animal studies and from mechanistic research that explains how moringa might help. There is no published, well-designed human clinical trial showing that moringa supplements alone cause meaningful weight loss. This does not mean moringa has no role — it means it has not yet been properly studied for this specific outcome.",
      },
      {
        type: "h2",
        content: "How moringa fits into a weight management approach",
      },
      {
        type: "p",
        content:
          "Moringa is best used as a nutritional complement to genuine lifestyle change — not as a shortcut. When combined with a reduced-calorie diet and increased physical activity, moringa may support blood sugar stability and energy levels, making the lifestyle changes easier to sustain. Using it as an add-on to good nutrition and activity is a reasonable approach. Using it instead of diet and exercise is not.",
      },
      {
        type: "h2",
        content: "How to use moringa for weight management",
      },
      {
        type: "list",
        items: [
          "Moringa powder in the morning: a teaspoon stirred into warm water or pap before breakfast may help stabilise blood sugar through the morning.",
          "Replace high-calorie drinks: moringa tea (dried leaves steeped in water) with no sugar is a very low-calorie, nutrient-dense drink to substitute for sugary beverages.",
          "Add to soups: a handful of fresh moringa leaves or a tablespoon of powder added to vegetable soup replaces starchy thickeners with nutrition.",
          "Moringa and lemon: a popular Nigerian preparation — moringa powder, lemon juice, and warm water first thing in the morning.",
        ],
      },
      {
        type: "h2",
        content: "Red flags when buying moringa products",
      },
      {
        type: "list",
        items: [
          "Any product that promises specific numbers ('lose 10kg in 30 days') is making claims that are not supported by evidence.",
          "Unlabelled moringa powder sold loose in markets may be adulterated or mislabelled.",
          "Moringa capsules with 'proprietary blends' that do not state the moringa dose are hard to evaluate.",
          "Look for products that list actual moringa leaf powder or moringa oleifera with a declared amount.",
        ],
      },
      {
        type: "cta",
        title: "Natural products from Wendy Herbals",
        content:
          "Browse our botanical and wellness range, formulated using traditional Nigerian herbs.",
        href: "/shop?category=herbal-collections",
        ctaLabel: "Shop Herbal Collections",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is educational information only. It does not recommend any product as a treatment for obesity or any medical condition.",
      },
    ],
  },

  {
    slug: "fibroid-herbs-what-nigerian-women-should-know",
    title: "Fibroid and Herbs: What Nigerian Women Are Using and What the Evidence Shows",
    excerpt:
      "Uterine fibroids affect a disproportionately high number of Nigerian women. Many turn to herbal preparations as an alternative or complement to medical treatment. This guide looks honestly at what is used and what the evidence says.",
    category: "Women's Wellness",
    publishedAt: "2026-10-31",
    coverSrc: "/media/brand/measuring-herbal-preparation.jpg",
    coverAlt: "Wendy measuring a herbal preparation at her desk",
    keywords: [
      "herbal remedy for fibroid Nigeria",
      "herbs for fibroid shrinkage Nigeria",
      "fibroid treatment herbs Nigeria",
      "natural remedy for fibroid Nigeria",
      "how to shrink fibroid naturally Nigeria",
      "bitter leaf for fibroid",
      "fibroid herbs Nigeria women",
    ],
    sections: [
      {
        type: "p",
        content:
          "Uterine fibroids (non-cancerous growths in the uterus) are significantly more common in women of African descent than in any other population. Studies suggest that by age 50, up to 80% of Nigerian women will have fibroids, though many are small and cause no symptoms. For women who do experience symptoms — heavy menstrual bleeding, pelvic pressure, frequent urination, or difficulty conceiving — the question of treatment is a major one.",
      },
      {
        type: "p",
        content:
          "Medical options include medication, minimally invasive procedures like uterine fibroid embolisation (UFE), and surgery. Many Nigerian women also explore herbal options, either because medical options are expensive, because they want to preserve fertility, or because they prefer a less invasive approach. Here is an honest look at the herbs most commonly used.",
      },
      {
        type: "h2",
        content: "Understanding fibroids before choosing a treatment",
      },
      {
        type: "p",
        content:
          "Fibroids grow in response to estrogen, which is why they are more common in women of reproductive age and typically shrink after menopause. Any approach to managing fibroids — herbal or medical — needs to work with this hormonal reality. Herbs that lower estrogen activity or support hormonal balance are the ones most commonly used in this context.",
      },
      {
        type: "h2",
        content: "Herbs most commonly used for fibroid in Nigeria",
      },
      {
        type: "h3",
        content: "Bitter leaf (Ewuro)",
      },
      {
        type: "p",
        content:
          "Bitter leaf is the herb most frequently mentioned alongside fibroid in Nigerian herbal discussions. The traditional use involves drinking the pressed juice regularly. The rationale offered is that bitter leaf compounds balance estrogen activity. Some phytoestrogens in bitter leaf can have anti-estrogenic effects in an estrogen-dominant environment. However, there are no clinical trials examining bitter leaf specifically for fibroid.",
      },
      {
        type: "h3",
        content: "Vitex (Chaste tree berry)",
      },
      {
        type: "p",
        content:
          "Vitex acts on the pituitary to increase progesterone relative to estrogen. Since fibroids tend to grow in a high-estrogen environment, correcting an estrogen-progesterone imbalance may theoretically slow their growth. Small studies in European herbalism have explored this for fibroid-related heavy bleeding with mixed results. Vitex needs to be taken consistently for at least three to six months.",
      },
      {
        type: "h3",
        content: "Green tea and serrapeptase",
      },
      {
        type: "p",
        content:
          "Green tea contains epigallocatechin-3-gallate (EGCG), which showed significant reduction in fibroid size and bleeding in a randomised trial — a genuinely positive clinical study for a natural compound. Serrapeptase is an enzyme from silkworms used in some Nigerian herbal markets; theoretical anti-fibrotic properties have been proposed but clinical evidence for fibroid specifically is very limited.",
      },
      {
        type: "h2",
        content: "What herbal approaches cannot do",
      },
      {
        type: "p",
        content:
          "There is no herbal preparation with proven ability to significantly shrink established fibroids, based on published clinical trial evidence. Medical procedures — particularly UFE, myomectomy, and hysterectomy — remain the most reliable options for large or symptomatic fibroids. This matters because delaying effective treatment of large fibroids can lead to anaemia, kidney problems from urinary tract compression, and reduced fertility.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "When to see a doctor",
        content:
          "Heavy menstrual bleeding (soaking through pads every hour), severe pelvic pain, difficulty urinating or having a bowel movement, or a noticeably distended abdomen all warrant medical assessment. These symptoms can indicate fibroids that need active management beyond herbal support.",
      },
      {
        type: "h2",
        content: "Diet and fibroids",
      },
      {
        type: "p",
        content:
          "Diet changes are the area where the strongest evidence exists for a natural influence on fibroid growth. Research consistently shows that a diet high in red meat and processed food increases fibroid risk and may accelerate growth, while a diet high in green vegetables, fruits, and fibre has a protective association. Reducing iron-depleting habits (such as excess alcohol) while maintaining iron intake is also important for women with heavy fibroid-related bleeding.",
      },
      {
        type: "cta",
        title: "Women's Wellness at Wendy Herbals",
        content:
          "Browse our herbal preparations for women's health, made using traditional Nigerian botanical formulations.",
        href: "/shop?category=womens-wellness",
        ctaLabel: "Shop Women's Wellness",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. It does not recommend any product as a treatment for fibroids or any medical condition.",
      },
    ],
  },
];
