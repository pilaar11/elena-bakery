/* Elena Bakery — configuración pública de Supabase (frontend estático).
 *
 * Esta es la anon/publishable key: es PÚBLICA por diseño. El acceso real a
 * los datos lo controla Row Level Security (RLS). La clave SECRETA
 * (service_role) NUNCA debe ir aquí ni en ningún archivo del repo.
 *
 * Requiere cargar antes el SDK:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */
(function () {
  window.ELENA_SUPABASE = {
    url: 'https://evmgcrkxjjcjfjapepcx.supabase.co',
    anonKey: 'sb_publishable_PJGT2uyUW22AK8bNJemzQg_l5sg_9kt',
  };

  window.getSupabase = function () {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('supabase-js no está cargado: incluye el <script> del CDN antes de supabase-config.js');
    }
    if (!window._elenaSupabase) {
      window._elenaSupabase = window.supabase.createClient(
        window.ELENA_SUPABASE.url,
        window.ELENA_SUPABASE.anonKey,
        { auth: { persistSession: true, autoRefreshToken: true } }
      );
    }
    return window._elenaSupabase;
  };
})();
