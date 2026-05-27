const rasterHrefPattern =
  /^(?:data:image\/(?:jpe?g|png|gif)|.*\.(?:jpe?g|png|gif)(?:[?#].*)?$)/i;

const isElement = (node) => node?.type === "element";

const isIllustratorFallback = (node) =>
  isElement(node) &&
  node.name === "foreignObject" &&
  node.attributes.requiredExtensions?.includes("AdobeIllustrator");

const hasRasterImage = (node) => {
  if (!isElement(node)) {
    return false;
  }

  if (node.name === "image") {
    const href = node.attributes.href ?? node.attributes["xlink:href"];

    return rasterHrefPattern.test(href ?? "");
  }

  return node.children.some((child) => hasRasterImage(child));
};

const hasTextElement = (node) =>
  isElement(node) &&
  (node.name === "text" ||
    node.children.some((child) => hasTextElement(child)));

const maskIdPattern = /^url\(#(.+)\)$/;

export default {
  plugins: [
    {
      name: "stripIllustratorArtifacts",
      fn: () => {
        const rasterMaskIds = new Set();

        return {
          element: {
            enter: (node, parentNode) => {
              if (
                node.name === "svg" &&
                node.attributes["xml:space"] === "preserve" &&
                !hasTextElement(node)
              ) {
                delete node.attributes["xml:space"];
              }

              if (node.name === "switch") {
                const children = node.children.filter(
                  (child) => !isIllustratorFallback(child),
                );

                if (
                  children.length === 1 &&
                  isElement(children[0]) &&
                  children[0].name === "g"
                ) {
                  const index = parentNode.children.indexOf(node);
                  const group = children[0];
                  const hasGroupAttributes =
                    Object.keys(group.attributes ?? {}).length > 0;

                  parentNode.children.splice(
                    index,
                    1,
                    ...(hasGroupAttributes ? [group] : group.children),
                  );
                } else {
                  node.children = children;
                }

                return;
              }

              if (node.name === "mask" && hasRasterImage(node)) {
                if (node.attributes.id) {
                  rasterMaskIds.add(node.attributes.id);
                }

                parentNode.children = parentNode.children.filter(
                  (child) => child !== node,
                );

                return;
              }

              const maskId = node.attributes.mask?.match(maskIdPattern)?.[1];

              if (maskId && rasterMaskIds.has(maskId)) {
                parentNode.children = parentNode.children.filter(
                  (child) => child !== node,
                );
              }
            },
            exit: (node, parentNode) => {
              if (
                (node.name === "defs" || node.name === "g") &&
                node.children.length === 0
              ) {
                parentNode.children = parentNode.children.filter(
                  (child) => child !== node,
                );
              }
            },
          },
        };
      },
    },
    {
      name: "preset-default",
      params: {
        overrides: {
          removeComments: false,
        },
      },
    },
  ],
};
