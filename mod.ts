import type {
  Data,
  Engine,
  Helper,
  Page,
  Site,
} from "https://deno.land/x/lume@v2.0.3/core.ts";
import { Exception } from "https://deno.land/x/lume@v2.0.3/core/errors.ts";
import { merge } from "https://deno.land/x/lume@v2.0.3/core/utils.ts";
import loader from "https://deno.land/x/lume@v2.0.3/core/loaders/text.ts";
import zenn from "npm:zenn-markdown-html@0.1.150";
import { replaceMath } from "./katex.ts";

const markdownToHtml = zenn.default;

export interface Options {
  extensions: string[];
  keepDefaultPlugins: boolean;
}

export const defaults: Options = {
  extensions: [".md"],
  keepDefaultPlugins: false,
};

export class MarkdownEngine implements Engine {
  constructor() {}

  deleteCache() {}

  render(
    content: string,
    data?: Data,
    filename?: string,
  ): Promise<string> {
    return Promise.resolve(this.renderSync(content, data, filename));
  }

  renderSync(
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

    site.loadPages(options.extensions, loader, engine);

    function filter(string: string, _inline = false): string {
      return engine.renderSync(string?.toString() || "").trim();
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
