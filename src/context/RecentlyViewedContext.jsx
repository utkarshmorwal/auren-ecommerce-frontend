import { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext(null);
const MAX_ITEMS = 10;

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(items));
  }, [items]);

  const recordView = (product) => {
    setItems((prev) => {
      const withoutThis = prev.filter((p) => p.id !== product.id);
      return [product, ...withoutThis].slice(0, MAX_ITEMS);
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, recordView }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}