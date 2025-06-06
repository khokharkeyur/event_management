'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';

interface ApolloProviderWrapperProps {
  children: ReactNode;
}

export default function ApolloProviderWrapper({
  children,
}: ApolloProviderWrapperProps) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
