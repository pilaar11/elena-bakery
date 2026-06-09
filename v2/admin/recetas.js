/* Elena Bakery — Recetas para la lista de insumos (estimado).
 *
 * Cada receta tiene un tamaño de referencia "ref" (en porciones o unidades
 * que produce) y una lista de ingredientes. En la vista de Producción, el
 * total de cada insumo = cantidad * (porciones_del_pedido / ref) * qty.
 * Los insumos marcados con f:1 (envasado) NO escalan por tamaño, solo por qty.
 *
 * Conversión de medidas: cucharadita ≈ 5, cucharada ≈ 15 (g o ml).
 * Se omiten "pizca de sal", papel mantequilla, alusa y acetato (reutilizable).
 * Unidades: g (gramos), ml (mililitros), un (unidades).
 *
 * Para editar precios/cantidades o agregar productos nuevos, edita este archivo.
 */
(function () {
  const G = { B: 'Bizcocho', M: 'Masa', R: 'Relleno', D: 'Decoración', E: 'Envasado' };

  window.RECETAS = {
    // ---- Bizcocho clásico (7 huevos) — mismas bases, distinto relleno ----
    'mami-gina': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 245, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Manjar Nestlé', c: 400, u: 'g', g: G.R }, { n: 'Nueces', c: 100, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'azul-manjar-durazno': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 245, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Manjar Nestlé', c: 400, u: 'g', g: G.R }, { n: 'Crema vegetal Puratos', c: 100, u: 'g', g: G.R }, { n: 'Durazno en conserva', c: 300, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'manjar-durazno': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 245, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Manjar Nestlé', c: 400, u: 'g', g: G.R }, { n: 'Crema vegetal Puratos', c: 100, u: 'g', g: G.R }, { n: 'Durazno en conserva', c: 300, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'harry-potter': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 245, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Cobertura chocolate blanco', c: 300, u: 'g', g: G.R }, { n: 'Crema de leche', c: 300, u: 'ml', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'barbara': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 245, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Mermelada de frambuesa', c: 400, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'roblox': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 245, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Crema de avellanas', c: 400, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Bizcocho clásico sin azúcar (alulosa) ----
    'frambuesa-sa': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Alulosa', c: 105, u: 'g', g: G.B }, { n: 'Harina', c: 210, u: 'g', g: G.B },
      { n: 'Frambuesas', c: 400, u: 'g', g: G.R }, { n: 'Alulosa', c: 80, u: 'g', g: G.R },
      { n: 'Crema de leche', c: 250, u: 'ml', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'manjar-crema-sa': { ref: 20, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Alulosa', c: 105, u: 'g', g: G.B }, { n: 'Harina', c: 210, u: 'g', g: G.B },
      { n: 'Manjar sin azúcar', c: 200, u: 'g', g: G.R }, { n: 'Crema pastelera', c: 200, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Caluga (sin horno) ----
    'caluga': { ref: 20, ing: [
      { n: 'Galletas de vino', c: 3, u: 'paq', g: G.M }, { n: 'Leche condensada', c: 800, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 400, u: 'g', g: G.R }, { n: 'Mantequilla', c: 100, u: 'g', g: G.R },
      { n: 'Nueces', c: 100, u: 'g', g: G.R }, { n: 'Frambuesas', c: 200, u: 'g', g: G.R },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Bizcocho chocolate (selva negra) ----
    'selva-negra': { ref: 20, ing: [
      { n: 'Huevos', c: 8, u: 'un', g: G.B }, { n: 'Azúcar', c: 240, u: 'g', g: G.B }, { n: 'Harina', c: 200, u: 'g', g: G.B },
      { n: 'Cacao amargo', c: 40, u: 'g', g: G.B }, { n: 'Polvo de hornear', c: 10, u: 'g', g: G.B }, { n: 'Leche', c: 80, u: 'ml', g: G.B }, { n: 'Aceite', c: 80, u: 'ml', g: G.B },
      { n: 'Mermelada de frambuesa', c: 400, u: 'g', g: G.R }, { n: 'Crema vegetal Puratos', c: 100, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'selva-negra-eco': { ref: 22, ing: [
      { n: 'Huevos', c: 7, u: 'un', g: G.B }, { n: 'Harina', c: 196, u: 'g', g: G.B }, { n: 'Cacao amargo', c: 49, u: 'g', g: G.B }, { n: 'Azúcar', c: 245, u: 'g', g: G.B },
      { n: 'Azúcar', c: 186, u: 'g', g: G.R }, { n: 'Agua', c: 500, u: 'ml', g: G.R }, { n: 'Crema vegetal Puratos', c: 200, u: 'g', g: G.R }, { n: 'Mermelada de frambuesa', c: 400, u: 'g', g: G.R },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Sticker', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Bizcocho Matilda ----
    'matilda': { ref: 20, ing: [
      { n: 'Huevos', c: 2, u: 'un', g: G.B }, { n: 'Azúcar', c: 270, u: 'g', g: G.B }, { n: 'Miel', c: 5, u: 'g', g: G.B }, { n: 'Leche', c: 225, u: 'ml', g: G.B },
      { n: 'Aceite', c: 115, u: 'ml', g: G.B }, { n: 'Jugo de limón', c: 10, u: 'ml', g: G.B }, { n: 'Harina', c: 220, u: 'g', g: G.B }, { n: 'Cacao amargo', c: 45, u: 'g', g: G.B },
      { n: 'Cobertura de chocolate', c: 200, u: 'g', g: G.R }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'matilda-xl': { ref: 40, ing: [
      { n: 'Harina', c: 750, u: 'g', g: G.B }, { n: 'Azúcar', c: 900, u: 'g', g: G.B }, { n: 'Cacao amargo', c: 150, u: 'g', g: G.B }, { n: 'Bicarbonato', c: 15, u: 'g', g: G.B },
      { n: 'Polvo de hornear', c: 10, u: 'g', g: G.B }, { n: 'Huevos', c: 6, u: 'un', g: G.B }, { n: 'Aceite', c: 360, u: 'ml', g: G.B }, { n: 'Leche', c: 720, u: 'ml', g: G.B }, { n: 'Café', c: 720, u: 'ml', g: G.B },
      { n: 'Cobertura de chocolate', c: 700, u: 'g', g: G.R }, { n: 'Crema de leche', c: 700, u: 'ml', g: G.R },
      { n: 'Crema vegetal Puratos', c: 400, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Red velvet ----
    'red-velvet': { ref: 20, ing: [
      { n: 'Huevos', c: 2, u: 'un', g: G.B }, { n: 'Azúcar', c: 300, u: 'g', g: G.B }, { n: 'Leche', c: 225, u: 'ml', g: G.B }, { n: 'Aceite', c: 115, u: 'ml', g: G.B },
      { n: 'Jugo de limón', c: 30, u: 'ml', g: G.B }, { n: 'Harina', c: 220, u: 'g', g: G.B }, { n: 'Cacao amargo', c: 20, u: 'g', g: G.B }, { n: 'Maicena', c: 30, u: 'g', g: G.B }, { n: 'Colorante rojo', c: 1, u: 'un', g: G.B },
      { n: 'Queso crema', c: 400, u: 'g', g: G.R }, { n: 'Mantequilla', c: 250, u: 'g', g: G.R }, { n: 'Azúcar flor', c: 250, u: 'g', g: G.R }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.R },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Carrot ----
    'carrot': { ref: 30, ing: [
      { n: 'Huevos', c: 5, u: 'un', g: G.B }, { n: 'Zanahoria', c: 250, u: 'g', g: G.B }, { n: 'Aceite', c: 200, u: 'ml', g: G.B }, { n: 'Azúcar', c: 500, u: 'g', g: G.B },
      { n: 'Harina', c: 400, u: 'g', g: G.B }, { n: 'Nueces', c: 50, u: 'g', g: G.B }, { n: 'Canela', c: 3, u: 'g', g: G.B }, { n: 'Bicarbonato', c: 2, u: 'g', g: G.B }, { n: 'Polvo de hornear', c: 3, u: 'g', g: G.B },
      { n: 'Queso crema', c: 500, u: 'g', g: G.R }, { n: 'Mantequilla', c: 250, u: 'g', g: G.R }, { n: 'Azúcar flor', c: 350, u: 'g', g: G.R }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.R },
      { n: 'Crema vegetal Puratos', c: 300, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'carrot-sa': { ref: 30, ing: [
      { n: 'Huevos', c: 5, u: 'un', g: G.B }, { n: 'Zanahoria', c: 250, u: 'g', g: G.B }, { n: 'Aceite', c: 200, u: 'ml', g: G.B }, { n: 'Alulosa', c: 200, u: 'g', g: G.B },
      { n: 'Harina', c: 400, u: 'g', g: G.B }, { n: 'Nueces', c: 50, u: 'g', g: G.B }, { n: 'Canela', c: 3, u: 'g', g: G.B }, { n: 'Bicarbonato', c: 2, u: 'g', g: G.B }, { n: 'Polvo de hornear', c: 3, u: 'g', g: G.B },
      { n: 'Queso crema', c: 500, u: 'g', g: G.R }, { n: 'Mantequilla', c: 250, u: 'g', g: G.R }, { n: 'Alulosa', c: 170, u: 'g', g: G.R }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.R }, { n: 'Esencia de naranja', c: 3, u: 'ml', g: G.R },
      { n: 'Crema vegetal Puratos', c: 300, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Hojarasca ----
    'hojarasca': { ref: 25, ing: [
      { n: 'Yemas', c: 6, u: 'un', g: G.M }, { n: 'Margarina', c: 125, u: 'g', g: G.M }, { n: 'Leche', c: 125, u: 'ml', g: G.M }, { n: 'Harina', c: 400, u: 'g', g: G.M },
      { n: 'Manjar Nestlé', c: 1000, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Sticker', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'hojarasca-sa': { ref: 25, ing: [
      { n: 'Yemas', c: 6, u: 'un', g: G.M }, { n: 'Margarina', c: 125, u: 'g', g: G.M }, { n: 'Leche', c: 125, u: 'ml', g: G.M }, { n: 'Harina', c: 400, u: 'g', g: G.M },
      { n: 'Manjar sin azúcar', c: 1000, u: 'g', g: G.R },
      { n: 'Crema vegetal Puratos', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Sticker', c: 1, u: 'un', g: G.E, f: 1 } ] },

    // ---- Panqueques ----
    'panqueque-naranja': { ref: 25, ing: [
      { n: 'Huevos', c: 6, u: 'un', g: G.M }, { n: 'Harina', c: 350, u: 'g', g: G.M }, { n: 'Mantequilla', c: 350, u: 'g', g: G.M }, { n: 'Azúcar', c: 350, u: 'g', g: G.M }, { n: 'Naranja', c: 1, u: 'un', g: G.M },
      { n: 'Jugo de naranja', c: 2500, u: 'ml', g: G.R }, { n: 'Maicena', c: 200, u: 'g', g: G.R }, { n: 'Azúcar', c: 400, u: 'g', g: G.R }, { n: 'Yemas', c: 4, u: 'un', g: G.R }, { n: 'Mantequilla', c: 75, u: 'g', g: G.R } ] },
    'panqueque-choco-naranja': { ref: 25, ing: [
      { n: 'Huevos', c: 6, u: 'un', g: G.M }, { n: 'Harina', c: 299, u: 'g', g: G.M }, { n: 'Cacao amargo', c: 53, u: 'g', g: G.M }, { n: 'Mantequilla', c: 350, u: 'g', g: G.M }, { n: 'Azúcar', c: 350, u: 'g', g: G.M }, { n: 'Naranja', c: 1, u: 'un', g: G.M },
      { n: 'Jugo de naranja', c: 1000, u: 'ml', g: G.R }, { n: 'Maicena', c: 80, u: 'g', g: G.R }, { n: 'Yemas', c: 2, u: 'un', g: G.R }, { n: 'Azúcar', c: 160, u: 'g', g: G.R }, { n: 'Mantequilla', c: 30, u: 'g', g: G.R },
      { n: 'Cobertura de chocolate', c: 300, u: 'g', g: G.D }, { n: 'Crema de leche', c: 300, u: 'ml', g: G.D } ] },

    // ---- Pies / tartas ----
    'pie-limon': { ref: 15, ing: [
      { n: 'Harina', c: 300, u: 'g', g: G.M }, { n: 'Mantequilla', c: 150, u: 'g', g: G.M }, { n: 'Azúcar flor', c: 100, u: 'g', g: G.M }, { n: 'Yemas', c: 2, u: 'un', g: G.M }, { n: 'Esencia de vainilla', c: 5, u: 'ml', g: G.M },
      { n: 'Leche condensada', c: 770, u: 'g', g: G.R }, { n: 'Jugo de limón', c: 200, u: 'ml', g: G.R },
      { n: 'Claras', c: 4, u: 'un', g: G.D }, { n: 'Azúcar', c: 200, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'kuchen': { ref: 15, ing: [
      { n: 'Harina', c: 250, u: 'g', g: G.M }, { n: 'Mantequilla', c: 125, u: 'g', g: G.M }, { n: 'Azúcar', c: 80, u: 'g', g: G.M }, { n: 'Huevos', c: 1, u: 'un', g: G.M }, { n: 'Polvo de hornear', c: 5, u: 'g', g: G.M },
      { n: 'Frambuesas', c: 400, u: 'g', g: G.R }, { n: 'Azúcar', c: 180, u: 'g', g: G.R }, { n: 'Maicena', c: 30, u: 'g', g: G.R }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.R }, { n: 'Huevos', c: 2, u: 'un', g: G.R }, { n: 'Esencia de vainilla', c: 15, u: 'ml', g: G.R },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 }, { n: 'Caja de cartón', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'tartaleta': { ref: 1, ing: [
      { n: 'Harina', c: 30, u: 'g', g: G.M }, { n: 'Margarina', c: 15, u: 'g', g: G.M }, { n: 'Azúcar flor', c: 12, u: 'g', g: G.M },
      { n: 'Crema pastelera', c: 30, u: 'g', g: G.R }, { n: 'Durazno en conserva', c: 15, u: 'g', g: G.R } ] },

    // ---- Antojitos ----
    'profiteroles': { ref: 30, ing: [
      { n: 'Agua', c: 250, u: 'ml', g: G.M }, { n: 'Margarina', c: 100, u: 'g', g: G.M }, { n: 'Mantequilla', c: 20, u: 'g', g: G.M }, { n: 'Harina', c: 150, u: 'g', g: G.M }, { n: 'Huevos', c: 3, u: 'un', g: G.M },
      { n: 'Crema chantillí', c: 120, u: 'g', g: G.R }, { n: 'Cobertura de chocolate', c: 200, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'cinnamon-frosting': { ref: 10, ing: [
      { n: 'Harina', c: 300, u: 'g', g: G.M }, { n: 'Azúcar', c: 40, u: 'g', g: G.M }, { n: 'Huevos', c: 1, u: 'un', g: G.M }, { n: 'Leche', c: 200, u: 'ml', g: G.M }, { n: 'Margarina', c: 40, u: 'g', g: G.M }, { n: 'Levadura', c: 7, u: 'g', g: G.M },
      { n: 'Margarina', c: 60, u: 'g', g: G.R }, { n: 'Azúcar rubia', c: 80, u: 'g', g: G.R }, { n: 'Canela', c: 15, u: 'g', g: G.R },
      { n: 'Queso crema', c: 100, u: 'g', g: G.D }, { n: 'Mantequilla', c: 40, u: 'g', g: G.D }, { n: 'Azúcar flor', c: 120, u: 'g', g: G.D },
      { n: 'Papel kraft', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'cinnamon-glaseado': { ref: 10, ing: [
      { n: 'Harina', c: 300, u: 'g', g: G.M }, { n: 'Azúcar', c: 40, u: 'g', g: G.M }, { n: 'Huevos', c: 1, u: 'un', g: G.M }, { n: 'Leche', c: 200, u: 'ml', g: G.M }, { n: 'Margarina', c: 40, u: 'g', g: G.M }, { n: 'Levadura', c: 7, u: 'g', g: G.M },
      { n: 'Margarina', c: 60, u: 'g', g: G.R }, { n: 'Azúcar rubia', c: 80, u: 'g', g: G.R }, { n: 'Canela', c: 15, u: 'g', g: G.R },
      { n: 'Azúcar flor', c: 120, u: 'g', g: G.D },
      { n: 'Papel kraft', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'galletas-oreo': { ref: 26, ing: [
      { n: 'Harina', c: 720, u: 'g', g: G.M }, { n: 'Azúcar', c: 140, u: 'g', g: G.M }, { n: 'Azúcar rubia', c: 260, u: 'g', g: G.M }, { n: 'Galletas Oreo', c: 2, u: 'paq', g: G.M },
      { n: 'Sticker', c: 13, u: 'un', g: G.E, f: 1 } ] },
    'berlines': { ref: 30, ing: [
      { n: 'Harina', c: 1050, u: 'g', g: G.M }, { n: 'Leche', c: 550, u: 'ml', g: G.M }, { n: 'Azúcar', c: 200, u: 'g', g: G.M }, { n: 'Levadura', c: 18, u: 'g', g: G.M },
      { n: 'Huevos', c: 2, u: 'un', g: G.M }, { n: 'Yemas', c: 2, u: 'un', g: G.M }, { n: 'Mantequilla', c: 100, u: 'g', g: G.M } ] },
    'alfajor-choco': { ref: 12, ing: [
      { n: 'Harina', c: 200, u: 'g', g: G.M }, { n: 'Cacao amargo', c: 30, u: 'g', g: G.M }, { n: 'Margarina', c: 100, u: 'g', g: G.M }, { n: 'Azúcar flor', c: 100, u: 'g', g: G.M }, { n: 'Yemas', c: 2, u: 'un', g: G.M },
      { n: 'Manjar Nestlé', c: 240, u: 'g', g: G.R }, { n: 'Cobertura de chocolate', c: 200, u: 'g', g: G.D },
      { n: 'Caja alfajores', c: 2, u: 'un', g: G.E, f: 1 } ] },
    'alfajor-comercial': { ref: 50, ing: [
      { n: 'Galletas comerciales', c: 100, u: 'un', g: G.M }, { n: 'Manjar Nestlé', c: 1000, u: 'g', g: G.R }, { n: 'Cobertura de chocolate', c: 1000, u: 'g', g: G.D },
      { n: 'Caja alfajores', c: 9, u: 'un', g: G.E, f: 1 } ] },
    'alfajor-oreo': { ref: 50, ing: [
      { n: 'Galletas comerciales', c: 100, u: 'un', g: G.M }, { n: 'Manjar Nestlé', c: 500, u: 'g', g: G.R }, { n: 'Cobertura de chocolate', c: 1000, u: 'g', g: G.D }, { n: 'Galletas Oreo', c: 4, u: 'paq', g: G.R },
      { n: 'Caja alfajores', c: 9, u: 'un', g: G.E, f: 1 } ] },

    // ---- Cheesecakes (base común, distinto sabor) ----
    'cheesecake-frambuesa': { ref: 16, ing: [
      { n: 'Yogur griego', c: 240, u: 'g', g: G.B }, { n: 'Queso crema', c: 226, u: 'g', g: G.B }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.B }, { n: 'Gelatina sin sabor', c: 15, u: 'g', g: G.B },
      { n: 'Galletas de mantequilla', c: 280, u: 'g', g: G.B }, { n: 'Mantequilla', c: 100, u: 'g', g: G.B }, { n: 'Leche condensada', c: 385, u: 'g', g: G.B },
      { n: 'Frambuesas', c: 200, u: 'g', g: G.D }, { n: 'Azúcar', c: 80, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'cheesecake-maracuya': { ref: 16, ing: [
      { n: 'Yogur griego', c: 240, u: 'g', g: G.B }, { n: 'Queso crema', c: 226, u: 'g', g: G.B }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.B }, { n: 'Gelatina sin sabor', c: 15, u: 'g', g: G.B },
      { n: 'Galletas de mantequilla', c: 280, u: 'g', g: G.B }, { n: 'Mantequilla', c: 100, u: 'g', g: G.B }, { n: 'Leche condensada', c: 385, u: 'g', g: G.B },
      { n: 'Mermelada de maracuyá', c: 250, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] },
    'cheesecake-frutosrojos': { ref: 16, ing: [
      { n: 'Yogur griego', c: 240, u: 'g', g: G.B }, { n: 'Queso crema', c: 226, u: 'g', g: G.B }, { n: 'Crema de leche', c: 200, u: 'ml', g: G.B }, { n: 'Gelatina sin sabor', c: 15, u: 'g', g: G.B },
      { n: 'Galletas de mantequilla', c: 280, u: 'g', g: G.B }, { n: 'Mantequilla', c: 100, u: 'g', g: G.B }, { n: 'Leche condensada', c: 385, u: 'g', g: G.B },
      { n: 'Mix frutos rojos', c: 200, u: 'g', g: G.D }, { n: 'Azúcar', c: 80, u: 'g', g: G.D },
      { n: 'Bandeja', c: 1, u: 'un', g: G.E, f: 1 } ] }
  };

  // Nombre del producto/sabor (como se guarda en el pedido) -> id de receta.
  window.NOMBRE_A_RECETA = {
    'Torta Caluga': 'caluga',
    'Torta Selva Negra': 'selva-negra',
    'Selva Negra económica': 'selva-negra-eco',
    'Torta Red Velvet': 'red-velvet',
    'Carrot Cake': 'carrot', 'Carrot Cake mini': 'carrot',
    'Carrot Cake sin azúcar': 'carrot-sa', 'Carrot Cake mini s/azúcar': 'carrot-sa',
    'Frambuesa sin azúcar': 'frambuesa-sa',
    'Torta Mami Gina': 'mami-gina',
    'Azul Manjar y Durazno': 'azul-manjar-durazno',
    'Manjar Durazno': 'manjar-durazno',
    'Torta Matilda': 'matilda', 'Torta Matilda XL': 'matilda-xl',
    'Hojarasca Manjar': 'hojarasca',
    'Hojarasca sin azúcar': 'hojarasca-sa', 'Hojarasca mini sin azúcar': 'hojarasca-sa',
    'Panqueque Naranja': 'panqueque-naranja',
    'Panqueque Choco-Naranja': 'panqueque-choco-naranja',
    'Torta Harry Potter': 'harry-potter',
    'Torta Roblox': 'roblox',
    'Torta Bárbara sin lactosa': 'barbara', 'Torta Bárbara': 'barbara',
    'Manjar-Crema Pastelera s/azúcar': 'manjar-crema-sa', 'Manjar-Crema Pastelera sin azúcar': 'manjar-crema-sa', 'Manjar-Crema mini s/azúcar': 'manjar-crema-sa',
    'Cheesecake Frambuesa': 'cheesecake-frambuesa',
    'Cheesecake Maracuyá': 'cheesecake-maracuya',
    'Cheesecake Frutos Rojos': 'cheesecake-frutosrojos',
    'Pie de Limón': 'pie-limon',
    'Kuchen Frambuesas': 'kuchen',
    'Mini Tartaleta Durazno-Piña': 'tartaleta',
    'Profiteroles cocktail': 'profiteroles',
    'Cinnamon Rolls con frosting': 'cinnamon-frosting',
    'Cinnamon Rolls con glaseado': 'cinnamon-glaseado',
    'Galletas Oreo': 'galletas-oreo',
    'Berlines': 'berlines',
    'Alfajores chocolate': 'alfajor-choco',
    'Alfajores galleta': 'alfajor-comercial',
    'Alfajores relleno Oreo': 'alfajor-oreo'
  };
})();
