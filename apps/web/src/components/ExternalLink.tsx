import React from "react";

interface ExternalLinkProps {
  className?: string;
}

export const ExternalLink = ({ className }: ExternalLinkProps) => {
  return (
    <a
      href="https://example.com"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      ↗
    </a>
  );
};
