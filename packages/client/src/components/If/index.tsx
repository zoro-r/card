import { isValidElement, Children, cloneElement } from 'react';
import type { ReactNode, PropsWithChildren, Attributes } from 'react';

export interface IfProps extends PropsWithChildren {
  /**
   * 是否展示
   * @default false
   */
  show?: boolean | (() => boolean);

  /**
   * 展示形式 display 仅仅是隐藏 hide 会直接卸载掉children
   * @default display
   */
  mode?: 'hide' | 'display';

  /**
   * 当条件不成立的时候显示的内容
   * @default null
   */
  fallback?: ReactNode | (() => ReactNode);
}

function renderChildren<P extends Attributes>(children: ReactNode, props: P): ReactNode {
  if (!isValidElement(children)) {
    return children;
  }
  return Children.map(children, (child) => {
    return cloneElement(child, props);
  });
}

function renderFallback<P extends Attributes>(fallback: IfProps['fallback'], props: P): ReactNode {
  if (typeof fallback === 'function') {
    return renderFallback(fallback(), props);
  }
  if (!isValidElement(fallback)) {
    return fallback;
  }
  return Children.map(fallback, (child) => {
    return cloneElement(child, props);
  });
}

function isShow(show: IfProps['show']) {
  if (typeof show === 'function') {
    return show();
  }

  return show;
}

function If(props: IfProps) {
  const { show: propsShow = false, children, mode = 'hide', fallback = null, ...rest } = props;

  const show = isShow(propsShow);

  if (mode === 'display') {
    return (
      <>
        <div style={!show ? { display: 'none' } : {}}>
          {renderChildren(children, rest)}
        </div>
        <div style={show ? { display: 'none' } : {}}>
          {renderFallback(fallback, rest)}
        </div>
      </>
    );
  }

  if (show) {
    return <>{renderChildren(children, rest)}</>;
  }

  return <>{renderFallback(fallback, rest)}</>;
}

export default If;
