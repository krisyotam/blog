import { Fragment } from 'react';

export function MDXProvider({ components, children }: { components?: any; children: React.ReactNode }) {
  // no-op provider: render children directly
  return <Fragment>{children}</Fragment>;
}

export function useMDXComponents(components: any) {
  // return user-provided components mapping unchanged
  return components;
} 