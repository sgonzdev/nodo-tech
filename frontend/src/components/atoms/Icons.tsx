type P = React.SVGProps<SVGSVGElement>;

const base = { viewBox: '0 0 24 24', fill: 'none' };

export const Icons = {
  logo: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M5 18V6l7 6 7-6v12"
        stroke="#052017"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="#052017" />
    </svg>
  ),
  download: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  exit: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  refresh: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M20 11a8 8 0 10-1.5 5.5M20 4v6h-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chev: (p: P) => (
    <svg {...base} width="14" height="14" {...p}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chevR: (p: P) => (
    <svg {...base} width="15" height="15" {...p}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M5 12l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  close: (p: P) => (
    <svg {...base} width="16" height="16" {...p}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  search: (p: P) => (
    <svg {...base} width="17" height="17" {...p}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
  money: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M12 3v18M8 7h6a2.5 2.5 0 010 5H9a2.5 2.5 0 000 5h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  invest: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M4 19h16M6 16l4-5 3 3 5-7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  target: (p: P) => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  pixel: (p: P) => (
    <svg {...base} {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  cart: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M3 4h2l2.2 11.2a1.5 1.5 0 001.5 1.2h7.8a1.5 1.5 0 001.5-1.2L21 8H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.3" fill="currentColor" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" />
    </svg>
  ),
  ticket: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M4 8a2 2 0 012-2h12a2 2 0 012 2 2 2 0 000 4 2 2 0 000 4 2 2 0 01-2 2H6a2 2 0 01-2-2 2 2 0 000-4 2 2 0 000-4z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  bolt: (p: P) => (
    <svg {...base} {...p}>
      <path
        d="M13 3L4 14h6l-1 7 9-11h-6l1-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  owner: (p: P) => (
    <svg {...base} width="12" height="12" {...p}>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20c0-3.3 3.1-5 7-5s7 1.7 7 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  cal: (p: P) => (
    <svg {...base} width="12" height="12" {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.5 9h17M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  dots: (p: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...p}>
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  ),
};
