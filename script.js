/* ============================================================
   AMERICANO Świdnik — dane menu + interakcje
   Wszystkie ceny i składy przepisane z ulotki w pełnej
   rozdzielczości (assets/_src/ulotka1.jpg, ulotka2.jpg).
   ============================================================ */

/* PODMIEŃ PRZED PUBLIKACJĄ. Ten sam adres siedzi w <link rel=canonical>,
   w og:url, w robots.txt i w sitemap.xml — musi być wszędzie taki sam. */
const SITE_URL = 'https://TWOJA-DOMENA.pl';

const BIZ = {
  name:   'Pizzeria AMERICANO',
  street: 'ul. Kosynierów 14',
  zip:    '21-040',
  city:   'Świdnik',
  tel:    '+48510010707',
  email:  'americano.pub@wp.pl',
  fb:     'https://www.facebook.com/AmericanoPub',
  opened: 2021,
  /* Potwierdzone przez właściciela strony (sierpień 2026). */
  rating: { value: 4.7, count: 264 },
  /* TODO: CLIENT CONFIRMATION — dokładne współrzędne lokalu.
     Bez nich pomijamy pole `geo` w structured data; zmyślony
     punkt na mapie byłby gorszy niż jego brak. */
  geo: null,
};

/* ---------- PIZZA: [nr, nazwa, skład, 32cm, 60cm, ostrość] ---------- */
const PIZZA = [
  [1,'Margherita','sos, ser, oregano',29,62,0],
  [2,'Capricciosa','sos, ser, szynka, pieczarki, oliwki',36,76,0],
  [3,'Hawajska','sos, ser, szynka, ananas, kukurydza',36,76,0],
  [4,'Vegetariana','sos, ser, papryka, pieczarki, cebula, kukurydza',39,82,0],
  [5,'Serowa','sos, cztery sery',39,82,0],
  [6,'Farmerska','sos, ser, kiełbasa, boczek, pieczarki, cebula, ogórek konserwowy',45,94,0],
  [7,'Diabelska','sos, ser, salami pepperoni, jalapeno, cebula, tabasco',42,88,2],
  [8,'Luksusowa','sos, ser, kurczak, boczek, salami, papryka, pieczarki, kukurydza',48,100,0],
  [9,'Słoneczna','sos śmietanowy, ser, kurczak, papryka, kukurydza, szczypiorek',40,84,0],
  [10,'Americano','sos, ser, baranina, pomidor, ogórek konserwowy, prażona cebula',40,84,0],
  [11,'Italiano','sos, ser, feta, suszone pomidory, oliwki, rukola',42,88,0],
  [12,'California','sos, ser, bekon, cebula, śliwka kalifornijska, szczypiorek',41,86,0],
  [13,'Monica','sos, ser, salami pepperoni, jalapeno, ananas',38,80,1],
  [14,'BBQ','sos bbq, ser, kurczak, boczek, prażona cebula',38,80,0],
  [15,'Góralska','sos śmietanowy/pomidorowy, ser, boczek, ser wędzony, cebula, żurawina',44,92,0],
  [16,'Camila','sos, ser, kurczak, pieczarki, kukurydza',37,78,0],
  [17,'Popularna','sos, ser, salami, cebula, papryka',37,78,0],
  // UWAGA: na FB są dwie wersje ulotki. Ciemna (starsza) ma tu 84,
  // żółta (nowsza, wyższe ID posta) ma 88 — trzymamy się nowszej.
  // TODO: CLIENT CONFIRMATION — która wersja obowiązuje.
  [18,'Codzienna','sos, ser, szynka, pieczarki, papryka, kukurydza',40,88,0],
  [19,'Brooklyn','sos, ser, brokuł, oliwki czarne, feta, słonecznik',42,88,0],
  [20,'Carbonara','sos śmietanowy, ser, boczek, pieczarki, cebula, tymianek',42,88,0],
  [21,'Zbójnicka','sos, ser, kiełbasa myśliwska, ser wędzony, cebula, ogórek kiszony',45,94,0],
  [22,'Carolina','sos paprykowy Carolina, ser, kurczak, baranina, cebula czerwona',41,86,3],
  [23,'Las Vegas','sos śmietanowy, ser, pieczarki, kurki, czosnek, cebula czerwona, parmezan',43,90,0],
  [24,'Bazyliowa','sos bazyliowy, ser, szynka, pomidor, cebula',39,82,0],
  [25,'Leśna','sos śmietanowy, ser, boczek, kurki, ogórek konserwowy, koperek',44,94,0],
  [26,'Lazur','sos pomidorowy, ser, boczek, czosnek, szpinak, cebula czerwona, ser pleśniowy',44,94,0],
  [27,'Grillowa','sos musztardowo-miodowy, ser, kiełbasa myśliwska, pomidor, oliwki, rukola',43,92,0],
  [28,'Lubelska','sos śmietanowy, ser, cebula, mak',35,74,0],
  [29,'Hulk','sos serowy, ser, kurczak, brokuł, pomidor suszony',41,88,0],
  [30,'Chester','sos serowy, ser, salami, posypka cheetos, szczypiorek',41,88,0],
];

