import { useState, useEffect } from 'react';
import loadingState from '../../api/loadingState';

export default function LoadingBar() {
  const [active, setActive] = useState(false);

  useEffect(() => loadingState.subscribe(setActive), []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] h-[3px] transition-opacity duration-300 ${
        active ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 animate-loading-bar" />
    </div>
  );
}
