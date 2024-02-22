import type { Data, Page } from "https://deno.land/x/lume@v2.1.0/core/file.ts";
import type Site from "https://deno.land/x/lume@v2.1.0/core/site.ts";
import type {
  Engine,
  Helper,
} from "https://deno.land/x/lume@v2.1.0/core/renderer.ts";
import { merge } from "https://deno.land/x/lume@v2.1.0/core/utils/object.ts";
import loader from "https://deno.land/x/lume@v2.1.0/core/loaders/text.ts";
import zenn from "npm:zenn-markdown-html@0.1.150";
import { replaceMath } from "./katex.ts";
import { Exception } from "./error.ts";

const markdownToHtml = zenn.default;

export interface Options {
  extensions: string[];
}

export const defaults: Options = {
  extensions: [".md"],
};

export class MarkdownEngine implements Engine {
  constructor() {}

  deleteCache() {}

  render(
    content: string,
    data?: Data,
    filename?: string,
  ): Promise<string> {
    return Promise.resolve(this.renderComponent(content, data, filename));
  }

  renderComponent(
    content: string,
    _data?: Data,
    filename?: string,
  ): string {
    const r = replaceMath(markdownToHtml(content));
    if (r.isErr()) {
      throw new Exception(r.error.message, { cause: r.error, name: filename });
    }
    return r.value;
  }

  addHelper() {}
}

export default function (userOptions?: Partial<Options>) {
  const options = merge(defaults, userOptions);

  return function (site: Site) {
    const engine = new MarkdownEngine();

    site.loadPages(options.extensions, {
      loader,
      engine,
    });

    function filter(string: string, _inline = false): string {
      return engine.renderComponent(string?.toString() || "").trim();
    }

    site.filter("md", filter as Helper);
  };
}

export interface ZennPageData extends Page {
  title: string;
  emoji: string;
  type: "tech" | "idea";
  topics: string[];
  published: boolean;
}

/** Extends Helpers interface */
declare global {
  namespace Lume {
    export interface Helpers {
      /** @see https://lume.land/plugins/markdown/ */
      md: (string: string, inline?: boolean) => string;
    }
  }
}
