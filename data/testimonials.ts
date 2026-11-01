import type { Testimonial } from "@/types";

/**
 * Real client reviews. The seeded `testimonials` table holds the same rows;
 * this file is only the fallback shown when Supabase is unreachable/empty.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t-houari",
    name: "Houari",
    project: "Maison particulière",
    isPlaceholder: false,
    review: {
      en: "I was responsible for preparing my sister's house and, honestly, I was unsure about many things, especially the ceilings, painting and lighting. Redline Deco didn't just do what I asked; they actually guided me and gave me advice on many details. Their ideas for the lighting helped me a lot, and I'm really happy with the final result.",
      fr: "J'étais responsable de préparer la maison de ma sœur et j'étais franchement hésitant sur plusieurs choix, surtout pour les plafonds, la peinture et l'éclairage. Redline Deco ne s'est pas contenté de faire ce que je demandais, ils m'ont vraiment conseillé et orienté sur plusieurs détails. Leurs idées pour l'éclairage m'ont beaucoup aidé et le résultat est vraiment réussi.",
      ar: "كنت مسؤول على تجهيز دار ختي، وكنت بصراحة محتار في بزاف حوايج، خاصة الأسقف والطلاء والإضاءة. Redline Deco ما خدموش غير اللي طلبت منهم، بالعكس نصحوني ووجّهوني في بزاف تفاصيل، وحتى في الإضاءة عطاوني أفكار ما كنتش حاسبها. هذا الشي سهل عليا بزاف الاختيارات والنتيجة جات مليحة بزاف.",
    },
  },
  {
    id: "t-nabil",
    name: "Nabil",
    project: "Maison particulière",
    isPlaceholder: false,
    review: {
      en: "I was preparing my home and wanted everything to be well thought out, especially the ceiling and lighting. Redline Deco gave me a lot of ideas and advice about the gypsum board and how to integrate the lighting into the design. Honestly, it makes a big difference when the people doing the work also help you make the right choices.",
      fr: "Je préparais ma maison et je voulais que tout soit bien réfléchi, surtout au niveau du plafond et de l'éclairage. Redline Deco m'a donné beaucoup d'idées et de conseils pour le placo et la manière d'intégrer l'éclairage dans la décoration. Franchement, ça fait une grande différence d'avoir quelqu'un qui réalise le travail tout en vous conseillant.",
      ar: "كنت نحضر في داري وكنت حاب كل حاجة تكون محسوبة مليح، خاصة السقف والإضاءة. Redline Deco عطاوني بزاف أفكار ونصائح في BA13 وكيفاش نوزع الإضاءة مع الديكور. بصراحة فرق كبير كي تلقى واحد يخدم معاك وفي نفس الوقت ينصحك ووش يكون خير.",
    },
  },
  {
    id: "t-moussa",
    name: "Moussa",
    project: "Salon — Sidi Abdelli",
    isPlaceholder: false,
    review: {
      en: "I was working with a limited budget, so I needed advice on where to spend and where I could save without compromising the result. They did the whole living room, including the ceiling, LED profiles, spotlights and hidden curtain, and also helped me improve some of the lighting. The project was in Sidi Abdelli, quite far from them, but they came, worked on site and even stayed overnight to finish on time. Honestly, they really went the extra mile for me.",
      fr: "Je travaillais avec un budget limité et j'avais besoin de conseils pour savoir où investir sans dépasser mes moyens. Ils ont réalisé toute ma pièce avec le plafond, les profils LED, les spots et le rideau caché, et m'ont également conseillé sur certains points d'éclairage. Le chantier était à Sidi Abdelli, assez loin pour eux, mais ils se sont déplacés et ont même dormi sur place pour terminer dans les délais. Franchement, ils ne m'ont pas laissé tomber.",
      ar: "كنت نخدم بميزانية محدودة، وكنت نحتاج واحد ينصحني وين نصرف ووش نقدر ندير بلا ما نتجاوز الميزانية. خدمولي الصالة كاملة بالسقف، LED profiles، السبوتات والستار المخفي، وزادوا صححولي شوية أمور في الإضاءة. وحتى الخدمة كانت بعيدة عليهم في سيدي العبدلي، بصح جاو وخدمو حتى باتو في البلاصة باش يكملولي في الوقت. صراحة ما قصرواش معايا.",
    },
  },
  {
    id: "t-jamal",
    name: "Jamal",
    project: "Magasin de cosmétiques",
    isPlaceholder: false,
    review: {
      en: "I wanted to improve the look of my cosmetics store and make it feel more professional. They installed the PVC ceiling and lighting, and also advised me on how to position the lights to make the products stand out. What I liked is that they don't just do the job; they try to understand what you actually want to achieve.",
      fr: "Je voulais améliorer l'apparence de mon magasin de cosmétiques et lui donner un aspect plus professionnel. Ils ont réalisé le plafond en PVC et l'éclairage, et m'ont également conseillé sur la disposition des lumières pour mieux mettre les produits en valeur. J'ai apprécié le fait qu'ils cherchent vraiment à comprendre le résultat que je voulais obtenir.",
      ar: "كنت حاب نبدل شكل المحل تاعي تاع الكوسميتيك ونخليه يبان أكثر بروفيشونال. خدمولي PVC ceiling والإضاءة، وزادوا نصحوني كيفاش نوزع الضوء باش المنتجات يبانوا مليح. عجبني فيهم أنهم ما يخدموش وخلاص، يحاولو يفهمو واش حاب توصل في الأخير.",
    },
  },
  {
    id: "t-mohamed",
    name: "Mohamed",
    project: "Plusieurs projets immobiliers",
    isPlaceholder: false,
    review: {
      en: "I've worked with Redline Deco on several projects: my own home, my aunt's house, and even several properties I was preparing for rental. Every time, I found the same level of seriousness and attention to detail. The main reason I kept coming back is trust. When you know the job will be done properly, you have one less thing to worry about.",
      fr: "J'ai travaillé avec Redline Deco sur plusieurs projets : chez moi, chez ma tante, et même sur plusieurs biens immobiliers que je préparais pour la location. À chaque fois, j'ai retrouvé le même sérieux et la même attention aux détails. Ce qui m'a surtout donné envie de retravailler avec eux, c'est la confiance. Quand vous savez que le travail sera bien fait, vous êtes beaucoup plus tranquille.",
      ar: "تعاملت مع Redline Deco في أكثر من مشروع، في داري، في دار خالتي، وحتى في مشاريع عقارية كنت نحضر فيهم سكنات للكراء. كل مرة كنت نلقى نفس الجدية ونفس الاهتمام بالتفاصيل. الحاجة اللي خلاتني نعاود نتعامل معاهم هي الثقة، كي تعرف بلي الخدمة راح تخرج مليحة ما تبقاش تقلق.",
    },
  },
  {
    id: "t-el-hadj",
    name: "El Hadj",
    project: "Réparation de plafond",
    isPlaceholder: false,
    review: {
      en: "I had a problem with my ceiling after the previous installation failed. I called Redline Deco and they came to assess it. What I appreciated was that they didn't just make a quick repair. They looked at what had gone wrong and redid the work properly. Since then, I haven't had any more problems.",
      fr: "J'avais un problème avec mon plafond qui était tombé à cause de l'ancienne installation. J'ai appelé Redline Deco et ils sont venus voir le problème. Ce que j'ai apprécié, c'est qu'ils ne se sont pas contentés de réparer rapidement. Ils ont cherché à comprendre ce qui n'allait pas et ont repris le travail correctement. Depuis, je n'ai plus eu de problème.",
      ar: "كان عندي مشكل في السقف بعدما طاح بسبب التركيب اللي كان قبل. عيطت لـ Redline Deco وجاو شافو المشكل ودارو اللازم. اللي عجبني هو أنهم ما حاولوش غير يصلحو وخلاص، بالعكس شافو وين كان الخطأ وعاودو خدموه بطريقة منظمة وثابتة. الحمد لله من نهار خدموه ما عاودش صرا حتى مشكل.",
    },
  },
  {
    id: "t-bouanani",
    name: "A. Bouanani",
    project: "Décor en BA13",
    isPlaceholder: false,
    review: {
      en: "I already had some gypsum board decoration that I wanted to finish and improve. Redline Deco took over the work and made several changes that really improved the overall result. It came out modern and clean, exactly what I was looking for.",
      fr: "J'avais déjà une décoration en placo que je voulais terminer et améliorer. Redline Deco a repris le travail et a apporté plusieurs modifications qui ont vraiment amélioré l'ensemble. Le résultat est moderne et propre, exactement ce que je recherchais.",
      ar: "كان عندي ديكور بـ BA13 وحبيت نكملو ونزيد نحسن شوية في الأسقف. Redline Deco كملولي الخدمة ودارولي بعض التعديلات اللي خلات الديكور يبان أحسن بزاف. النتيجة خرجت عصرية ونظيفة، وهذا هو الشي اللي كنت حابّاه.",
    },
  },
  {
    id: "t-ben-ammar",
    name: "Ben Ammar",
    project: "Plafond & éclairage LED",
    isPlaceholder: false,
    review: {
      en: "They did a complete ceiling with LED lighting for me, and I'm really happy with the result. What I liked most was how they integrated the lighting into the ceiling, with every spotlight and LED carefully positioned. It came out modern, clean and exactly how I wanted it.",
      fr: "Ils m'ont réalisé un plafond complet avec un éclairage LED et je suis très satisfait du résultat. J'ai particulièrement aimé la manière dont l'éclairage a été intégré au plafond, avec chaque spot et chaque LED bien positionné. Le résultat est moderne, propre et exactement comme je le voulais.",
      ar: "خدمولي تسقيف كامل مع إضاءة LED، والنتيجة عجبتني بزاف. أكثر حاجة عجبتني هي كيفاش دارو توزيع الإضاءة مع السقف، كل سبوت وكل LED عندو بلاصتو. الخدمة خرجت مرتبة وعصرية وبالضبط كيما كنت حاب.",
    },
  },
  {
    id: "t-allouche",
    name: "Allouche",
    project: "Peinture intérieure",
    isPlaceholder: false,
    review: {
      en: "Redline Deco painted my home and doors, and honestly, the work was very clean and precise. They paid attention even to the small details and didn't leave anything unfinished. I'm really happy with the result.",
      fr: "Redline Deco a réalisé la peinture de ma maison et de mes portes. Franchement, le travail était très propre et précis. Même les petits détails ont été pris en compte et rien n'a été laissé au hasard. Je suis vraiment satisfait du résultat.",
      ar: "خدمولي الطلاء تاع الدار والأبواب، وبصراحة الخدمة كانت نقية ودقيقة بزاف. حتى التفاصيل الصغيرة كانوا يهتمو بيها، وما خلوش حتى حاجة ناقصة. النتيجة خرجت بروفيشونال وأنا راضي بزاف على الخدمة.",
    },
  },
];
