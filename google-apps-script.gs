/**
 * Elena Bakery — Registro de pedidos + número correlativo + producción
 * ------------------------------------------------------------
 * INSTALACIÓN (la primera vez):
 * 1. En tu Google Sheet: Extensiones > Apps Script. Borra todo y pega ESTO.
 * 2. Guarda (💾).
 * 3. Arriba selecciona la función "configurar" y pulsa "Ejecutar" una vez.
 *    Autoriza los permisos. Esto crea el menú de estados, los colores y la
 *    pestaña "Producción".
 * 4. Implementar > Nueva implementación > Aplicación web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier persona
 *    Copia la URL /exec y pégala en index.html (PEDIDOS_ENDPOINT).
 *
 * SI YA LO TENÍAS Y SOLO ESTÁS ACTUALIZANDO:
 * - Pega este código, Guarda, ejecuta "configurar" una vez.
 * - Vuelve a desplegar: Implementar > Gestionar implementaciones >
 *   ✏️ (editar) > Versión: "Nueva versión" > Implementar.  (El URL NO cambia.)
 *
 * FLUJO DE TRABAJO:
 * - Cada pedido entra como "Solicitado" (un interesado).
 * - Cuando confirmes el abono del 50%, cambia su Estado a "Abonado".
 * - La pestaña "Producción" muestra SOLO los abonados, ordenados por fecha
 *   de entrega. Eso es lo único que debes hornear.
 * - Los que nunca abonan quedan en "Solicitado" y no afectan producción;
 *   bórralos cuando quieras (clic en el nº de fila > clic derecho > Eliminar).
 */

const SHEET_PEDIDOS    = 'Pedidos';
const SHEET_PRODUCCION = 'Producción';
const NUMERO_INICIAL   = 1;
const ESTADOS = ['Solicitado', 'Abonado', 'Entregado', 'Anulado'];
const HEADER  = ['N° Pedido', 'Fecha/hora', 'Teléfono', 'Fecha de entrega',
                 'Entrega (orden)', 'Total', 'Abono 50%', 'Detalle', 'Estado'];

function doPost(e){
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sh = obtenerHojaPedidos_();
    const props = PropertiesService.getScriptProperties();
    const numero = parseInt(props.getProperty('ultimoNumero') || String(NUMERO_INICIAL - 1), 10) + 1;
    props.setProperty('ultimoNumero', String(numero));
    sh.appendRow([
      numero,
      new Date(),
      data.telefono || '',
      data.fechaEntrega || '',
      data.fechaEntregaISO || '',
      data.total || '',
      data.abono || '',
      data.detalle || '',
      'Solicitado'
    ]);
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
  const sh = obtenerHojaPedidos_();
  const colEstado = HEADER.indexOf('Estado') + 1;

  // Menú desplegable de estados
  const regla = SpreadsheetApp.newDataValidation()
    .requireValueInList(ESTADOS, true)
    .setAllowInvalid(false)
    .build();
  sh.getRange(2, colEstado, 2000, 1).setDataValidation(regla);

  pintarEstados_(sh, colEstado);
  crearProduccion_();
  SpreadsheetApp.getActiveSpreadsheet()
    .toast('Listo: estados, colores y pestaña "Producción" configurados.');
}

function obtenerHojaPedidos_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_PEDIDOS);
  if(!sh) sh = ss.insertSheet(SHEET_PEDIDOS);
  const head = sh.getRange(1, 1, 1, HEADER.length).getValues()[0];
  if(head.join('') !== HEADER.join('')){
    sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function pintarEstados_(sh, colEstado){
  const letra = columnaLetra_(colEstado);
  const rango = sh.getRange(2, 1, 2000, HEADER.length);
  const colores = [['Abonado', '#d9ead3'], ['Entregado', '#cfe2f3'],
                   ['Anulado', '#efefef'], ['Solicitado', '#fff2cc']];
  const reglas = colores.map(function(c){
    return SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$' + letra + '2="' + c[0] + '"')
      .setBackground(c[1])
      .setRanges([rango])
      .build();
  });
  sh.setConditionalFormatRules(reglas);
}

function crearProduccion_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let p = ss.getSheetByName(SHEET_PRODUCCION);
  if(!p) p = ss.insertSheet(SHEET_PRODUCCION);
  p.clear();
  p.getRange('A1')
    .setValue('PEDIDOS A PRODUCIR (solo abonados) — se actualiza solo')
    .setFontWeight('bold');
  p.getRange('A3').setFormula(
    '=QUERY(' + SHEET_PEDIDOS + '!A:I, "select A, D, H, F, G, C ' +
    'where I = \'Abonado\' order by E", 1)');
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
