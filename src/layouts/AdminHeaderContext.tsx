import { createContext, useContext, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export interface AdminHeaderContent {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const AdminHeaderContext = createContext<(content: AdminHeaderContent | null) => void>(() => {});

export function useAdminHeader(content: AdminHeaderContent) {
  const setHeader = useContext(AdminHeaderContext);
  const contentRef = useRef(content);
  contentRef.current = content;

  useEffect(() => {
    setHeader(contentRef.current);
    return () => setHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
