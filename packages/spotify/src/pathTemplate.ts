export const pathTemplate =
  (baseDomain: string) =>
  (strings: TemplateStringsArray, ...values: any[]): string => {
    const path = strings.reduce((result, str, index) => {
      const value = values[index] || "";
      return result + str + value;
    }, "");

    const fullUrl = new URL(path, baseDomain);

    return fullUrl.href;
  };
