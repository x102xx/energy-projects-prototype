import content from '../content/site-content.json';
export default function EnergyIllustration({ compact = false }: { compact?: boolean }) {
  return <svg className={`energy-art ${compact ? 'compact-art' : ''}`} viewBox="0 0 620 500" role="img" aria-label={content.ui.projectNote}>
    <defs>
      <pattern id={compact ? 'small-grid' : 'grid'} width="44" height="26" patternUnits="userSpaceOnUse" patternTransform="matrix(1 .5 -1 .5 310 -55)"><path d="M44 0H0V26" fill="none" stroke="#7faaa3" strokeWidth=".5" opacity=".3"/></pattern>
      <linearGradient id={compact ? 'small-top' : 'top'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#bad0c8"/><stop offset="1" stopColor="#70948b"/></linearGradient>
    </defs>
    <rect width="620" height="500" fill={`url(#${compact ? 'small-grid' : 'grid'})`}/>
    <g fill="none" stroke="#7da39a" opacity=".5" strokeWidth="1"><path d="M28 296l284 143 280-143M28 313l284 142 280-142M312 439v25M28 296v17M592 296v17"/></g>
    <path d="M64 285L310 161l246 123-246 124z" fill="#26473f" stroke="#64897d"/>
    <path d="M64 285v12l246 124v-13z" fill="#29433f"/><path d="M310 408l246-124v13L310 421z" fill="#122f2b"/>
    <g fill="none" stroke="#9bb6ab" strokeWidth="1.3" opacity=".7"><path d="M78 278l38-19m396 34 26-13M94 316l18-9m390 24 19-9M155 347l26-13m257 29 20-10"/></g>
    {[0, 1, 2].map(i => <g key={i} transform={`translate(${i * 77} ${i * -39})`}>
      <path d="M135 250l144-72 68 34-144 72z" fill={`url(#${compact ? 'small-top' : 'top'})`} stroke="#c0d0c6" strokeWidth="1"/>
      <path d="M135 250v63l68 35v-64z" fill="#78988d" stroke="#aac0b5"/>
      <path d="M203 284l144-72v63l-144 73z" fill="#416b5f" stroke="#87a797"/>
      {Array.from({ length: 12 }, (_, j) => <path key={j} d={`M${214 + j * 10.5} ${285 - j * 5.2}v47`} stroke="#193f34" strokeWidth="2"/>)}
      <path d="M147 266v33l42 21v-33z" fill="#a1b6a6" stroke="#36594c"/>
      <path d="M154 278l26 13m-26-6 26 13m-26-6 26 13" stroke="#547869" strokeWidth="2"/>
      <path d="M169 244l97-49 25 13-97 49z" fill="#5c8072"/>
      <path d="M174 241l89-44m-78 49 89-44" stroke="#a9beb1"/>
      <path d="M314 224v-73l9-4 9 4v65" fill="#bdd1c3" stroke="#deeadf" strokeWidth="1"/>
      <path d="M314 151l9 5 9-5m-9 5v64" fill="none" stroke="#668d7a"/>
      <ellipse cx="323" cy="150" rx="8" ry="3.5" fill="#2d5142"/>
      <path d="M238 238v-27l8-4 8 4v19" fill="#b3c8bb" stroke="#deeadf"/>
      <path d="M231 306l32-16v8l-32 16z" fill="#b5cf9d"/>
    </g>)}
    <g fill="none" stroke="#a3c4ac" strokeWidth="2"><path d="M379 329l64-32v-48l30-15M381 339l74-37v-48l19-10"/><path d="M443 249l12 5m-12 14 12 5"/></g>
    <g stroke="#97ba9a" strokeWidth="1.5"><path d="M472 233l28-14 26 13-28 14z" fill="#8ea994"/><path d="M472 233v29l26 13v-29z" fill="#74917a"/><path d="M498 246l28-14v29l-28 14z" fill="#3a654c"/></g>
    <g fill="none" stroke="#b3cc9c" opacity=".75"><path d="M164 359l-40 21H58M455 168l52-26h68"/><circle cx="164" cy="359" r="3" fill="#b3cc9c"/><circle cx="455" cy="168" r="3" fill="#b3cc9c"/></g>
    <g fill="#b9d0bc" fontFamily="Segoe UI, sans-serif" fontSize="10" letterSpacing="2"><text x="35" y="401">ENERGY / INFRASTRUCTURE</text><text x="476" y="129">CONCEPT 01</text></g>
  </svg>;
}
