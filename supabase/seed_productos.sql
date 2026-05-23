-- ============================================================
-- Elena Bakery — Seed de productos (migración del catálogo actual)
-- Ejecutar DESPUÉS de schema.sql, en el SQL Editor.
-- Idempotente: usa el código del producto como clave única.
-- ============================================================

insert into public.productos
  (codigo, nombre, categoria, descripcion, precio, porciones, emoji, badge, destacado, orden)
values
  ('PROD-012', 'Torta Caluga', 'Tortas', 'Hojarasca crujiente con sedosa crema de caluga casera. Coronada con frambuesas frescas, toffee y nueces picadas.', 41055, 20, '🍰', 'Especial', true, 1),
  ('PROD-011', 'Torta Selva Negra', 'Tortas', 'Bizcocho de chocolate extra húmedo con almíbar, capas de chantillí y mermelada de frambuesas.', 14875, 10, '🍫', null, false, 2),
  ('PROD-025', 'Selva Negra económica', 'Tortas', 'Versión grande de nuestra Selva Negra clásica para compartir en familia.', 32130, 22, '🍫', null, false, 3),
  ('PROD-017', 'Torta Red Velvet', 'Tortas', 'Bizcocho aterciopelado carmín con toque de cacao. Frosting de queso crema y migas de bizcocho red velvet.', 39270, 20, '❤️', 'Top', true, 4),
  ('PROD-019', 'Carrot Cake', 'Tortas', 'Bizcocho especiado con zanahoria y nueces. Frosting de queso crema, ralladura de naranja y canela.', 55335, 30, '🥕', null, false, 5),
  ('PROD-034', 'Carrot Cake mini', 'Tortas', 'Versión mini (14 cm) de nuestro Carrot Cake. Perfecto para celebraciones íntimas.', 23324, 4, '🥕', null, false, 6),
  ('PROD-032', 'Carrot Cake sin azúcar', 'Tortas', 'Versión sin azúcar de nuestro Carrot Cake, manteniendo toda su humedad y sabor.', 64855, 30, '🥕', 'Sin azúcar', false, 7),
  ('PROD-001', 'Frambuesa sin azúcar', 'Tortas', 'Torta especial sin azúcar con frambuesas frescas. Ideal para quienes cuidan su alimentación.', 30345, 20, '🫐', 'Sin azúcar', false, 8),
  ('PROD-009', 'Torta Mami Gina', 'Tortas', 'Receta familiar clásica que conquista a todos. Sabor tradicional chileno.', 21420, 20, '🎂', null, false, 9),
  ('PROD-007', 'Azul Manjar y Durazno', 'Tortas', 'Bizcocho con manjar y durazno, decoración azul elegante para ocasiones especiales.', 26180, 20, '🍑', null, false, 10),
  ('PROD-008', 'Manjar Durazno', 'Tortas', 'Clásica combinación de manjar artesanal con duraznos en almíbar. Un imperdible chileno.', 26180, 20, '🍑', null, false, 11),
  ('PROD-018', 'Torta Matilda', 'Tortas', 'Receta familiar versátil. Disponible para 15 o 20 personas.', 21420, 20, '🎂', null, false, 12),
  ('PROD-010', 'Torta Matilda XL', 'Tortas', 'Versión grande de chocolate, perfecta para celebraciones con muchos invitados.', 60690, 40, '🍫', 'Para 40', false, 13),
  ('PROD-027', 'Hojarasca Manjar', 'Tortas', 'Capas de hojarasca crujiente con manjar artesanal. Clásico chileno por excelencia.', 29155, 25, '🥮', null, false, 14),
  ('PROD-030', 'Hojarasca sin azúcar', 'Tortas', 'Versión sin azúcar de nuestra hojarasca con manjar. Manteniendo el sabor tradicional.', 32725, 25, '🥮', 'Sin azúcar', false, 15),
  ('PROD-031', 'Hojarasca mini sin azúcar', 'Tortas', 'Versión mini (14 cm) sin azúcar. Para 4 personas.', 14161, 4, '🥮', 'Sin azúcar', false, 16),
  ('PROD-015', 'Panqueque Naranja', 'Tortas', 'Delgadas capas de panqueque con crema de naranja natural. Glaseado cítrico brillante.', 42840, 25, '🍊', null, false, 17),
  ('PROD-016', 'Panqueque Choco-Naranja', 'Tortas', 'Variante de panqueque con chocolate y naranja. Combinación irresistible.', 47005, 25, '🍫', null, false, 18),
  ('PROD-004', 'Torta Harry Potter', 'Tortas', 'Diseño temático Harry Potter. Personalizable para fans del mundo mágico.', 26180, 20, '⚡', 'Temática', false, 19),
  ('PROD-006', 'Torta Roblox', 'Tortas', 'Diseño temático Roblox. Perfecta para cumpleaños infantiles.', 20230, 20, '🎮', 'Temática', false, 20),
  ('PROD-005', 'Torta Bárbara sin lactosa', 'Tortas', 'Especialmente formulada sin lactosa, sin perder textura ni sabor.', 30345, 20, '🎂', 'Sin lactosa', false, 21),
  ('PROD-035', 'Manjar-Crema Pastelera s/azúcar', 'Tortas', 'Combinación de manjar y crema pastelera, sin azúcar añadida.', 21420, 20, '🍮', 'Sin azúcar', false, 22),
  ('PROD-036', 'Manjar-Crema mini s/azúcar', 'Tortas', 'Versión mini (14 cm) sin azúcar. Ideal para 4 personas.', 9877, 4, '🍮', 'Sin azúcar', false, 23),
  ('PROD-020', 'Cheesecake Frambuesa', 'Cheesecakes', 'Base de galleta de mantequilla con crema de queso aterciopelada. Coronado con salsa de frambuesa.', 32725, 16, '🍰', 'Favorito', true, 24),
  ('PROD-021', 'Cheesecake Maracuyá', 'Cheesecakes', 'Crema de queso densa y sedosa. Coronado con coulis de maracuyá natural con semillas.', 34510, 16, '🥭', null, false, 25),
  ('PROD-022', 'Cheesecake Frutos Rojos', 'Cheesecakes', 'Crema de queso aireada con arándanos, frambuesas y moras bañados en coulis del bosque.', 32130, 16, '🫐', null, false, 26),
  ('PROD-002', 'Pie de Limón', 'Pies y Tartas', 'Masa quebrada crocante con crema de limón equilibrada. Merengue suizo firme y tostado.', 28560, 15, '🍋', 'Clásico', true, 27),
  ('PROD-003', 'Kuchen Frambuesas', 'Pies y Tartas', 'Kuchen sureño tradicional con frambuesas frescas. Receta de la abuela.', 26775, 15, '🥧', null, false, 28),
  ('PROD-023', 'Mini Tartaleta Durazno-Piña', 'Pies y Tartas', 'Masa sablé con crema pastelera, durazno y piña. Tamaño individual de 8 cm.', 2023, 1, '🥧', null, false, 29),
  ('PROD-026', 'Profiteroles cocktail', 'Antojitos', 'Caja de 10 unidades. Masa choux con manjar, chantillí y chocolate semiamargo.', 4641, 10, '🍩', 'Caja x10', false, 30),
  ('PROD-028', 'Cinnamon Rolls con frosting', 'Antojitos', 'Par de cinnamon rolls esponjosos con frosting de queso crema.', 3094, 2, '🌀', 'Par', false, 31),
  ('PROD-029', 'Cinnamon Rolls con glaseado', 'Antojitos', 'Par de cinnamon rolls esponjosos con glaseado clásico de azúcar.', 1904, 2, '🌀', 'Par', false, 32),
  ('PROD-013', 'Galletas Oreo', 'Antojitos', 'Cartucho de 2 galletas especiales tipo Oreo. Perfectas para acompañar el café.', 3570, 2, '🍪', null, false, 33),
  ('PROD-014', 'Berlines', 'Antojitos', 'Suaves y esponjosos, rellenos de crema pastelera casera y manjar. Unidad.', 1190, 1, '🍩', null, false, 34),
  ('PROD-024', 'Alfajores chocolate', 'Antojitos', 'Caja de 6 alfajores con galleta suave, manjar artesanal y baño de chocolate.', 7497, 6, '🍪', 'Caja x6', false, 35),
  ('PROD-037', 'Alfajores galleta', 'Antojitos', 'Caja de 6 alfajores con galleta comercial premium y relleno tradicional.', 6902, 6, '🍪', 'Caja x6', false, 36),
  ('PROD-038', 'Alfajores relleno Oreo', 'Antojitos', 'Caja de 6 alfajores con galleta comercial y relleno sabor Oreo. Una delicia.', 7497, 6, '🍪', 'Caja x6', false, 37),
  ('PROD-033', 'Carrot Cake mini s/azúcar', 'Tortas', 'Versión mini (14 cm) sin azúcar. Para 4 personas.', 27132, 4, '🥕', 'Sin azúcar', false, 38)
on conflict (codigo) do update set
  nombre      = excluded.nombre,
  categoria   = excluded.categoria,
  descripcion = excluded.descripcion,
  precio      = excluded.precio,
  porciones   = excluded.porciones,
  emoji       = excluded.emoji,
  badge       = excluded.badge,
  destacado   = excluded.destacado,
  orden       = excluded.orden,
  updated_at  = now();
