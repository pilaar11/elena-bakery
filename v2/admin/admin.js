/* Elena Bakery — Panel de administración (Fase 2) */
(function () {
  'use strict';
  const sb = window.getSupabase();
  const $ = (id) => document.getElementById(id);

  // ---------- utilidades ----------
  const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  const money = (n) => CLP.format(Number(n) || 0);
  const CATEGORIAS = ['Tortas', 'Cheesecakes', 'Pies y Tartas', 'Antojitos'];
  const ESTADOS = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
  const ESTADO_LABEL = {
    pendiente: 'Pendiente', confirmado: 'Confirmado', en_preparacion: 'En preparación',
    listo: 'Listo', entregado: 'Entregado', cancelado: 'Cancelado'
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nz = (v) => { const t = (v == null ? '' : String(v)).trim(); return t === '' ? null : t; };
  const intOr = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—';
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

  function toast(msg, isErr) {
    const t = $('toast');
    t.textContent = msg; t.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.className = 'toast'; }, 2800);
  }
  function show(view) {
    ['loadingView', 'loginView', 'appView'].forEach((v) => $(v).classList.toggle('hidden', v !== view));
  }

  // ---------- auth ----------
  async function isAdmin(userId) {
    const { data, error } = await sb.from('profiles').select('role').eq('id', userId).single();
    return !error && data && data.role === 'admin';
  }
  async function route() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { show('loginView'); return; }
    if (await isAdmin(session.user.id)) {
      $('whoEmail').textContent = session.user.email || '';
      show('appView');
      navTo('dashboard');
    } else {
      await sb.auth.signOut();
      show('loginView');
      setLoginMsg('Esta cuenta no tiene permisos de administrador.', 'error');
    }
  }
  function setLoginMsg(text, type) {
    const m = $('loginMsg'); m.textContent = text || ''; m.className = 'msg' + (type ? ' ' + type : '');
  }
  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('loginBtn'); btn.disabled = true; setLoginMsg('Verificando…');
    const { data, error } = await sb.auth.signInWithPassword({
      email: $('email').value.trim(), password: $('password').value
    });
    if (error) { btn.disabled = false; setLoginMsg('Correo o contraseña incorrectos.', 'error'); return; }
    if (await isAdmin(data.user.id)) {
      setLoginMsg(''); $('whoEmail').textContent = data.user.email || '';
      show('appView'); navTo('dashboard');
    } else {
      await sb.auth.signOut(); setLoginMsg('Esta cuenta no tiene permisos de administrador.', 'error');
    }
    btn.disabled = false;
  });
  $('logoutBtn').addEventListener('click', async () => {
    await sb.auth.signOut(); $('loginForm').reset(); setLoginMsg(''); show('loginView');
  });

  // ---------- navegación ----------
  $('nav').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-view]'); if (b) navTo(b.dataset.view);
  });
  function navTo(view) {
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    ({ dashboard: renderDashboard, pedidos: renderPedidos, productos: renderProductos, config: renderConfig }[view] || renderDashboard)();
  }
  const main = () => $('main');
  const loading = () => { main().innerHTML = '<div class="spinner">Cargando…</div>'; };

  // ============================================================
  // DASHBOARD
  // ============================================================
  async function renderDashboard() {
    loading();
    const [pedRes, prodRes] = await Promise.all([
      sb.from('pedidos').select('id,numero,telefono,total,abono,estado,fecha_entrega,created_at').order('created_at', { ascending: false }).limit(1000),
      sb.from('productos').select('id,nombre,stock,activo,categoria')
    ]);
    if (pedRes.error || prodRes.error) { return errorBox(pedRes.error || prodRes.error); }
    const pedidos = pedRes.data || [], productos = prodRes.data || [];

    const activos = pedidos.filter((p) => p.estado !== 'cancelado');
    const ventas = pedidos.filter((p) => p.estado === 'entregado').reduce((s, p) => s + (p.total || 0), 0);
    const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
    const enProc = pedidos.filter((p) => ['confirmado', 'en_preparacion', 'listo'].includes(p.estado)).length;
    const lowStock = productos.filter((p) => p.activo && (p.stock || 0) <= 3);
    const prodActivos = productos.filter((p) => p.activo).length;

    const countByEstado = ESTADOS.map((e) => ({ e, n: pedidos.filter((p) => p.estado === e).length }));

    main().innerHTML = `
      <div class="page-head"><h2>Dashboard</h2></div>
      <div class="stats">
        <div class="stat"><div class="k">Pedidos totales</div><div class="v">${activos.length}</div><div class="sub">sin contar cancelados</div></div>
        <div class="stat"><div class="k">Pendientes</div><div class="v">${pendientes}</div><div class="sub">${enProc} en proceso</div></div>
        <div class="stat"><div class="k">Ventas (entregados)</div><div class="v">${money(ventas)}</div></div>
        <div class="stat"><div class="k">Productos activos</div><div class="v">${prodActivos}</div><div class="sub">${lowStock.length} con stock bajo</div></div>
      </div>
      <div class="panel-card">
        <h3>Pedidos por estado</h3>
        <div class="stats" style="margin:0">
          ${countByEstado.map((c) => `<div class="stat"><div class="k">${ESTADO_LABEL[c.e]}</div><div class="v" style="font-size:1.5rem">${c.n}</div></div>`).join('')}
        </div>
      </div>
      <div class="panel-card">
        <h3>Pedidos recientes</h3>
        ${pedidos.length ? `<div class="tbl-wrap"><table><thead><tr>
          <th>N°</th><th>Fecha</th><th>Entrega</th><th>Teléfono</th><th class="right">Total</th><th>Estado</th></tr></thead>
          <tbody>${pedidos.slice(0, 8).map((p) => `<tr>
            <td>${esc(p.numero || p.id.slice(0, 8))}</td><td>${fmtDateTime(p.created_at)}</td>
            <td>${fmtDate(p.fecha_entrega)}</td><td>${esc(p.telefono || '—')}</td>
            <td class="right">${money(p.total)}</td><td>${estadoBadge(p.estado)}</td></tr>`).join('')}</tbody></table></div>`
        : '<div class="empty">Aún no hay pedidos.</div>'}
      </div>
      <div class="panel-card">
        <h3>Stock bajo</h3>
        ${lowStock.length ? `<div class="tbl-wrap"><table><thead><tr><th>Producto</th><th>Categoría</th><th class="right">Stock</th></tr></thead>
          <tbody>${lowStock.map((p) => `<tr><td>${esc(p.nombre)}</td><td>${esc(p.categoria)}</td>
            <td class="right stock-low">${p.stock || 0}</td></tr>`).join('')}</tbody></table></div>`
        : '<div class="empty">Todo el stock está en orden.</div>'}
      </div>`;
  }
  const estadoBadge = (e) => `<span class="badge b-${e}">${ESTADO_LABEL[e] || e}</span>`;
  function errorBox(error) {
    main().innerHTML = `<div class="panel-card"><h3>Error al cargar</h3><p class="muted">${esc(error.message || error)}</p>
      <p class="field-note">Verifica que ejecutaste <code>schema.sql</code> en Supabase.</p></div>`;
  }

  // ============================================================
  // PEDIDOS
  // ============================================================
  let _pedidos = [];
  async function renderPedidos() {
    loading();
    const { data, error } = await sb.from('pedidos').select('*').order('created_at', { ascending: false }).limit(1000);
    if (error) return errorBox(error);
    _pedidos = data || [];
    main().innerHTML = `
      <div class="page-head"><h2>Pedidos</h2></div>
      <div class="filters">
        <div class="f"><label>Buscar</label><input id="fBuscar" placeholder="N° o teléfono"></div>
        <div class="f"><label>Estado</label><select id="fEstado"><option value="">Todos</option>
          ${ESTADOS.map((e) => `<option value="${e}">${ESTADO_LABEL[e]}</option>`).join('')}</select></div>
        <div class="f"><label>Desde</label><input id="fDesde" type="date"></div>
        <div class="f"><label>Hasta</label><input id="fHasta" type="date"></div>
        <button class="btn btn-ghost btn-sm" id="fClear">Limpiar</button>
      </div>
      <div id="pedTabla"></div>`;
    ['fBuscar', 'fEstado', 'fDesde', 'fHasta'].forEach((id) => $(id).addEventListener('input', drawPedidos));
    $('fClear').addEventListener('click', () => {
      ['fBuscar', 'fEstado', 'fDesde', 'fHasta'].forEach((id) => $(id).value = ''); drawPedidos();
    });
    drawPedidos();
  }
  function drawPedidos() {
    const q = ($('fBuscar').value || '').toLowerCase().trim();
    const est = $('fEstado').value, desde = $('fDesde').value, hasta = $('fHasta').value;
    let rows = _pedidos.filter((p) => {
      if (est && p.estado !== est) return false;
      if (q && !((p.numero || '').toLowerCase().includes(q) || (p.telefono || '').toLowerCase().includes(q))) return false;
      if (desde && (!p.created_at || p.created_at.slice(0, 10) < desde)) return false;
      if (hasta && (!p.created_at || p.created_at.slice(0, 10) > hasta)) return false;
      return true;
    });
    $('pedTabla').innerHTML = rows.length ? `<div class="tbl-wrap"><table><thead><tr>
      <th>N°</th><th>Fecha</th><th>Entrega</th><th>Teléfono</th><th class="right">Total</th>
      <th class="right">Abono</th><th>Estado</th><th></th></tr></thead><tbody>
      ${rows.map((p) => `<tr>
        <td>${esc(p.numero || p.id.slice(0, 8))}</td><td>${fmtDateTime(p.created_at)}</td>
        <td>${fmtDate(p.fecha_entrega)}</td><td>${esc(p.telefono || '—')}</td>
        <td class="right">${money(p.total)}</td><td class="right">${money(p.abono)}</td>
        <td><select class="estado-sel" data-id="${p.id}" style="padding:5px 8px;font-size:.82rem">
          ${ESTADOS.map((e) => `<option value="${e}" ${e === p.estado ? 'selected' : ''}>${ESTADO_LABEL[e]}</option>`).join('')}
        </select></td>
        <td><button class="btn btn-ghost btn-sm" data-ver="${p.id}">Ver</button></td></tr>`).join('')}
      </tbody></table></div>`
      : '<div class="empty">No hay pedidos que coincidan.</div>';

    $('pedTabla').querySelectorAll('.estado-sel').forEach((s) => s.addEventListener('change', async (e) => {
      const id = e.target.dataset.id, estado = e.target.value;
      const { error } = await sb.from('pedidos').update({ estado }).eq('id', id);
      if (error) return toast('No se pudo actualizar', true);
      const p = _pedidos.find((x) => x.id === id); if (p) p.estado = estado;
      toast('Estado actualizado');
    }));
    $('pedTabla').querySelectorAll('[data-ver]').forEach((b) =>
      b.addEventListener('click', () => openPedido(b.dataset.ver)));
  }
  async function openPedido(id) {
    const p = _pedidos.find((x) => x.id === id); if (!p) return;
    const { data: items } = await sb.from('pedido_items').select('*').eq('pedido_id', id);
    const itemRows = (items && items.length) ? items.map((it) => `<tr>
      <td>${esc(it.nombre)}${it.porciones ? ` <span class="muted">(${it.porciones} porc.)</span>` : ''}
        ${it.opciones ? `<div class="field-note">${esc(it.opciones)}</div>` : ''}</td>
      <td class="center">${it.qty}</td><td class="right">${money(it.precio_unit)}</td>
      <td class="right">${money((it.precio_unit || 0) * (it.qty || 1))}</td></tr>`).join('')
      : '<tr><td colspan="4" class="muted center">Sin ítems detallados</td></tr>';
    openModal(`
      <h3>Pedido ${esc(p.numero || p.id.slice(0, 8))}</h3>
      <p class="field-note">${fmtDateTime(p.created_at)}</p>
      <div class="grid2" style="margin-top:14px">
        <div><label>Teléfono</label><div>${esc(p.telefono || '—')}</div></div>
        <div><label>Entrega</label><div>${fmtDate(p.fecha_entrega)}</div></div>
        <div><label>Total</label><div>${money(p.total)}</div></div>
        <div><label>Abono</label><div>${money(p.abono)}</div></div>
      </div>
      ${p.detalle ? `<label style="margin-top:14px">Detalle</label><div class="muted">${esc(p.detalle)}</div>` : ''}
      ${p.notas ? `<label style="margin-top:10px">Notas</label><div class="muted">${esc(p.notas)}</div>` : ''}
      <label style="margin-top:16px">Ítems</label>
      <div class="tbl-wrap"><table><thead><tr><th>Producto</th><th class="center">Cant.</th>
        <th class="right">P. unit.</th><th class="right">Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table></div>
      <label style="margin-top:16px">Estado</label>
      <select id="mEstado">${ESTADOS.map((e) => `<option value="${e}" ${e === p.estado ? 'selected' : ''}>${ESTADO_LABEL[e]}</option>`).join('')}</select>
      <div class="actions">
        <button class="btn btn-danger" id="mDel">Eliminar</button>
        <button class="btn btn-ghost" data-close>Cerrar</button>
        <button class="btn" id="mSave">Guardar estado</button>
      </div>`);
    $('mSave').addEventListener('click', async () => {
      const { error } = await sb.from('pedidos').update({ estado: $('mEstado').value }).eq('id', id);
      if (error) return toast('No se pudo guardar', true);
      p.estado = $('mEstado').value; closeModal(); drawPedidos(); toast('Pedido actualizado');
    });
    $('mDel').addEventListener('click', async () => {
      if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return;
      const { error } = await sb.from('pedidos').delete().eq('id', id);
      if (error) return toast('No se pudo eliminar', true);
      _pedidos = _pedidos.filter((x) => x.id !== id); closeModal(); drawPedidos(); toast('Pedido eliminado');
    });
  }

  // ============================================================
  // PRODUCTOS
  // ============================================================
  let _productos = [];
  async function renderProductos() {
    loading();
    const { data, error } = await sb.from('productos').select('*').order('orden', { ascending: true });
    if (error) return errorBox(error);
    _productos = data || [];
    main().innerHTML = `
      <div class="page-head"><h2>Productos</h2>
        <div class="actions"><button class="btn" id="btnNuevo">+ Nuevo producto</button></div>
      </div>
      <div class="filters">
        <div class="f"><label>Buscar</label><input id="pBuscar" placeholder="Nombre o código"></div>
        <div class="f"><label>Categoría</label><select id="pCat"><option value="">Todas</option>
          ${CATEGORIAS.map((c) => `<option>${c}</option>`).join('')}</select></div>
        <div class="f"><label class="chk" style="margin-top:22px"><input type="checkbox" id="pInact"> Mostrar inactivos</label></div>
      </div>
      <div id="prodTabla"></div>`;
    $('btnNuevo').addEventListener('click', () => openProducto(null));
    ['pBuscar', 'pCat', 'pInact'].forEach((id) => $(id).addEventListener('input', drawProductos));
    drawProductos();
  }
  function drawProductos() {
    const q = ($('pBuscar').value || '').toLowerCase().trim();
    const cat = $('pCat').value, inact = $('pInact').checked;
    let rows = _productos.filter((p) => {
      if (!inact && !p.activo) return false;
      if (cat && p.categoria !== cat) return false;
      if (q && !((p.nombre || '').toLowerCase().includes(q) || (p.codigo || '').toLowerCase().includes(q))) return false;
      return true;
    });
    $('prodTabla').innerHTML = rows.length ? `<div class="tbl-wrap"><table><thead><tr>
      <th>#</th><th></th><th>Nombre</th><th>Categoría</th><th class="right">Precio</th>
      <th class="right">Stock</th><th class="center">Destacado</th><th class="center">Activo</th><th></th></tr></thead><tbody>
      ${rows.map((p) => `<tr>
        <td class="muted">${p.orden ?? ''}</td>
        <td>${p.imagen_url ? `<img src="${esc(p.imagen_url)}" style="width:38px;height:38px;object-fit:cover;border-radius:7px">` : `<span style="font-size:1.4rem">${esc(p.emoji || '🍰')}</span>`}</td>
        <td>${esc(p.nombre)}${p.codigo ? `<div class="field-note">${esc(p.codigo)}</div>` : ''}</td>
        <td>${esc(p.categoria)}</td><td class="right">${money(p.precio)}</td>
        <td class="right ${(p.stock || 0) <= 3 ? 'stock-low' : ''}">${p.stock ?? 0}</td>
        <td class="center">${p.destacado ? '★' : '—'}</td>
        <td class="center">${p.activo ? '<span class="dot-on">Sí</span>' : '<span class="dot-off">No</span>'}</td>
        <td><button class="btn btn-ghost btn-sm" data-edit="${p.id}">Editar</button>
            <button class="btn btn-ghost btn-sm" data-toggle="${p.id}">${p.activo ? 'Desactivar' : 'Activar'}</button>
            <button class="btn btn-danger btn-sm" data-del="${p.id}">✕</button></td></tr>`).join('')}
      </tbody></table></div>`
      : '<div class="empty">No hay productos que coincidan.</div>';

    $('prodTabla').querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => openProducto(b.dataset.edit)));
    $('prodTabla').querySelectorAll('[data-toggle]').forEach((b) =>
      b.addEventListener('click', async () => {
        const p = _productos.find((x) => x.id === b.dataset.toggle);
        const { error } = await sb.from('productos').update({ activo: !p.activo, updated_at: new Date().toISOString() }).eq('id', p.id);
        if (error) return toast('No se pudo actualizar', true);
        p.activo = !p.activo; drawProductos(); toast(p.activo ? 'Producto activado' : 'Producto desactivado');
      }));
    $('prodTabla').querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', async () => {
        const p = _productos.find((x) => x.id === b.dataset.del);
        if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
        const { error } = await sb.from('productos').delete().eq('id', p.id);
        if (error) return toast('No se pudo eliminar', true);
        _productos = _productos.filter((x) => x.id !== p.id); drawProductos(); toast('Producto eliminado');
      }));
  }
  function openProducto(id) {
    const p = id ? _productos.find((x) => x.id === id) : {};
    const isNew = !id;
    openModal(`
      <h3>${isNew ? 'Nuevo producto' : 'Editar producto'}</h3>
      <div class="grid2">
        <div style="grid-column:1/-1"><label>Nombre *</label><input id="f_nombre" value="${esc(p.nombre)}"></div>
        <div><label>Categoría *</label><input id="f_categoria" list="catList" value="${esc(p.categoria)}">
          <datalist id="catList">${CATEGORIAS.map((c) => `<option value="${c}">`).join('')}</datalist></div>
        <div><label>Código</label><input id="f_codigo" value="${esc(p.codigo)}" placeholder="PROD-XXX"></div>
        <div><label>Precio (CLP) *</label><input id="f_precio" type="number" min="0" value="${p.precio ?? 0}"></div>
        <div><label>Porciones</label><input id="f_porciones" type="number" min="0" value="${p.porciones ?? ''}"></div>
        <div><label>Stock</label><input id="f_stock" type="number" min="0" value="${p.stock ?? 0}"></div>
        <div><label>Orden</label><input id="f_orden" type="number" value="${p.orden ?? 0}"></div>
        <div><label>Emoji</label><input id="f_emoji" value="${esc(p.emoji)}" placeholder="🍰"></div>
        <div><label>Badge</label><input id="f_badge" value="${esc(p.badge)}" placeholder="Top / Especial…"></div>
        <div style="grid-column:1/-1"><label>Descripción</label><textarea id="f_descripcion">${esc(p.descripcion)}</textarea></div>
        <div style="grid-column:1/-1"><label>Imagen (URL)</label><input id="f_imagen" value="${esc(p.imagen_url)}" placeholder="https://…">
          <div class="field-note">O sube un archivo:</div>
          <input id="f_file" type="file" accept="image/*" style="margin-top:6px">
          <img id="f_prev" class="img-prev ${p.imagen_url ? '' : 'hidden'}" src="${esc(p.imagen_url)}" alt="">
        </div>
      </div>
      <div style="display:flex;gap:24px">
        <label class="chk"><input type="checkbox" id="f_destacado" ${p.destacado ? 'checked' : ''}> Destacado (best seller)</label>
        <label class="chk"><input type="checkbox" id="f_activo" ${(p.activo ?? true) ? 'checked' : ''}> Activo</label>
      </div>
      <div class="actions">
        <button class="btn btn-ghost" data-close>Cancelar</button>
        <button class="btn" id="f_save">${isNew ? 'Crear' : 'Guardar'}</button>
      </div>`);

    const fileInput = $('f_file'), prev = $('f_prev'), urlInput = $('f_imagen');
    urlInput.addEventListener('input', () => {
      if (urlInput.value.trim()) { prev.src = urlInput.value.trim(); prev.classList.remove('hidden'); }
      else prev.classList.add('hidden');
    });
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0]; if (!file) return;
      toast('Subiendo imagen…');
      const url = await uploadImagen(file);
      if (url) { urlInput.value = url; prev.src = url; prev.classList.remove('hidden'); toast('Imagen subida'); }
    });

    $('f_save').addEventListener('click', async () => {
      const nombre = nz($('f_nombre').value), categoria = nz($('f_categoria').value);
      if (!nombre || !categoria) return toast('Nombre y categoría son obligatorios', true);
      const obj = {
        nombre, categoria, codigo: nz($('f_codigo').value),
        precio: intOr($('f_precio').value, 0), porciones: $('f_porciones').value === '' ? null : intOr($('f_porciones').value),
        stock: intOr($('f_stock').value, 0), orden: intOr($('f_orden').value, 0),
        emoji: nz($('f_emoji').value), badge: nz($('f_badge').value),
        descripcion: nz($('f_descripcion').value), imagen_url: nz($('f_imagen').value),
        destacado: $('f_destacado').checked, activo: $('f_activo').checked,
        updated_at: new Date().toISOString()
      };
      const res = isNew
        ? await sb.from('productos').insert(obj).select().single()
        : await sb.from('productos').update(obj).eq('id', id).select().single();
      if (res.error) return toast(res.error.message || 'No se pudo guardar', true);
      if (isNew) _productos.push(res.data); else Object.assign(_productos.find((x) => x.id === id), res.data);
      _productos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      closeModal(); drawProductos(); toast(isNew ? 'Producto creado' : 'Producto guardado');
    });
  }
  async function uploadImagen(file) {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `prod/${Date.now()}_${safe}`;
    const { error } = await sb.storage.from('productos').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) {
      toast('No se pudo subir (revisa el bucket "productos"). Usa una URL.', true);
      return null;
    }
    return sb.storage.from('productos').getPublicUrl(path).data.publicUrl;
  }

  // ============================================================
  // CONFIGURACIÓN
  // ============================================================
  async function renderConfig() {
    loading();
    const { data, error } = await sb.from('configuracion').select('*').eq('id', 1).single();
    if (error) return errorBox(error);
    const c = data || {};
    main().innerHTML = `
      <div class="page-head"><h2>Configuración de la tienda</h2></div>
      <div class="panel-card" style="max-width:680px">
        <div class="grid2">
          <div style="grid-column:1/-1"><label>Nombre de la tienda</label><input id="c_nombre" value="${esc(c.nombre_tienda)}"></div>
          <div><label>Teléfono</label><input id="c_tel" value="${esc(c.telefono)}"></div>
          <div><label>WhatsApp</label><input id="c_wsp" value="${esc(c.whatsapp)}" placeholder="56944832160"></div>
          <div><label>Email</label><input id="c_email" value="${esc(c.email)}"></div>
          <div><label>Instagram</label><input id="c_ig" value="${esc(c.instagram)}"></div>
          <div style="grid-column:1/-1"><label>Dirección</label><input id="c_dir" value="${esc(c.direccion)}"></div>
          <div style="grid-column:1/-1"><label>Horario</label><input id="c_hor" value="${esc(c.horario)}"></div>
          <div><label>% de abono (0 a 1)</label><input id="c_abono" type="number" step="0.05" min="0" max="1" value="${c.abono_pct ?? 0.5}">
            <div class="field-note">0.5 = 50% de abono al reservar</div></div>
          <div style="grid-column:1/-1"><label>Mensaje del banner</label><textarea id="c_banner">${esc(c.mensaje_banner)}</textarea></div>
        </div>
        <div class="actions"><button class="btn" id="c_save">Guardar cambios</button></div>
      </div>`;
    $('c_save').addEventListener('click', async () => {
      const obj = {
        nombre_tienda: nz($('c_nombre').value), telefono: nz($('c_tel').value), whatsapp: nz($('c_wsp').value),
        email: nz($('c_email').value), instagram: nz($('c_ig').value), direccion: nz($('c_dir').value),
        horario: nz($('c_hor').value), abono_pct: parseFloat($('c_abono').value) || 0.5,
        mensaje_banner: nz($('c_banner').value), updated_at: new Date().toISOString()
      };
      const { error } = await sb.from('configuracion').update(obj).eq('id', 1);
      if (error) return toast(error.message || 'No se pudo guardar', true);
      toast('Configuración guardada');
    });
  }

  // ---------- modal ----------
  function openModal(html) {
    $('modalRoot').innerHTML = `<div class="modal-bg"><div class="modal">${html}</div></div>`;
    $('modalRoot').querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    $('modalRoot').querySelector('.modal-bg').addEventListener('click', (e) => { if (e.target.classList.contains('modal-bg')) closeModal(); });
  }
  function closeModal() { $('modalRoot').innerHTML = ''; }

  // ---------- arranque ----------
  sb.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') show('loginView'); });
  route();
})();