const HOT_LABEL = ['', 'lekko ostra', 'ostra', 'bardzo ostra'];

/* ---------- DODATKI ---------- */
const ADDONS = [
  { name:'Warzywne', p32:4, p60:8, items:[
    'pieczarki','papryka','kukurydza','cebula','ananas','jalapeno','oliwki',
    'szczypiorek','prażona cebula','czosnek','pomidor','ogórek konserwowy',
    'ogórek kiszony','rukola','brokuł','szpinak'] },
  { name:'Mięsne i serowe', p32:5, p60:10, items:[
    'kurczak','baranina','szynka','boczek','salami pepperoni','kiełbasa',
    'podwójny ser','feta','parmezan'] },
  { name:'Luksusowe', p32:6, p60:12, items:[
    'śliwka kalifornijska','tabasco','suszone pomidory','kurki',
    'kiełbasa myśliwska','ser wędzony','ser pleśniowy'] },
  { name:'Sosy do pizzy', p32:3, p60:4, items:[
    'pomidorowy','ketchup','czosnek','gyros','meksykański','amerykański',
    'duński','tysiąca wysp','bbq','piri-piri','słodkie chilli'] },
];

/* ---------- POZOSTAŁE KARTY ----------
   Bez grafik — użytkownik kazał je usunąć. Karty niosą samą treść:
   nazwa sekcji na kolorowym pasku, pozycje ze składem i pieczątką ceny.
   `id` jest kotwicą dla paska kategorii. */
const CARDS = [
  {
    id:'panzerotti',
    title:'Panzerotti',
    tone:'tone--yellow',
    rows:[
      ['z kurczakiem','ser, kurczak, pieczarka z cebulą, sos czosnkowy (gratis)',25],
      ['z baraniną','ser, baranina, pieczarka z cebulą, sos czosnkowy (gratis)',25],
      ['z szynką','ser, szynka, pieczarka z cebulą, sos czosnkowy (gratis)',25],
      ['mix','ser, mieszane mięso, pieczarka z cebulą, sos czosnkowy (gratis)',25],
      ['vege','ser, mix warzyw, sos czosnkowy (gratis)',25],
    ],
    note:'W cenie wliczone jest opakowanie',
  },
  {
    id:'hot-dogi',
    title:'Hot-dogi',
    tone:'tone--peach',
    rows:[
      ['Americano','baranina, ser, colesław, jalapeno, sos czosnkowy, sos gyros',28],
      ['Texas','kiełbaska, ser, colesław, kukurydza, pomidor, sos tysiąca wysp, gyros',27],
      ['Chicago','kiełbaska, ser, pomidor, ogórek konserwowy, cebula, prażona cebula, musztarda, ketchup',26],
      ['Chicken','stripsy, ser, colesław, kukurydza, ogórek konserwowy, sos duński, sos cebulowy',28],
    ],
    note:'W cenie wliczone jest opakowanie',
  },
  {
    id:'zapiekanki',
    title:'Zapiekanki',
    tone:'tone--lemon',
    rows:[
      ['z kurczakiem','ser, pieczarka z cebulą, kurczak, szczypiorek, ketchup',21],
      ['z baraniną','ser, pieczarka z cebulą, baranina, szczypiorek, ketchup',21],
      ['z szynką','ser, pieczarka z cebulą, szynka, szczypiorek, ketchup',21],
      ['z salami','ser, pieczarka z cebulą, salami, szczypiorek, ketchup',21],
      ['z warzywami','ser, pieczarka z cebulą, papryka, kukurydza, szczypiorek, ketchup',21],
    ],
    note:'Dodatkowy sos +1 zł',
  },
  {
    id:'przekaski',
    title:'Przekąski',
    tone:'tone--orange',
    rows:[
      ['Frytki 150 g','',10],
      ['Frytki 300 g','',16],
      ['Krążki cebulowe','10 sztuk',15],
      ['Stripsy','ok. 200 g',23],
      ['Paluchy serowe','350 g',22],
    ],
    note:'W cenie wliczone jest opakowanie',
  },
];

