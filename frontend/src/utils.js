export const uid = () => Math.random().toString(36).slice(2,10);

export const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
};

export const daysLeft = iso => {
  if (!iso) return null;
  return Math.ceil((new Date(iso+'T12:00:00') - Date.now()) / 86400000);
};

export const deadlineMeta = (iso, done) => {
  if (!iso) return {text:'No deadline', color:'#475569'};
  const d = daysLeft(iso);
  if (done)  return {text: fmtDate(iso),             color:'#475569'};
  if (d < 0) return {text:`${Math.abs(d)}d overdue`, color:'#F43F5E'};
  if (d===0) return {text:'Due today',               color:'#F59E0B'};
  if (d<=3)  return {text:`${d}d left`,              color:'#F59E0B'};
  return {text: fmtDate(iso), color:'#94A3B8'};
};

export const calcProgress = tasks => {
  if (!tasks?.length) return 0;
  return Math.round(tasks.filter(t=>t.status==='done').length / tasks.length * 100);
};
