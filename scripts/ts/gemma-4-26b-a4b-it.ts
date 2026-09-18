// // To run this code you need to install the following dependencies:
// // npm install @google/genai mime
// // npm install -D @types/node

// import { GoogleGenAI } from "@google/genai";

// async function main() {
//   const ai = new GoogleGenAI({
//     apiKey: process.env["GEMINI_API_KEY"],
//   });
//   const tools = [
//     {
//       googleSearch: {},
//     },
//   ];
//   const config = {
//     thinkingConfig: {
//       thinkingLevel: ThinkingLevel.HIGH,
//     },
//     audioTranscriptionConfig: {},
//     tools,
//   };
//   const model = "gemma-4-26b-a4b-it";
//   const contents = [
//     {
//       role: "user",
//       parts: [
//         {
//           text: `INSERT_INPUT_HERE`,
//         },
//       ],
//     },
//   ];

//   const response = await ai.models.generateContentStream({
//     model,
//     config,
//     contents,
//   });
//   let fileIndex = 0;
//   for await (const chunk of response) {
//     if (chunk.text) {
//       console.log(chunk.text);
//     }
//   }
// }

// main();

// const response = await ai.models.generateContent({
//   model: "gemma-4-26b-a4b-it",
//   contents: "Create a brave little robot character.",
//   config: {
//     responseMimeType: "application/json",
//     responseSchema: {
//       type: "object",
//       properties: {
//         name: { type: "string" },
//         type: { type: "string" },
//         brave: { type: "boolean" },
//         abilities: {
//           type: "array",
//           items: { type: "string" },
//         },
//       },
//       required: ["name", "type", "brave", "abilities"],
//     },
//   },
// });
