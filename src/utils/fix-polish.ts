// Fix dla polskich znaków - krzaki → poprawne znaki
export function fixPolishChars(text: string): string {
  if (!text || typeof text !== 'string') return text;

  const polishFixes: Record<string, string> = {
    // Małe litery
    'Ä…': 'ą',
    'Ä™': 'ę',
    'Å‚': 'ł',
    'Å„': 'ń',
    'Ã³': 'ó',
    'Å›': 'ś',
    Åº: 'ź',
    'Å¼': 'ż',
    'Ä‡': 'ć',

    // Duże litery
    'Ä„': 'Ą',
    'Ä˜': 'Ę',
    Å: 'Ł',
    Åƒ: 'Ń',
    'Ã"': 'Ó',
    Åš: 'Ś',
    'Å¹': 'Ź',
    'Å»': 'Ż',
    'Ä†': 'Ć',

    // Dodatkowe krzaki
    'Å‚Ã³': 'łó',
    'Ä…Å‚': 'ął',
    'Å›Ä‡': 'ść',
  };

  let fixed = text;
  Object.entries(polishFixes).forEach(([krzak, poprawny]) => {
    fixed = fixed.replace(new RegExp(krzak, 'g'), poprawny);
  });

  return fixed;
}
