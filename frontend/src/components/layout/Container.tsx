import type { ReactNode } from 'react';

export function Container({ children }: { children: ReactNode }) {
  return <div className="page-shell">{children}</div>;
}
