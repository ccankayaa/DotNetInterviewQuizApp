import Link from 'next/link';
export default function NotFound() { return <div className="empty-state"><div className="empty-symbol">404</div><h1 style={{ fontSize: 30 }}>Content not found / İçerik bulunamadı</h1><p>The page may have moved. / Sayfa taşınmış olabilir.</p><Link href="/tr" className="btn btn-primary">Ana sayfa / Home</Link></div>; }
