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
  ];
  const THEMES = [
    ['synthwave', 'Synthwave 80'], ['arcade', 'Arcade'], ['heroique', 'Héroïque'],
    ['memphis', 'Années 90'], ['gameboy', 'Game Boy'], ['photo', 'Ma photo'],
  ];
  const OWNERS = ['Papa', 'Maman', 'Anaïs', 'Elodie'];
  const PLACES = ['Normandie', 'Montgeron'];
  const PLATFORMS = ['PS5', 'PS4', 'PS3', 'PS2', 'PS1', 'PSP', 'PS Vita', 'Nintendo Switch', 'Wii U', 'Wii', 'GameCube', 'Nintendo 64',
    'Super Nintendo', 'NES', 'Nintendo DS', 'Nintendo 3DS', 'Game Boy', 'Game Boy Advance', 'Xbox Series', 'Xbox One', 'Xbox 360', 'Xbox',
    'Master System', 'Mega Drive', 'Saturn', 'Dreamcast', 'Neo Geo', 'Atari 2600', 'PC'];
  const BRANDS = ['Nintendo', 'Sony', 'Microsoft', 'Sega', 'Atari', 'SNK', 'Ubisoft', 'EA', 'Activision', 'Square Enix', 'Capcom', 'Konami',
    'Bandai Namco', 'Mattel', 'Hasbro', 'Lego', 'Playmobil', 'Kenner', 'Adidas', 'Nike', 'Puma'];
  const CONDITIONS = ['Neuf (sous blister)', 'Très bon', 'Bon', 'Moyen', 'Abîmé'];
  const EMOJIS = ['🎮', '🕹️', '👾', '🧸', '🦸', '🤖', '👕', '⚽', '🏀', '🎧', '🃏', '📀', '💿', '📼', '📚', '🚗', '🧩', '🏆', '🎲', '⌚', '👟', '🧢', '⚔️', '📦', '⭐'];
  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ef4444', '#14b8a6', '#64748b', '#ff3d9a', '#29e6ff', '#7cff6b'];

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
    document.body.className = `theme-${settings.theme || 'synthwave'}`;
    const bg = $('#bg');
    const bgUrl = settings.theme === 'photo' && settings.bg_path && urlCache.get(settings.bg_path);
    bg.style.backgroundImage = bgUrl ? `url('${bgUrl}')` : '';
    const logoUrl = settings.logo_path ? urlCache.get(settings.logo_path) : settings.logo_url;
    logoEl.innerHTML = logoUrl ? `<img src="${esc(logoUrl)}" alt="Logo">` : DEFAULT_LOGO;
    const img = logoEl.querySelector('img');
    if (img) img.onerror = () => { logoEl.innerHTML = DEFAULT_LOGO; };
  }
  logoEl.onclick = () => user && go('#/');

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
    if (!categories.length) {
      const { data, error } = await sb.from('collection_categories').insert(DEFAULT_CATEGORIES.map((d, n) => ({ ...d, position: n }))).select();
      if (error) throw error;
      categories = data;
    }
    await signedUrls([...items.map((x) => x.photo_path), settings.bg_path, settings.logo_path]);
    applyLook();
  }

  // ---------- Écrans ----------
  function setHeader({ back = false, fabVisible = true } = {}) {
    backBtn.hidden = !back; menuBtn.hidden = false; fab.hidden = !fabVisible;
  }

  // Une carte : la forme (cartouche, maillot…) avec la photo ou l'icône, et le texte dessous
  function faceHtml(shape, color, url, icon) {
    const style = url ? `background-image:url('${esc(url)}')` : `background:linear-gradient(160deg, ${esc(color)}, ${esc(shade(color))})`;
    return `<div class="face${url ? ' photo' : ''}" style="${style}">${url ? '' : `<span class="emoji">${esc(icon)}</span>`}</div>`;
  }
  function shade(hex) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    if (Number.isNaN(n)) return '#1b1435';
    const f = (v) => Math.max(0, Math.round(v * 0.45));
    return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
  }
  const coverFor = (cat) => {
    const x = items.find((i) => i.category_id === cat.id && i.photo_path && urlCache.get(i.photo_path));
    return x ? urlCache.get(x.photo_path) : null;
  };

  function categoryCard(c) {
    const n = items.filter((x) => x.category_id === c.id).length;
    return `<a class="card shape-${esc(c.shape || 'classique')}" href="#/c/${c.id}">
      ${faceHtml(c.shape, c.color, coverFor(c), c.icon)}
      <div class="label"><b>${esc(c.name)}</b><span>${plural(n, 'objet')}</span></div></a>`;
  }

  function itemCard(x) {
    const cat = categories.find((c) => c.id === x.category_id) || {};
    const url = x.photo_path && urlCache.get(x.photo_path);
    const sub = [x.platform || x.brand, x.year, x.owner, x.location].filter(Boolean).join(' · ');
    return `<a class="card shape-${esc(cat.shape || 'classique')}" href="#/i/${x.id}">
      ${faceHtml(cat.shape, cat.color || '#334155', url, cat.icon || '📦')}
      <div class="label"><b>${esc(x.name)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div></a>`;
  }

  function renderHome() {
    setHeader();
    fab.onclick = () => itemForm();
    menuBtn.onclick = mainMenu;
    const total = items.reduce((s, x) => s + (Number(x.estimated_value) || 0), 0);
    app.innerHTML = `
      <div class="summary">
        <div><b>${items.length}</b><span>objets</span></div>
        <div><b>${categories.length}</b><span>catégories</span></div>
        <div><b>${total ? money(total) : '–'}</b><span>valeur totale</span></div>
      </div>
      <input class="search" id="search" type="search" placeholder="🔍 Rechercher dans toute la collection">
      <div id="results"></div>`;
    const draw = () => {
      const q = $('#search').value.trim().toLowerCase();
      if (q) {
        const found = items.filter((x) => matches(x, q));
        $('#results').innerHTML = found.length ? `<div class="grid">${found.map(itemCard).join('')}</div>` : '<p class="empty">Aucun résultat</p>';
        return;
      }
      $('#results').innerHTML = `<div class="grid">${categories.map(categoryCard).join('')}
        <button class="card add" id="addCat"><div class="face">+</div><div class="label"><b>Nouvelle catégorie</b></div></button></div>`;
      $('#addCat').onclick = () => categoryForm();
    };
    $('#search').oninput = draw;
    draw();
  }

  function renderCategory(id) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return go('#/');
    setHeader({ back: true });
    fab.onclick = () => itemForm(null, cat.id);
    menuBtn.onclick = () => categoryMenu(cat);
    const list = items.filter((x) => x.category_id === id);
    const total = list.reduce((s, x) => s + (Number(x.estimated_value) || 0), 0);
    app.innerHTML = `
      <h2 class="page-title">${esc(cat.icon)} ${esc(cat.name)}</h2>
      <div class="summary">
        <div><b>${list.length}</b><span>objets</span></div>
        <div><b>${total ? money(total) : '–'}</b><span>valeur</span></div>
      </div>
      <input class="search" id="search" type="search" placeholder="🔍 Rechercher dans ${esc(cat.name)}">
      <div id="results"></div>`;
    const draw = () => {
      const q = $('#search').value.trim().toLowerCase();
      const found = q ? list.filter((x) => matches(x, q)) : list;
      $('#results').innerHTML = found.length ? `<div class="grid">${found.map(itemCard).join('')}</div>`
        : `<p class="empty">${q ? 'Aucun résultat' : 'Aucun objet pour l’instant.<br>Appuie sur le bouton + pour en ajouter un.'}</p>`;
    };
    $('#search').oninput = draw;
    draw();
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
        ${field('Tarif', money(x.estimated_value))}
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
  function itemForm(x = null, categoryId = null) {
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
        <div class="row">
          <div><label>Console</label><input name="platform" list="platforms" value="${esc(x?.platform)}" placeholder="Ex. : PS5"></div>
          <div><label>Marque</label><input name="brand" list="brands" value="${esc(x?.brand)}" placeholder="Ex. : Nintendo"></div>
        </div>
        <datalist id="platforms">${PLATFORMS.map((p) => `<option value="${p}">`).join('')}</datalist>
        <datalist id="brands">${BRANDS.map((p) => `<option value="${p}">`).join('')}</datalist>
        <div class="row">
          <div><label>Année</label><input name="year" inputmode="numeric" value="${esc(x?.year)}" placeholder="Ex. : 1996"></div>
          <div><label>Tarif (€)</label><input name="estimated_value" inputmode="decimal" value="${esc(x?.estimated_value)}" placeholder="Ex. : 25"></div>
        </div>
        <label>Propriétaire</label>
        <select name="owner"><option value="">Choisir…</option>${OWNERS.map((o) => `<option ${o === x?.owner ? 'selected' : ''}>${o}</option>`).join('')}</select>
        <div class="row">
          <div><label>Lieu</label><select name="location"><option value="">Choisir…</option>${[...new Set([...PLACES, ...(x?.location ? [x.location] : [])])].map((o) => `<option ${o === x?.location ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>
          <div><label>Obtenu le</label><input name="acquired_on" type="date" value="${esc(x?.acquired_on)}"></div>
        </div>
        <details ${x?.condition || x?.purchase_price || x?.notes ? 'open' : ''}><summary>Plus de détails (facultatif)</summary>
          <div class="row">
            <div><label>État</label><select name="condition"><option value=""></option>${CONDITIONS.map((c) => `<option ${c === x?.condition ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            <div><label>Prix d’achat (€)</label><input name="purchase_price" inputmode="decimal" value="${esc(x?.purchase_price)}"></div>
          </div>
          <label>Notes</label><textarea name="notes" rows="3">${esc(x?.notes)}</textarea>
        </details>
        <div class="actions"><button type="button" class="btn" id="cancel">Annuler</button><button class="btn primary" id="save">Enregistrer</button></div>
      </form>`);
    let blob = null;
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
        platform: fd.platform.trim() || null, brand: fd.brand.trim() || null,
        year: numOrNull(fd.year), estimated_value: numOrNull(fd.estimated_value), owner: fd.owner || null,
        condition: fd.condition || null, purchase_price: numOrNull(fd.purchase_price),
        location: fd.location || null, acquired_on: fd.acquired_on || null, notes: fd.notes.trim() || null, updated_at: new Date().toISOString(),
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
          <div class="card shape-${k}"><div class="face" style="background:${color}"></div></div>${l}</button>`).join('')}</div>
        <label>Icône</label><div class="emojis">${EMOJIS.map((e) => `<button type="button" data-e="${e}" class="${e === icon ? 'on' : ''}">${e}</button>`).join('')}</div>
        <label>Couleur</label><div class="colors">${COLORS.map((c) => `<button type="button" data-c="${c}" style="background:${c}" class="${c === color ? 'on' : ''}"></button>`).join('')}</div>
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
      modalBody.querySelectorAll('.shapes .face').forEach((f) => (f.style.background = v));
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

  function categoryMenu(cat) {
    const n = items.filter((x) => x.category_id === cat.id).length;
    openModal(`<h3>${esc(cat.icon)} ${esc(cat.name)}</h3>
      <div class="stack">
        <button class="btn" id="editCat">✏️ Nom, forme, icône, couleur</button>
        <button class="btn" id="look">🎨 Fond d’écran et logo</button>
        <button class="btn danger" id="delCat">Supprimer la catégorie${n ? ` et ses ${plural(n, 'objet')}` : ''}</button>
        <button class="btn" id="cancel">Fermer</button>
      </div>`);
    $('#cancel').onclick = closeModal;
    $('#editCat').onclick = () => categoryForm(cat);
    $('#look').onclick = lookMenu;
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
        <button class="btn" id="look">🎨 Fond d’écran et logo</button>
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
    openModal(`<h3>Fond d’écran et logo</h3>
      <div class="lbl">Fond d’écran</div>
      <div class="themes">${THEMES.map(([k, l]) => `<button type="button" data-t="${k}" class="theme-${k} ${settings.theme === k ? 'on' : ''}">
        <div class="mini-bg" id="mini-${k}" style="background-size:cover"></div><span>${l}</span></button>`).join('')}</div>
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
    modalBody.querySelectorAll('[data-t]').forEach((b) => (b.onclick = async () => {
      const t = b.dataset.t;
      if (t === 'photo' && !settings.bg_path) return $('#bgFile').click();
      try { await saveSettings({ theme: t }); lookMenu(); } catch (e) { fail(e); }
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
    const [, type, id] = location.hash.split('/');
    if (type === 'c') renderCategory(id);
    else if (type === 'i') renderItem(id);
    else renderHome();
  }

  backBtn.onclick = () => {
    const [, type, id] = location.hash.split('/');
    if (type === 'i') {
      const x = items.find((i) => i.id === id);
      return go(x ? `#/c/${x.category_id}` : '#/');
    }
    go('#/');
  };
  window.addEventListener('hashchange', route);

  applyLook();
  sb.auth.onAuthStateChange((_event, session) => {
    const newUser = session?.user || null;
    if (newUser?.id === user?.id) return;
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
