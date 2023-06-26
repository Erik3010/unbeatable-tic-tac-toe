export const parseToSVG = (string) =>
  new DOMParser().parseFromString(string, "image/svg+xml");

export const createElement = (
  tagName,
  { namespaced = false, props = {} } = {}
) => {
  const namespace = "http://www.w3.org/2000/svg";
  const element = namespaced
    ? document.createElementNS(namespace, tagName)
    : document.createElement(tagName);

  for (const key in props) {
    if (key === "class") {
      element.classList.add(...props[key]);
    } else {
      element.setAttribute(key, props[key]);
    }
  }

  return element;
};
