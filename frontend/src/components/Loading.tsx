import React, { useState } from 'react';

/** Displays a "Loading" state after 1200 ms. Use this
 * while waiting for the actual components to load.
 * (If the actual component loads quickly, we will never
 * see the loading state. This prevents the appearance of
 * flicker)
 */
export const Loading = () => {
  const [ui, setUi] = useState(<span></span>);

  setTimeout(() => setUi(<div>Loading</div>), 1200);

  return <>{ui}</>;
};