/* ---------- GODZINY (0 = niedziela) ----------
   `w` to forma po przyimku: „otwieramy w środę", „we wtorek".
   `iso` to dzień w notacji schema.org. */
const HOURS = [
  { d:'Niedziela',    w:'w niedzielę',    iso:'Sunday',    open:'13:00', close:'22:00' },
  { d:'Poniedziałek', w:'w poniedziałek', iso:'Monday',    open:null,    close:null    },
  { d:'Wtorek',       w:'we wtorek',      iso:'Tuesday',   open:null,    close:null    },
  { d:'Środa',        w:'w środę',        iso:'Wednesday', open:'13:00', close:'22:00' },
  { d:'Czwartek',     w:'w czwartek',     iso:'Thursday',  open:'13:00', close:'22:00' },
  { d:'Piątek',       w:'w piątek',       iso:'Friday',    open:'13:00', close:'24:00' },
  { d:'Sobota',       w:'w sobotę',       iso:'Saturday',  open:'13:00', close:'24:00' },
];

/* [plik, szerokość, wysokość] — wymiary po przeskalowaniu przez
   tools/optimize-images.ps1. Podajemy je w HTML, żeby przeglądarka
   zarezerwowała miejsce i galeria nie przesuwała layoutu.

   Do galerii wchodzą tylko czyste zdjęcia potraw. Zdjęcia z FB
   z wklejonymi naklejkami (nieaktualne godziny otwarcia na majówkę,
   nalepki na jedzeniu) są odrzucone albo wykadrowane — mapa kadrów
   siedzi w $crops w tools/optimize-images.ps1. Nie dodawaj tu pliku
   bez wcześniejszego obejrzenia go w pełnej rozdzielczości. */
const GALLERY = [
  ['pizza-1',      747, 560],
  ['pizza-2',      420, 560],
  ['panzerotti-2', 448, 560],
  ['pizza-3',      709, 560],
  ['zapiekanki',   458, 560],
  ['pizza-4',      420, 560],
  ['stripsy',      914, 560],
  ['pizza-5',      747, 560],
  ['pizza-box-2',  420, 560],
  ['pizza-6',      554, 560],
  ['pizza-box',    747, 560],
  ['hotdog',       747, 560],
];

/* ============================================================
   RENDER
   ============================================================ */
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* pieczątki z ceną mają nieregularny obrys i lekki obrót — tak jak
   czarne plamy z ulotki. Kąt zależy od indeksu, żeby nie skakał. */
const tilt = i => (i % 4 === 0 ? -1.4 : i % 4 === 1 ? 1.1 : i % 4 === 2 ? -0.7 : 1.6);

/* Etykieta rozmiaru przy każdej cenie. Na desktopie chowa ją CSS
   (jest wtedy nagłówek nad kolumną), na mobile to jedyne miejsce,
   w którym widać, czy 29 zł dotyczy 32 czy 60 cm. */
const priceCell = (size, value, i) => `
  <span class="pricecol">
    <span class="pricecol__size" aria-hidden="true">${size}</span>
    <span class="stamp" style="--t:${tilt(i)}deg">
      <span class="sr-only">${size} — </span>${value}<span class="sr-only"> zł</span>
    </span>
  </span>`;

function pizzaItem([no, name, desc, p32, p60, hot], i){
  const heat = hot
    ? ` <span class="chili" aria-hidden="true">${'🌶️'.repeat(hot)}</span>` +
      `<span class="sr-only"> — ${HOT_LABEL[hot]}</span>`
    : '';
  return `
    <article class="item reveal">
      <span class="item__no" aria-hidden="true">${no}.</span>
      <div class="item__body">
        <h3 class="item__name">${esc(name)}${heat}</h3>
        <p class="item__desc">${esc(desc)}</p>
      </div>
      <div class="item__prices">
        ${priceCell('32 cm', p32, i)}
        ${priceCell('60 cm', p60, i + 2)}
      </div>
    </article>`;
}

/* Menu leci w dwóch kolumnach, tak jak na ulotce: 1–15 po lewej,
   16–30 po prawej. Wcześniej robiły to CSS-owe `columns`, ale wtedy
   nagłówek „32 cm / 60 cm" stał tylko nad prawą kolumną i połowa
   cen była nieopisana. Teraz każda kolumna niesie własny nagłówek. */
