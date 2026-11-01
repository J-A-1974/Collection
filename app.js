(() => {
  'use strict';

  const cfg = window.COLLECTION_CONFIG;
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

  // ---------- Listes ----------
  const DEFAULT_CATEGORIES = [
    { name: 'Jeux vidéo', icon: '🎮', color: '#6366f1', shape: 'cartouche' },
    { name: 'Jouets', icon: '🧸', color: '#ec4899', shape: 'blister' },
    { name: 'Maillots de foot', icon: '👕', color: '#10b981', shape: 'maillot' },
    { name: 'Consoles', icon: '🕹️', color: '#8b5cf6', shape: 'ecran' },
    { name: 'Ballons de foot', icon: '⚽', color: '#f59e0b', shape: 'ballon' },
    { name: 'Accessoires', icon: '🎧', color: '#0ea5e9', shape: 'ticket' },
  ];
  const SHAPES = [
    ['classique', 'Classique'], ['cartouche', 'Cartouche'], ['ecran', 'Télé'], ['maillot', 'Maillot'],
    ['ballon', 'Ballon'], ['blister', 'Blister'], ['ticket', 'Ticket'], ['bouton', 'Bouton'],
    ['appli', 'Appli'], ['hexagone', 'Hexagone'], ['octogone', 'Octogone'], ['ecusson', 'Écusson'],
    ['pilule', 'Pilule'], ['etoile', 'Étoile'], ['feuille', 'Feuille'], ['losange', 'Losange'],
  ];
  const THEMES = [
    ['synthwave', 'Synthwave 80', 'Rétro'], ['arcade', 'Arcade', 'Rétro'], ['heroique', 'Héroïque', 'Rétro'],
    ['memphis', 'Années 90', 'Rétro'], ['gameboy', 'Game Boy', 'Rétro'],
    ['confettis', 'Confettis', 'Fun et coloré'], ['bonbons', 'Bonbons', 'Fun et coloré'], ['arcenciel', 'Arc-en-ciel', 'Fun et coloré'],
    ['tropical', 'Tropical', 'Fun et coloré'], ['popart', 'Pop art', 'Fun et coloré'],
    ['blanc', 'Blanc pur', 'Clair et épuré'], ['nuage', 'Nuage', 'Clair et épuré'], ['pastel', 'Pastel', 'Clair et épuré'], ['sable', 'Sable', 'Clair et épuré'],
    ['aurore', 'Aurore', 'Moderne'], ['graphite', 'Graphite', 'Moderne'], ['ocean', 'Océan', 'Moderne'], ['verre', 'Verre', 'Moderne'],
    ['photo', 'Ma photo', 'Personnel'],
  ];
  const LIGHT_THEMES = ['confettis', 'bonbons', 'popart', 'blanc', 'nuage', 'pastel', 'sable', 'verre'];
  // Taille des cartes, retenue sur ce téléphone
  let cardSize = 'grand';
  try { cardSize = localStorage.getItem('cardSize') || 'grand'; } catch {}
  let bgStill = false;
  try { bgStill = localStorage.getItem('bgStill') === '1'; } catch {}
  const OWNERS = ['Papa', 'Maman', 'Anaïs', 'Elodie'];
  const PLACES = ['Normandie', 'Montgeron'];
  // Sous-cartes proposées d'office dans « Jeux vidéo » et « Consoles »
  const FEATURED_PLATFORMS = ['PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'Master System', 'Mega Drive', 'Mega CD', 'Xbox 360', 'Xbox One'];
  const PLATFORMS = [...FEATURED_PLATFORMS, 'PSP', 'PS Vita', 'Xbox', 'Xbox Series', 'Saturn', 'Dreamcast', 'Game Gear',
    'NES', 'Super Nintendo', 'Nintendo 64', 'GameCube', 'Wii', 'Wii U', 'Nintendo Switch', 'Game Boy', 'Game Boy Advance', 'Nintendo DS', 'Nintendo 3DS',
    'Neo Geo', 'Atari 2600', 'PC'];
  const BRANDS = {
    jeux: ['Nintendo', 'Sony', 'Microsoft', 'Sega', 'Atari', 'SNK', 'Ubisoft', 'Electronic Arts', 'Activision', 'Square Enix', 'Capcom', 'Konami', 'Bandai Namco', 'Rockstar', 'Bethesda'],
    jouets: ['Playmobil', 'Lego', 'Mattel', 'Hasbro', 'Kenner', 'Bandai', 'Hot Wheels', 'Majorette', 'Corolle', 'Smoby', 'VTech', 'Ravensburger', 'Asmodee', 'Dujardin', 'Panini'],
    voitures: ['Ferrari', 'Lamborghini', 'Porsche', 'Bugatti', 'McLaren', 'Aston Martin', 'Mercedes', 'BMW', 'Audi', 'Volkswagen', 'Peugeot', 'Renault', 'Citroën', 'Alpine', 'Ford', 'Chevrolet', 'Dodge', 'Jaguar', 'Mini', 'Fiat',
      'Burago', 'Maisto', 'Solido', 'Norev', 'Majorette', 'Hot Wheels', 'Minichamps', 'Kyosho', 'AutoArt'],
    musique: ['Universal', 'Sony Music', 'Warner', 'EMI', 'Columbia', 'Polydor', 'Virgin', 'Atlantic', 'Disney', 'Warner Bros', 'Gaumont', 'Pathé', 'Fox', 'Paramount'],
    vaisselle: ['Disney', 'Arcopal', 'Luminarc', 'Duralex', 'Pyrex', 'Villeroy & Boch', 'Le Creuset', 'Ikea', 'Primark', 'Disney Store'],
    sport: ['Adidas', 'Nike', 'Puma', 'Kappa', 'Le Coq Sportif', 'Umbro', 'Macron', 'New Balance', 'Kipsta', 'Mitre', 'Select'],
  };
  // Type de catégorie, d'après son nom, pour proposer les bons champs et les bonnes marques
  // ---------- Arborescence : catégories et sous-thèmes ----------
  const childrenOf = (id) => categories.filter((c) => (c.parent_id || null) === (id || null))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || cmpText(a.created_at || '', b.created_at || ''));
  function subtreeIds(id) {
    const ids = new Set([id]);
    let added = true;
    while (added) { added = false; for (const c of categories) if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) { ids.add(c.id); added = true; } }
    return ids;
  }
  const itemsUnder = (id) => { const ids = subtreeIds(id); return items.filter((x) => ids.has(x.category_id)); };
  function ancestors(cat) {
    const out = []; let c = cat; let guard = 0;
    while (c && guard++ < 20) { out.unshift(c); c = categories.find((p) => p.id === c.parent_id); }
    return out;
  }
  const pathName = (cat) => ancestors(cat).map((c) => c.name).join(' › ');
  // Toutes les catégories dans l'ordre de l'arbre (pour le menu « Catégorie » d'un objet)
  function treeList(parent = null, depth = 0, out = []) {
    for (const c of childrenOf(parent)) { out.push({ c, depth }); treeList(c.id, depth + 1, out); }
    return out;
  }

  function kindOf(cat) {
    const n = ancestors(cat).map((c) => c.name).join(' ').toLowerCase();
    if (/voiture|auto|miniature|1\s*[\/:]\s*\d+/.test(n)) return 'voitures';
    if (/musique|vinyle|\bcd\b|cassette|dvd|blu-?ray|vhs|film/.test(n)) return 'musique';
    if (/vaisselle|bol|mug|assiette|couvert|verre/.test(n)) return 'vaisselle';
    if (/jeux?\s*vid|vid[ée]o/.test(n)) return 'jeux';
    if (/console/.test(n)) return 'consoles';
    if (/maillot|ballon|foot|sport|crampon|basket/.test(n)) return 'sport';
    if (/jouet|playmo|lego|figurine|poup|peluche|carte|jeu|voiture|maquette/.test(n)) return 'jouets';
    return 'autre';
  }
  const NATIONAL_TEAMS = ['France', 'Portugal', 'Argentine', 'Brésil', 'Allemagne', 'Espagne', 'Italie', 'Angleterre', 'Pays-Bas', 'Belgique', 'Croatie',
    'Uruguay', 'Mexique', 'États-Unis', 'Japon', 'Maroc', 'Sénégal', 'Algérie', 'Cameroun', 'Côte d’Ivoire', 'Colombie', 'Suisse', 'Danemark', 'Suède', 'Écosse'];
  const CLUBS = ['Paris SG', 'Marseille', 'Lyon', 'Lille', 'Monaco', 'Nantes', 'Saint-Étienne', 'Bordeaux', 'Lens', 'Rennes', 'Nice', 'Benfica', 'FC Porto', 'Sporting CP',
    'Real Madrid', 'FC Barcelone', 'Atlético Madrid', 'Manchester United', 'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Juventus', 'AC Milan', 'Inter Milan',
    'Bayern Munich', 'Borussia Dortmund', 'Ajax', 'Boca Juniors', 'Flamengo'];
  const TEAM_TYPES = ['Équipe nationale', 'Club', 'Autre'];
  // Maillots : flocage (joueur + numéro) et version
  const PLAYERS = ['Mbappé', 'Zidane', 'Griezmann', 'Benzema', 'Henry', 'Platini', 'Giroud', 'Pogba', 'Dembélé', 'Kanté', 'Ribéry', 'Cantona', 'Papin', 'Deschamps',
    'Thuram', 'Barthez', 'Lloris', 'Pires', 'Trezeguet', 'Vieira', 'Makelele', 'Desailly', 'Lizarazu', 'Hernandez', 'Camavinga', 'Tchouaméni', 'Saliba', 'Olise', 'Doué',
    'Ronaldo', 'Messi', 'Neymar', 'Pelé', 'Maradona', 'Ronaldinho', 'Kaká', 'Rivaldo', 'Romário', 'Vinícius Jr', 'Figo', 'Eusébio', 'Rui Costa', 'Bernardo Silva',
    'Bruno Fernandes', 'Pepe', 'Haaland', 'Bellingham', 'Kane', 'Salah', 'Lewandowski', 'De Bruyne', 'Modrić', 'Benzema', 'Ibrahimović', 'Beckham', 'Rooney', 'Gerrard',
    'Lampard', 'Drogba', 'Eto’o', 'Weah', 'Iniesta', 'Xavi', 'Ramos', 'Casillas', 'Raúl', 'Pirlo', 'Totti', 'Del Piero', 'Maldini', 'Baggio', 'Buffon', 'Cruyff',
    'Van Basten', 'Robben', 'Beckenbauer', 'Müller', 'Kroos', 'Neuer', 'Yamal', 'Pedri', 'Hakimi', 'Mahrez', 'Mané', 'Son', 'Suárez', 'Cavani', 'Di María', 'Hazard'];
  const SHIRT_NUMBERS = Array.from({ length: 99 }, (_, i) => String(i + 1));
  const SHIRT_VERSIONS = ['Porté par un joueur', 'Officiel', 'Réplique'];
  const WORN = 'Porté par un joueur';
  const isShirt = (cat) => cat && /maillot/i.test(pathName(cat));
  function brandsFor(kind) {
    if (kind === 'jeux' || kind === 'consoles') return BRANDS.jeux;
    if (BRANDS[kind]) return BRANDS[kind];
    return [...BRANDS.jeux, ...BRANDS.jouets, ...BRANDS.sport].sort((a, b) => a.localeCompare(b, 'fr'));
  }
  // Menu déroulant avec « Autre… » qui ouvre une case pour écrire soi-même
  function selectOther(name, options, value, placeholder) {
    const list = value && !options.includes(value) ? [value, ...options] : options;
    return `<select name="${name}" data-other="${name}"><option value="">Choisir…</option>
      ${list.map((o) => `<option ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('')}
      <option value="__autre">✏️ Autre…</option></select>
      <input name="${name}__autre" placeholder="${esc(placeholder)}" hidden style="margin-top:6px">`;
  }
  function wireOther(root) {
    root.querySelectorAll('select[data-other]').forEach((sel) => {
      sel.onchange = () => {
        const input = root.querySelector(`[name="${sel.dataset.other}__autre"]`);
        input.hidden = sel.value !== '__autre';
        if (!input.hidden) input.focus();
      };
    });
  }
  const qty = (x) => Math.max(1, Number(x.quantity) || 1);
  const countOf = (list) => list.reduce((s, x) => s + qty(x), 0);
  const valueOf = (list) => list.reduce((s, x) => s + (Number(x.estimated_value) || 0) * qty(x), 0);
  // Liste d'un menu : valeurs d'origine + toutes celles déjà enregistrées sur des objets
  const withUsed = (base, field) => {
    const extra = [...new Set(items.map((i) => i[field]).filter(Boolean))].filter((v) => !base.includes(v)).sort((a, b) => a.localeCompare(b, 'fr'));
    return [...base, ...extra];
  };
  const otherValue = (fd, name) => (fd[name] === '__autre' ? (fd[name + '__autre'] || '').trim() : fd[name]) || null;
  const CONDITIONS = ['Neuf (sous blister)', 'Neuf', 'Très bon', 'Bon', 'Moyen', 'Abîmé'];
  const EMOJI_GROUPS = [
    ['Jeux et jouets', ['🎮', '🕹️', '👾', '🎰', '🧸', '🪀', '🪁', '🧩', '🎲', '♟️', '🃏', '🀄', '🎴', '🪅', '🪆', '🤖', '🦸', '🦹', '🧙', '🧌', '👸', '🦖', '🦄', '🐉', '🚂', '🚗', '🏎️', '🚓', '🚒', '🚜', '✈️', '🚀', '🛸', '⛵', '🏰']],
    ['Sport', ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🏓', '🏸', '🥊', '⛳', '🏒', '🎿', '🛹', '🚲', '🏁', '👕', '🎽', '👟', '🧢', '🏆', '🥇', '🏅', '🎖️']],
    ['Pins, badges, objets', ['📌', '📍', '🔘', '🎗️', '💎', '💍', '👑', '⌚', '🕶️', '👜', '🎒', '🔑', '🗝️', '🪙', '💰', '🧲', '🔮', '🏺', '🗿', '🎁', '📦', '🧳', '🖼️', '🪞']],
    ['Musique, films, livres', ['🎧', '🎵', '🎸', '🎹', '🥁', '🎺', '🎻', '🎤', '📻', '📀', '💿', '📼', '📺', '📷', '📸', '🎥', '🎬', '🎞️', '📚', '📖', '📰', '✉️', '📮', '🗺️']],
    ['Divers', ['⭐', '🌟', '✨', '🔥', '💥', '❤️', '💙', '💚', '💛', '💜', '🖤', '🍀', '🌈', '☀️', '🌙', '⚡', '❄️', '🌸', '🐱', '🐶', '🦁', '🐼', '🦊', '🐸', '🍕', '🍔', '🍭', '🍩', '☕', '🍷', '⚔️', '🛡️', '🧪', '💡', '🔧', '🧵']],
  ];
  const EMOJIS = EMOJI_GROUPS.flatMap((g) => g[1]);
  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ef4444', '#14b8a6', '#64748b', '#ff3d9a', '#29e6ff', '#7cff6b'];
  const VIVID_COLORS = ['#ffe600', '#76ff03', '#00e676', '#00b0ff', '#2979ff', '#ff1744', '#ff9100', '#ff4081', '#d500f9', '#1de9b6', '#ffffff', '#111111'];
  const GRADIENTS = ['grad:#ff512f,#f09819', 'grad:#ff1744,#ff9100,#ffe600,#00e676,#00b0ff,#d500f9', 'grad:#00c6ff,#0072ff', 'grad:#00e676,#00b0ff',
    'grad:#ff4081,#7c4dff', 'grad:#ff1744,#ffe600', 'grad:#1de9b6,#2979ff', 'grad:#d500f9,#2979ff,#00e5ff', 'grad:#ffe600,#76ff03', 'grad:#ff9a8b,#ff6a88,#ff99ac',
    'grad:#f7971e,#ffd200', 'grad:#8e2de2,#ff4081,#ffb800'];
  // Fond d'une carte : couleur unie (légèrement dégradée) ou mélange de couleurs
  function colorBg(c) {
    if (String(c).startsWith('grad:')) return `linear-gradient(135deg, ${c.slice(5)})`;
    if (VIVID_COLORS.includes(c)) return `linear-gradient(160deg, ${c} 45%, ${shade(c, 0.85)})`;
    return `linear-gradient(160deg, ${c}, ${shade(c)})`;
  }

  // Logo par défaut (créé pour l'appli), remplaçable par l'image de son choix
  const DEFAULT_LOGO = `<svg viewBox="0 0 360 110" xmlns="http://www.w3.org/2000/svg" aria-label="Ma Collection">
    <defs>
      <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c2"/><stop offset=".45" stop-color="#ffc93c"/><stop offset=".55" stop-color="#e08a00"/><stop offset="1" stop-color="#ffd76a"/></linearGradient>
      <linearGradient id="lg-band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a3d"/><stop offset="1" stop-color="#8a0f2e"/></linearGradient>
      <path id="lg-arc" d="M 20 92 Q 180 18 340 92"/>
    </defs>
    <path d="M 8 98 Q 180 14 352 98 L 344 108 Q 180 30 16 108 Z" fill="url(#lg-band)" stroke="#2a0710" stroke-width="3"/>
    <text font-family="Bungee, 'Arial Black', Impact, sans-serif" font-size="34" letter-spacing="1" text-anchor="middle"
      fill="url(#lg-gold)" stroke="#3a1600" stroke-width="2.5" paint-order="stroke" style="filter:drop-shadow(0 3px 0 #3a1600)">
      <textPath href="#lg-arc" startOffset="50%">MA COLLECTION</textPath>
    </text>
    <g transform="translate(180 18)"><path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z" fill="url(#lg-gold)" stroke="#3a1600" stroke-width="2"/></g>
  </svg>`;

  const $ = (s) => document.querySelector(s);
  const app = $('#app'), logoEl = $('#logo'), backBtn = $('#backBtn'), menuBtn = $('#menuBtn'), fab = $('#fab');
  const modal = $('#modal'), modalBody = $('#modalBody');

  let user = null;
  let categories = [];
  let items = [];
  let settings = { theme: 'synthwave' };
  const urlCache = new Map();

  // ---------- Utilitaires ----------
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (v) => (v == null || v === '' ? '' : Number(v).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }));
  const numOrNull = (v) => (v === '' || v == null ? null : Number(String(v).replace(',', '.')));
  const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;
  const matches = (x, q) => [x.name, x.brand, x.platform, x.team, x.owner, x.location, x.notes].some((f) => (f || '').toLowerCase().includes(q));

  function toast(msg, ms = 2500) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), ms);
  }
  function fail(err) { console.error(err); toast('Erreur : ' + (err?.message || err), 4000); }
  function openModal(html) { modalBody.innerHTML = html; if (!modal.open) modal.showModal(); modalBody.scrollTop = 0; }
  function closeModal() { modal.close(); modalBody.innerHTML = ''; }
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Réduit une image au maximum avant l'envoi (WebP, ou JPEG si le téléphone ne sait pas faire de WebP)
  async function compressImage(file, { maxSize = 640, maxKB = 50, keepAlpha = false } = {}) {
    let src;
    try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch {
      src = await new Promise((res, rej) => {
        const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = URL.createObjectURL(file);
      });
    }
    const scale = Math.min(1, maxSize / Math.max(src.width, src.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(src.width * scale); canvas.height = Math.round(src.height * scale);
    canvas.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);
    const toBlob = (type, q) => new Promise((r) => canvas.toBlob(r, type, q));
    let quality = 0.6;
    let blob = await toBlob('image/webp', quality);
    const webp = blob && blob.type === 'image/webp';
    const type = webp ? 'image/webp' : keepAlpha ? 'image/png' : 'image/jpeg';
    if (!webp) blob = await toBlob(type, quality);
    while (type !== 'image/png' && blob.size > maxKB * 1024 && quality > 0.25) {
      quality -= 0.08;
      blob = await toBlob(type, quality);
    }
    return blob;
  }

  async function uploadFile(blob) {
    const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/svg+xml': 'svg' }[blob.type] || 'jpg';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from('collection-photos').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
    if (error) throw error;
    return path;
  }
  const removeFiles = (paths) => {
    const list = paths.filter(Boolean);
    return list.length ? sb.storage.from('collection-photos').remove(list) : null;
  };

  async function signedUrls(paths) {
    const missing = [...new Set(paths.filter((p) => p && !urlCache.has(p)))];
    if (!missing.length) return;
    const { data, error } = await sb.storage.from('collection-photos').createSignedUrls(missing, 60 * 60 * 24);
    if (!error) data.forEach((d) => d.signedUrl && urlCache.set(d.path, d.signedUrl));
  }

  // ---------- Apparence ----------
  function applyLook() {
    const t = settings.theme || 'synthwave';
    document.body.className = `theme-${t}${LIGHT_THEMES.includes(t) ? ' light' : ''}${cardSize === 'petit' ? ' cards-small' : ''}${bgStill ? ' still' : ''}`;
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', LIGHT_THEMES.includes(t) ? '#ffffff' : '#0f0a1f');
    const bg = $('#bg');
    const bgUrl = settings.theme === 'photo' && settings.bg_path && urlCache.get(settings.bg_path);
    bg.style.backgroundImage = bgUrl ? `url('${bgUrl}')` : '';
    const logoUrl = settings.logo_path ? urlCache.get(settings.logo_path) : settings.logo_url;
    logoEl.innerHTML = logoUrl ? `<img src="${esc(logoUrl)}" alt="Logo">` : DEFAULT_LOGO;
    const img = logoEl.querySelector('img');
    if (img) img.onerror = () => { logoEl.innerHTML = DEFAULT_LOGO; };
  }
  logoEl.onclick = () => user && go('#/');

  // Images des sous-cartes : { "idCatégorie|PS2": { path } ou { url } }
  const groupImages = () => settings.group_images || {};
  const groupImagePaths = () => Object.values(groupImages()).map((v) => v.path).filter(Boolean);
  function groupImageUrl(catId, g) {
    const v = groupImages()[`${catId}|${g}`];
    return v ? (v.path ? urlCache.get(v.path) : v.url) : null;
  }
  async function setGroupImage(catId, g, value) {
    const key = `${catId}|${g}`;
    const old = groupImages()[key];
    const next = { ...groupImages() };
    if (value) next[key] = value; else delete next[key];
    try { await saveSettings({ group_images: next }); }
    catch (e) {
      if (/group_images/.test(e?.message || '')) throw new Error('il manque une petite mise à jour dans Supabase (voir le message de Claude)');
      throw e;
    }
    await signedUrls(groupImagePaths());
    if (old?.path && old.path !== value?.path) removeFiles([old.path]);
  }

  async function saveSettings(patch) {
    const old = { ...settings };
    settings = { ...settings, ...patch, user_id: user.id, updated_at: new Date().toISOString() };
    const { error } = await sb.from('collection_settings').upsert(settings);
    if (error) { settings = old; throw error; }
    await signedUrls([settings.bg_path, settings.logo_path]);
    applyLook();
    // Supprime les anciennes images remplacées
    const gone = ['bg_path', 'logo_path'].map((k) => old[k] !== settings[k] && old[k]).filter(Boolean);
    removeFiles(gone);
  }

  // ---------- Données ----------
  async function loadAll() {
    const [c, i, s] = await Promise.all([
      sb.from('collection_categories').select('*').order('position').order('created_at'),
      sb.from('collection_items').select('*').order('created_at', { ascending: false }),
      sb.from('collection_settings').select('*').maybeSingle(),
    ]);
    if (c.error) throw c.error;
    if (i.error) throw i.error;
    categories = c.data; items = i.data;
    settings = s.data || { theme: 'synthwave' };
    if (settings.view_prefs && Object.keys(settings.view_prefs).length) {
      prefs = settings.view_prefs;
      try { localStorage.setItem('viewPrefs', JSON.stringify(prefs)); } catch {}
    }
    if (!categories.length) {
      const { data, error } = await sb.from('collection_categories').insert(DEFAULT_CATEGORIES.map((d, n) => ({ ...d, position: n }))).select();
      if (error) throw error;
      categories = data;
    }
    await signedUrls([...items.map((x) => x.photo_path), settings.bg_path, settings.logo_path, ...groupImagePaths()]);
    applyLook();
    await seedCollection();
  }

  // Cartes de départ avec leurs sous-thèmes, créées une seule fois (si la base gère les sous-thèmes)
  const SEEDS = [
    { key: 'collection', name: 'Collection', icon: '🏆', color: 'grad:#d500f9,#2979ff,#00e5ff', shape: 'appli', kids: [
      { name: 'Harry Potter', icon: '🧙', color: 'grad:#8e2de2,#ff4081,#ffb800', shape: 'ecusson', kids: [
        { name: 'Jouets', icon: '🧸', color: '#ec4899' }, { name: 'Livres', icon: '📚', color: '#0ea5e9' },
        { name: 'Films', icon: '🎬', color: '#ef4444' }, { name: 'Objets de collection', icon: '🏺', color: '#f59e0b' }] },
      { name: 'Voitures', icon: '🏎️', color: 'grad:#ff1744,#ff9100', kids: [
        { name: '1/18', icon: '🚗', color: '#ff1744', shape: 'appli' }, { name: '1/24', icon: '🚗', color: '#2979ff', shape: 'appli' },
        { name: '1/43', icon: '🚗', color: '#00e676', shape: 'appli' }] }] },
    { key: 'vaisselle', name: 'Vaisselle', icon: '☕', color: 'grad:#1de9b6,#2979ff', shape: 'ballon', kids: [
      { name: 'Disney', icon: '🏰', color: 'grad:#2979ff,#d500f9', shape: 'ecusson', kids: [
        { name: 'Bols', icon: '🥣', color: '#ff9100' }, { name: 'Mugs', icon: '☕', color: '#ff4081' }, { name: 'Assiettes', icon: '🍽️', color: '#00b0ff' },
        { name: 'Couverts', icon: '🍴', color: '#64748b' }, { name: 'Verres', icon: '🥛', color: '#1de9b6' }] }] },
    { key: 'musique', name: 'Musique et films', icon: '🎵', color: 'grad:#ff1744,#d500f9,#2979ff', shape: 'bouton', kids: [
      { name: 'CD', icon: '💿', color: '#00b0ff', shape: 'ballon' }, { name: 'Vinyles', icon: '🎶', color: '#111111', shape: 'ballon' },
      { name: 'Cassettes', icon: '📼', color: '#ff9100', shape: 'ticket' },
      { name: 'Films', icon: '🎬', color: '#ef4444', shape: 'ecran', kids: [
        { name: 'DVD', icon: '📀', color: '#2979ff' }, { name: 'Blu-ray', icon: '📀', color: '#00b0ff' }, { name: 'VHS', icon: '📼', color: '#111111' }] }] },
  ];
  async function seedCollection() {
    if (!categories.length || !('parent_id' in categories[0])) return;
    const make = async (node, parentId, position) => {
      const row = { name: node.name, icon: node.icon, color: node.color, shape: node.shape || 'classique', position };
      if (parentId) row.parent_id = parentId;
      const { data, error } = await sb.from('collection_categories').insert(row).select().single();
      if (error) throw error;
      categories.push(data);
      for (const [i, k] of (node.kids || []).entries()) await make(k, data.id, i);
    };
    for (const seed of SEEDS) {
      if (prefs.__seed?.[seed.key]) continue;
      try {
        const exists = categories.some((c) => !c.parent_id && c.name.trim().toLowerCase() === seed.name.toLowerCase());
        if (!exists) await make(seed, null, childrenOf(null).length);
        await savePrefs('__seed', { [seed.key]: true });
      } catch (e) { console.warn('Carte non créée', seed.name, e); }
    }
  }

  // ---------- Écrans ----------
  function setHeader({ back = false, fabVisible = true } = {}) {
    backBtn.hidden = !back; menuBtn.hidden = false; fab.hidden = !fabVisible;
  }

  // Une carte : la forme (cartouche, maillot…) avec la photo ou l'icône, et le texte dessous
  function faceHtml(shape, color, url, icon) {
    const style = url ? `background-image:url('${esc(url)}')` : `background:${esc(colorBg(color))}`;
    return `<div class="face${url ? ' photo' : ''}" style="${style}">${url ? '' : `<span class="emoji">${esc(icon)}</span>`}</div>`;
  }
  // Couleur d'une sous-carte selon la famille de console ou la marque
  function groupColor(v) {
    const n = (v || '').toLowerCase();
    if (/^ps|playstation|psp|vita|sony/.test(n)) return '#1f4bd8';
    if (/xbox|microsoft/.test(n)) return '#118a11';
    if (/sega|master|mega|saturn|dreamcast|game gear/.test(n)) return '#0b3d91';
    if (/nintendo|wii|switch|game ?boy|nes|gamecube|\bds\b|3ds/.test(n)) return '#d4001a';
    if (/atari|neo ?geo|snk/.test(n)) return '#9a4a12';
    let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return COLORS[h % COLORS.length];
  }
  // ---------- Tri et classement choisis par l'utilisateur ----------
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem('viewPrefs') || '{}'); } catch {}
  const catPrefs = (catId) => ({ group: 'auto', groupSort: 'defaut', itemSort: 'recent', ...(prefs[catId] || {}) });
  async function savePrefs(key, patch) {
    prefs = { ...prefs, [key]: { ...(prefs[key] || {}), ...patch } };
    try { localStorage.setItem('viewPrefs', JSON.stringify(prefs)); } catch {}
    if ('view_prefs' in settings) settings.view_prefs = prefs;
    // Copie dans Supabase pour la retrouver sur un autre appareil (ignorée si la colonne n'existe pas encore)
    try { await sb.from('collection_settings').upsert({ user_id: user.id, view_prefs: prefs }); } catch {}
  }
  const GROUP_FIELDS = [
    ['auto', 'Automatique'], ['platform', 'Console'], ['brand', 'Marque'], ['team_type', 'Équipe nationale ou club'], ['team', 'Équipe'], ['owner', 'Propriétaire'],
    ['location', 'Lieu'], ['year', 'Année'], ['condition', 'État'], ['price', 'Tarif'], ['letter', 'Première lettre du nom'], ['none', 'Pas de sous-cartes'],
  ];
  const GROUP_SORTS = [['defaut', 'Ordre actuel'], ['az', 'A → Z'], ['za', 'Z → A'], ['plus', 'Plus d’objets d’abord'], ['moins', 'Moins d’objets d’abord']];
  const ITEM_SORTS = [['recent', 'Ajoutés récemment'], ['ancien', 'Ajoutés en premier'], ['az', 'Nom A → Z'], ['za', 'Nom Z → A'],
    ['prix_asc', 'Tarif croissant'], ['prix_desc', 'Tarif décroissant'], ['annee_asc', 'Année croissante'], ['annee_desc', 'Année décroissante']];
  const HOME_SORTS = [['manuel', 'Ordre actuel'], ['az', 'A → Z'], ['za', 'Z → A'], ['plus', 'Plus d’objets d’abord'], ['moins', 'Moins d’objets d’abord']];
  const PRICE_RANGES = ['Moins de 10 €', '10 à 50 €', '50 à 100 €', '100 à 500 €', 'Plus de 500 €'];
  const cmpText = (a, b) => String(a).localeCompare(String(b), 'fr', { numeric: true, sensitivity: 'base' });
  function sortItems(list, how) {
    const l = [...list];
    const num = (v, dflt) => (v == null || v === '' ? dflt : Number(v));
    const by = {
      recent: (a, b) => cmpText(b.created_at, a.created_at),
      ancien: (a, b) => cmpText(a.created_at, b.created_at),
      az: (a, b) => cmpText(a.name, b.name),
      za: (a, b) => cmpText(b.name, a.name),
      prix_asc: (a, b) => num(a.estimated_value, Infinity) - num(b.estimated_value, Infinity),
      prix_desc: (a, b) => num(b.estimated_value, -Infinity) - num(a.estimated_value, -Infinity),
      annee_asc: (a, b) => num(a.year, Infinity) - num(b.year, Infinity),
      annee_desc: (a, b) => num(b.year, -Infinity) - num(a.year, -Infinity),
    }[how];
    return by ? l.sort(by) : l;
  }

  const autoField = (cat) => (['jeux', 'consoles'].includes(kindOf(cat)) ? 'platform' : 'brand');
  // Niveaux de sous-cartes : ex. maillots → « Équipe nationale / Club » puis « Équipe »
  function groupChain(cat) {
    const g = catPrefs(cat?.id).group;
    if (g === 'none') return [];
    if (g !== 'auto') return [g];
    if (kindOf(cat) === 'sport') return ['team_type', 'team'];
    // Sous-thème (ex. Vaisselle › Disney › Mugs, Collection › Voitures › 1/18) : objets affichés directement.
    // José peut quand même choisir un rangement avec « ↕ Trier ».
    if (cat?.parent_id) return [];
    // Cartes créées par José (ex. Jeux de société) : objets affichés directement.
    // Rangement automatique seulement pour les cartes de départ (Jeux vidéo, Jouets…).
    if (!['jeux', 'consoles'].includes(kindOf(cat)) && !DEFAULT_CATEGORIES.some((d) => d.name === cat?.name)) return [];
    return [autoField(cat)];
  }
  // En mode automatique, une seule sous-carte (ex. tout « Disney ») ne sert à rien : on montre les objets
  const PRESET_FIELDS = ['platform', 'team_type'];
  const skipSingle = (cat, field, pool) => catPrefs(cat?.id).group === 'auto' && !PRESET_FIELDS.includes(field)
    && new Set(pool.map((x) => groupOf(x, field))).size <= 1;
  const groupField = (cat) => groupChain(cat)[0] || 'none';
  const NONE = '__aucun';
  function groupOf(x, field) {
    if (field === 'none') return NONE;
    if (field === 'letter') { const c = (x.name || '').trim().charAt(0).toUpperCase(); return c ? c.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : NONE; }
    if (field === 'price') {
      const v = x.estimated_value;
      if (v == null || v === '') return NONE;
      return v < 10 ? PRICE_RANGES[0] : v < 50 ? PRICE_RANGES[1] : v < 100 ? PRICE_RANGES[2] : v < 500 ? PRICE_RANGES[3] : PRICE_RANGES[4];
    }
    const v = x[field];
    return v == null || v === '' ? NONE : String(v);
  }
  const NONE_LABELS = { platform: 'Sans console', brand: 'Sans marque', owner: 'Sans propriétaire', location: 'Sans lieu', year: 'Sans année',
    condition: 'Sans état', price: 'Sans tarif', letter: 'Sans nom', team_type: 'Sans type', team: 'Sans équipe' };
  const groupLabel = (g, field) => (g === NONE ? NONE_LABELS[field] || 'Autres' : g);
  const groupLink = (catId, g) => `#/c/${catId}/${(Array.isArray(g) ? g : [g]).map(encodeURIComponent).join('/')}`;

  function shade(hex, k = 0.6) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    if (Number.isNaN(n)) return '#1b1435';
    const f = (v) => Math.max(0, Math.round(v * k));
    return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
  }

  const CARD_IMG = '__carte'; // image choisie par José pour une carte ou un sous-thème
  function categoryCard(c) {
    const n = countOf(itemsUnder(c.id));
    const img = groupImageUrl(c.id, CARD_IMG);
    return `<a class="card shape-${esc(c.shape || 'classique')}${img ? ' has-img' : ''}" href="#/c/${c.id}"><span class="edit-pen" role="button" aria-label="Modifier" data-edit="cat" data-id="${c.id}">✏️</span>
      ${img ? `<div class="face" style="background:#fff url('${esc(img)}') center / contain no-repeat"></div>` : faceHtml(c.shape, c.color, null, c.icon)}
      <div class="label"><b>${esc(c.name)}</b><span>${plural(n, 'objet')}</span></div></a>`;
  }

  function itemCard(x) {
    const cat = categories.find((c) => c.id === x.category_id) || {};
    const url = x.photo_path && urlCache.get(x.photo_path);
    const floc = [x.player_name, x.shirt_number && `n°${x.shirt_number}`].filter(Boolean).join(' ');
    const sub = [x.team || x.platform || x.brand, floc, x.year, x.owner, x.location].filter(Boolean).join(' · ');
    const worn = x.shirt_version === WORN;
    return `<a class="card shape-${esc(cat.shape || 'classique')}${worn ? ' worn' : ''}" href="#/i/${x.id}"><span class="edit-pen" role="button" aria-label="Modifier" data-edit="item" data-id="${x.id}">✏️</span>
      <div class="face-wrap">${faceHtml(cat.shape, cat.color || '#334155', url, cat.icon || '📦')}${qty(x) > 1 ? `<span class="qty">×${qty(x)}</span>` : ''}${worn ? '<span class="worn-badge">⭐ Porté</span>' : ''}</div>
      <div class="label"><b>${esc(x.name)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div></a>`;
  }

  // Petit crayon ✏️ sur chaque carte : modifier sans ouvrir la carte
  let editGroup = null; // (g) => menu de la sous-carte, défini par la page catégorie ouverte
  app.addEventListener('click', (e) => {
    const pen = e.target.closest('[data-edit]');
    if (!pen) return;
    e.preventDefault(); e.stopPropagation();
    const { edit, id } = pen.dataset;
    if (edit === 'cat') { const c = categories.find((k) => k.id === id); if (c) categoryMenu(c); }
    if (edit === 'item') { const x = items.find((k) => k.id === id); if (x) itemForm(x); }
    if (edit === 'group' && editGroup) editGroup(id);
  }, true);

  // Supprime des objets (et leurs photos) dans Supabase
  async function deleteItems(list) {
    for (const x of list) {
      const { error } = await sb.from('collection_items').delete().eq('id', x.id);
      if (error) throw error;
      removeFiles([x.photo_path]);
      items = items.filter((i) => i.id !== x.id);
    }
  }

  function renderHome() {
    setHeader();
    fab.onclick = () => itemForm();
    menuBtn.onclick = mainMenu;
    const total = valueOf(items);
    app.innerHTML = `
      <div class="summary">
        <div><b>${countOf(items)}</b><span>objets</span></div>
        <div><b>${childrenOf(null).length}</b><span>catégories</span></div>
        <div><b>${total ? money(total) : '–'}</b><span>valeur totale</span></div>
      </div>
      <div class="searchbar"><input class="search" id="search" type="search" placeholder="🔍 Rechercher dans toute la collection">
        <button class="sort-btn" id="sortBtn">↕ Trier</button></div>
      <div id="results"></div>`;
    $('#sortBtn').onclick = () => sortMenu('Trier les cartes', [['sort', 'Ordre des cartes', HOME_SORTS]], { sort: prefs.home?.sort || 'manuel' }, (p) => savePrefs('home', p));
    const draw = () => {
      const q = $('#search').value.trim().toLowerCase();
      if (q) {
        const found = sortItems(items.filter((x) => matches(x, q)), 'az');
        $('#results').innerHTML = found.length ? `<div class="grid">${found.map(itemCard).join('')}</div>` : '<p class="empty">Aucun résultat</p>';
        return;
      }
      const hs = prefs.home?.sort || 'manuel';
      const cnt = (c) => countOf(itemsUnder(c.id));
      const cats = childrenOf(null).sort({
        az: (a, b) => cmpText(a.name, b.name), za: (a, b) => cmpText(b.name, a.name),
        plus: (a, b) => cnt(b) - cnt(a), moins: (a, b) => cnt(a) - cnt(b),
      }[hs] || (() => 0));
      $('#results').innerHTML = `<div class="grid">${cats.map(categoryCard).join('')}
        <button class="card add" id="addCat"><div class="face">+</div><div class="label"><b>Nouvelle catégorie</b></div></button></div>`;
      $('#addCat').onclick = () => categoryForm();
    };
    $('#search').oninput = draw;
    draw();
  }

  // Fil d'Ariane cliquable : Accueil › Vaisselle › Disney › Mugs (le dernier niveau n'est pas un lien)
  function crumbsHtml(cat, path = [], labels = [], lastLinked = false) {
    const parts = [['🏠', '#/']];
    ancestors(cat).forEach((c, i, arr) => parts.push([i === arr.length - 1 ? `${esc(c.icon)} ${esc(c.name)}` : esc(c.name), `#/c/${c.id}`]));
    labels.forEach((l, i) => parts.push([esc(l), groupLink(cat.id, path.slice(0, i + 1))]));
    return parts.map(([t, h], i) => (i === parts.length - 1 && !lastLinked ? `<span>${t}</span>` : `<a class="crumb" href="${h}">${t}</a>`)).join(' › ');
  }
  function renderCategory(id, path = []) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return go('#/');
    const cp = catPrefs(cat.id);
    const chain = groupChain(cat);
    const level = path.length;
    const field = chain[level];
    const kids = level === 0 ? childrenOf(cat.id) : [];
    // Objets rangés directement dans cette carte, filtrés par les sous-cartes déjà ouvertes
    const all = items.filter((x) => x.category_id === id && path.every((g, i) => groupOf(x, chain[i]) === g));
    const used = field ? [...new Set(all.map((x) => groupOf(x, field)))].filter((g) => g !== NONE) : [];
    // Sous-cartes proposées d'office (PS1…, Équipe nationale…), sauf celles que José a supprimées (si vides)
    const hiddenGroups = cp.hidden || [];
    const preset = (field === 'platform' ? FEATURED_PLATFORMS : field === 'team_type' ? TEAM_TYPES : [])
      .filter((g) => !hiddenGroups.includes([...path, g].join('/')) || all.some((x) => groupOf(x, field) === g));
    const extra = used.filter((v) => !preset.includes(v));
    extra.sort(field === 'price' ? (a, b) => PRICE_RANGES.indexOf(a) - PRICE_RANGES.indexOf(b) : cmpText);
    const groups = [...preset, ...extra];
    const countIn = (g) => countOf(all.filter((x) => groupOf(x, field) === g));
    if (cp.groupSort === 'az') groups.sort(cmpText);
    if (cp.groupSort === 'za') groups.sort((a, b) => cmpText(b, a));
    if (cp.groupSort === 'plus') groups.sort((a, b) => countIn(b) - countIn(a));
    if (cp.groupSort === 'moins') groups.sort((a, b) => countIn(a) - countIn(b));
    if (field && all.some((x) => groupOf(x, field) === NONE)) groups.push(NONE);
    // Pas de sous-cartes vides proposées d'office dans une carte qui ne contient que des sous-thèmes
    const useGroups = !!field && !skipSingle(cat, field, all) && (used.length || (preset.length && (all.length || !kids.length)));
    const list = sortItems(all, cp.itemSort);
    const labels = path.map((g, i) => groupLabel(g, chain[i]));
    const groupName = labels[labels.length - 1] || '';

    setHeader({ back: true });
    const prefill = {};
    path.forEach((g, i) => {
      if (g !== NONE && ['platform', 'brand', 'owner', 'location', 'year', 'condition', 'team_type', 'team'].includes(chain[i])) prefill[chain[i]] = g;
    });
    fab.onclick = () => itemForm(null, cat.id, prefill);
    menuBtn.onclick = () => categoryMenu(cat, path, groupName);
    const scope = level === 0 ? itemsUnder(cat.id) : list;
    const total = valueOf(scope);
    app.innerHTML = `
      <h2 class="page-title">${crumbsHtml(cat, path, labels)}</h2>
      <div class="summary">
        <div><b>${countOf(scope)}</b><span>objets</span></div>
        ${kids.length ? `<div><b>${kids.length}</b><span>sous-thèmes</span></div>` : ''}
        <div><b>${total ? money(total) : '–'}</b><span>valeur</span></div>
      </div>
      <div class="searchbar"><input class="search" id="search" type="search" placeholder="🔍 Rechercher dans ${esc(groupName || cat.name)}">
        <button class="sort-btn" id="sortBtn">↕ Trier</button><button class="sort-btn" id="editBtn" aria-label="Modifier">✏️</button></div>
      <div id="results"></div>`;
    $('#editBtn').onclick = () => categoryMenu(cat, path, groupName);
    editGroup = (g) => categoryMenu(cat, [...path, g], groupLabel(g, field), field);
    $('#sortBtn').onclick = () => sortMenu(`Trier et classer « ${cat.name} »`, [
      ['group', 'Ranger les objets en sous-cartes par', GROUP_FIELDS],
      ['groupSort', 'Ordre des sous-cartes', GROUP_SORTS],
      ['itemSort', 'Ordre des objets', ITEM_SORTS],
    ], cp, (p) => savePrefs(cat.id, p), () => { if (level) go(`#/c/${cat.id}`); });
    const subCard = (g) => {
      const n = countIn(g);
      const label = groupLabel(g, field);
      const color = g === NONE ? '#475569' : groupColor(g);
      const img = groupImageUrl(cat.id, [...path, g].join('/'));
      const size = label.length <= 4 ? 1.6 : label.length <= 7 ? 1.25 : label.length <= 10 ? 1 : 0.85;
      const bg = img ? `background:#fff url('${esc(img)}') center / contain no-repeat` : `background:linear-gradient(160deg, ${color}, ${shade(color)})`;
      return `<a class="card sub shape-${esc(cat.shape || 'classique')}${n ? '' : ' empty-group'}${img ? ' has-img' : ''}" href="${groupLink(cat.id, [...path, g])}"><span class="edit-pen" role="button" aria-label="Modifier" data-edit="group" data-id="${esc(g)}">✏️</span>
        <div class="face" style="${bg}"><span class="tag" style="--fs:${size}">${esc(label)}</span></div>
        <div class="label"><span>${plural(n, 'objet')}</span></div></a>`;
    };
    const fieldName = (GROUP_FIELDS.find((f) => f[0] === field)?.[1] || '').toLowerCase();
    const draw = () => {
      const q = $('#search').value.trim().toLowerCase();
      if (q) {
        const pool = level === 0 ? itemsUnder(cat.id) : all;
        const found = sortItems(pool.filter((x) => matches(x, q)), cp.itemSort);
        $('#results').innerHTML = found.length ? `<div class="grid">${found.map(itemCard).join('')}</div>` : '<p class="empty">Aucun résultat</p>';
        return;
      }
      let html = '';
      if (kids.length) {
        html += `<div class="grid">${kids.map(categoryCard).join('')}
          <button class="card add" id="addSub"><div class="face">+</div><div class="label"><b>Nouveau sous-thème</b></div></button></div>`;
      }
      // Carte « Nouveau sous-thème » toujours visible au premier niveau, même sans sous-thème existant
      const addSubCard = level === 0 && !kids.length
        ? '<button class="card add" id="addSub3"><div class="face">📁</div><div class="label"><b>Nouveau sous-thème</b></div></button>' : '';
      if (useGroups) {
        html += `${kids.length ? '<h3 class="section-title">Objets</h3>' : ''}<div class="grid">${groups.map(subCard).join('')}${addSubCard}</div>
          <p class="hint" style="text-align:center;margin-top:16px">Les objets sont rangés par ${esc(fieldName)}. Tu peux changer ça avec le bouton « ↕ Trier ».</p>`;
      } else if (list.length) {
        html += `${kids.length ? '<h3 class="section-title">Objets</h3>' : ''}<div class="grid">${list.map(itemCard).join('')}
          <button class="card add add-item"><div class="face">+</div><div class="label"><b>Ajouter un objet</b></div></button>${addSubCard}</div>`;
      } else if (!kids.length) {
        html += `<p class="empty">Aucun objet pour l’instant.<br><br>
          <button class="btn primary add-item" style="max-width:280px">➕ Ajouter un objet</button><br><br>
          <button class="btn" id="addSub2" style="max-width:280px">📁 Créer un sous-thème ici</button></p>`;
      } else {
        html += `<div style="text-align:center;margin-top:16px"><button class="btn add-item" style="max-width:280px">➕ Ajouter un objet ici</button></div>`;
      }
      $('#results').innerHTML = html;
      $('#addSub')?.addEventListener('click', () => categoryForm(null, cat.id));
      $('#addSub2')?.addEventListener('click', () => categoryForm(null, cat.id));
      $('#addSub3')?.addEventListener('click', () => categoryForm(null, cat.id));
      document.querySelectorAll('#results .add-item').forEach((b) => (b.onclick = () => itemForm(null, cat.id, prefill)));
    };
    $('#search').oninput = draw;
    draw();
  }

  // Fenêtre de tri : une liste de choix par réglage
  function sortMenu(title, sections, current, onSave, after) {
    const state = { ...current };
    openModal(`<h3>${esc(title)}</h3>
      ${sections.map(([key, label, opts]) => `<div class="lbl">${label}</div>
        <div class="chips">${opts.map(([v, l]) => `<button type="button" data-k="${key}" data-v="${v}" class="${state[key] === v ? 'on' : ''}">${l}</button>`).join('')}</div>`).join('')}
      <div class="actions"><button class="btn" id="cancel">Annuler</button><button class="btn primary" id="ok">Appliquer</button></div>`);
    modalBody.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
      state[b.dataset.k] = b.dataset.v;
      modalBody.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach((o) => o.classList.toggle('on', o === b));
    }));
    $('#cancel').onclick = closeModal;
    $('#ok').onclick = async () => {
      closeModal();
      onSave(state);
      if (after) after();
      route();
    };
  }

  function renderItem(id) {
    const x = items.find((i) => i.id === id);
    if (!x) return go('#/');
    const cat = categories.find((c) => c.id === x.category_id) || {};
    setHeader({ back: true, fabVisible: false });
    menuBtn.onclick = mainMenu;
    const url = x.photo_path && urlCache.get(x.photo_path);
    const field = (label, value, wide) => (value || value === 0 ? `<div class="${wide ? 'wide' : ''}"><span>${label}</span>${esc(value)}</div>` : '');
    // Sous-cartes où se trouve l'objet, pour le fil d'Ariane
    const chain = cat.id ? groupChain(cat) : [];
    const gp = [];
    for (const f of chain) {
      const pool = items.filter((i) => i.category_id === x.category_id && gp.every((g, k) => groupOf(i, chain[k]) === g));
      if (!(PRESET_FIELDS.includes(f) || pool.some((i) => groupOf(i, f) !== NONE)) || skipSingle(cat, f, pool)) break;
      gp.push(groupOf(x, f));
    }
    app.innerHTML = `${cat.id ? `<p class="page-title crumbs-small">${crumbsHtml(cat, gp, gp.map((g, i) => groupLabel(g, chain[i])), true)}</p>` : ''}<div class="detail">
      <div class="hero card shape-${esc(cat.shape || 'classique')}${url ? ' zoomable' : ''}" id="hero">${faceHtml(cat.shape, cat.color || '#334155', url, cat.icon || '📦')}</div>
      ${url ? '<p class="hint" style="text-align:center">Touche la photo pour l’agrandir</p>' : ''}
      ${x.shirt_version === WORN ? '<div class="worn-banner">⭐ Maillot porté par un joueur ⭐</div>' : ''}
      <h2>${esc(x.name)}</h2>
      <div class="fields">
        ${field('Catégorie', `${cat.icon || ''} ${pathName(cat)}`)}
        ${field('Propriétaire', x.owner)}
        ${field('Type', x.team_type)}
        ${field(x.team_type === 'Club' ? 'Club' : x.team_type === 'Équipe nationale' ? 'Pays' : 'Équipe', x.team)}
        ${field('Version', x.shirt_version)}
        ${field('Flocage', x.player_name)}
        ${field('Numéro', x.shirt_number)}
        ${field('Console', x.platform)}
        ${field('Marque', x.brand)}
        ${field('Année', x.year)}
        ${field('Quantité', qty(x) > 1 ? `× ${qty(x)}` : '')}
        ${field('Tarif', money(x.estimated_value) + (qty(x) > 1 && x.estimated_value ? ` l’unité (${money(x.estimated_value * qty(x))} en tout)` : ''))}
        ${field('Lieu', x.location)}
        ${field('Obtenu le', x.acquired_on && new Date(x.acquired_on + 'T12:00').toLocaleDateString('fr-FR'))}
        ${field('État', x.condition)}
        ${field('Prix d’achat', money(x.purchase_price))}
        ${field('Notes', x.notes, true)}
      </div>
      <div class="actions">
        <button class="btn primary" id="edit">Modifier</button>
        <button class="btn danger" id="del">Supprimer</button>
      </div></div>`;
    if (url) $('#hero').onclick = () => showPhoto(url, x.name);
    $('#edit').onclick = () => itemForm(x);
    $('#del').onclick = async () => {
      if (!confirm(`Supprimer « ${x.name} » ? C’est définitif.`)) return;
      try {
        await deleteItems([x]);
        toast('Référence supprimée');
        go(`#/c/${x.category_id}`);
      } catch (e) { fail(e); }
    };
  }

  // Photo en plein écran : appui long sur l'image = menu du téléphone (télécharger), ou bouton Télécharger
  function showPhoto(url, name) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `<img src="${esc(url)}" alt="${esc(name)}">
      <div class="lb-bar"><button class="btn" id="lbDl">⬇️ Télécharger</button><button class="btn" id="lbClose">✕ Fermer</button></div>`;
    document.body.appendChild(box);
    const close = () => { box.remove(); window.removeEventListener('popstate', close); };
    history.pushState({ photo: 1 }, '');
    window.addEventListener('popstate', close);
    box.querySelector('#lbClose').onclick = () => history.back();
    box.onclick = (e) => { if (e.target === box) history.back(); };
    box.querySelector('#lbDl').onclick = async () => {
      try {
        const blob = await (await fetch(url)).blob();
        const ext = blob.type.includes('png') ? 'png' : blob.type.includes('jpeg') ? 'jpg' : 'webp';
        const file = `${(name || 'photo').replace(/[^\p{L}\p{N} _-]+/gu, '').trim() || 'photo'}.${ext}`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = file;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        toast('Photo téléchargée');
      } catch (e) { fail(e); }
    };
  }

  // ---------- Formulaire objet ----------
  function itemForm(x = null, categoryId = null, prefill = {}) {
    const catId = x?.category_id || categoryId || categories[0]?.id;
    const url = x?.photo_path && urlCache.get(x.photo_path);
    openModal(`<h3>${x ? 'Modifier' : 'Ajouter un objet'}</h3>
      <form id="f">
        <label class="photo-pick" id="pick" style="${url ? `background-image:url('${esc(url)}')` : ''}">
          <span id="pickTxt">${url ? '' : '📷 Prendre ou choisir une photo'}</span>
          <input type="file" accept="image/*" id="photo">
        </label>
        <p class="hint">La photo est réduite automatiquement pour prendre très peu de place.</p>
        <label>Nom *</label><input name="name" required value="${esc(x?.name)}" placeholder="Ex. : Super Mario 64">
        <label>Catégorie</label>
        <select name="category_id">${treeList().map(({ c, depth }) => `<option value="${c.id}" ${c.id === catId ? 'selected' : ''}>${'\u00a0\u00a0\u00a0'.repeat(depth)}${esc(c.icon)} ${esc(c.name)}</option>`).join('')}</select>
        <div id="dyn"></div>
        <div class="row">
          <div><label>Année</label><input name="year" inputmode="numeric" value="${esc(x ? x.year : prefill.year)}" placeholder="Ex. : 1996"></div>
          <div><label>Tarif (€)</label><input name="estimated_value" inputmode="decimal" value="${esc(x?.estimated_value)}" placeholder="Ex. : 25"></div>
        </div>
        <div class="row">
          <div><label>Quantité</label><div class="stepper"><button type="button" data-q="-1">−</button><input name="quantity" inputmode="numeric" value="${x ? qty(x) : 1}"><button type="button" data-q="1">+</button></div></div>
          <div><label>Propriétaire</label>${selectOther('owner', withUsed(OWNERS, 'owner'), x ? x.owner : prefill.owner, 'Nom')}</div>
        </div>
        <div class="row">
          <div><label>Lieu</label>${selectOther('location', withUsed(PLACES, 'location'), x ? x.location : prefill.location, 'Nom du lieu')}</div>
          <div><label>Obtenu le</label><input name="acquired_on" type="date" value="${esc(x?.acquired_on)}"></div>
        </div>
        <details ${x?.condition || x?.purchase_price || x?.notes ? 'open' : ''}><summary>Plus de détails (facultatif)</summary>
          <div class="row">
            <div><label>État</label><select name="condition"><option value=""></option>${CONDITIONS.map((c) => `<option ${c === (x ? x.condition : prefill.condition) ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            <div><label>Prix d’achat (€)</label><input name="purchase_price" inputmode="decimal" value="${esc(x?.purchase_price)}"></div>
          </div>
          <label>Notes</label><textarea name="notes" rows="3">${esc(x?.notes)}</textarea>
        </details>
        <div class="actions"><button type="button" class="btn" id="cancel">Annuler</button><button class="btn primary" id="save">Enregistrer</button></div>
        ${x ? '<button type="button" class="btn danger" id="delItem" style="width:100%;margin-top:12px">🗑️ Supprimer cette référence</button>' : ''}
      </form>`);
    if (x) $('#delItem').onclick = async () => {
      if (!confirm(`Supprimer « ${x.name} » ? C’est définitif.`)) return;
      try {
        await deleteItems([x]);
        closeModal(); toast('Référence supprimée');
        if (location.hash === `#/i/${x.id}`) go(`#/c/${x.category_id}`); else route();
      } catch (e) { fail(e); }
    };
    let blob = null;
    // Champs qui dépendent de la catégorie : « Console » seulement pour les jeux vidéo, marques adaptées
    const drawDyn = () => {
      const cat = categories.find((c) => c.id === $('[name=category_id]').value);
      const kind = kindOf(cat);
      const prev = $('#dyn').innerHTML ? Object.fromEntries(new FormData($('#f'))) : null;
      const platform = prev ? otherValue(prev, 'platform') : (x ? x.platform : prefill.platform);
      const brand = prev ? otherValue(prev, 'brand') : (x ? x.brand : prefill.brand);
      const teamType = prev ? prev.team_type : (x ? x.team_type : prefill.team_type);
      const team = prev ? otherValue(prev, 'team') : (x ? x.team : prefill.team);
      const showPlatform = kind === 'jeux' || kind === 'consoles' || platform;
      const showTeam = kind === 'sport' || teamType || team;
      const teams = teamType === 'Club' ? CLUBS : teamType === 'Équipe nationale' ? NATIONAL_TEAMS : [...NATIONAL_TEAMS, ...CLUBS];
      const player = prev ? otherValue(prev, 'player_name') : x?.player_name;
      const number = prev ? otherValue(prev, 'shirt_number') : x?.shirt_number;
      const version = prev ? prev.shirt_version : x?.shirt_version;
      const showShirt = isShirt(cat) || player || number || version;
      const players = [...new Set(PLAYERS)].sort((a, b) => a.localeCompare(b, 'fr'));
      $('#dyn').innerHTML = `
        ${showTeam ? `<div class="row">
          <div><label>Type</label><select name="team_type"><option value="">Choisir…</option>${TEAM_TYPES.map((t) => `<option ${t === teamType ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <div><label>${teamType === 'Club' ? 'Club' : teamType === 'Équipe nationale' ? 'Pays' : 'Pays ou club'}</label>${selectOther('team', withUsed(teams, 'team'), team, 'Nom de l’équipe')}</div>
        </div>` : ''}
        ${showShirt ? `<label>Version du maillot</label>
        <div class="chips version-chips">${SHIRT_VERSIONS.map((v) => `<label class="chip${v === WORN ? ' worn' : ''}"><input type="radio" name="shirt_version" value="${v}" ${v === version ? 'checked' : ''}>${v === WORN ? '⭐ ' : ''}${v}</label>`).join('')}
          <label class="chip"><input type="radio" name="shirt_version" value="" ${version ? '' : 'checked'}>Je ne sais pas</label></div>
        <div class="row">
          <div><label>Flocage (nom du joueur)</label>${selectOther('player_name', withUsed(players, 'player_name'), player, 'Nom du joueur')}</div>
          <div style="flex:0 0 34%"><label>Numéro</label>${selectOther('shirt_number', withUsed(SHIRT_NUMBERS, 'shirt_number'), number, 'Ex. : 10')}</div>
        </div>` : ''}
        <div class="row">
          ${showPlatform ? `<div><label>Console</label>${selectOther('platform', withUsed(PLATFORMS, 'platform'), platform, 'Nom de la console')}</div>` : ''}
          <div><label>Marque</label>${selectOther('brand', withUsed(brandsFor(kind), 'brand'), brand, 'Nom de la marque')}</div>
        </div>`;
      wireOther($('#dyn'));
      const tt = $('#dyn [name=team_type]');
      if (tt) tt.onchange = drawDyn;
    };
    drawDyn();
    $('[name=category_id]').onchange = drawDyn;
    wireOther($('#f'));
    modalBody.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => {
      const q = $('[name=quantity]');
      q.value = Math.max(1, (parseInt(q.value, 10) || 1) + Number(b.dataset.q));
    }));
    $('#cancel').onclick = closeModal;
    $('#photo').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      $('#pickTxt').textContent = 'Réduction de la photo…';
      try {
        blob = await compressImage(file);
        $('#pick').style.backgroundImage = `url('${URL.createObjectURL(blob)}')`;
        $('#pickTxt').textContent = '';
        toast(`Photo réduite : ${Math.max(1, Math.round(blob.size / 1024))} Ko`);
      } catch (err) { $('#pickTxt').textContent = '📷 Photo illisible, réessaie'; fail(err); }
    };
    $('#f').onsubmit = async (e) => {
      e.preventDefault();
      const fd = Object.fromEntries(new FormData(e.target));
      const row = {
        name: fd.name.trim(), category_id: fd.category_id,
        platform: otherValue(fd, 'platform'), brand: otherValue(fd, 'brand'),
        ...('team_type' in fd ? { team_type: fd.team_type || null, team: otherValue(fd, 'team') } : {}),
        ...('player_name' in fd ? { player_name: otherValue(fd, 'player_name'), shirt_number: otherValue(fd, 'shirt_number'), shirt_version: fd.shirt_version || null } : {}),
        year: numOrNull(fd.year), estimated_value: numOrNull(fd.estimated_value), owner: otherValue(fd, 'owner'), quantity: Math.max(1, parseInt(fd.quantity, 10) || 1),
        condition: fd.condition || null, purchase_price: numOrNull(fd.purchase_price),
        location: otherValue(fd, 'location'), acquired_on: fd.acquired_on || null, notes: fd.notes.trim() || null, updated_at: new Date().toISOString(),
      };
      $('#save').disabled = true; $('#save').textContent = 'Enregistrement…';
      try {
        const oldPath = x?.photo_path;
        if (blob) row.photo_path = await uploadFile(blob);
        const save = (r) => (x ? sb.from('collection_items').update(r).eq('id', x.id) : sb.from('collection_items').insert(r)).select().single();
        let { data, error } = await save(row);
        // Colonnes du flocage pas encore créées dans Supabase : on enregistre le reste
        if (error && /player_name|shirt_number|shirt_version/.test(error.message || '')) {
          const { player_name, shirt_number, shirt_version, ...rest } = row;
          ({ data, error } = await save(rest));
          if (!error) toast('Enregistré, mais le flocage n’est pas encore activé (mise à jour en cours)');
        }
        if (error) throw error;
        if (blob && oldPath) removeFiles([oldPath]);
        await signedUrls([data.photo_path]);
        items = x ? items.map((i) => (i.id === data.id ? data : i)) : [data, ...items];
        closeModal();
        toast(x ? 'Objet modifié' : 'Objet ajouté');
        go(`#/i/${data.id}`, true);
      } catch (err) { fail(err); $('#save').disabled = false; $('#save').textContent = 'Enregistrer'; }
    };
  }

  // ---------- Formulaire catégorie ----------
  // Choix d'une image (fichier JPEG/PNG/SVG ou lien) : renvoie { path } ou { url }
  function imagePickerHtml(id, title, hasImg) {
    return `<label class="btn file-btn">🖼️ ${title}<input type="file" accept="image/*,.svg" id="${id}File"></label>
      <div style="display:flex;gap:8px"><input class="input" id="${id}Url" type="url" placeholder="…ou colle le lien d’une image"><button type="button" class="btn primary" id="${id}UrlOk" style="flex:0 0 auto">OK</button></div>
      ${hasImg ? `<button type="button" class="btn" id="${id}Reset">Enlever l’image</button>` : ''}`;
  }
  async function imageFromFile(file) {
    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
      if (file.size > 300 * 1024) throw new Error('Ce SVG est trop lourd (300 Ko maximum)');
      return { path: await uploadFile(new Blob([await file.text()], { type: 'image/svg+xml' })) };
    }
    return { path: await uploadFile(await compressImage(file, { maxSize: 400, maxKB: 40, keepAlpha: true })) };
  }
  // onPick(valeur) : valeur = { path } | { url } | null (enlever)
  function wireImagePicker(id, onPick) {
    $(`#${id}File`).onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try { toast('Envoi de l’image…'); await onPick(await imageFromFile(file)); } catch (err) { fail(err); }
    };
    $(`#${id}UrlOk`).onclick = async () => {
      const v = $(`#${id}Url`).value.trim();
      if (!/^https:\/\//i.test(v)) return toast('Le lien doit commencer par https://');
      try { await onPick({ url: v }); } catch (err) { fail(err); }
    };
    const r = $(`#${id}Reset`);
    if (r) r.onclick = async () => { try { await onPick(null); } catch (err) { fail(err); } };
  }

  function categoryForm(cat = null, parentId = null) {
    let icon = cat?.icon || '📦', color = cat?.color || COLORS[0], shape = cat?.shape || 'classique';
    const parent = parentId && categories.find((c) => c.id === parentId);
    openModal(`<h3>${cat ? 'Modifier' : parent ? `Nouveau sous-thème dans « ${esc(parent.name)} »` : 'Nouvelle catégorie'}</h3>
      <form id="f">
        <label>Nom *</label><input name="name" required value="${esc(cat?.name)}" placeholder="Ex. : Figurines">
        <label>Forme de la carte</label>
        <div class="shapes">${SHAPES.map(([k, l]) => `<button type="button" data-s="${k}" class="${k === shape ? 'on' : ''}">
          <div class="card shape-${k}"><div class="face" style="background:${esc(colorBg(color))}"></div></div>${l}</button>`).join('')}</div>
        <label>Icône</label>${EMOJI_GROUPS.map(([t, list]) => `<div class="hint">${t}</div>
          <div class="emojis">${list.map((e) => `<button type="button" data-e="${e}" class="${e === icon ? 'on' : ''}">${e}</button>`).join('')}</div>`).join('')}
        <label>Couleur</label>${[['Classiques', COLORS], ['Vives', VIVID_COLORS], ['Mélanges', GRADIENTS]].map(([t, list]) => `<div class="hint">${t}</div>
          <div class="colors">${list.map((c) => `<button type="button" data-c="${c}" style="background:${colorBg(c)}" class="${c === color ? 'on' : ''}"></button>`).join('')}</div>`).join('')}
        <label>Image de la carte (facultatif)</label>
        <p class="hint">Une photo, un logo… en JPEG, PNG ou SVG. Elle remplace l’icône et la couleur.</p>
        <div class="stack">${imagePickerHtml('ci', 'Choisir une image', cat && groupImageUrl(cat.id, CARD_IMG))}</div>
        <p class="hint" id="ciState"></p>
        <div class="actions"><button type="button" class="btn" id="cancel">Annuler</button><button class="btn primary" id="save">Enregistrer</button></div>
      </form>`);
    $('#cancel').onclick = closeModal;
    const pick = (attr, set) => modalBody.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => {
      set(b.dataset[attr]);
      modalBody.querySelectorAll(`[data-${attr}]`).forEach((o) => o.classList.toggle('on', o === b));
    }));
    pick('s', (v) => (shape = v));
    pick('e', (v) => (icon = v));
    let newImg; // undefined = pas de changement
    wireImagePicker('ci', async (v) => {
      newImg = v;
      $('#ciState').textContent = v ? '✅ Image prête, appuie sur Enregistrer' : '✅ L’image sera enlevée, appuie sur Enregistrer';
    });
    pick('c', (v) => {
      color = v;
      modalBody.querySelectorAll('.shapes .face').forEach((f) => (f.style.background = colorBg(v)));
    });
    $('#f').onsubmit = async (e) => {
      e.preventDefault();
      const name = new FormData(e.target).get('name').trim();
      $('#save').disabled = true;
      try {
        const row = { name, icon, color, shape };
        if (!cat) row.position = childrenOf(parentId).length;
        if (!cat && parentId) row.parent_id = parentId;
        const q = cat ? sb.from('collection_categories').update(row).eq('id', cat.id) : sb.from('collection_categories').insert(row);
        const { data, error } = await q.select().single();
        if (error) {
          if (/parent_id/.test(error.message || '')) throw new Error('il manque une petite mise à jour dans Supabase pour les sous-thèmes (voir le message de Claude)');
          throw error;
        }
        categories = cat ? categories.map((c) => (c.id === data.id ? data : c)) : [...categories, data];
        if (newImg !== undefined) await setGroupImage(data.id, CARD_IMG, newImg);
        closeModal();
        toast(cat ? 'Modifié' : parent ? 'Sous-thème créé' : 'Catégorie créée');
        cat ? route() : go(`#/c/${data.id}`);
      } catch (err) { fail(err); $('#save').disabled = false; }
    };
  }

  const RENAMABLE = ['platform', 'brand', 'owner', 'location', 'team', 'team_type', 'condition', 'year'];
  function categoryMenu(cat, path = [], groupName = '', groupField = null) {
    const group = path.length ? path.join('/') : null;
    const n = countOf(itemsUnder(cat.id));
    const nSub = subtreeIds(cat.id).size - 1;
    const imgKey = group || CARD_IMG;
    const gChain = groupChain(cat);
    const groupItems = group ? items.filter((x) => x.category_id === cat.id && path.every((g, i) => groupOf(x, gChain[i]) === g)) : [];
    const hasImg = groupImageUrl(cat.id, imgKey);
    openModal(`<h3>${esc(cat.icon)} ${esc(cat.name)}${group ? ` › ${esc(groupName)}` : ''}</h3>
      <div class="stack">
        ${imagePickerHtml('g', `Image de la carte « ${esc(group ? groupName : cat.name)} » (JPEG, PNG, SVG)`, hasImg)}
        <hr style="border:0;border-top:1px solid var(--surface-2);width:100%">
        ${group && groupField && RENAMABLE.includes(groupField) && path[path.length - 1] !== NONE ? `<button class="btn" id="renGroup">✏️ Renommer « ${esc(groupName)} »</button>` : ''}
        <button class="btn" id="editCat">✏️ Modifier « ${esc(cat.name)} » : nom, forme, icône, couleur</button>
        <button class="btn" id="addSubM">➕ Ajouter un sous-thème</button>
        ${!group && (catPrefs(cat.id).hidden || []).length ? `<button class="btn" id="unhide">↩️ Remettre les ${plural(catPrefs(cat.id).hidden.length, 'sous-carte')} supprimée(s)</button>` : ''}
        <button class="btn" id="look">🎨 Apparence : fond, cartes, logo</button>
        ${group ? `<button class="btn danger" id="delGroup">🗑️ Supprimer la sous-carte « ${esc(groupName)} » et ses ${plural(groupItems.length, 'objet')}</button>` : ''}
        <button class="btn danger" id="delCat">🗑️ Supprimer ${cat.parent_id ? 'le sous-thème' : 'la carte'} « ${esc(cat.name)} »${nSub ? ` et ses ${plural(nSub, 'sous-thème')}` : ''}${n ? ` (${plural(n, 'objet')})` : ''}</button>
        <button class="btn" id="cancel">Fermer</button>
      </div>`);
    $('#cancel').onclick = closeModal;
    $('#editCat').onclick = () => categoryForm(cat);
    $('#unhide')?.addEventListener('click', async () => { await savePrefs(cat.id, { hidden: [] }); closeModal(); toast('Sous-cartes remises'); route(); });
    $('#delGroup')?.addEventListener('click', async () => {
      if (!confirm(groupItems.length ? `Supprimer la sous-carte « ${groupName} » et ses ${plural(groupItems.length, 'objet')} ? C’est définitif.` : `Supprimer la sous-carte « ${groupName} » ?`)) return;
      try {
        await deleteItems(groupItems);
        // Retenir qu'elle est supprimée, sinon les sous-cartes d'office (PS1…, Club…) reviendraient
        const hidden = catPrefs(cat.id).hidden || [];
        if (!hidden.includes(group)) await savePrefs(cat.id, { hidden: [...hidden, group] });
        const next = { ...groupImages() }; delete next[`${cat.id}|${group}`];
        await saveSettings({ group_images: next }).catch(() => {});
        closeModal(); toast('Sous-carte supprimée');
        go(path.length > 1 ? groupLink(cat.id, path.slice(0, -1)) : `#/c/${cat.id}`);
      } catch (e) { fail(e); }
    });
    $('#renGroup')?.addEventListener('click', async () => {
      const old = path[path.length - 1];
      const v = (prompt(`Nouveau nom pour « ${groupName} » :`, old) || '').trim();
      if (!v || v === old) return;
      const ids = subtreeIds(cat.id);
      const list = items.filter((x) => ids.has(x.category_id) && String(x[groupField] ?? '') === old);
      const val = groupField === 'year' ? numOrNull(v) : v;
      try {
        for (const x of list) {
          const { error } = await sb.from('collection_items').update({ [groupField]: val }).eq('id', x.id);
          if (error) throw error;
          x[groupField] = val;
        }
        const oldImg = groupImages()[`${cat.id}|${path.join('/')}`];
        if (oldImg) { // l'image de la sous-carte suit le nouveau nom
          const next = { ...groupImages(), [`${cat.id}|${[...path.slice(0, -1), v].join('/')}`]: oldImg };
          delete next[`${cat.id}|${path.join('/')}`];
          await saveSettings({ group_images: next }).catch(() => {});
        }
        closeModal(); toast(`Renommé (${plural(list.length, 'objet')})`);
        go(groupLink(cat.id, [...path.slice(0, -1), v]));
      } catch (err) { fail(err); }
    });
    $('#addSubM').onclick = () => categoryForm(null, cat.id);
    $('#look').onclick = lookMenu;
    wireImagePicker('g', async (v) => {
      await setGroupImage(cat.id, imgKey, v);
      closeModal(); toast(v ? 'Image de la carte changée' : 'Image enlevée'); route();
    });
    $('#delCat').onclick = async () => {
      if (!confirm(n || nSub ? `Supprimer « ${cat.name} »${nSub ? `, ses ${plural(nSub, 'sous-thème')}` : ''}${n ? ` et ${plural(n, 'objet')}` : ''} ? C’est définitif.` : `Supprimer « ${cat.name} » ?`)) return;
      try {
        const ids = subtreeIds(cat.id);
        const photos = items.filter((x) => ids.has(x.category_id)).map((x) => x.photo_path);
        const { error } = await sb.from('collection_categories').delete().eq('id', cat.id);
        if (error) throw error;
        removeFiles(photos);
        categories = categories.filter((c) => !ids.has(c.id));
        items = items.filter((x) => !ids.has(x.category_id));
        closeModal(); toast('Supprimé');
        if ([...ids].some((i) => location.hash.includes(i))) go(cat.parent_id ? `#/c/${cat.parent_id}` : '#/'); else route();
      } catch (err) { fail(err); }
    };
  }

  // ---------- Menus ----------
  function mainMenu() {
    openModal(`<h3>Menu</h3>
      <div class="stack">
        <button class="btn" id="look">🎨 Apparence : fond, cartes, logo</button>
        <button class="btn" id="newCat">➕ Nouvelle catégorie</button>
        <p class="hint">Connecté : ${esc(user.email)}</p>
        <button class="btn danger" id="logout">Se déconnecter</button>
        <button class="btn" id="cancel">Fermer</button>
      </div>`);
    $('#cancel').onclick = closeModal;
    $('#look').onclick = lookMenu;
    $('#newCat').onclick = () => categoryForm();
    $('#logout').onclick = async () => { await sb.auth.signOut(); closeModal(); };
  }

  function lookMenu() {
    const logoUrl = settings.logo_path ? urlCache.get(settings.logo_path) : settings.logo_url;
    openModal(`<h3>Apparence</h3>
      <div class="lbl">Taille des cartes</div>
      <div class="sizes">
        <button type="button" data-size="grand" class="${cardSize === 'grand' ? 'on' : ''}"><span class="ico">▢▢</span>Grandes<br><small>2 par ligne</small></button>
        <button type="button" data-size="petit" class="${cardSize === 'petit' ? 'on' : ''}"><span class="ico">▫▫▫</span>Petites<br><small>3 par ligne</small></button>
      </div>
      <div class="lbl">Fond animé</div>
      <div class="sizes">
        <button type="button" data-still="0" class="${bgStill ? '' : 'on'}"><span class="ico">✨</span>Animé</button>
        <button type="button" data-still="1" class="${bgStill ? 'on' : ''}"><span class="ico">⏸️</span>Immobile</button>
      </div>
      ${[...new Set(THEMES.map((t) => t[2]))].map((grp) => `<div class="lbl">${grp}</div>
      <div class="themes">${THEMES.filter((t) => t[2] === grp).map(([k, l]) => `<button type="button" data-t="${k}" class="theme-${k} ${settings.theme === k ? 'on' : ''}">
        <div class="mini-bg" id="mini-${k}" style="background-size:cover"></div><span>${l}</span></button>`).join('')}</div>`).join('')}
      <label class="btn file-btn" style="margin-top:10px">📷 Mettre ma propre photo en fond<input type="file" accept="image/*" id="bgFile"></label>

      <h4>Logo en haut de l’écran</h4>
      <div class="logo-preview">${logoUrl ? `<img src="${esc(logoUrl)}" alt="">` : DEFAULT_LOGO}</div>
      <div class="stack" style="margin-top:8px">
        <label class="btn file-btn">🖼️ Choisir une image (JPEG, PNG, SVG)<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg" id="logoFile"></label>
        <div class="row" style="display:flex;gap:8px"><input class="input" id="logoUrl" type="url" placeholder="…ou colle le lien d’une image" value="${esc(settings.logo_url || '')}"><button class="btn primary" id="logoUrlOk" style="flex:0 0 auto">OK</button></div>
        <button class="btn" id="logoReset">Remettre le logo d’origine</button>
        <button class="btn" id="cancel">Fermer</button>
      </div>`);
    const bgUrl = settings.bg_path && urlCache.get(settings.bg_path);
    if (bgUrl) $('#mini-photo').style.backgroundImage = `url('${bgUrl}')`;
    $('#cancel').onclick = closeModal;
    modalBody.querySelectorAll('[data-size]').forEach((b) => (b.onclick = () => {
      cardSize = b.dataset.size;
      try { localStorage.setItem('cardSize', cardSize); } catch {}
      applyLook();
      modalBody.querySelectorAll('[data-size]').forEach((o) => o.classList.toggle('on', o === b));
    }));
    modalBody.querySelectorAll('[data-still]').forEach((b) => (b.onclick = () => {
      bgStill = b.dataset.still === '1';
      try { localStorage.setItem('bgStill', bgStill ? '1' : '0'); } catch {}
      applyLook();
      modalBody.querySelectorAll('[data-still]').forEach((o) => o.classList.toggle('on', o === b));
    }));
    modalBody.querySelectorAll('[data-t]').forEach((b) => (b.onclick = async () => {
      const t = b.dataset.t;
      if (t === 'photo' && !settings.bg_path) return $('#bgFile').click();
      try { const y = modalBody.scrollTop; await saveSettings({ theme: t }); lookMenu(); modalBody.scrollTop = y; } catch (e) { fail(e); }
    }));
    $('#bgFile').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      toast('Préparation du fond…');
      try {
        const blob = await compressImage(file, { maxSize: 1280, maxKB: 150 });
        const path = await uploadFile(blob);
        await saveSettings({ theme: 'photo', bg_path: path });
        toast('Fond d’écran changé'); lookMenu();
      } catch (err) { fail(err); }
    };
    $('#logoFile').onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        let blob;
        if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
          if (file.size > 300 * 1024) throw new Error('Ce SVG est trop lourd (300 Ko maximum)');
          blob = new Blob([await file.text()], { type: 'image/svg+xml' });
        } else {
          blob = await compressImage(file, { maxSize: 480, maxKB: 60, keepAlpha: true });
        }
        const path = await uploadFile(blob);
        await saveSettings({ logo_path: path, logo_url: null });
        toast('Logo changé'); lookMenu();
      } catch (err) { fail(err); }
    };
    $('#logoUrlOk').onclick = async () => {
      const v = $('#logoUrl').value.trim();
      if (!/^https:\/\//i.test(v)) return toast('Le lien doit commencer par https://');
      try { await saveSettings({ logo_url: v, logo_path: null }); toast('Logo changé'); lookMenu(); } catch (err) { fail(err); }
    };
    $('#logoReset').onclick = async () => {
      try { await saveSettings({ logo_url: null, logo_path: null }); toast('Logo d’origine remis'); lookMenu(); } catch (err) { fail(err); }
    };
  }

  // ---------- Connexion ----------
  function renderAuth(mode = 'login') {
    setHeader({ fabVisible: false });
    menuBtn.hidden = true;
    app.innerHTML = `<div class="auth">
      <h2>${mode === 'login' ? 'Connexion' : 'Créer mon compte'}</h2>
      <form id="f">
        <label>E-mail</label><input name="email" type="email" required autocomplete="email">
        <label>Mot de passe</label><input name="password" type="password" required minlength="6" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}">
        <div class="actions"><button class="btn primary" id="go">${mode === 'login' ? 'Se connecter' : 'Créer le compte'}</button></div>
      </form>
      <button class="link" id="switch">${mode === 'login' ? 'Pas encore de compte ? En créer un' : 'Déjà un compte ? Se connecter'}</button></div>`;
    $('#switch').onclick = () => renderAuth(mode === 'login' ? 'signup' : 'login');
    $('#f').onsubmit = async (e) => {
      e.preventDefault();
      const { email, password } = Object.fromEntries(new FormData(e.target));
      $('#go').disabled = true;
      const { data, error } = mode === 'login'
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.href.split('#')[0] } });
      $('#go').disabled = false;
      if (error) return fail(error);
      if (mode === 'signup' && !data.session) toast('Compte créé ! Clique sur le lien reçu par e-mail pour l’activer.', 6000);
    };
  }

  // ---------- Navigation ----------
  function go(hash, replace = false) {
    if (location.hash === hash) return route();
    if (replace) { history.replaceState(null, '', hash); route(); } else location.hash = hash;
  }

  function route() {
    if (!user) return renderAuth();
    window.scrollTo(0, 0);
    const [, type, id, ...rest] = location.hash.split('/');
    if (type === 'c') renderCategory(id, rest.filter(Boolean).map(decodeURIComponent));
    else if (type === 'i') renderItem(id);
    else renderHome();
  }

  backBtn.onclick = () => {
    const [, type, id, ...rest] = location.hash.split('/');
    const path = rest.filter(Boolean);
    if (type === 'i') {
      const x = items.find((i) => i.id === id);
      if (!x) return go('#/');
      const cat = categories.find((c) => c.id === x.category_id);
      // Revient dans la sous-carte où se trouve l'objet
      const chain = groupChain(cat);
      const p = [];
      for (const f of chain) {
        const pool = items.filter((i) => i.category_id === x.category_id && p.every((g, k) => groupOf(i, chain[k]) === g));
        const hasGroups = ['platform', 'team_type'].includes(f) || pool.some((i) => groupOf(i, f) !== NONE);
        if (!hasGroups || skipSingle(cat, f, pool)) break;
        p.push(groupOf(x, f));
      }
      return go(p.length ? groupLink(x.category_id, p) : `#/c/${x.category_id}`);
    }
    if (type === 'c' && path.length) return go(path.length > 1 ? groupLink(id, path.slice(0, -1).map(decodeURIComponent)) : `#/c/${id}`);
    if (type === 'c') {
      const cat = categories.find((c) => c.id === id);
      if (cat?.parent_id) return go(`#/c/${cat.parent_id}`);
    }
    go('#/');
  };
  window.addEventListener('hashchange', route);

  applyLook();
  let started = false;
  sb.auth.onAuthStateChange((_event, session) => {
    const newUser = session?.user || null;
    if (started && newUser?.id === user?.id) return;
    started = true;
    user = newUser;
    // Laisse Supabase finir son travail avant de charger les données
    setTimeout(async () => {
      if (!user) { categories = []; items = []; urlCache.clear(); settings = { theme: 'synthwave' }; applyLook(); return renderAuth(); }
      app.innerHTML = '<p class="loading">Chargement de la collection…</p>';
      try { await loadAll(); route(); } catch (e) { fail(e); }
    }, 0);
  });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
