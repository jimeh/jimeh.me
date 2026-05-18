import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { parseHTML } from "linkedom";

type Component = Parameters<AstroContainer["renderToString"]>[0];
type ComponentProps = Record<string, unknown>;
type ComponentSlots = Record<string, string>;

export async function renderComponent(
  component: Component,
  props: ComponentProps = {},
  slots: ComponentSlots = {},
): Promise<Document> {
  const container = await AstroContainer.create({
    astroConfig: {
      image: {
        dangerouslyProcessSVG: true,
        domains: ["example.com"],
        remotePatterns: [{ protocol: "https" }],
      },
    },
  });
  const html = await container.renderToString(component, { props, slots });

  return parseHTML(html).document;
}
