import { Fragment } from 'react';
import { useMDXComponents as useGlobalMDXComponents } from './mdx-components';

export function MDXProvider({ components, children }: { components?: any; children: React.ReactNode }) {
  return <Fragment>{children}</Fragment>;
}

export function useMDXComponents(components: any) {
  return useGlobalMDXComponents(components);
} 