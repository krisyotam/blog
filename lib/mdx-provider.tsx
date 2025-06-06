import { Fragment } from 'react';
import { useMDXComponents as useGlobalMDXComponents } from '../mdx-components';

export function MDXProvider({ components, children }: { components?: any; children: React.ReactNode }) {
  // wrap children but mapping is handled in the hook
  return <Fragment>{children}</Fragment>;
}

export function useMDXComponents(components: any) {
  // merge MDX page components with the global mapping
  return useGlobalMDXComponents(components);
} 