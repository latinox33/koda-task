export function analyzeUserPrompt(promptText: string): { isAirportRelatedQuestion: boolean } {
    // @todo add more validators
    return {
        isAirportRelatedQuestion: isAirportRelatedQuestion(promptText),
    };
}

function isAirportRelatedQuestion(question: string): boolean {
    const airportKeywords = [
        { base: 'lotnisk', forms: ['lotnisko', 'lotniska', 'lotnisku', 'lotniskiem'] },
        { base: 'bagaż', forms: ['bagaż', 'bagażu', 'bagażem', 'bagażowi', 'bagaże'] },
        { base: 'odpraw', forms: ['odprawa', 'odprawy', 'odprawę', 'odprawą'] },
        { base: 'terminal', forms: ['terminal', 'terminalu', 'terminalem', 'terminale'] },
        { base: 'bramk', forms: ['bramka', 'bramki', 'bramkę', 'bramką', 'bramce'] },
        { base: 'bezpieczeństw', forms: ['bezpieczeństwo', 'bezpieczeństwa', 'bezpieczeństwem'] },
        { base: 'parking', forms: ['parking', 'parkingu', 'parkingiem', 'parkingi'] },
        { base: 'transport', forms: ['transport', 'transportu', 'transportem'] },
        { base: 'wiz', forms: ['wiza', 'wizy', 'wizę', 'wizą'] },
        { base: 'paszport', forms: ['paszport', 'paszportu', 'paszportem', 'paszporty'] },
    ];

    const lowercaseQuestion = question.toLowerCase();

    return airportKeywords.some(
        (keywordObj) =>
            keywordObj.forms.some((form) => lowercaseQuestion.includes(form)) ||
            lowercaseQuestion.includes(keywordObj.base),
    );
}
