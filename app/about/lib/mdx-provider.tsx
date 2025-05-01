import { Fragment } from 'react';

export function MDXProvider({ components, children }: { components: any; children: React.ReactNode }) {
  return <Fragment>{children}</Fragment>;
}

export function useMDXComponents(components: any) {
  return components;
} 