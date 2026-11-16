import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

const SQL = {
  settings: 'SELECT setting_key, setting_value FROM site_settings',
  menus:
    'SELECT id, parent_id, label, url, icon, description, has_dropdown FROM nav_menus WHERE is_active = 1 ORDER BY sort_order, id',
  highlights:
    'SELECT id, tag, title, subtitle, date_label, start_date, end_date, image_url, link FROM highlights WHERE is_active = 1 ORDER BY sort_order, id LIMIT 10',
  categories: 'SELECT id, name, icon, color, link FROM categories WHERE is_active = 1 ORDER BY sort_order, id',
  shops:
    'SELECT id, category_id, name, category_label, badge, is_new, image_url, link FROM shops WHERE is_active = 1 AND is_featured = 1 ORDER BY sort_order, id LIMIT 15',
  visitInfo: 'SELECT id, icon, title, detail FROM visit_info WHERE is_active = 1 ORDER BY sort_order, id',
  footerLinks: 'SELECT id, group_key, label, url FROM footer_links WHERE is_active = 1 ORDER BY group_key, sort_order, id',
}

// footer_links was added later – if the table doesn't exist yet, return [] so the
// rest of the home page still comes from the database (front end uses its defaults)
const optional = (sql) =>
  query(sql).catch((err) => {
    if (err.code === 'ER_NO_SUCH_TABLE') return []
    throw err
  })

// nav_menus rows → main menus, each with its dropdown items in `children`.
// Before update-2026-11-16-navmenu.sql is run the table has no parent_id column:
// return [] so the front end shows its built-in (new) menu instead of the old one.
const loadMenus = () =>
  query(SQL.menus).then(
    (rows) =>
      rows
        .filter((m) => !m.parent_id)
        .map((m) => ({ ...m, children: rows.filter((c) => c.parent_id === m.id) })),
    (err) => {
      if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') return []
      throw err
    },
  )

const toSettings = (rows) => Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]))

// Everything the home page needs in one request
router.get('/home', async (_req, res, next) => {
  try {
    const [settings, menus, highlights, categories, shops, visitInfo, footerLinks] = await Promise.all([
      query(SQL.settings),
      loadMenus(),
      query(SQL.highlights),
      query(SQL.categories),
      query(SQL.shops),
      query(SQL.visitInfo),
      optional(SQL.footerLinks),
    ])
    res.json({ settings: toSettings(settings), menus, highlights, categories, shops, visitInfo, footerLinks })
  } catch (err) {
    next(err)
  }
})

// Individual collections
router.get('/settings', async (_req, res, next) => {
  try {
    res.json(toSettings(await query(SQL.settings)))
  } catch (err) {
    next(err)
  }
})

router.get('/menus', async (_req, res, next) => {
  try {
    res.json(await loadMenus())
  } catch (err) {
    next(err)
  }
})

for (const key of ['highlights', 'categories', 'shops', 'visitInfo', 'footerLinks']) {
  const path = { visitInfo: '/visit-info', footerLinks: '/footer-links' }[key] || `/${key}`
  router.get(path, async (_req, res, next) => {
    try {
      res.json(await query(SQL[key]))
    } catch (err) {
      next(err)
    }
  })
}

// Shop Directory: every active shop + zones + categories.
// Before update-2026-11-16-shops.sql is run the new columns don't exist yet:
// return empty lists so the front end uses its built-in directory.
router.get('/directory', async (_req, res, next) => {
  try {
    const [shops, zones, categories] = await Promise.all([
      query(
        `SELECT id, category_id, name, category_label, badge, is_new, is_featured, image_url, link,
                zone, unit_no, open_hours, phone, description
           FROM shops WHERE is_active = 1 ORDER BY sort_order, id`,
      ),
      query('SELECT code, name FROM shop_zones ORDER BY sort_order, code'),
      query(SQL.categories),
    ])
    res.json({ shops, zones, categories })
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE') return res.json({ shops: [], zones: [], categories: [] })
    next(err)
  }
})

router.get('/shops/:id', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM shops WHERE id = ? AND is_active = 1', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Shop not found' })
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

export default router
