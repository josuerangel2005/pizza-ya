// DOM simulado mínimo para Node: analiza el HTML generado por la página y
// permite consultarlo como lo haría el navegador (sin dependencias nuevas).
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const decode = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

const encode = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const node = (tag, attrs, parent) => ({
  tag,
  attrs,
  children: [],
  parent,
  text: "",
});

function texto(nodeArg) {
  let out = nodeArg.text ?? "";
  for (const child of nodeArg.children) {
    out += child.tag === "#text" ? child.text : texto(child);
  }
  return out;
}

function outerHtml(nodeArg) {
  if (nodeArg.tag === "#text") {
    return encode(nodeArg.text);
  }
  const attrs = Object.entries(nodeArg.attrs)
    .map(([name, value]) => ` ${name}="${encode(value)}"`)
    .join("");
  if (VOID_TAGS.has(nodeArg.tag)) {
    return `<${nodeArg.tag}${attrs}/>`;
  }
  const inner = nodeArg.children.map(outerHtml).join("");
  return `<${nodeArg.tag}${attrs}>${inner}</${nodeArg.tag}>`;
}

function searchAll(nodeArg, tag, found) {
  for (const child of nodeArg.children) {
    if (child.tag === tag) {
      found.push(child);
    }
    searchAll(child, tag, found);
  }
  return found;
}

export function parseHtml(html) {
  const document = node("#document", {}, null);
  let current = document;
  let index = 0;
  while (index < html.length) {
    if (html.startsWith("</", index)) {
      const end = html.indexOf(">", index);
      const tag = html.slice(index + 2, end).trim();
      let target = current;
      while (target && target.tag !== tag) {
        target = target.parent;
      }
      current = target ? target.parent : current;
      index = end + 1;
    } else if (html[index] === "<") {
      const end = html.indexOf(">", index);
      if (end === -1) {
        throw new Error(`HTML mal formado en la posición ${index}`);
      }
      const selfClosing = html[end - 1] === "/";
      const inner = html.slice(index + 1, selfClosing ? end - 1 : end);
      const spaceIndex = inner.search(/\s/);
      const tag = spaceIndex === -1 ? inner : inner.slice(0, spaceIndex);
      const rest = spaceIndex === -1 ? "" : inner.slice(spaceIndex + 1);
      const attrs = {};
      const attrRegex = /([^\s=/]+)(?:="([^"]*)")?/g;
      let match;
      while ((match = attrRegex.exec(rest)) !== null) {
        attrs[match[1]] = decode(match[2] ?? "");
      }
      const element = node(tag, attrs, current);
      current.children.push(element);
      if (!selfClosing && !VOID_TAGS.has(tag)) {
        current = element;
      }
      index = end + 1;
    } else {
      const next = html.indexOf("<", index);
      const raw = html.slice(index, next === -1 ? html.length : next);
      const last = current.children[current.children.length - 1];
      if (last && last.tag === "#text") {
        last.text += decode(raw);
      } else {
        const textNode = node("#text", {}, current);
        textNode.text = decode(raw);
        current.children.push(textNode);
      }
      index = next === -1 ? html.length : next;
    }
  }
  return {
    document,
    querySelector(tag) {
      return searchAll(document, tag, [])[0] ?? null;
    },
    querySelectorAll(tag) {
      return searchAll(document, tag, []);
    },
  };
}

export { node, texto, outerHtml };
