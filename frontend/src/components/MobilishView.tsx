/** Simple container that restricts the width to a bit more than mobile. Most
 * (if not all) views should be wrapped in this.
 */
import React, { CSSProperties } from 'react';

export function MobilishView(props: any) {
  const { children } = props;
  const style: CSSProperties = {
    width: '100vw',
    maxWidth: '520px',
    minWidth: '200px',
    padding: '14px',
  };
  if (props.align) {
    style.textAlign = props.align;
  }
  return (
    <div className="mobilish" style={style}>
      {children}
    </div>
  );
}
