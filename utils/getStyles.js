export default function getStyles(style) {
  let result = "";

  switch (style) {
    case "center":
      result += "max-w-screen-lg w-[450px] mx-auto";
      break;
    default:
    // Do nothing
  }

  return result;
}
