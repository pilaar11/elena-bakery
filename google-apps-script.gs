/**
 * Elena Bakery — Pedidos, número correlativo y planificación de producción
 * ------------------------------------------------------------
 * INSTALACIÓN / ACTUALIZACIÓN:
 * 1. En tu Google Sheet: Extensiones > Apps Script. Borra todo y pega ESTO. Guarda (💾).
 * 2. Arriba elige la función "configurar" y pulsa ▶ Ejecutar (autoriza permisos).
 *    Esto crea/ordena las pestañas Y repara los Items que ya tengas.
 * 3. Implementar > Gestionar implementaciones > ✏️ editar >
 *    Versión: "Nueva versión" > Implementar.   (El URL /exec NO cambia.)
 *
 * CÓMO FUNCIONA:
 * - "Pedidos": una fila por pedido. Aquí controlas el ESTADO (marcas "Abonado").
 * - "Items": una fila por producto (se llena solo). Col. Estado se cruza con Pedidos.
 * - "Producción": detalle por ítem de los pedidos ABONADOS (cada producto en su línea).
 * - "Resumen": CUÁNTO HORNEAR por día y producto (suma cantidades del mismo día).
 *
 * NOTA: los pedidos hechos ANTES de tener el desglose en "Items" no aparecerán
 * en Producción/Resumen. Los nuevos sí.
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
                        'Porciones', 'Cantidad', 'Opciones', 'Estado'];

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
      const r = items.getLastRow();
      const cell = items.getRange(r, 8);
      cell.setNumberFormat('General');                 // evita que la fórmula quede como texto
      cell.setFormula('=IFERROR(VLOOKUP(C' + r + ', ' + SHEET_PEDIDOS + '!$A:$I, 9, FALSE),"")');
    });

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

/** Ejecútala UNA VEZ desde el editor para dejar todo listo. */
function configurar(){
  const sh = obtenerHoja_(SHEET_PEDIDOS, HEADER_PEDIDOS);
  obtenerHoja_(SHEET_ITEMS, HEADER_ITEMS);

  const colEstado = HEADER_PEDIDOS.indexOf('Estado') + 1;
  const regla = SpreadsheetApp.newDataValidation()
    .requireValueInList(ESTADOS, true).setAllowInvalid(false).build();
  sh.getRange(2, colEstado, 2000, 1).setDataValidation(regla);

  pintarEstados_(sh, colEstado);
  repararItems_();        // arregla la columna Estado de los Items existentes
  crearProduccion_();
  crearResumen_();
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('Listo: Pedidos, Items, Producción y Resumen configurados.');
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

// Re-escribe la fórmula de Estado (col H) de todos los Items, con formato General
// para que se evalúe (y no quede como texto).
function repararItems_(){
  const items = obtenerHoja_(SHEET_ITEMS, HEADER_ITEMS);
  const last = items.getLastRow();
  if(last < 2) return;
  const rng = items.getRange(2, 8, last - 1, 1);
  rng.setNumberFormat('General');
  const fs = [];
  for(let r = 2; r <= last; r++){
    fs.push(['=IFERROR(VLOOKUP(C' + r + ', ' + SHEET_PEDIDOS + '!$A:$I, 9, FALSE),"")']);
  }
  rng.setFormulas(fs);
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

function crearProduccion_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const p = ss.getSheetByName(SHEET_PRODUCCION) || ss.insertSheet(SHEET_PRODUCCION);
  p.clear();
  p.getRange('A1')
    .setValue('PEDIDOS A PRODUCIR (solo abonados) — detalle por ítem, se actualiza solo')
    .setFontWeight('bold');
  p.getRange('A3').setFormula(
    '=IFERROR(QUERY(' + SHEET_ITEMS + '!A:H, "select B, C, D, E, F, G ' +
    'where H = \'Abonado\' order by A, C", 1), "Aún no hay pedidos abonados.")');
  p.setFrozenRows(3);
}

function crearResumen_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const p = ss.getSheetByName(SHEET_RESUMEN) || ss.insertSheet(SHEET_RESUMEN);
  p.clear();
  p.getRange('A1')
    .setValue('CUÁNTO HORNEAR (solo abonados) — por día y producto, se actualiza solo')
    .setFontWeight('bold');
  p.getRange('A3').setFormula(
    '=IFERROR(QUERY(' + SHEET_ITEMS + '!A:H, "select A, D, E, sum(F) ' +
    'where H = \'Abonado\' group by A, D, E order by A ' +
    'label A \'Entrega\', D \'Producto\', E \'Porciones\', sum(F) \'Cantidad total\'", 1), ' +
    '"Aún no hay pedidos abonados.")');
  p.setFrozenRows(3);
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
