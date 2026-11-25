/** Zones on the Shop Directory 3D map, traced from the CAD site plan
 * (public/images/bon-floor-plan.webp, "แปลน 1:250", north arrow points down).
 *
 * Coordinates are plan units = pixels of that image ÷ 2 (the plan is 1510 × 1910 units),
 * with the plan's own orientation: ถนนเทศบาลสงเคราะห์ runs along the bottom.
 * `code` is the value stored in shops.zone; `points` is the tap area on the ground;
 * `pin` is where the label stands. Names are the ones written on the plan.
 * อาคาร D has no label on the plan: it is the angled building to the right of อาคาร N.
 */
export const FLOOR_ZONES = [
  { code: 'MK', short: 'ตลาด', label: 'ตลาด', en: 'Market', zh: '市场', color: '#23968a', pin: [300, 1640],
    points: [[100,1505],[400,1505],[700,1455],[720,1600],[722,1712],[430,1774],[160,1774],[100,1715]] },
  { code: 'FC', short: 'FC', label: 'FOOD COURT', en: 'Food Court', zh: '美食广场', color: '#ef7d32', pin: [835, 1500],
    points: [[690,1362],[905,1332],[950,1470],[990,1590],[998,1680],[930,1705],[760,1712],[735,1640],[715,1560],[700,1460]] },
  { code: 'A', short: 'A', label: 'อาคาร A', en: 'Building A', zh: 'A 栋', color: '#3a7fc2', pin: [180, 1250],
    points: [[88,1020],[222,1020],[222,1270],[272,1270],[272,1500],[88,1500]] },
  { code: 'BC', short: 'B,C', label: 'อาคาร B,C', en: 'Building B,C', zh: 'B,C 栋', color: '#7467cc', pin: [455, 706],
    points: [[300,512],[470,512],[585,612],[645,700],[680,800],[680,955],[300,955]] },
  { code: 'D', short: 'D', label: 'อาคาร D', en: 'Building D', zh: 'D 栋', color: '#bd8442', pin: [392, 378],
    points: [[278,305],[318,273],[462,418],[412,468],[372,468],[358,440],[358,400],[338,368]] },
  { code: 'E', short: 'E', label: 'อาคาร E', en: 'Building E', zh: 'E 栋', color: '#d6507a', pin: [880, 1140],
    points: [[708,990],[760,945],[785,928],[870,1045],[940,1150],[975,1215],[1002,1282],[950,1315],[905,1320],[850,1290],[818,1278],[765,1292],[728,1205],[725,1080],[712,1040]] },
  { code: 'F', short: 'F', label: 'อาคาร F', en: 'Building F', zh: 'F 栋', color: '#4f9d52', pin: [760, 615],
    points: [[603,532],[728,437],[915,697],[792,792]] },
  { code: 'G', short: 'G', label: 'อาคาร G', en: 'Building G', zh: 'G 栋', color: '#d9a52c', pin: [1065, 1470],
    points: [[965,1432],[1068,1392],[1125,1418],[1160,1490],[1182,1565],[1150,1588],[1040,1590],[1000,1505],[985,1470]] },
  { code: 'H', short: 'H', label: 'อาคาร H', en: 'Building H', zh: 'H 栋', color: '#3aa7c2', pin: [1325, 1800],
    points: [[1270,1752],[1292,1748],[1300,1718],[1320,1728],[1388,1828],[1388,1856],[1288,1856],[1270,1838]] },
  { code: 'J', short: 'J', label: 'อาคาร J', en: 'Building J', zh: 'J 栋', color: '#8b6446', pin: [385, 1325],
    points: [[290,1288],[342,1270],[400,1268],[430,1298],[440,1322],[425,1338],[420,1382],[400,1394],[290,1400]] },
  { code: 'K', short: 'K', label: 'อาคาร K', en: 'Building K', zh: 'K 栋', color: '#5f86b0', pin: [1278, 1205],
    points: [[1187,1233],[1342,1140],[1368,1195],[1360,1207],[1212,1274],[1198,1268]] },
  { code: 'M', short: 'M', label: 'อาคาร M', en: 'Building M', zh: 'M 栋', color: '#a856ad', pin: [1318, 1590],
    points: [[1270,1520],[1290,1502],[1310,1502],[1385,1622],[1300,1698],[1275,1680],[1270,1660]] },
  { code: 'N', short: 'N', label: 'อาคาร N', en: 'Building N', zh: 'N 栋', color: '#567a63', pin: [150, 286],
    points: [[75,256],[225,256],[225,317],[75,317]] },
]

export const ZONE_COLORS = Object.fromEntries(FLOOR_ZONES.map(z => [z.code, z.color]))

/** Names on the plan that are not shop zones: shown as signs, not tappable. */
export const LANDMARKS = [
  { id: 'tops', th: 'Tops Daily', en: 'Tops Daily', zh: 'Tops Daily', at: [178, 735], z: 20, kind: 'brand' },
  { id: 'kfc', th: 'KFC', en: 'KFC', zh: 'KFC', at: [1102, 1655], z: 11, kind: 'brand' },
  { id: 'starbucks', th: 'STARBUCKS', en: 'STARBUCKS', zh: 'STARBUCKS', at: [392, 1350], z: 12, kind: 'brand', minZoom: 1.6 },
  { id: 'pond', th: 'สระน้ำ', en: 'Pond', zh: '水池', at: [500, 1190], z: 0, kind: 'water' },
  { id: 'dorm', th: 'อาคารหอพัก', en: 'Dormitory', zh: '宿舍楼', at: [48, 132], z: 18, kind: 'place' },
  { id: 'guard', th: 'อาคาร รปภ.', en: 'Security', zh: '保安楼', at: [38, 1780], z: 10, kind: 'place' },
  { id: 'park-n', th: 'ลานจอดรถ', en: 'Parking', zh: '停车场', at: [160, 426], z: 0, kind: 'parking' },
  { id: 'park-k', th: 'ลานจอดรถ', en: 'Parking', zh: '停车场', at: [1345, 1360], z: 0, kind: 'parking' },
  { id: 'park-w', th: 'ที่จอดรถ', en: 'Parking', zh: '停车位', at: [24, 1130], z: 0, kind: 'parking', minZoom: 1.6 },
  { id: 'road', th: 'ถนนเทศบาลสงเคราะห์', en: 'Thetsaban Songkhro Rd.', zh: 'Thetsaban Songkhro 路', at: [420, 1890], z: 0, kind: 'road' },
  { id: 'to-canal', th: 'ไปคลองประปา →', en: 'To Khlong Prapa →', zh: '往 Khlong Prapa →', at: [1290, 1890], z: 0, kind: 'road' },
  { id: 'gate-in', th: 'ทางเข้า-ออก', en: 'Entrance / exit', zh: '出入口', at: [760, 1838], z: 0, kind: 'gate', minZoom: 1.3 },
  { id: 'gate-out', th: 'ทางออก', en: 'Exit', zh: '出口', at: [130, 1838], z: 0, kind: 'gate', minZoom: 1.3 },
  { id: 'gate-east', th: 'ทางเข้า-ออก', en: 'Entrance / exit', zh: '出入口', at: [1232, 1846], z: 0, kind: 'gate', minZoom: 1.3 },
]
