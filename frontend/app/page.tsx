import Link from 'next/link';
import { Mic2, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
      <h1>SpeakerAgent.ai</h1>
      <p>Select a module to view:</p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        <Link href="/processing" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textDecoration: 'none', color: 'black' }}>
          <Mic2 style={{ marginBottom: '10px' }} />
          <div style={{ fontWeight: 'bold' }}>Speaker Processing</div>
        </Link>
        <Link href="/admin" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textDecoration: 'none', color: 'black' }}>
          <LayoutDashboard style={{ marginBottom: '10px' }} />
          <div style={{ fontWeight: 'bold' }}>Admin Success Center</div>
        </Link>
      </div>
    </div>
  );
}