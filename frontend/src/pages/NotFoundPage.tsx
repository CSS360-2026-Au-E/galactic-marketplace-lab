import { Link } from "react-router-dom";
export function NotFoundPage() { return <div className="wrap page empty"><span>🪐</span><h1>Wrong dimension</h1><p>This page either moved or was never approved by Gary.</p><Link to="/" className="button primary">Beam me home</Link></div>; }
