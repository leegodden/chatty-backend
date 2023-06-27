export const Helpers = {
  firstLetterUppercase: (str: string): string => {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  },
  lowerCase: (str: string): string => {
    return str.toLowerCase();
  }
};

export const generateRandomIntegers = (integerLength: number): number => {
  const characters = '0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < integerLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return parseInt(result, 10);
};

// Convert JSON object in text format to a Javascript object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJson = (prop: string): any => {
  try {
    // if not stringified then return error
    JSON.parse(prop);
  } catch (error) {
    return prop;
  }
};
