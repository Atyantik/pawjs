import { compile } from 'html-to-text';

const convert = compile({ wordwrap: false });

const getTextFromHtml = (html: string): string => convert(html);

export { getTextFromHtml };
