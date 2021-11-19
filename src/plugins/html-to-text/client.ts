
const getTextFromHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.innerText;
};

export { getTextFromHtml };