function renderPizza(){
  const el = document.getElementById('menu');
  if(!el) return;
  const half = Math.ceil(PIZZA.length / 2);
  const cols = [PIZZA.slice(0, half), PIZZA.slice(half)];

  el.innerHTML = cols.map((col, c) => `
    <div class="menucol">
      <div class="menucol__head" aria-hidden="true">
        <span class="menucol__sizes"><span>32 cm</span><span>60 cm</span></span>
      </div>
      ${col.map((row, i) => pizzaItem(row, i + c * half)).join('')}
    </div>`).join('');
}

function renderAddons(){
  const el = document.getElementById('addons');
  if(!el) return;
  el.innerHTML = ADDONS.map((a, i) => `
    <div class="addon reveal" style="--d:${i * 0.07}s">
      <div class="addon__head">
        <h3 class="addon__name">${esc(a.name)}</h3>
        <div class="addon__prices">
          ${priceCell('32 cm', a.p32, i)}
          ${priceCell('60 cm', a.p60, i + 1)}
        </div>
      </div>
      <ul class="chips">
        ${a.items.map(t => `<li class="chip">${esc(t)}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function renderCards(){
  const el = document.getElementById('cards');
  if(!el) return;
  el.innerHTML = CARDS.map(c => `
    <article class="card reveal" id="${c.id}" aria-labelledby="t-${c.id}">
      <div class="card__head ${c.tone}">
        <h3 class="card__title" id="t-${c.id}">${esc(c.title)}</h3>
      </div>
      <div class="card__body">
        ${c.rows.map(([n,d,p], i) => `
          <div class="card__row">
            <div class="card__rowtxt">
              <b>${esc(n)}</b>
              ${d ? `<span class="card__desc">${esc(d)}</span>` : ''}
            </div>
            <span class="stamp stamp--sm" style="--t:${tilt(i)}deg">${p}<span class="sr-only"> zł</span></span>
          </div>`).join('')}
        <p class="card__note">${esc(c.note)}</p>
      </div>
    </article>
  `).join('');
}

function renderGallery(){
  const el = document.getElementById('galleryTrack');
  if(!el) return;
  const one = GALLERY.map(([n,w,h]) =>
    `<img src="assets/${n}.jpg" alt="" width="${w}" height="${h}" loading="lazy" aria-hidden="true">`
  ).join('');
  el.innerHTML = one + one;   // duplikat = płynna pętla
}

/* ---------- godziny + live status ---------- */
function warsawNow(){
  // liczymy zawsze wg czasu w Polsce, nie wg strefy odwiedzającego
  const s = new Intl.DateTimeFormat('en-GB',{
    timeZone:'Europe/Warsaw', weekday:'short', hour:'2-digit', minute:'2-digit', hour12:false
  }).formatToParts(new Date());
  const g = t => s.find(p => p.type === t).value;
  const days = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
  return { day: days[g('weekday')], mins: +g('hour') * 60 + +g('minute') };
}

const toMin = hhmm => { const [h,m] = hhmm.split(':').map(Number); return h * 60 + m; };

function renderHours(){
  const { day, mins } = warsawNow();
  const order = [1,2,3,4,5,6,0];   // od poniedziałku

  const body = document.getElementById('hours');
  if(body){
    body.innerHTML = order.map(i => {
      const h = HOURS[i];
      const today = i === day;
      const val = h.open
        ? `${h.open}–${h.close}`
        : '<span class="closed">nieczynne</span>';
      const mark = today ? '<span class="sr-only">(dzisiaj) </span>' : '';
      return `<tr class="${today ? 'is-today' : ''}">
        <th scope="row">${mark}${h.d}</th><td>${val}</td></tr>`;
    }).join('');
  }

  const nextOpenDay = () => {
    for(let k = 1; k <= 7; k++){
      const c = HOURS[(day + k) % 7];
      if(c.open) return c;
    }
    return null;
  };

  const h = HOURS[day];
  let open = false, msg = '';
  if(h.open && mins >= toMin(h.open) && mins < toMin(h.close)){
    open = true;
    msg = `Otwarte teraz — do ${h.close}`;
  } else if(h.open && mins < toMin(h.open)){
    msg = `Zamknięte — otwieramy dziś o ${h.open}`;
  } else {
    const n = nextOpenDay();
    msg = n ? `Zamknięte — otwieramy ${n.w} o ${n.open}` : 'Zamknięte';
  }

  const dot = document.getElementById('statusDot');
  const txt = document.getElementById('statusText');
  if(dot) dot.className = 'dot ' + (open ? 'is-open' : 'is-closed');
  if(txt) txt.textContent = msg;
}

/* ---------- lata działalności ----------
   Liczone z BIZ.opened, żeby „5 lat" nie zdezaktualizowało się
   samo z siebie 1 stycznia. */
function renderYears(){
  const years = new Date().getFullYear() - BIZ.opened;
  document.querySelectorAll('[data-years]').forEach(el => {
    if(el.hasAttribute('data-to')) el.dataset.to = years;
    else el.textContent = years;
  });
  return years;
}

/* ============================================================
   STRUCTURED DATA
   Budowane z tych samych tablic, co widoczne menu — dzięki temu
   cena w Google i cena na stronie nie mogą się rozjechać.
   ============================================================ */
function buildSchema(){
  const offer = (price, name) => ({
    '@type':'Offer', price:String(price), priceCurrency:'PLN',
    ...(name ? { name } : {}),
  });

  const allPrices = [
    ...PIZZA.flatMap(p => [p[3], p[4]]),
    ...CARDS.flatMap(c => c.rows.map(r => r[2])),
  ];

  const menu = {
    '@type':'Menu',
    name:'Menu — Pizzeria AMERICANO Świdnik',
    inLanguage:'pl-PL',
    hasMenuSection:[
      {
        '@type':'MenuSection',
        name:'Pizza',
        description:'30 rodzajów pizzy w rozmiarach 32 cm i 60 cm. W cenie opakowanie.',
        hasMenuItem: PIZZA.map(([,name,desc,p32,p60]) => ({
          '@type':'MenuItem',
          name, description: desc,
          offers:[ offer(p32, '32 cm'), offer(p60, '60 cm') ],
        })),
      },
      ...CARDS.map(c => ({
        '@type':'MenuSection',
        name:c.title,
        description:c.note,
        hasMenuItem: c.rows.map(([name, desc, price]) => ({
          '@type':'MenuItem',
          name,
          ...(desc ? { description: desc } : {}),
          offers: offer(price),
        })),
      })),
    ],
  };

  const data = {
    '@context':'https://schema.org',
    '@type':'Restaurant',
    '@id': SITE_URL + '/#restaurant',
    name: BIZ.name,
    url: SITE_URL + '/',
    image: SITE_URL + '/assets/pizza-hero.jpg',
    logo:  SITE_URL + '/assets/logo.png',
    telephone: BIZ.tel,
    email: BIZ.email,
    sameAs:[ BIZ.fb ],
    address:{
      '@type':'PostalAddress',
      streetAddress: BIZ.street,
      postalCode: BIZ.zip,
      addressLocality: BIZ.city,
      addressCountry:'PL',
    },
    areaServed:{ '@type':'City', name: BIZ.city },
    servesCuisine:['Pizza','Włoska','Fast food'],
    priceRange: `${Math.min(...allPrices)}–${Math.max(...allPrices)} PLN`,
    currenciesAccepted:'PLN',
    openingHoursSpecification: HOURS.filter(h => h.open).map(h => ({
      '@type':'OpeningHoursSpecification',
      dayOfWeek:`https://schema.org/${h.iso}`,
      opens:h.open,
      // schema.org nie przyjmuje "24:00" — północ to "23:59"
      closes:h.close === '24:00' ? '23:59' : h.close,
    })),
    hasMenu: menu,
  };

  if(BIZ.rating){
    data.aggregateRating = {
      '@type':'AggregateRating',
      ratingValue:String(BIZ.rating.value),
      reviewCount:String(BIZ.rating.count),
      bestRating:'5', worstRating:'1',
    };
  }
  if(BIZ.geo){
    data.geo = { '@type':'GeoCoordinates', latitude:BIZ.geo.lat, longitude:BIZ.geo.lng };
  }
  return data;
}

function injectSchema(){
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(buildSchema());
  document.head.appendChild(s);
}

/* ============================================================
   INTERAKCJE
   ============================================================ */
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(e => e.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){ en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin:'0px 0px -8% 0px', threshold:0.05 });
  els.forEach(e => io.observe(e));
}

