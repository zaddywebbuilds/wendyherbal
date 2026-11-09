/**
 * Blog post data for Wendy Herbals.
 *
 * Each post targets a specific health concern Nigerians search for,
 * walks through the condition clearly, and ends by pointing to the
 * exact Wendy Herbals product that addresses it.
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
    slug: "yeast-infection-symptoms-treatment-nigeria",
    title: "Yeast Infection: Symptoms, Causes and What Nigerian Women Use for Relief",
    excerpt:
      "Vaginal yeast infection is one of the most common complaints among Nigerian women — but many suffer in silence because they do not recognise the symptoms or know where to get help. Here is what you need to know.",
    category: "Women's Wellness",
    publishedAt: "2026-11-09",
    coverSrc: "/media/brand/measuring-herbal-preparation.jpg",
    coverAlt: "Wendy measuring a herbal preparation at her desk",
    keywords: [
      "yeast infection treatment Nigeria",
      "symptoms of yeast infection in Nigeria",
      "how to treat yeast infection naturally Nigeria",
      "vaginal yeast infection Nigeria",
      "candida infection Nigeria women",
      "yeast infection herbal remedy Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Vaginal yeast infection — also called vaginal candidiasis — affects most women at least once in their lives, and many Nigerian women experience recurring episodes. It is caused by an overgrowth of Candida, a fungus that lives naturally in the vagina in small amounts. When the natural balance shifts, Candida multiplies rapidly and symptoms begin.",
      },
      {
        type: "h2",
        content: "Common symptoms",
      },
      {
        type: "list",
        items: [
          "Intense itching and irritation inside and around the vagina",
          "Thick, white, cottage-cheese-like discharge (odourless or mild)",
          "Burning sensation during urination or sex",
          "Redness and swelling of the vaginal area",
          "Soreness and rash on surrounding skin",
        ],
      },
      {
        type: "h2",
        content: "Why it keeps coming back for many Nigerian women",
      },
      {
        type: "p",
        content:
          "Recurrent yeast infection is extremely common in Nigeria, and there are several reasons. High-sugar diets feed Candida and allow it to thrive. Tight synthetic underwear and heat create a warm, moist environment where the fungus multiplies. Frequent antibiotic use — a reality in Nigeria where antibiotics are widely self-prescribed — kills the protective bacteria that keep Candida in check. Some women also have an underlying immune or hormonal condition that makes them more susceptible.",
      },
      {
        type: "h2",
        content: "What Nigerian women traditionally use",
      },
      {
        type: "p",
        content:
          "Traditional herbal approaches to yeast infection in Nigeria focus on restoring balance rather than simply suppressing symptoms. Herbs with antifungal, antibacterial, and immune-supporting properties are combined into oral preparations and sometimes used alongside external hygiene products. The Feminine Herbal Wash is used externally to soothe symptoms; the internal preparation is taken by mouth to address the underlying overgrowth.",
      },
      {
        type: "h2",
        content: "How to prevent recurrence",
      },
      {
        type: "list",
        items: [
          "Wear breathable cotton underwear — avoid tight nylon or synthetic fabrics",
          "Reduce sugar intake, particularly refined sugar and sweetened drinks",
          "Avoid unnecessary antibiotics — take them only when prescribed and always complete the course",
          "Use an unscented, pH-balanced feminine wash — regular soap is too alkaline for the vaginal environment",
          "Change out of wet swimwear or gym clothes immediately",
          "Avoid douching — it destroys protective bacteria",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "When to see a doctor",
        content:
          "If you have unusual or foul-smelling discharge, pelvic pain, fever, or sores, see a healthcare professional before using any herbal preparation — these symptoms suggest a bacterial infection (BV) or STI rather than a simple yeast infection, and they need different treatment.",
      },
      {
        type: "cta",
        title: "Wendy Herbals Yeast Infection Herbs",
        content:
          "A traditional botanical preparation used for vaginal yeast infection — available in the Women's Wellness collection. Ships anywhere in Nigeria.",
        href: "/product/yeast-infection-herbs",
        ctaLabel: "View Yeast Infection Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This article is for general educational purposes and does not constitute medical advice. Product names describe traditional associations, not claims of diagnosis or treatment.",
      },
    ],
  },

  {
    slug: "fibroid-symptoms-treatment-nigeria",
    title: "Fibroid in Nigeria: Symptoms, Why It's So Common, and What Women Use",
    excerpt:
      "Nigeria has one of the highest rates of uterine fibroid in the world. Many women carry fibroids for years without knowing. This guide covers the signs to watch for, why Nigerian women are more affected, and what herbal support is available.",
    category: "Women's Wellness",
    publishedAt: "2026-11-08",
    coverSrc: "/media/brand/filling-herbal-preparation.jpg",
    coverAlt: "Wendy pouring herbal preparation from a jerrycan into a measuring cup",
    keywords: [
      "fibroid symptoms Nigeria",
      "fibroid treatment Nigeria",
      "herbal remedy for fibroid Nigeria",
      "how to shrink fibroid naturally Nigeria",
      "uterine fibroid Nigeria women",
      "fibroid herbs Nigeria",
      "signs of fibroid in Nigerian women",
    ],
    sections: [
      {
        type: "p",
        content:
          "Uterine fibroid — non-cancerous growths in or on the wall of the womb — affects a disproportionately high number of Nigerian women. Studies suggest that women of African descent develop fibroids earlier, in greater numbers, and of larger size than women of other backgrounds. Many Nigerian women are carrying fibroids right now and do not know it, because small fibroids often cause no symptoms at all.",
      },
      {
        type: "h2",
        content: "Symptoms that suggest fibroid",
      },
      {
        type: "list",
        items: [
          "Very heavy menstrual bleeding — soaking pads quickly, passing clots, or bleeding lasting longer than 7 days",
          "Periods that are noticeably more painful than before",
          "A feeling of pressure or fullness in the lower abdomen",
          "Frequent urination or difficulty emptying the bladder",
          "Constipation or a sense of pressure in the back passage",
          "Pain during sex",
          "Difficulty conceiving — fibroids near the opening of the fallopian tubes can obstruct eggs",
          "A visibly enlarged abdomen without weight gain",
        ],
      },
      {
        type: "h2",
        content: "Why fibroid is so common in Nigerian women",
      },
      {
        type: "p",
        content:
          "The exact reason fibroid is more common in women of African descent is not fully understood, but several factors are linked. Estrogen drives fibroid growth — higher estrogen exposure across a woman's lifetime increases risk. Diet high in red meat and processed food has been associated with higher fibroid risk in studies. Vitamin D deficiency, more common in equatorial climates where women spend less time outdoors, is strongly linked to fibroid growth. Genetic factors also play a significant role.",
      },
      {
        type: "h2",
        content: "What herbal support aims to do",
      },
      {
        type: "p",
        content:
          "Herbal preparations used for fibroid in Nigeria traditionally target two things: reducing the estrogen dominance that drives fibroid growth, and supporting the body's natural processes to shrink or contain the fibroids. These preparations are typically taken alongside dietary changes — reducing red meat, increasing green vegetables, and cutting refined sugar — which also reduce estrogen load. The Fibroid Herbs with Balm from Wendy Herbals is a traditional formulation for this concern, combining an oral herbal preparation with an external balm.",
      },
      {
        type: "h2",
        content: "Diet changes that matter alongside herbal support",
      },
      {
        type: "list",
        items: [
          "Reduce red meat — research consistently links red meat consumption to higher fibroid risk",
          "Increase green vegetables: ugwu (pumpkin leaf), bitter leaf, broccoli all contain compounds that support estrogen metabolism",
          "Cut sugary drinks and refined carbohydrates — they raise insulin, which stimulates fibroid growth",
          "Get more vitamin D — spend time in direct morning sunlight or supplement",
          "Eat more fibre — it helps the body clear excess estrogen through the gut",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "When to see a gynaecologist",
        content:
          "Very heavy periods with anaemia, significant pain interfering with daily life, or a rapidly growing abdomen all need medical assessment before herbal treatment. Some fibroids require surgical or procedural intervention that herbs cannot replace.",
      },
      {
        type: "cta",
        title: "Wendy Herbals Fibroid Herbs with Balm",
        content:
          "A traditional botanical preparation for uterine fibroid, supplied with its matching external balm. Part of the Women's Wellness collection.",
        href: "/product/fibroid-herbs-with-balm",
        ctaLabel: "View Fibroid Herbs with Balm — ₦17,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice or a treatment recommendation for any medical condition.",
      },
    ],
  },

  {
    slug: "low-sperm-count-causes-treatment-nigeria",
    title: "Low Sperm Count in Nigerian Men: Causes, Signs and How to Address It",
    excerpt:
      "Male infertility is behind half of all conception difficulties, yet it is rarely discussed openly in Nigeria. Low sperm count is the most common finding. Here is what causes it, how to know if it is an issue, and what Nigerian men are using.",
    category: "Men's Wellness",
    publishedAt: "2026-11-07",
    coverSrc: "/media/brand/ground-herb-powders.jpg",
    coverAlt: "Ground herb powders in a steel mixing bowl",
    keywords: [
      "low sperm count treatment Nigeria",
      "how to increase sperm count Nigeria",
      "sperm booster herbs Nigeria",
      "oligospermia treatment Nigeria",
      "male infertility Nigeria",
      "how to treat low sperm count naturally Nigeria",
      "sperm count remedy Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "When a couple is unable to conceive, attention in Nigerian families often falls on the woman first. But studies consistently show that male factors are involved in about half of all infertility cases. Low sperm count — called oligospermia in clinical terms — is the single most common finding in men assessed for infertility. A normal sperm count is above 15 million sperm per millilitre. Anything below that is classified as oligospermia.",
      },
      {
        type: "h2",
        content: "What causes low sperm count",
      },
      {
        type: "list",
        items: [
          "Varicocele — enlarged veins in the scrotum raise temperature and reduce sperm production. This is the most common reversible cause.",
          "Infections — gonorrhoea, chlamydia, mumps orchitis, and other infections can scar the tubes that carry sperm.",
          "Hormonal imbalances — low testosterone, high prolactin, or low FSH/LH all reduce sperm production.",
          "Heat exposure — laptops on the lap, tight underwear, prolonged hot baths, and physically hot work environments damage sperm.",
          "Heavy alcohol use — directly reduces testosterone and sperm production.",
          "Smoking — damages sperm DNA and reduces count and motility.",
          "Stress — elevated cortisol suppresses the hormones that drive sperm production.",
          "Poor nutrition — zinc, selenium, vitamin D and folate are all essential for healthy sperm.",
        ],
      },
      {
        type: "h2",
        content: "Signs that may suggest low sperm count",
      },
      {
        type: "p",
        content:
          "Low sperm count itself has no obvious symptoms — the only way to confirm it is a semen analysis. But it is often associated with low sex drive, difficulty maintaining erection, reduced facial and body hair, or a small, firm testicle. These are signs of hormonal issues that can also lower sperm count. If a couple has been trying for 12 months without conceiving (or 6 months if the woman is over 35), both partners should be assessed.",
      },
      {
        type: "h2",
        content: "What Nigerian men use for sperm count support",
      },
      {
        type: "p",
        content:
          "Traditional herbal approaches to male fertility in Nigeria focus on nutritional support, reducing oxidative stress that damages sperm, and supporting hormonal balance. Sperm cells are particularly vulnerable to free radicals — antioxidant-rich botanical preparations are used to protect the sperm-forming environment. Sperm Booster Herbs from Wendy Herbals is a traditional preparation used for this concern.",
      },
      {
        type: "h2",
        content: "Practical steps that actually make a difference",
      },
      {
        type: "list",
        items: [
          "Switch to loose-fitting, breathable cotton underwear — this alone can improve scrotal temperature",
          "Stop smoking — sperm DNA fragmentation from smoking improves measurably within 3 months of stopping",
          "Reduce alcohol — especially spirits and beer in large quantities",
          "Eat zinc-rich foods daily: ugwu leaves, pumpkin seeds, sesame, seafood, red meat in moderate amounts",
          "Take a walk or do light exercise — sitting for long hours without movement worsens scrotal heat",
          "Get assessed — a semen analysis at any private laboratory in Nigeria costs between ₦3,000–₦8,000 and gives you an actual count to work from",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Medical causes need medical assessment",
        content:
          "Varicocele, blockages, and hormonal disorders causing low sperm count need proper diagnosis — a urologist or andrologist can identify these quickly. Herbal support works best alongside proper investigation, not instead of it.",
      },
      {
        type: "cta",
        title: "Wendy Herbals Sperm Booster Herbs",
        content:
          "A traditional botanical preparation for sperm count support, from the Men's Wellness collection. Ships anywhere in Nigeria.",
        href: "/product/sperm-booster-herbs",
        ctaLabel: "View Sperm Booster Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. It does not recommend any product as a treatment for a medical condition.",
      },
    ],
  },

  {
    slug: "pcos-symptoms-treatment-nigeria",
    title: "PCOS in Nigerian Women: Symptoms, Causes and What Helps",
    excerpt:
      "Polycystic ovary syndrome is widely underdiagnosed in Nigeria. Many women are told they are 'fine' after years of irregular periods, difficulty conceiving, and unexplained weight gain. This guide explains PCOS in plain terms and what support is available.",
    category: "Women's Wellness",
    publishedAt: "2026-11-06",
    coverSrc: "/media/brand/dried-herbs-and-hibiscus-bowls.jpg",
    coverAlt: "Dried botanicals and hibiscus in steel bowls on a work surface",
    keywords: [
      "PCOS symptoms Nigeria",
      "polycystic ovary syndrome Nigeria",
      "PCOS treatment Nigeria",
      "how to treat PCOS naturally Nigeria",
      "PCOS and infertility Nigeria",
      "irregular periods Nigeria PCOS",
      "PCOS herbs Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Polycystic ovary syndrome (PCOS) is one of the most common hormonal conditions in women of reproductive age worldwide, and Nigeria is no exception — but it is significantly underdiagnosed here. Many women spend years dealing with irregular periods, unexplained weight gain, excessive hair on the face or body, and difficulty conceiving, without anyone connecting the dots to PCOS.",
      },
      {
        type: "h2",
        content: "What PCOS actually is",
      },
      {
        type: "p",
        content:
          "PCOS is a hormonal disorder in which the ovaries produce excess androgen (male hormones), leading to small cysts on the ovaries and disrupted ovulation. The name can be misleading — not all women with PCOS have visible cysts on ultrasound, and not all women with ovarian cysts have PCOS. The condition is diagnosed using a combination of symptoms, blood hormone levels, and ultrasound findings.",
      },
      {
        type: "h2",
        content: "Common symptoms of PCOS in Nigerian women",
      },
      {
        type: "list",
        items: [
          "Irregular or absent periods — cycles longer than 35 days, or fewer than 8 cycles per year",
          "Difficulty getting pregnant, or multiple early miscarriages",
          "Weight gain, particularly around the belly, without obvious cause",
          "Excessive hair on the face, chest, or back (hirsutism)",
          "Thinning hair or hair loss from the scalp",
          "Persistent acne that does not clear up with normal skin care",
          "Dark patches of skin in skin folds (neck, armpits, groin) — a sign of insulin resistance",
          "Mood changes, fatigue, low libido",
        ],
      },
      {
        type: "h2",
        content: "The insulin connection — why diet matters so much",
      },
      {
        type: "p",
        content:
          "Most women with PCOS have some degree of insulin resistance, meaning their cells do not respond well to insulin. The body produces more insulin to compensate, and high insulin drives the ovaries to produce more androgen — which disrupts ovulation further. This creates a feedback loop. For this reason, diet changes — reducing refined carbohydrates and sugar, increasing fibre and protein — are the most evidence-backed intervention for PCOS alongside medical management.",
      },
      {
        type: "h2",
        content: "PCOS and fertility",
      },
      {
        type: "p",
        content:
          "PCOS is the most common cause of ovulation-related infertility. The good news is that most women with PCOS can conceive with proper management. Regulating the cycle and inducing ovulation — through lifestyle changes, medication like metformin or clomiphene, or herbal support — is the main route. Some Nigerian women use herbal preparations alongside conventional management, particularly when fertility drugs alone are not working or are not accessible.",
      },
      {
        type: "h2",
        content: "Diet and lifestyle changes with the best evidence",
      },
      {
        type: "list",
        items: [
          "Reduce refined carbohydrates: white rice, white bread, sweet drinks — these spike insulin rapidly",
          "Increase fibre: beans, oats, vegetables — they slow glucose absorption",
          "Exercise regularly: even 30 minutes of brisk walking 5 days a week improves insulin sensitivity measurably",
          "Manage weight: even a 5% reduction in body weight in overweight women with PCOS can restore ovulation",
          "Reduce processed foods and seed oils that promote inflammation",
          "Spearmint tea: small clinical trials show it lowers androgens in women with PCOS",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Get a proper diagnosis first",
        content:
          "PCOS symptoms overlap with thyroid disorders, hyperprolactinaemia, and other hormonal conditions. A proper blood test panel (LH, FSH, testosterone, prolactin, thyroid) done at a teaching hospital or private lab will give you a clear picture before choosing any treatment path.",
      },
      {
        type: "cta",
        title: "Wendy Herbals PCOS Herbs",
        content:
          "A traditional botanical preparation for PCOS, from the Women's Wellness collection. Ships anywhere in Nigeria.",
        href: "/product/pcos-herbs",
        ctaLabel: "View PCOS Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. It does not recommend any product as a treatment for PCOS or any medical condition.",
      },
    ],
  },

  {
    slug: "uti-symptoms-treatment-nigeria",
    title: "UTI (Urinary Tract Infection): Why Nigerian Women Keep Getting It and What Helps",
    excerpt:
      "UTI is one of the most common infections in Nigerian women — and many get it over and over again. This guide explains why it recurs, the warning signs, and what herbal support is available.",
    category: "Women's Wellness",
    publishedAt: "2026-11-05",
    coverSrc: "/media/brand/measuring-herbal-preparation.jpg",
    coverAlt: "Wendy measuring herbal preparation at her desk",
    keywords: [
      "UTI symptoms Nigeria",
      "urinary tract infection Nigeria women",
      "how to treat UTI naturally Nigeria",
      "UTI treatment Nigeria",
      "burning urination Nigeria women",
      "UTI herbal remedy Nigeria",
      "recurrent UTI Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Urinary tract infection (UTI) is one of the most common bacterial infections in Nigerian women, and recurrent UTI — where the infection keeps coming back every few weeks or months — affects a significant number of them. The burning sensation when passing urine, the frequent urge to go, and the lower abdominal discomfort are recognisable to many Nigerian women, often because they have experienced it before.",
      },
      {
        type: "h2",
        content: "Common symptoms of UTI",
      },
      {
        type: "list",
        items: [
          "Burning or stinging sensation when urinating",
          "Frequent urge to urinate, with little coming out",
          "Cloudy, strong-smelling, or pink-coloured urine",
          "Pain or pressure in the lower abdomen or pelvic area",
          "Feeling of incomplete bladder emptying",
          "Fever, chills, or back/side pain (signs the infection has reached the kidneys — needs urgent treatment)",
        ],
      },
      {
        type: "h2",
        content: "Why Nigerian women get UTI so often",
      },
      {
        type: "p",
        content:
          "Women are more susceptible to UTI than men because the urethra is shorter, making it easier for bacteria to reach the bladder. In Nigeria, specific factors make recurrence more common: limited access to clean water for adequate hydration, sharing toilet facilities with poor hygiene, insufficient post-sex hygiene, and the widespread use of broad-spectrum antibiotics that disrupts the urogenital flora. Dehydration is a significant factor — in hot weather, many Nigerian women do not drink enough water, and concentrated urine is a better environment for bacteria.",
      },
      {
        type: "h2",
        content: "The antibiotic problem",
      },
      {
        type: "p",
        content:
          "Many Nigerian women treat UTI by buying antibiotics from a pharmacy without a prescription or urine culture. While antibiotics are the right treatment for a confirmed UTI, repeatedly taking the wrong antibiotic — or not completing the full course — creates antibiotic resistance. The infection keeps coming back because the bacteria have learned to survive the drug. This is why a urine culture (MCS) before treatment, though often skipped, is valuable for recurrent UTI.",
      },
      {
        type: "h2",
        content: "What helps prevent UTI from recurring",
      },
      {
        type: "list",
        items: [
          "Drink at least 2 litres of water daily — staying well hydrated flushes bacteria from the urinary tract",
          "Urinate immediately after sex — does not prevent all UTIs but reduces bacterial migration",
          "Wipe front to back — prevents E. coli from the bowel reaching the urethra",
          "Avoid holding urine for long periods",
          "Avoid harsh soaps and douches in the vaginal area — they destroy protective bacteria",
          "Change underwear daily and use breathable cotton",
          "Cranberry — either as unsweetened juice or supplement — has modest evidence for prevention in women with recurrent UTI",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Kidney infection needs hospital care",
        content:
          "If you have fever, chills, nausea, vomiting, or severe back pain alongside UTI symptoms, the infection may have reached your kidneys. This needs antibiotic treatment — go to a hospital, do not attempt to treat it with herbs alone.",
      },
      {
        type: "cta",
        title: "Wendy Herbals UTI Infection Herbs",
        content:
          "A traditional botanical preparation used for urinary tract infection, from the Herbal Collections range. Ships anywhere in Nigeria.",
        href: "/product/uti-infection-herbs",
        ctaLabel: "View UTI Infection Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information, not medical advice. For confirmed or severe UTI, seek professional medical treatment.",
      },
    ],
  },

  {
    slug: "weak-erection-causes-treatment-nigeria",
    title: "Weak Erection: Causes, What Nigerian Men Do About It, and When to Seek Help",
    excerpt:
      "Erectile dysfunction affects far more Nigerian men than the silence around it suggests. Many cases are reversible. This guide covers the real causes, what helps, and when herbal support is a reasonable option.",
    category: "Men's Wellness",
    publishedAt: "2026-11-04",
    coverSrc: "/media/brand/production-drums.jpg",
    coverAlt: "Large production drums at the Wendy Herbals factory",
    keywords: [
      "weak erection treatment Nigeria",
      "how to treat weak erection naturally Nigeria",
      "erectile dysfunction Nigeria",
      "weak erection herbs Nigeria",
      "how to improve erection Nigeria",
      "manpower herbs Nigeria",
      "natural remedy for weak erection Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "Weak erection — the inability to achieve or maintain an erection firm enough for satisfying sex — is called erectile dysfunction (ED) in clinical terms. It is one of the most common health concerns among Nigerian men, particularly those above 40, though it also affects younger men, often due to psychological or lifestyle factors. Many men deal with it privately without seeking any help, partly because of shame and partly because they do not know that most causes are treatable.",
      },
      {
        type: "h2",
        content: "Common causes of weak erection",
      },
      {
        type: "list",
        items: [
          "High blood pressure — hypertension damages the blood vessels needed for erection",
          "Diabetes — high blood sugar damages nerves and blood vessels in the penis",
          "Low testosterone — reduces sexual drive and can directly impair erection quality",
          "Stress, anxiety, and depression — psychological causes are very common, especially in younger men",
          "Heavy alcohol use — a major cause in Nigeria; alcohol suppresses the nervous system needed for erection",
          "Smoking — restricts blood flow throughout the body including the penis",
          "Obesity — excess weight is associated with low testosterone and poor circulation",
          "Medication side effects — beta-blockers, antidepressants, and some blood pressure drugs can cause ED",
          "Poor sleep — testosterone is produced mainly during deep sleep",
        ],
      },
      {
        type: "h2",
        content: "The difference between physical and psychological causes",
      },
      {
        type: "p",
        content:
          "A simple self-test: if you have morning erections regularly (which most men have on waking), the physical machinery is working and the cause is more likely psychological — stress, performance anxiety, relationship issues. If morning erections are absent or consistently weak, the cause is more likely physical: cardiovascular, hormonal, or neurological. This distinction matters because the most effective treatment differs significantly between the two.",
      },
      {
        type: "h2",
        content: "What Nigerian men use for erection support",
      },
      {
        type: "p",
        content:
          "Traditional herbal preparations for male virility and erection strength are a long-standing part of Nigerian herbal medicine. Roots and bark with reputation for increasing blood flow, boosting testosterone, and supporting stamina are combined in preparations drunk as tonic or taken as directed. Weak Erection Herbs from Wendy Herbals is a traditional formulation for this concern.",
      },
      {
        type: "h2",
        content: "Practical steps with real impact",
      },
      {
        type: "list",
        items: [
          "Cut alcohol significantly — this alone improves erection quality in many men within weeks",
          "Exercise daily: cardiovascular exercise improves penile blood flow measurably",
          "Sleep 7–8 hours: testosterone production depends on it",
          "Check your blood pressure — hypertension is a leading hidden cause of ED in Nigeria",
          "Reduce stress: seek conversation with a trusted person or counsellor — performance anxiety responds well to psychological support",
          "Lose excess weight if applicable — even 10% weight loss improves testosterone significantly in overweight men",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Check for diabetes and blood pressure",
        content:
          "Persistent ED in a man over 40, especially with no obvious psychological cause, can be an early sign of cardiovascular disease or undiagnosed diabetes. Get your blood pressure and blood glucose checked — it may reveal a treatable underlying condition.",
      },
      {
        type: "cta",
        title: "Wendy Herbals Weak Erection Herbs",
        content:
          "A traditional botanical preparation for erection strength and male virility, from the Men's Wellness collection. Ships anywhere in Nigeria.",
        href: "/product/weak-erection-herbs",
        ctaLabel: "View Weak Erection Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. Persistent ED warrants professional assessment.",
      },
    ],
  },

  {
    slug: "ovarian-cyst-symptoms-treatment-nigeria",
    title: "Ovarian Cyst: Signs Nigerian Women Miss, and What Helps",
    excerpt:
      "Most ovarian cysts are harmless and resolve on their own. But some cause real symptoms and need attention. Many Nigerian women are living with ovarian cysts without knowing it. Here is what you need to know.",
    category: "Women's Wellness",
    publishedAt: "2026-11-03",
    coverSrc: "/media/brand/filling-herbal-preparation.jpg",
    coverAlt: "Wendy pouring herbal preparation from a jerrycan into a measuring cup",
    keywords: [
      "ovarian cyst symptoms Nigeria",
      "ovarian cyst treatment Nigeria",
      "herbal remedy for ovarian cyst Nigeria",
      "signs of ovarian cyst Nigeria",
      "ovarian cyst pain Nigeria",
      "how to treat ovarian cyst naturally Nigeria",
      "ovarian cyst herbs Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "An ovarian cyst is a fluid-filled sac that forms on or inside an ovary. Most functional cysts — the kind that form during the normal menstrual cycle — disappear on their own within two or three menstrual cycles. But some cysts persist, grow larger, or are linked to conditions like PCOS or endometriosis, and these can cause real symptoms and affect fertility.",
      },
      {
        type: "h2",
        content: "Symptoms that suggest an ovarian cyst",
      },
      {
        type: "list",
        items: [
          "Dull aching pain or pressure on one side of the lower abdomen",
          "Sharp sudden pain — particularly if the cyst has ruptured or twisted",
          "Bloating or a feeling of fullness in the lower abdomen",
          "Pain during or after sex",
          "Irregular, painful, or unusually heavy periods",
          "Difficulty conceiving",
          "Frequent urination if the cyst is pressing on the bladder",
          "Nausea and vomiting alongside pelvic pain",
        ],
      },
      {
        type: "h2",
        content: "Types of ovarian cysts and why it matters",
      },
      {
        type: "p",
        content:
          "Functional cysts (follicular and corpus luteum cysts) form as a normal part of the monthly cycle and usually resolve without treatment. Polycystic ovaries (from PCOS) are clusters of small undeveloped follicles rather than a single large cyst. Endometriomas form when endometriosis affects the ovary. Dermoid cysts and cystadenomas are non-cancerous but may grow large. Knowing the type matters because treatment approaches differ — an endometrioma or large dermoid cyst needs different management from a simple functional cyst.",
      },
      {
        type: "h2",
        content: "When herbal support is used",
      },
      {
        type: "p",
        content:
          "For functional and PCOS-related cysts, traditional herbal preparations in Nigeria aim to support hormone balance, reduce the estrogen dominance that promotes cyst formation, and reduce inflammation. The Ovarian Cyst Herbs with Balm from Wendy Herbals is a traditional formulation for this concern, combining an oral herbal preparation with an external balm for abdominal application.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "Sudden severe pain needs emergency care",
        content:
          "Sudden severe one-sided pelvic pain, particularly if accompanied by fever, vomiting, or feeling faint, may indicate a ruptured or twisted cyst. This is a medical emergency — go to a hospital immediately. Do not attempt home treatment.",
      },
      {
        type: "h2",
        content: "Questions to ask at an ultrasound",
      },
      {
        type: "list",
        items: [
          "What is the size of the cyst?",
          "Is it simple (fluid only) or complex (solid parts, irregular walls)?",
          "Is it on one ovary or both?",
          "Does it look like it needs monitoring, further investigation, or intervention?",
          "Could it be related to PCOS or endometriosis?",
        ],
      },
      {
        type: "cta",
        title: "Wendy Herbals Ovarian Cyst Herbs with Balm",
        content:
          "A traditional botanical preparation for ovarian cyst, supplied with its matching external balm. Part of the Women's Wellness collection.",
        href: "/product/ovarian-cyst-herbs-with-balm",
        ctaLabel: "View Ovarian Cyst Herbs with Balm — ₦17,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. Any suspected ovarian cyst should be investigated by ultrasound.",
      },
    ],
  },

  {
    slug: "staphylococcus-infection-symptoms-nigeria",
    title: "Staphylococcus Infection in Nigeria: What It Is, Why It Spreads, and What Helps",
    excerpt:
      "Staphylococcus is one of the most diagnosed infections in Nigerian private labs, though many cases are genuinely complex to treat. This guide explains what staphylococcus infection really means, why the diagnosis is so common, and what herbal support is available.",
    category: "General Wellness",
    publishedAt: "2026-11-02",
    coverSrc: "/media/brand/ground-herb-powders.jpg",
    coverAlt: "Ground herb powders in a steel mixing bowl",
    keywords: [
      "staphylococcus infection symptoms Nigeria",
      "staph infection treatment Nigeria",
      "how to treat staphylococcus naturally Nigeria",
      "staph infection herbs Nigeria",
      "staphylococcus aureus Nigeria",
      "signs of staphylococcus infection Nigeria",
      "staphylococcus herbal remedy Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "\"Staphylococcus\" has become one of the most common diagnoses given to patients in Nigerian private clinics and laboratories. Many Nigerians have been told they have staph, been treated, and found the problem returning — sometimes because the original diagnosis was correct and the treatment incomplete, and sometimes because the laboratory result was not interpreted properly in context.",
      },
      {
        type: "h2",
        content: "What staphylococcus infection actually is",
      },
      {
        type: "p",
        content:
          "Staphylococcus aureus is a bacterium that lives on the skin and in the nose of about a third of healthy people without causing any harm. It becomes an infection when it enters the body through a wound, the urogenital tract, or a compromised immune system. Genuine staph infection can cause skin infections (boils, carbuncles, impetigo), wound infections, blood poisoning (septicaemia), and urinary tract infections, among others.",
      },
      {
        type: "h2",
        content: "Why the diagnosis is so common in Nigeria",
      },
      {
        type: "p",
        content:
          "In many Nigerian laboratories, staph is found in urine or swab cultures because it was present on the skin around the sample collection area, not because it is actually causing infection in the body. A positive culture result does not automatically mean active infection — context, symptoms, and bacterial count all matter. Unfortunately, many patients are treated aggressively for a diagnosis of uncertain clinical significance, leading to cycles of antibiotics and recurring positive results.",
      },
      {
        type: "h2",
        content: "Symptoms of genuine staphylococcus infection",
      },
      {
        type: "list",
        items: [
          "Skin boils, abscesses, or carbuncles that are painful, red, and filled with pus",
          "Persistent skin infections that keep coming back",
          "Wound infections that do not heal or keep weeping",
          "Urinary symptoms alongside a confirmed high-count culture",
          "Fever, chills, body aches — signs of a spreading infection",
          "In men: discharge, painful urination, or genital discomfort alongside positive culture",
        ],
      },
      {
        type: "h2",
        content: "What herbal preparations for staph aim to do",
      },
      {
        type: "p",
        content:
          "Traditional herbal preparations for staphylococcus infection in Nigeria combine herbs with known antimicrobial properties — plants whose extracts have shown activity against Staphylococcus aureus in laboratory studies — with immune-supporting botanicals. The goal is to support the body's ability to clear the infection and reduce the risk of recurrence. Staphylococcus Infection Herbs from Wendy Herbals is a traditional preparation for this concern.",
      },
      {
        type: "h2",
        content: "Personal hygiene that reduces risk",
      },
      {
        type: "list",
        items: [
          "Wash hands thoroughly with soap — especially before meals and after using the toilet",
          "Do not share towels, razors, or personal items — staph spreads through close contact",
          "Keep wounds and cuts clean and covered until healed",
          "Shower daily and change into clean clothes — staph thrives in warm, moist skin environments",
          "Get any recurring skin boils or infections properly cultured and sensitivity-tested before treatment",
        ],
      },
      {
        type: "cta",
        title: "Wendy Herbals Staphylococcus Infection Herbs",
        content:
          "A traditional botanical preparation for staphylococcus infection, from the Herbal Collections range. Ships anywhere in Nigeria.",
        href: "/product/staphylococcus-infection-herbs",
        ctaLabel: "View Staphylococcus Infection Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. Severe or spreading infections need professional medical treatment.",
      },
    ],
  },

  {
    slug: "prostate-enlargement-symptoms-treatment-nigeria",
    title: "Prostate Enlargement: What Nigerian Men Need to Know",
    excerpt:
      "Prostate enlargement affects most Nigerian men over 50 — but many do not recognise the symptoms and delay help for years. This guide explains the signs, what causes it, and what herbal support is available alongside medical care.",
    category: "Men's Wellness",
    publishedAt: "2026-11-01",
    coverSrc: "/media/brand/production-drums.jpg",
    coverAlt: "Production drums at the Wendy Herbals factory",
    keywords: [
      "prostate enlargement symptoms Nigeria",
      "prostate treatment Nigeria",
      "prostate herbs Nigeria",
      "how to treat prostate naturally Nigeria",
      "BPH treatment Nigeria",
      "prostate problems Nigeria men",
      "prostate herbal remedy Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "The prostate is a small gland, about the size of a walnut, that sits just below the bladder in men and wraps around the urethra. It produces fluid that nourishes sperm. After age 40, the prostate typically begins to grow — a process called benign prostatic hyperplasia (BPH). By age 60, more than half of Nigerian men have some degree of prostate enlargement, and by 80 the majority do. It is not cancer, but it causes real urinary problems that significantly affect quality of life.",
      },
      {
        type: "h2",
        content: "Symptoms of prostate enlargement",
      },
      {
        type: "list",
        items: [
          "Frequent urination, especially at night — waking two or more times to urinate",
          "A weak or slow urine stream",
          "Difficulty starting urination — having to wait at the toilet",
          "A feeling that the bladder has not fully emptied",
          "Dribbling of urine at the end",
          "Urgency — sudden strong urge to urinate that is difficult to hold",
          "In severe cases, complete inability to urinate (urinary retention) — this is a medical emergency",
        ],
      },
      {
        type: "h2",
        content: "The cancer question",
      },
      {
        type: "p",
        content:
          "Prostate enlargement (BPH) and prostate cancer are different conditions and have different treatments. BPH is not cancer and does not lead to cancer. However, both can cause similar urinary symptoms, and prostate cancer is one of the most common cancers in Nigerian men. Any man over 50 — or over 40 with a family history — should discuss a PSA (prostate-specific antigen) blood test with a doctor. This is a simple test that helps distinguish benign enlargement from more serious disease.",
      },
      {
        type: "h2",
        content: "What Nigerian men use for prostate support",
      },
      {
        type: "p",
        content:
          "Several plants used in Nigerian herbal medicine have been studied for prostate health. Pygeum africanum (African cherry) — found in West African forests — has the best clinical evidence for BPH symptoms; extracts of its bark are used in several European pharmaceutical preparations. Saw palmetto, though not native to Nigeria, is widely used in Nigerian herbal markets. Prostate Enlargement Herbs from Wendy Herbals is a traditional formulation targeting this concern.",
      },
      {
        type: "h2",
        content: "Diet and lifestyle for prostate health",
      },
      {
        type: "list",
        items: [
          "Reduce caffeine and alcohol — both irritate the bladder and worsen urinary frequency",
          "Avoid drinking large amounts of fluid in the evening",
          "Eat tomatoes regularly — lycopene, which is concentrated in cooked tomatoes, is associated with prostate health",
          "Maintain a healthy weight — excess belly fat converts testosterone to estrogen, which stimulates prostate growth",
          "Stay active — a sedentary lifestyle worsens urinary symptoms",
          "Do not delay urination — trying to hold it for long periods irritates the bladder",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Cannot urinate? Go to hospital immediately",
        content:
          "Complete urinary retention — being completely unable to pass urine despite urgency — is a medical emergency that needs catheterisation at a hospital. Do not attempt to treat this at home.",
      },
      {
        type: "cta",
        title: "Wendy Herbals Prostate Enlargement Herbs",
        content:
          "A traditional botanical preparation for prostate enlargement and urinary symptoms in men. From the Men's Wellness collection. Ships anywhere in Nigeria.",
        href: "/product/prostate-enlargement-herbs",
        ctaLabel: "View Prostate Enlargement Herbs — ₦17,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. Men with urinary symptoms should be evaluated by a urologist.",
      },
    ],
  },

  {
    slug: "hormonal-imbalance-symptoms-women-nigeria",
    title: "Hormonal Imbalance in Nigerian Women: Symptoms, Causes and What Helps",
    excerpt:
      "Hormonal imbalance is behind many of the health problems Nigerian women experience — from irregular periods and mood swings to weight gain and difficulty conceiving. This guide explains what it means in real terms and what support is available.",
    category: "Women's Wellness",
    publishedAt: "2026-10-31",
    coverSrc: "/media/brand/measuring-herbal-preparation.jpg",
    coverAlt: "Wendy measuring a herbal preparation at her desk",
    keywords: [
      "hormonal imbalance symptoms Nigeria",
      "hormonal imbalance treatment Nigeria",
      "signs of hormonal imbalance Nigerian women",
      "hormones herbs Nigeria",
      "how to balance hormones naturally Nigeria",
      "irregular hormones Nigeria women",
      "hormonal imbalance herbs Nigeria",
    ],
    sections: [
      {
        type: "p",
        content:
          "\"Hormonal imbalance\" is a phrase many Nigerian women have heard — from doctors, from herbalists, and on social media — but it is rarely explained clearly. Hormones are chemical messengers produced by glands throughout the body: estrogen, progesterone, testosterone, cortisol, thyroid hormones, insulin, and others. When these are out of balance, the effects show up across the entire body.",
      },
      {
        type: "h2",
        content: "Common signs of hormonal imbalance in women",
      },
      {
        type: "list",
        items: [
          "Irregular, missed, or very heavy periods",
          "Severe premenstrual symptoms (PMS): mood swings, bloating, breast tenderness, headaches",
          "Difficulty conceiving or recurrent early miscarriage",
          "Unexplained weight gain, especially around the belly",
          "Persistent fatigue that does not improve with rest",
          "Acne that is worse around the time of the period",
          "Hair thinning or increased hair on the face",
          "Low libido",
          "Mood changes: anxiety, irritability, depression",
          "Hot flashes or night sweats (in perimenopause)",
        ],
      },
      {
        type: "h2",
        content: "The key hormones involved",
      },
      {
        type: "p",
        content:
          "Estrogen and progesterone work together to regulate the menstrual cycle. When estrogen is too high relative to progesterone — a state called estrogen dominance — heavy periods, fibroids, breast tenderness, and mood swings result. When progesterone is too low, maintaining a pregnancy in early stages becomes difficult. Thyroid imbalance mimics many of these symptoms and is significantly underdiagnosed in Nigerian women. Insulin resistance drives PCOS. Each imbalance has a different cause and may need different support.",
      },
      {
        type: "h2",
        content: "What drives hormonal imbalance in Nigerian women",
      },
      {
        type: "list",
        items: [
          "High-stress life — chronic stress elevates cortisol, which suppresses progesterone and disrupts the entire hormonal axis",
          "Diet high in processed food, seed oils, and refined sugar — promotes inflammation and insulin resistance",
          "Environmental chemicals — plastics (BPA), certain pesticides, and chemical-laden cosmetics can mimic estrogen in the body",
          "Poor sleep — most hormone production happens during deep sleep",
          "Excess body fat — fat tissue converts androgens to estrogen, creating excess estrogen",
          "Undernutrition — insufficient fat intake is a common cause of hormonal disruption, particularly in young women",
        ],
      },
      {
        type: "h2",
        content: "Getting the right tests",
      },
      {
        type: "p",
        content:
          "Before taking any hormonal herbs, it is worth getting a proper hormone panel done. A good starting panel includes: FSH, LH, prolactin, estradiol (E2), progesterone (day 21 of the cycle), total testosterone, TSH (thyroid), and fasting insulin. These are available at most private labs in Nigeria. The results tell you which hormone is actually out of balance — estrogen dominant, low progesterone, high prolactin, thyroid issue — which informs whether herbs, medical treatment, or lifestyle change is most relevant.",
      },
      {
        type: "cta",
        title: "Wendy Herbals Hormonal Imbalance Herbs",
        content:
          "A traditional botanical preparation for hormonal balance in women, from the Women's Wellness collection. Ships anywhere in Nigeria.",
        href: "/product/hormonal-imbalance-herbs",
        ctaLabel: "View Hormonal Imbalance Herbs — ₦15,000",
      },
      {
        type: "callout",
        tone: "note",
        title: "About this article",
        content:
          "This is general educational information and does not constitute medical advice. Suspected hormonal disorders should be assessed with appropriate blood tests.",
      },
    ],
  },
  // <AUTO_GENERATED_END>
];
