/**
 * Elena Bakery — Registro de pedidos + número correlativo
 * ------------------------------------------------------------
 * CÓMO USARLO:
 * 1. Abre tu Google Sheet (puede ser la misma de Disponibilidad).
 * 2. Menú: Extensiones > Apps Script. Borra lo que haya y pega ESTE código.
 * 3. Guarda. Luego: Implementar > Nueva implementación > tipo "Aplicación web":
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier persona
 * 4. Autoriza los permisos cuando lo pida.
 * 5. Copia la URL que termina en /exec.
 * 6. Pégala en index.html, en:  const PEDIDOS_ENDPOINT = 'TU_URL/exec';
 *
 * Para reiniciar la numeración: en Apps Script ve a "Configuración del proyecto"
 * > "Propiedades del script" y borra/edita la propiedad "ultimoNumero".
 * O cambia NUMERO_INICIAL abajo antes del primer pedido.
 */

const SHEET_PEDIDOS = 'Pedidos';   // pestaña donde se guardan los pedidos
const NUMERO_INICIAL = 1;          // primer número de pedido

function doPost(e){
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_PEDIDOS);
    if(!sh){
      sh = ss.insertSheet(SHEET_PEDIDOS);
      sh.appendRow(['N° Pedido','Fecha/hora','Teléfono','Fecha de entrega','Total','Abono 50%','Detalle','Estado']);
    }
    const props = PropertiesService.getScriptProperties();
    const numero = parseInt(props.getProperty('ultimoNumero') || String(NUMERO_INICIAL - 1), 10) + 1;
    props.setProperty('ultimoNumero', String(numero));
    sh.appendRow([
      numero,
      new Date(),
      data.telefono || '',
      data.fechaEntrega || '',
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

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
