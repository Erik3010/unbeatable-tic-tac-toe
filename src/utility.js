export const parseToSVG = (string) =>
  new DOMParser().parseFromString(string, "image/svg+xml");