function initCounters(){
  const els = document.querySelectorAll('.count');
  if(!els.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  const run = el => {
    const to = +el.dataset.to;
    const suffix = el.dataset.suffix || '';
    if(reduce){ el.textContent = to + suffix; return; }
    const dur = 1100, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + suffix;
      if(p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if(en.isIntersecting){ run(en.target); io.unobserve(en.target); } });
  }, { threshold:0.5 });
  els.forEach(e => io.observe(e));
}

function initNav(){
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');

  if(nav){
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }
  if(burger && links){
    const close = () => {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded','false');
    };
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    // Escape zamyka menu i oddaje focus przyciskowi — inaczej
    // klawiaturowy użytkownik zostaje uwięziony w otwartej liście.
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && links.classList.contains('is-open')){
        close();
        burger.focus();
      }
    });
  }
}

/* ---------- pasek kategorii ----------
   Wysokość przyklejonego bloku trafia do --stick, bo od niej zależy
   scroll-margin-top wszystkich sekcji. Mierzymy ją zamiast wpisywać
   na sztywno: nagłówek zmienia wysokość przy `is-stuck` i przy
   zmianie szerokości okna. */
function initCatnav(){
  const stick   = document.getElementById('stick');
  const catnav  = document.getElementById('catnav');
  const hero    = document.getElementById('top');
  if(!stick || !catnav) return;

  const links   = [...catnav.querySelectorAll('a')];
  const targets = links
    .map(a => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(t => t.el);

  const navEl = document.getElementById('nav');
  const list  = catnav.querySelector('.catnav__list');

  // Liczymy nagłówek + PEŁNĄ wysokość paska kategorii, także gdy jest
  // jeszcze zwinięty. Inaczej kliknięcie „Zobacz menu" z hero trafiałoby
  // w pozycję sprzed rozwinięcia paska i nagłówek sekcji chowałby się
  // pod nim w trakcie przewijania.
  const setStickHeight = () => {
    const h = (navEl ? navEl.offsetHeight : 0) + (list ? list.offsetHeight : 0);
    document.documentElement.style.setProperty('--stick', h + 'px');
    // scroll-margin-top jest liczony z --stick, więc odświeżamy cache
    // tutaj. Czytanie go w każdej klatce przewijania wymuszałoby
    // przeliczenie stylów sześć razy na klatkę.
    targets.forEach(t => {
      t.reserve = parseFloat(getComputedStyle(t.el).scrollMarginTop) || 0;
    });
  };

  if('ResizeObserver' in window){
    const ro = new ResizeObserver(setStickHeight);
    if(navEl) ro.observe(navEl);
    if(list)  ro.observe(list);
  } else {
    window.addEventListener('resize', setStickHeight);
  }
  setStickHeight();

  // Pasek pojawia się dopiero po zejściu z pierwszego ekranu, żeby
  // nie odbierać miejsca nagłówkowi i CTA na 375 px.
  const threshold = () => Math.min(300, (hero ? hero.offsetHeight : 600) * 0.45);

  let ticking = false;
  const update = () => {
    ticking = false;
    catnav.classList.toggle('is-on', window.scrollY > threshold());

    // Aktywna jest ostatnia sekcja, do której kotwica już „doskoczyła":
    // porównujemy pozycję docelową (górna krawędź minus scroll-margin-top)
    // z bieżącym scrollem. Liczenie tego z aktualnej wysokości paska
    // dawało przesunięcie o jedną pozycję — pasek zwinięty ma 73 px,
    // a kotwica rezerwuje 147 px, więc sekcja nigdy nie dobijała do linii.
    let active = null;
    for(const t of targets){
      const landing = t.el.getBoundingClientRect().top + window.scrollY - (t.reserve || 0);
      if(landing - 2 <= window.scrollY) active = t;
    }
    // przy samym dole strony podświetlamy ostatnią pozycję —
    // niskie sekcje nigdy nie dotarłyby do linii
    if(window.innerHeight + window.scrollY >= document.body.scrollHeight - 4){
      active = targets[targets.length - 1];
    }
    links.forEach(a => {
      const on = active && a === active.a;
      a.classList.toggle('is-active', !!on);
      // "location" to właściwy token dla „tu właśnie jesteś" w nawigacji
      if(on) a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
  };

  const onScroll = () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  update();
}

/* ---------- start ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderPizza();
  renderAddons();
  renderCards();
  renderGallery();
  renderHours();
  renderYears();
  injectSchema();
  initReveal();
  initCounters();
  initNav();
  initCatnav();
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
  setInterval(renderHours, 60000);
});
