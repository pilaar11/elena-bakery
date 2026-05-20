/**
 * Elena Bakery — Pedidos, número correlativo y planificación de producción
 * ------------------------------------------------------------
 * Las pestañas Producción y Resumen se calculan con código (sin fórmulas), así
 * que NO dependen del idioma/región de la planilla. Se actualizan solas:
 *   - al entrar un pedido nuevo (web), y
 *   - cada vez que cambias el Estado en la pestaña Pedidos (disparador onEdit).
 *
 * INSTALACIÓN / ACTUALIZACIÓN:
 * 1. Extensiones > Apps Script. Borra todo y pega ESTO. Guarda (💾).
 * 2. Arriba elige la función "configurar" y pulsa ▶ Ejecutar (autoriza permisos).
 *    Esto deja todo listo y llena Producción/Resumen con lo que ya tengas.
 * 3. Implementar > Gestionar implementaciones > ✏️ editar >
 *    Versión: "Nueva versión" > Implementar.   (El URL /exec NO cambia.)
 *
 * USO: cuando te paguen el 50%, cambia el Estado del pedido a "Abonado".
 * Producción (detalle por ítem) y Resumen (cuánto hornear por día) se actualizan.
 */

const SHEET_PEDIDOS    = 'Pedidos';
const SHEET_ITEMS      = 'Items';
const SHEET_PRODUCCION = 'Producción';
const SHEET_RESUMEN    = 'Resumen';
const NUMERO_INICIAL   = 1;
const ESTADOS = ['Solicitado', 'Abonado', 'Entregado', 'Anulado'];

const HEADER_PEDIDOS = ['N° Pedido', 'Fecha/hora', 'Teléfono', 'Fecha de entrega',
                        'Entrega (orden)', 'Total', 'Abono 50%', 'Detalle', 'Estado'];
const HEADER_ITEMS   = ['Entrega (orden)', 'Fecha de entrega', 'N° Pedido', 'Producto',
                        'Porciones', 'Cantidad', 'Opciones'];
const HEAD_PROD = ['Fecha de entrega', 'N° Pedido', 'Producto', 'Porciones', 'Cantidad', 'Opciones'];
const HEAD_RES  = ['Entrega', 'Producto', 'Porciones', 'Cantidad total'];

