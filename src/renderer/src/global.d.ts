// @types/react v19 no longer exposes JSX as a global namespace.
// This shim restores `JSX.Element` so existing return-type annotations compile.
import type React from 'react';

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
  }
}
