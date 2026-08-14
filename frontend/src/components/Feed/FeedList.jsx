import React, { useEffect, useRef, useCallback } from 'react';
import FeedCard from './FeedCard';

const FeedList = ({ data, fetchNextPage, hasNextPage, isFetchingNextPage }) => {
  const observerTarget = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option = { threshold: 0.1 };

    const observer = new IntersectionObserver(handleObserver, option);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const allBusinesses = data?.pages?.flatMap(page => page.data || []) || [];

  if (allBusinesses.length === 0 && !isFetchingNextPage) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ margin: 0, fontSize: 14 }}>Henüz gösterilecek işletme bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="feed-list-container">
      {allBusinesses.map((business) => (
        <FeedCard key={business.id} business={business} />
      ))}

      <div ref={observerTarget} style={{ padding: 16, textAlign: 'center' }}>
        {isFetchingNextPage ? (
          <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        ) : !hasNextPage && allBusinesses.length > 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Tüm sonuçlar yüklendi.</p>
        ) : null}
      </div>
    </div>
  );
};

export default FeedList;
