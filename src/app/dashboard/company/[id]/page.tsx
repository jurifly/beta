
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page is obsolete. Founders now see their active company dashboard on the main /dashboard route.
// CAs view client details under /dashboard/clients/[id].
// This redirect ensures any old bookmarks or links don't lead to a broken page.
export default function RedirectPage() {
  useEffect(() => {
    redirect('/dashboard');
  }, []);
  return null;
}
