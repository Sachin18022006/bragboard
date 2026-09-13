import React from 'react';
import './Skeleton.css';

export const PostSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-avatar skeleton-shimmer" />
      <div className="skeleton-header-text">
        <div className="skeleton-line skeleton-title skeleton-shimmer" />
        <div className="skeleton-line skeleton-subtitle skeleton-shimmer" />
      </div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton-line skeleton-shimmer" style={{ width: '100%' }} />
      <div className="skeleton-line skeleton-shimmer" style={{ width: '85%' }} />
      <div className="skeleton-line skeleton-shimmer" style={{ width: '60%' }} />
    </div>
    <div className="skeleton-footer">
      <div className="skeleton-button skeleton-shimmer" />
      <div className="skeleton-button skeleton-shimmer" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="skeleton-stat-card">
    <div className="skeleton-line skeleton-shimmer" style={{ width: '40%', height: '14px' }} />
    <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '28px', margin: '12px 0 6px' }} />
    <div className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: '12px' }} />
  </div>
);
