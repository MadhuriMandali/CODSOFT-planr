export const T = {
  bg:'#080C14', surface:'#0E1420', surfaceHigh:'#141B2D',
  surfacePop:'#1A2236', border:'#1E2A40', borderBright:'#2E3D5C',
  blue:'#3B82F6', blueLight:'#93C5FD', violet:'#7C3AED',
  teal:'#14B8A6', amber:'#F59E0B', rose:'#F43F5E', green:'#22C55E',
  text:'#E2E8F0', textSub:'#94A3B8', textMuted:'#475569',
};

export const STATUS = {
  todo:      {label:'To Do',       color:'#475569', ring:'#334155'},
  inprogress:{label:'In Progress', color:'#3B82F6', ring:'#3B82F6'},
  review:    {label:'Review',      color:'#F59E0B', ring:'#F59E0B'},
  done:      {label:'Done',        color:'#22C55E', ring:'#22C55E'},
};

export const PRIORITY = {
  low:   {label:'Low',    color:'#475569'},
  medium:{label:'Medium', color:'#F59E0B'},
  high:  {label:'High',   color:'#F43F5E'},
};

export const PALETTES = [
  {bg:'#3B82F6'},{bg:'#7C3AED'},{bg:'#14B8A6'},
  {bg:'#F59E0B'},{bg:'#F43F5E'},{bg:'#22C55E'},
];

export const inputStyle = {
  background:T.bg, border:`1.5px solid #1E2A40`, borderRadius:8,
  padding:'9px 12px', color:'#E2E8F0', fontSize:13,
  outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit',
};
