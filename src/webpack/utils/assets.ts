export const staticAssetsExtensions = [
  '7z',
  'arj',
  'deb',
  'pkg',
  'rar',
  'rpm',
  'tar.gz',
  'z',
  'zip',
  'bin',
  'dmg',
  'iso',
  'toast',
  'vcd',
  'csv',
  'dat',
  'db',
  'dbf',
  'log',
  'mdb',
  'sav',
  'sql',
  'tar',
  'xml',
  'email',
  'eml',
  'emlx',
  'msg',
  'oft',
  'ost',
  'pst',
  'vcf',
  'apk',
  'bat',
  'cgi',
  'pl',
  'com',
  'exe',
  'gadget',
  'jar',
  'msi',
  'py',
  'wsf',
  'fnt',
  'fon',
  'otf',
  'ttf',
  'eot',
  'woff',
  'woff2',
  'ai',
  'ps',
  'psd',
  'asp',
  'aspx',
  'cer',
  'cfm',
  'htm',
  'html',
  'jsp',
  'part',
  'php',
  'rss',
  'xhtml',
  'key',
  'odp',
  'pps',
  'ppt',
  'pptx',
  'c',
  'class',
  'cpp',
  'cs',
  'h',
  'java',
  'sh',
  'swift',
  'vb',
  'ods',
  'xls',
  'xlsm',
  'xlsx',
  'bak',
  'cab',
  'cfg',
  'cpl',
  'cur',
  'dll',
  'dmp',
  'drv',
  'icns',
  'ini',
  'lnk',
  'sys',
  'tmp',
  '3g2',
  '3gp',
  'avi',
  'flv',
  'h264',
  'm4v',
  'mkv',
  'mov',
  'mp4',
  'mpg',
  'mpeg',
  'rm',
  'swf',
  'vob',
  'wmv',
  'doc',
  'docx',
  'odt',
  'pdf',
  'rtf',
  'tex',
  'txt',
  'wpd',
];

export const imageAssetsExtensions = [
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'tif',
  'tiff',
];

export const extensionRegex = (assetsList: string[]) => new RegExp(`\\.(${assetsList.join('|')})$`);