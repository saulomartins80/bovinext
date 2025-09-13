declare module 'react' {
  namespace React {
    type ReactNode = import('react').ReactNode;
  }
}

declare module 'next/link' {
  import { ComponentProps } from 'react';
  const Link: React.FC<ComponentProps<'a'> & { href: string }>;
  export default Link;
}

declare module 'next/image' {
  import { ComponentProps } from 'react';
  const Image: React.FC<ComponentProps<'img'> & { src: string; alt: string; width?: number; height?: number }>;
  export default Image;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};
