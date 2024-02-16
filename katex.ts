import { katex } from "https://deno.land/x/lume@v2.0.3/deps/katex.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.16.3/mod.ts";
import { err, ok, Result } from "npm:neverthrow@6.1.0";

const SELECTOR = "embed-katex";

export function replaceMath(domString: string): Result<string, Error> {
  const document = new DOMParser().parseFromString(domString, "text/html");

  if (document == null) {
    return err(new Error("document is null", { cause: document }));
  }

  try {
    document.querySelectorAll(SELECTOR)
      .forEach((node) => {
        // @ts-ignore monkey patch
        const element = node as Element;

        try {
          const parent = element.parentElement;
          const isBlock = parent && parent.tagName === "EQN";
          const rendered = ensure(
            katex.renderToString(
              element.textContent,
              {
                displayMode: isBlock,
              },
            ),
            is.String,
          ).trim();

          // we've selected the <code> element, we want to also replace the parent <pre>
          if (isBlock) {
            parent.outerHTML = rendered;
          } else {
            element.outerHTML = rendered;
          }
        } catch (cause) {
          throw new Error("Katex failed to render", {
            cause,
          });
        }
      });
  } catch (e: unknown) {
    return err(
      e instanceof Error ? e : new Error("unexpected error", { cause: e }),
    );
  }

  return ok(document.body.innerHTML);
}
