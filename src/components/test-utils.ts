import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { ContainerRenderOptions } from "astro/container";
import { parseHTML } from "linkedom";

type Component = Parameters<AstroContainer["renderToString"]>[0];
type ComponentProps = Record<string, unknown>;
type ComponentSlots = Record<string, string>;
type RenderOptions = Omit<ContainerRenderOptions, "props" | "slots">;

export async function renderComponent(
  component: Component,
  props: ComponentProps = {},
  slots: ComponentSlots = {},
  options: RenderOptions = {},
): Promise<Document> {
  const container = await AstroContainer.create({
    astroConfig: {
      site: "https://jimeh.me",
      image: {
        dangerouslyProcessSVG: true,
        domains: ["example.com"],
        remotePatterns: [{ protocol: "https" }],
      },
    },
  });
  const html = await container.renderToString(component, {
    ...options,
    props,
    slots,
  });

  return parseHTML(html).document;
}
