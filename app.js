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
    sport: ['Adidas', 'Nike', 'Puma', 'Kappa', 'Le Coq Sportif', 'Umbro', 'Macron', 'New Balance', 'Kipsta', 'Mitre', 'Select'],
  };
  // Type de catégorie, d'après son nom, pour proposer les bons champs et les bonnes marques
  function kindOf(cat) {
    const n = (cat?.name || '').toLowerCase();
    if (/jeux?\s*vid|vid[ée]o/.test(n)) return 'jeux';
    if (/console/.test(n)) return 'consoles';
    if (/maillot|ballon|foot|sport|crampon|basket/.test(n)) return 'sport';
    if (/jouet|playmo|lego|figurine|poup|peluche|carte|jeu|voiture|maquette/.test(n)) return 'jouets';
    return 'autre';
  }
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
  const CONDITIONS = ['Neuf (sous blister)', 'Très bon', 'Bon', 'Moyen', 'Abîmé'];
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
  const matches = (x, q) => [x.name, x.brand, x.platform, x.owner, x.location, x.notes].some((f) => (f || '').toLowerCase().includes(q));

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
    document.body.className = `theme-${t}${LIGHT_THEMES.includes(t) ? ' light' : ''}${cardSize === 'petit' ? ' cards-small' : ''}`;
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
    ['auto', 'Automatique (console ou marque)'], ['platform', 'Console'], ['brand', 'Marque'], ['owner', 'Propriétaire'],
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
  const groupField = (cat) => { const g = catPrefs(cat?.id).group; return g === 'auto' ? autoField(cat) : g; };
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
    condition: 'Sans état', price: 'Sans tarif', letter: 'Sans nom' };
  const groupLabel = (g, field) => (g === NONE ? NONE_LABELS[field] || 'Autres' : g);
  const groupLink = (catId, g) => `#/c/${catId}/${encodeURIComponent(g)}`;

  function shade(hex, k = 0.6) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    if (Number.isNaN(n)) return '#1b1435';
    const f = (v) => Math.max(0, Math.round(v * k));
    return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
  }

  function categoryCard(c) {
    const n = countOf(items.filter((x) => x.category_id === c.id));
    return `<a class="card shape-${esc(c.shape || 'classique')}" href="#/c/${c.id}">
      ${faceHtml(c.shape, c.color, null, c.icon)}
      <div class="label"><b>${esc(c.name)}</b><span>${plural(n, 'objet')}</span></div></a>`;
  }

  function itemCard(x) {
    const cat = categories.find((c) => c.id === x.category_id) || {};
    const url = x.photo_path && urlCache.get(x.photo_path);
    const sub = [x.platform || x.brand, x.year, x.owner, x.location].filter(Boolean).join(' · ');
    return `<a class="card shape-${esc(cat.shape || 'classique')}" href="#/i/${x.id}">
      <div class="face-wrap">${faceHtml(cat.shape, cat.color || '#334155', url, cat.icon || '📦')}${qty(x) > 1 ? `<span class="qty">×${qty(x)}</span>` : ''}</div>
      <div class="label"><b>${esc(x.name)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div></a>`;
  }

  function renderHome() {
    setHeader();
    fab.onclick = () => itemForm();
    menuBtn.onclick = mainMenu;
    const total = valueOf(items);
    app.innerHTML = `
      <div class="summary">
        <div><b>${countOf(items)}</b><span>objets</span></div>
        <div><b>${categories.length}</b><span>catégories</span></div>
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
      const cnt = (c) => countOf(items.filter((x) => x.category_id === c.id));
      const cats = [...categories].sort({
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

  function renderCategory(id, group = null) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return go('#/');
    const cp = catPrefs(cat.id);
    const field = groupField(cat);
    const all = items.filter((x) => x.category_id === id);
    // Les sous-cartes : celles proposées d'office (consoles des jeux vidéo) + celles déjà utilisées
    const used = [...new Set(all.map((x) => groupOf(x, field)))].filter((g) => g !== NONE);
    const preset = field === 'platform' ? FEATURED_PLATFORMS : [];
    const extra = used.filter((v) => !preset.includes(v));
    extra.sort(field === 'price' ? (a, b) => PRICE_RANGES.indexOf(a) - PRICE_RANGES.indexOf(b) : cmpText);
    let groups = [...preset, ...extra];
    const countIn = (g) => countOf(all.filter((x) => groupOf(x, field) === g));
    if (cp.groupSort === 'az') groups.sort(cmpText);
    if (cp.groupSort === 'za') groups.sort((a, b) => cmpText(b, a));
    if (cp.groupSort === 'plus') groups.sort((a, b) => countIn(b) - countIn(a));
    if (cp.groupSort === 'moins') groups.sort((a, b) => countIn(a) - countIn(b));
    if (all.some((x) => groupOf(x, field) === NONE)) groups.push(NONE);
    const useGroups = !group && field !== 'none' && (preset.length || used.length);
    const list = sortItems(group ? all.filter((x) => groupOf(x, field) === group) : all, cp.itemSort);
    const groupName = group ? groupLabel(group, field) : '';

    setHeader({ back: true });
    const prefill = group && group !== NONE && ['platform', 'brand', 'owner', 'location', 'year', 'condition'].includes(field) ? { [field]: group } : {};
    fab.onclick = () => itemForm(null, cat.id, prefill);
    menuBtn.onclick = () => categoryMenu(cat, group, groupName);
    const total = valueOf(list);
    app.innerHTML = `
      <h2 class="page-title">${esc(cat.icon)} ${esc(cat.name)}${group ? ` › ${esc(groupName)}` : ''}</h2>
      <div class="summary">
        <div><b>${countOf(list)}</b><span>objets</span></div>
        <div><b>${total ? money(total) : '–'}</b><span>valeur</span></div>
      </div>
      <div class="searchbar"><input class="search" id="search" type="search" placeholder="🔍 Rechercher dans ${esc(group ? groupName : cat.name)}">
        <button class="sort-btn" id="sortBtn">↕ Trier</button></div>
      <div id="results"></div>`;
    $('#sortBtn').onclick = () => sortMenu(`Trier et classer « ${cat.name} »`, [
      ['group', 'Ranger les objets en sous-cartes par', GROUP_FIELDS],
      ['groupSort', 'Ordre des sous-cartes', GROUP_SORTS],
      ['itemSort', 'Ordre des objets', ITEM_SORTS],
    ], cp, (p) => savePrefs(cat.id, p), () => { if (group) go(`#/c/${cat.id}`); });
    const subCard = (g) => {
      const n = countIn(g);
      const label = groupLabel(g, field);
      const color = g === NONE ? '#475569' : groupColor(g);
      const img = groupImageUrl(cat.id, g);
      const size = label.length <= 4 ? 1.6 : label.length <= 7 ? 1.25 : label.length <= 10 ? 1 : 0.85;
      const bg = img ? `background:#fff url('${esc(img)}') center / contain no-repeat` : `background:linear-gradient(160deg, ${color}, ${shade(color)})`;
      return `<a class="card sub shape-${esc(cat.shape || 'classique')}${n ? '' : ' empty-group'}${img ? ' has-img' : ''}" href="${groupLink(cat.id, g)}">
        <div class="face" style="${bg}"><span class="tag" style="--fs:${size}">${esc(label)}</span></div>
        <div class="label"><span>${plural(n, 'objet')}</span></div></a>`;
    };
    const fieldName = (GROUP_FIELDS.find((f) => f[0] === field)?.[1] || '').toLowerCase();
    const draw = () => {
      const q = $('#search').value.trim().toLowerCase();
      if (useGroups && !q) {
        $('#results').innerHTML = `<div class="grid">${groups.map(subCard).join('')}</div>
          <p class="hint" style="text-align:center;margin-top:16px">Les objets sont rangés par ${esc(fieldName)}. Tu peux changer ça avec le bouton « ↕ Trier ».</p>`;
        return;
      }
      const found = q ? sortItems(all.filter((x) => matches(x, q)), cp.itemSort) : list;
      $('#results').innerHTML = found.length ? `<div class="grid">${found.map(itemCard).join('')}</div>`
        : `<p class="empty">${q ? 'Aucun résultat' : 'Aucun objet pour l’instant.<br>Appuie sur le bouton + pour en ajouter un.'}</p>`;
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
    app.innerHTML = `<div class="detail">
      <div class="hero card shape-${esc(cat.shape || 'classique')}">${faceHtml(cat.shape, cat.color || '#334155', url, cat.icon || '📦')}</div>
      <h2>${esc(x.name)}</h2>
      <div class="fields">
        ${field('Catégorie', `${cat.icon || ''} ${cat.name || ''}`)}
        ${field('Propriétaire', x.owner)}
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
    $('#edit').onclick = () => itemForm(x);
    $('#del').onclick = async () => {
      if (!confirm(`Supprimer « ${x.name} » ?`)) return;
      try {
        const { error } = await sb.from('collection_items').delete().eq('id', x.id);
        if (error) throw error;
        removeFiles([x.photo_path]);
        items = items.filter((i) => i.id !== x.id);
        toast('Objet supprimé');
        go(`#/c/${x.category_id}`);
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
        <select name="category_id">${categories.map((c) => `<option value="${c.id}" ${c.id === catId ? 'selected' : ''}>${esc(c.icon)} ${esc(c.name)}</option>`).join('')}</select>
        <div class="row" id="dyn"></div>
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
      </form>`);
    let blob = null;
    // Champs qui dépendent de la catégorie : « Console » seulement pour les jeux vidéo, marques adaptées
    const drawDyn = () => {
      const cat = categories.find((c) => c.id === $('[name=category_id]').value);
      const kind = kindOf(cat);
      const prev = $('#dyn').innerHTML ? Object.fromEntries(new FormData($('#f'))) : null;
      const platform = prev ? otherValue(prev, 'platform') : (x ? x.platform : prefill.platform);
      const brand = prev ? otherValue(prev, 'brand') : (x ? x.brand : prefill.brand);
      const showPlatform = kind === 'jeux' || kind === 'consoles' || platform;
      $('#dyn').innerHTML = `
        ${showPlatform ? `<div><label>Console</label>${selectOther('platform', withUsed(PLATFORMS, 'platform'), platform, 'Nom de la console')}</div>` : ''}
        <div><label>Marque</label>${selectOther('brand', withUsed(brandsFor(kind), 'brand'), brand, 'Nom de la marque')}</div>`;
      wireOther($('#dyn'));
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
        year: numOrNull(fd.year), estimated_value: numOrNull(fd.estimated_value), owner: otherValue(fd, 'owner'), quantity: Math.max(1, parseInt(fd.quantity, 10) || 1),
        condition: fd.condition || null, purchase_price: numOrNull(fd.purchase_price),
        location: otherValue(fd, 'location'), acquired_on: fd.acquired_on || null, notes: fd.notes.trim() || null, updated_at: new Date().toISOString(),
      };
      $('#save').disabled = true; $('#save').textContent = 'Enregistrement…';
      try {
        const oldPath = x?.photo_path;
        if (blob) row.photo_path = await uploadFile(blob);
        const q = x ? sb.from('collection_items').update(row).eq('id', x.id) : sb.from('collection_items').insert(row);
        const { data, error } = await q.select().single();
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
  function categoryForm(cat = null) {
    let icon = cat?.icon || '📦', color = cat?.color || COLORS[0], shape = cat?.shape || 'classique';
    openModal(`<h3>${cat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
      <form id="f">
        <label>Nom *</label><input name="name" required value="${esc(cat?.name)}" placeholder="Ex. : Figurines">
        <label>Forme de la carte</label>
        <div class="shapes">${SHAPES.map(([k, l]) => `<button type="button" data-s="${k}" class="${k === shape ? 'on' : ''}">
          <div class="card shape-${k}"><div class="face" style="background:${esc(colorBg(color))}"></div></div>${l}</button>`).join('')}</div>
        <label>Icône</label>${EMOJI_GROUPS.map(([t, list]) => `<div class="hint">${t}</div>
          <div class="emojis">${list.map((e) => `<button type="button" data-e="${e}" class="${e === icon ? 'on' : ''}">${e}</button>`).join('')}</div>`).join('')}
        <label>Couleur</label>${[['Classiques', COLORS], ['Vives', VIVID_COLORS], ['Mélanges', GRADIENTS]].map(([t, list]) => `<div class="hint">${t}</div>
          <div class="colors">${list.map((c) => `<button type="button" data-c="${c}" style="background:${colorBg(c)}" class="${c === color ? 'on' : ''}"></button>`).join('')}</div>`).join('')}
        <div class="actions"><button type="button" class="btn" id="cancel">Annuler</button><button class="btn primary" id="save">Enregistrer</button></div>
      </form>`);
    $('#cancel').onclick = closeModal;
    const pick = (attr, set) => modalBody.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => {
      set(b.dataset[attr]);
      modalBody.querySelectorAll(`[data-${attr}]`).forEach((o) => o.classList.toggle('on', o === b));
    }));
    pick('s', (v) => (shape = v));
    pick('e', (v) => (icon = v));
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
        if (!cat) row.position = categories.length;
        const q = cat ? sb.from('collection_categories').update(row).eq('id', cat.id) : sb.from('collection_categories').insert(row);
        const { data, error } = await q.select().single();
        if (error) throw error;
        categories = cat ? categories.map((c) => (c.id === data.id ? data : c)) : [...categories, data];
        closeModal();
        toast(cat ? 'Catégorie modifiée' : 'Catégorie créée');
        cat ? route() : go(`#/c/${data.id}`);
      } catch (err) { fail(err); $('#save').disabled = false; }
    };
  }

  function categoryMenu(cat, group = null, groupName = '') {
    const n = items.filter((x) => x.category_id === cat.id).length;
    const hasImg = group && groupImageUrl(cat.id, group);
    openModal(`<h3>${esc(cat.icon)} ${esc(cat.name)}${group ? ` › ${esc(groupName)}` : ''}</h3>
      <div class="stack">
        ${group ? `<label class="btn file-btn">🖼️ Image de la carte « ${esc(groupName)} »<input type="file" accept="image/*,.svg" id="gFile"></label>
        <div style="display:flex;gap:8px"><input class="input" id="gUrl" type="url" placeholder="…ou colle le lien d’une image"><button class="btn primary" id="gUrlOk" style="flex:0 0 auto">OK</button></div>
        ${hasImg ? '<button class="btn" id="gReset">Enlever l’image de cette carte</button>' : ''}
        <hr style="border:0;border-top:1px solid var(--surface-2);width:100%">` : ''}
        <button class="btn" id="editCat">✏️ Nom, forme, icône, couleur</button>
        <button class="btn" id="look">🎨 Apparence : fond, cartes, logo</button>
        <button class="btn danger" id="delCat">Supprimer la catégorie${n ? ` et ses ${plural(n, 'objet')}` : ''}</button>
        <button class="btn" id="cancel">Fermer</button>
      </div>`);
    $('#cancel').onclick = closeModal;
    $('#editCat').onclick = () => categoryForm(cat);
    $('#look').onclick = lookMenu;
    if (group) {
      const done = () => { closeModal(); toast('Image de la carte changée'); };
      $('#gFile').onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          let blob;
          if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
            if (file.size > 300 * 1024) throw new Error('Ce SVG est trop lourd (300 Ko maximum)');
            blob = new Blob([await file.text()], { type: 'image/svg+xml' });
          } else blob = await compressImage(file, { maxSize: 400, maxKB: 40, keepAlpha: true });
          await setGroupImage(cat.id, group, { path: await uploadFile(blob) });
          done();
        } catch (err) { fail(err); }
      };
      $('#gUrlOk').onclick = async () => {
        const v = $('#gUrl').value.trim();
        if (!/^https:\/\//i.test(v)) return toast('Le lien doit commencer par https://');
        try { await setGroupImage(cat.id, group, { url: v }); done(); } catch (err) { fail(err); }
      };
      if (hasImg) $('#gReset').onclick = async () => { try { await setGroupImage(cat.id, group, null); closeModal(); toast('Image enlevée'); } catch (err) { fail(err); } };
    }
    $('#delCat').onclick = async () => {
      if (!confirm(n ? `Supprimer « ${cat.name} » et ses ${plural(n, 'objet')} ? C’est définitif.` : `Supprimer « ${cat.name} » ?`)) return;
      try {
        const photos = items.filter((x) => x.category_id === cat.id).map((x) => x.photo_path);
        const { error } = await sb.from('collection_categories').delete().eq('id', cat.id);
        if (error) throw error;
        removeFiles(photos);
        categories = categories.filter((c) => c.id !== cat.id);
        items = items.filter((x) => x.category_id !== cat.id);
        closeModal(); toast('Catégorie supprimée'); go('#/');
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
    const [, type, id, group] = location.hash.split('/');
    if (type === 'c') renderCategory(id, group ? decodeURIComponent(group) : null);
    else if (type === 'i') renderItem(id);
    else renderHome();
  }

  backBtn.onclick = () => {
    const [, type, id, group] = location.hash.split('/');
    if (type === 'i') {
      const x = items.find((i) => i.id === id);
      if (!x) return go('#/');
      const cat = categories.find((c) => c.id === x.category_id);
      const field = groupField(cat);
      const hasGroups = field !== 'none' && (field === 'platform' || items.some((i) => i.category_id === x.category_id && groupOf(i, field) !== NONE));
      return go(hasGroups ? groupLink(x.category_id, groupOf(x, field)) : `#/c/${x.category_id}`);
    }
    if (type === 'c' && group) return go(`#/c/${id}`);
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
