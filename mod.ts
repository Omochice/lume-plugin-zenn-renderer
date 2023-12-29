import type {
  Data,
  Engine,
  Helper,
  Page,
  Site,
} from "https://deno.land/x/lume@v1.19.4/core.ts";
import { merge } from "https://deno.land/x/lume@v1.19.4/core/utils.ts";
import loader from "https://deno.land/x/lume@v1.19.4/core/loaders/text.ts";
import zenn from "npm:zenn-markdown-html@0.1.149";

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
    _data?: Data,
    _filename?: string,
  ): Promise<string> {
    return Promise.resolve(markdownToHtml(content));
  }

  renderSync(
    content: string,
    _data?: Data,
    _filename?: string,
  ): string {
    return markdownToHtml(content);
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
