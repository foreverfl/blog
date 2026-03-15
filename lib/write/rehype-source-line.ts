import type { Root, Element } from "hast";
import type { Plugin } from "unified";

// Attach data-source-line to top-level block elements for scroll sync
const rehypeSourceLine: Plugin<[], Root> = () => {
  return (tree) => {
    for (const node of tree.children) {
      if (node.type === "element") {
        const el = node as Element;
        if (el.position?.start.line != null) {
          el.properties = el.properties || {};
          el.properties["dataSourceLine"] = el.position.start.line;
        }
      }
    }
  };
};

export default rehypeSourceLine;
