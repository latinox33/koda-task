export function simpleTextParserToFirstHumanParagraph(t: string): string {
    const trimmedInput = t.trimStart();
    const firstHumanIndex = trimmedInput.search(/\b(Human:|H:)/i);

    return firstHumanIndex === -1 ? trimmedInput : trimmedInput.substring(0, firstHumanIndex).trim();
}
