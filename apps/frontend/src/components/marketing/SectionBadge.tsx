import React from 'react';

interface SectionBadgeProps {
  label: string;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({ label }) => (
  <div className="marketing-section-badge">
    <span className="marketing-section-badge-dot" />
    <span>{label}</span>
  </div>
);