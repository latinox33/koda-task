import { IFlightSummary } from '../interfaces/flights.interface.ts';

// @todo: change to Map() and parser for variables. And change from utils to composables

export function getFlightsAnalysisPrompt(userPrompt: string) {
    return `Today is ${new Date().toISOString()}.
    Analyze a user query in Polish regarding a flight from Wrocław.
    User query:
    "${userPrompt}"
     
    Your main task is to extract the destination and the departure and return dates from Wrocław.
    
    As a response, you should return only an object with the following structure:
    {
        "isValidQuery": boolean,
        "destination": string | null,
        "dateModel": {
            "date": string,
            "fullDate": string,
            "returnFullDate": string
        },
        "missingInfo": string[],
        "suggestion": string | null
    }

    Field descriptions:
    - isValidQuery: Should indicate whether all necessary information to find the flight was determined.
    - destination: Should indicate the arrival airport code, e.g., POZ for Poznań or KRK for Kraków.
    - date: Departure date in DD.MM.YYYY format. Mandatory field.
    - fullDate: Departure date in YYYY-MM-DD format. Mandatory field.
    - returnFullDate: Return date in YYYY-MM-DD format. Mandatory field.
    - missingInfo: List of missing information, e.g., ['destination', 'fullDate'].
    - suggestion: Suggestion for additional information in Polish.

    If only the return date is missing, fill it with a date in YYYY-MM-DD format, 7 days after the departure date. Otherwise, set it to \`null\` and write a suggestion to ask for the return date.
    If any information is missing, the \`suggestion\` field should always contain a request for that information in Polish.
    If any information couldn't be obtained, the object should still have all fields, but their values should be \`null\`.
    Fields marked as "Mandatory field" must be filled for \`isValidQuery\` to be \`true\`.
    Analyze the Polish query and return only the JSON object described above, without any additional explanations or text.
    
    Return only then JSON object without additional explanations or text.
    
    Examples:
    1. If the query is "I want to fly from Wrocław to Kraków on the 5th of August and return on the 10th of August", the response might look like this:
    \`\`\`{ "isValidQuery": true, "destination": "KRK", "dateModel": { "date": "05.08.2024", "fullDate": "2024-08-05", "returnFullDate": "2024-08-10" }, "missingInfo": [], "suggestion": null }\`\`\`
    
    2. If the query is incomplete, such as "I want to fly from Wrocław on the 5th of August", the response might look like this:
    \`\`\`{ "isValidQuery": false, "destination": null, "dateModel": { "date": "05.08.2024", "fullDate": "2024-08-05", "returnFullDate": null }, "missingInfo": ["destination", "returnFullDate"], "suggestion": "Proszę podać miejsce docelowe oraz datę powrotu." }\`\`\`
    
    3. If the the is incomplete, such as "I want to fly to Berlin, 21th of August", the response might look like this:
    \`\`\`{ "isValidQuery": true, "destination": "BER", "dateModel": { "date": "21.08.2024", "fullDate": "2024-08-21", "returnFullDate": "2024-08-28 }, "missingInfo": [], "suggestion": null }\`\`\`
    `;
}

export function getSecondFlightsAnalysisPrompt(userPrompt: string) {
    return `Today is ${new Date().toISOString()}.
    You are part of a conversation chain processing flight queries from Wrocław. 
    New user query: 
    "${userPrompt}"
    
    Your task is to analyze the entire conversation history, including the initial query and any subsequent user responses, to complete or update the flight information object.
    Review the conversation history and focus on any new information provided by the user. Update the flight information object based on this new data. The object structure remains the same as in the initial prompt:
    {
        "isValidQuery": boolean,
        "destination": string | null,
        "dateModel": {
            "date": string,
            "fullDate": string,
            "returnFullDate": string
        },
        "missingInfo": string[],
        "suggestion": string | null
    }

    Follow these steps:
    1. Analyze new information in the context of the entire conversation.
    2. Update relevant fields in the object with any newly provided information.
    3. If all mandatory information is now complete, set "isValidQuery" to true.
    4. If information is still missing, update the "missingInfo" array and "suggestion" field accordingly.
    5. If only the return date is missing, set "returnFullDate" to 7 days after "fullDate".

    Remember:
    - Maintain the same object structure, even if some fields remain null.
    - Update "suggestion" in Polish to request any still-missing information.
    - Ensure "date", "fullDate", and either a valid "returnFullDate" or a suggestion for it are present for "isValidQuery" to be true.
    - This prompt may be used multiple times in the conversation, so always consider the full context.

    Return only the updated JSON object without additional explanations or text.
    
    Examples:
    1. If the query is "I want to fly from Wrocław to Kraków on the 5th of August and return on the 10th of August", the response might look like this:
    \`\`\`{ "isValidQuery": true, "destination": "KRK", "dateModel": { "date": "05.08.2024", "fullDate": "2024-08-05", "returnFullDate": "2024-08-10" }, "missingInfo": [], "suggestion": null }\`\`\`
    
    2. If the query is incomplete, such as "I want to fly from Wrocław on the 5th of August", the response might look like this:
    \`\`\`{ "isValidQuery": false, "destination": null, "dateModel": { "date": "05.08.2024", "fullDate": "2024-08-05", "returnFullDate": null }, "missingInfo": ["destination", "returnFullDate"], "suggestion": "Proszę podać miejsce docelowe oraz datę powrotu." }\`\`\`
    
    3. If the the is incomplete, such as "I want to fly to Berlin, 21th of August", the response might look like this:
    \`\`\`{ "isValidQuery": true, "destination": "BER", "dateModel": { "date": "21.08.2024", "fullDate": "2024-08-21", "returnFullDate": "2024-08-28 }, "missingInfo": [], "suggestion": null }\`\`\`
    `;
}

export function getFlightsSummaryPrompt(
    flights: { bestFlights: IFlightSummary[][]; otherFlights: IFlightSummary[][] },
    additionalMessage: string,
) {
    return `
    You are an AI assistant specializing in flight information analysis. 
    Your task is to analyze a JSON object containing flight details from Wrocław and generate a concise, user-friendly summary in Polish, not exceeding 300 words.

    The input object has the following structure:
    {
        bestFlights: IFlightSummary[][],
        otherFlights: IFlightSummary[][]
    }

    Where IFlightSummary is:
    {
        airline: string,
        price: number,
        duration: number,
        departure: string,
        arrival: string
    }

    Analyze the provided data and create a summary that includes:
    1. The total number of flights found
    2. Price range (lowest to highest)
    3. Shortest and longest flight durations
    4. Suggestions for the best options, if applicable

    If the 'bestFlights' array is empty, focus on the 'otherFlights' array, which suggests flights with layovers.
    Your summary should be informative, easy to understand, and tailored for the average traveler. Highlight any particularly good deals or convenient options. If there are multiple flight options, try to provide a balanced overview of the choices available.
    Remember to keep your response in Polish and within the 300-word limit. Format the text to be easily readable, using appropriate paragraph breaks and bullet points if necessary.
    Analyze the data thoroughly and provide a summary that will help the user make an informed decision about their flight options from Wrocław.
    
    Additionally, analyze additional information for travelers, shorten it and add it to the summary.
    Answer in no more than 500 words.
    Return only answer for user without additional explanations or text like "Here's a possible summary".
    
    JSON object to analyze:
    "${JSON.stringify(flights)}"
    
    Additional information for travelers:
    "${additionalMessage}"
    `;
}
