import { CSSProperties, useMemo } from 'react';
import {
  Direction,
  FLEX_TREE,
  GetSizeFromNodeDate,
  IsNodeCollapsed,
  LayoutType,
  OUTLINE,
  RawNode,
  SizedRawNode,
  getPaddingForDirection,
  layoutFun,
  prepareNodeSize,
  useRenderWithD3,
} from './render';
export * from './render';
import './MindMap.css';

type MFC<D> = {
  style?: CSSProperties;
  tree: RawNode<D>;
  getSizeFromNodeDate: GetSizeFromNodeDate<D>;
  isNodeCollapsed: IsNodeCollapsed<D>;
  layoutType: LayoutType;
  treeDirection: Direction;
  scale: number;
  moveNodeTo: (nodeId: string, targetId: string, index: number) => void;
  nodesRender: (
    pendingRenderNodes: [SVGForeignObjectElement, SizedRawNode<D>][],
  ) => JSX.Element;
};

export function MindMap<D>(props: MFC<D>) {
  const {
    style,
    tree,
    layoutType,
    treeDirection,
    scale,
    getSizeFromNodeDate,
    isNodeCollapsed,
    moveNodeTo,
    nodesRender,
  } = props;
  const root = useMemo(() => {
    const sizedData = prepareNodeSize(tree, getSizeFromNodeDate);
    switch (layoutType) {
      case LayoutType.FLEX_TREE:
        return layoutFun(layoutType as FLEX_TREE)(sizedData, {
          direction: treeDirection,
          getInfo: (d) => ({
            id: d.id,
            padding: getPaddingForDirection(treeDirection),
            size: { width: d.content_size[0], height: d.content_size[1] },
            collapsed: isNodeCollapsed(d.payload),
          }),
          getChildren: (d) => d.children || [],
        });
      case LayoutType.OUTLINE:
        return layoutFun(layoutType as OUTLINE)(sizedData);
      default:
        return layoutFun(layoutType as OUTLINE)(sizedData);
    }
  }, [tree, layoutType, treeDirection, getSizeFromNodeDate, isNodeCollapsed]);
  const { svg, pendingRenderNodes } = useRenderWithD3(
    root,
    treeDirection,
    scale,
    moveNodeTo,
  );

  const nodes = nodesRender(pendingRenderNodes);

  return root ? (
    <div style={style}>
      <svg
        ref={svg}
        role="presentation"
        style={{ height: '100%', width: '100%', display: 'block' }}
      ></svg>
      {nodes}
    </div>
  ) : (
    <div>loading...</div>
  );
}
