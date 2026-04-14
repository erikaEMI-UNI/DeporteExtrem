// Componentes de iconos reutilizables
const createIcon = (path) => ({ className = "", size = 24 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const ICON_PATHS = {
  X: [<path key="x1" d="M18 6L6 18" />, <path key="x2" d="M6 6L18 18" />],
  MapPin: [<path key="pin" d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />, <circle key="circle" cx="12" cy="10" r="3" />],
  Mountain: [<path key="mountain" d="M8 3l4 8 5-5 5 15H2L8 3z" />],
  Zap: [<polygon key="zap" points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />],
  Trophy: [
    <path key="t1" d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />,
    <path key="t2" d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />,
    <path key="t3" d="M4 22h16" />,
    <path key="t4" d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />,
    <path key="t5" d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />,
    <path key="t6" d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  ],
  Clock: [<circle key="circle" cx="12" cy="12" r="10" />, <polyline key="poly" points="12 6 12 12 16 14" />],
  Users: [
    <path key="u1" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />,
    <circle key="u2" cx="9" cy="7" r="4" />,
    <path key="u3" d="M22 21v-2a4 4 0 0 0-3-3.87" />,
    <path key="u4" d="M16 3.13a4 4 0 0 1 0 7.75" />
  ],
  ChevronLeft: [<polyline key="left" points="15 18 9 12 15 6" />],
  ChevronRight: [<polyline key="right" points="9 18 15 12 9 6" />],
  Video: [
    <polygon key="v1" points="23 7 16 12 23 17 23 7" />,
    <rect key="v2" x="1" y="5" width="15" height="14" rx="2" ry="2" />
  ],
  Package: [
    <line key="p1" x1="16.5" x2="7.5" y1="9.4" y2="4.21" />,
    <path key="p2" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
    <polyline key="p3" points="3.29 7 12 12 20.71 7" />,
    <line key="p4" x1="12" x2="12" y1="22" y2="12" />
  ],
  Calendar: [
    <rect key="c1" x="3" y="4" width="18" height="18" rx="2" ry="2" />,
    <line key="c2" x1="16" y1="2" x2="16" y2="6" />,
    <line key="c3" x1="8" y1="2" x2="8" y2="6" />,
    <line key="c4" x1="3" y1="10" x2="21" y2="10" />
  ],
  User: [
    <path key="user1" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
    <circle key="user2" cx="12" cy="7" r="4" />
  ],
  DollarSign: [
    <line key="d1" x1="12" y1="1" x2="12" y2="23" />,
    <path key="d2" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  ]
};

export const X = createIcon(ICON_PATHS.X);
export const MapPin = createIcon(ICON_PATHS.MapPin);
export const Mountain = createIcon(ICON_PATHS.Mountain);
export const Zap = createIcon(ICON_PATHS.Zap);
export const Trophy = createIcon(ICON_PATHS.Trophy);
export const Clock = createIcon(ICON_PATHS.Clock);
export const Users = createIcon(ICON_PATHS.Users);
export const ChevronLeft = createIcon(ICON_PATHS.ChevronLeft);
export const ChevronRight = createIcon(ICON_PATHS.ChevronRight);
export const Video = createIcon(ICON_PATHS.Video);
export const Package = createIcon(ICON_PATHS.Package);
export const Calendar = createIcon(ICON_PATHS.Calendar);
export const User = createIcon(ICON_PATHS.User);
export const DollarSign = createIcon(ICON_PATHS.DollarSign);