function doPost(e){
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sh = obtenerHoja_(SHEET_PEDIDOS, HEADER_PEDIDOS);
    const props = PropertiesService.getScriptProperties();
    const numero = parseInt(props.getProperty('ultimoNumero') || String(NUMERO_INICIAL - 1), 10) + 1;
    props.setProperty('ultimoNumero', String(numero));

    sh.appendRow([
      numero, new Date(), data.telefono || '', data.fechaEntrega || '',
      data.fechaEntregaISO || '', data.total || '', data.abono || '',
      data.detalle || '', 'Solicitado'
    ]);

    const items = obtenerHoja_(SHEET_ITEMS, HEADER_ITEMS);
    (data.items || []).forEach(function(it){
      items.appendRow([
        data.fechaEntregaISO || '', data.fechaEntrega || '', numero,
        it.nombre || '', it.porciones || '', it.qty || '', it.opciones || ''
      ]);
    });

    actualizarVistas_();
    return json({ ok: true, numero: numero });
  } catch(err){
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(){
  return json({ ok: true, ping: true });
}

// Disparador automático: al cambiar el Estado en Pedidos, recalcula las vistas.
function onEdit(e){
  try {
    if(!e || !e.range) return;
    const sh = e.range.getSheet();
    if(sh.getName() !== SHEET_PEDIDOS) return;
    const colEstado = HEADER_PEDIDOS.indexOf('Estado') + 1;
    if(e.range.getColumn() !== colEstado || e.range.getRow() < 2) return;
    actualizarVistas_();
  } catch(err){ /* silencioso */ }
}

/** Ejecútala UNA VEZ desde el editor para dejar todo listo. */
function configurar(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = obtenerHoja_(SHEET_PEDIDOS, HEADER_PEDIDOS);
  const it = obtenerHoja_(SHEET_ITEMS, HEADER_ITEMS);

  // Limpia columnas sobrantes de versiones anteriores en Items (ej. la vieja "Estado")
  if(it.getLastColumn() > HEADER_ITEMS.length){
    it.getRange(1, HEADER_ITEMS.length + 1, it.getMaxRows(),
               it.getLastColumn() - HEADER_ITEMS.length).clearContent();
  }

  const colEstado = HEADER_PEDIDOS.indexOf('Estado') + 1;
  const regla = SpreadsheetApp.newDataValidation()
    .requireValueInList(ESTADOS, true).setAllowInvalid(false).build();
  sh.getRange(2, colEstado, 2000, 1).setDataValidation(regla);
  pintarEstados_(sh, colEstado);

  actualizarVistas_();
  ss.toast('Listo. Producción y Resumen se calculan con código y se actualizan solos.');
}

// Calcula Producción (detalle) y Resumen (agregado) y escribe los VALORES.
function actualizarVistas_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ped = ss.getSheetByName(SHEET_PEDIDOS);
  const it  = ss.getSheetByName(SHEET_ITEMS);
  if(!ped || !it) return;

  const pv = ped.getDataRange().getValues();
  const estadoPorNumero = {};
  for(let r = 1; r < pv.length; r++){
    const num = pv[r][0];
    if(num !== '' && num !== null) estadoPorNumero[String(num)] = pv[r][8];
  }

  const iv = it.getDataRange().getValues();
  const abonados = [];
  for(let r = 1; r < iv.length; r++){
    const row = iv[r];
    const num = row[2];
    if(num === '' || num === null) continue;
    if(estadoPorNumero[String(num)] === 'Abonado'){
      abonados.push({
        iso: row[0], fecha: row[1], num: num, producto: row[3],
        porciones: row[4], cantidad: Number(row[5]) || 0, opciones: row[6]
      });
    }
  }

  // Detalle por ítem, ordenado por fecha de entrega y N° de pedido
  const det = abonados.slice().sort(function(a, b){
    if(a.iso !== b.iso) return a.iso < b.iso ? -1 : 1;
    return a.num - b.num;
  });
  const detRows = det.map(function(x){
    return [x.fecha, x.num, x.producto, x.porciones, x.cantidad, x.opciones];
  });
  escribirVista_(ss, SHEET_PRODUCCION,
    'PEDIDOS A PRODUCIR (solo abonados) — detalle por ítem', HEAD_PROD, detRows);

  // Resumen: suma cantidades por día + producto + porciones
  const mapa = {};
  abonados.forEach(function(x){
    const k = x.iso + '||' + x.producto + '||' + x.porciones;
    if(!mapa[k]) mapa[k] = { iso: x.iso, producto: x.producto, porciones: x.porciones, total: 0 };
    mapa[k].total += x.cantidad;
  });
  const res = Object.keys(mapa).map(function(k){ return mapa[k]; }).sort(function(a, b){
    if(a.iso !== b.iso) return a.iso < b.iso ? -1 : 1;
    return a.producto < b.producto ? -1 : (a.producto > b.producto ? 1 : 0);
  });
  const resRows = res.map(function(x){ return [x.iso, x.producto, x.porciones, x.total]; });
  escribirVista_(ss, SHEET_RESUMEN,
    'CUÁNTO HORNEAR (solo abonados) — por día y producto', HEAD_RES, resRows);
}

function escribirVista_(ss, nombre, titulo, header, filas){
  const p = ss.getSheetByName(nombre) || ss.insertSheet(nombre);
  p.clearContents();
  p.getRange('A1').setValue(titulo).setFontWeight('bold');
  p.getRange(2, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if(filas.length){
    p.getRange(3, 1, filas.length, header.length).setValues(filas);
  } else {
    p.getRange('A3').setValue('Aún no hay pedidos abonados.');
  }
  p.setFrozenRows(2);
}

function obtenerHoja_(nombre, header){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nombre);
  if(!sh) sh = ss.insertSheet(nombre);
  const head = sh.getRange(1, 1, 1, header.length).getValues()[0];
  if(head.join('') !== header.join('')){
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function pintarEstados_(sh, colEstado){
  const letra = columnaLetra_(colEstado);
  const rango = sh.getRange(2, 1, 2000, HEADER_PEDIDOS.length);
  const colores = [['Abonado', '#d9ead3'], ['Entregado', '#cfe2f3'],
                   ['Anulado', '#efefef'], ['Solicitado', '#fff2cc']];
  const reglas = colores.map(function(c){
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letra + '2="' + c[0] + '"')
      .setBackground(c[1]).setRanges([rango]).build();
  });
  sh.setConditionalFormatRules(reglas);
}

function columnaLetra_(n){
  let s = '';
  while(n > 0){ const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
