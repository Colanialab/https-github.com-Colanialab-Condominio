
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const queryCondoWiki = async (question: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Sei un esperto di diritto condominiale italiano. Rispondi in modo conciso e professionale a questa domanda riguardante la gestione di un piccolo condominio (sotto le 8 unità): ${question}`,
      config: {
        systemInstruction: "Sei un assistente legale specializzato nel Codice Civile italiano e nelle normative sui condomini. Fornisci riferimenti ad articoli di legge quando possibile.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Wiki Error:", error);
    return "Spiacente, non ho potuto recuperare le informazioni legali in questo momento.";
  }
};

export const generateProfessionalNotice = async (topic: string, details: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Genera una comunicazione formale per i condomini riguardante: ${topic}. Dettagli aggiuntivi: ${details}`,
      config: {
        systemInstruction: "Sei un amministratore di condominio preciso e cortese. Scrivi una circolare formale da inviare via email.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Errore nella generazione del testo.";
  }
};

export const generateDebtActionText = async (
  type: 'Sollecito Bonario' | 'Diffida' | 'Decreto Ingiuntivo',
  ownerName: string,
  amount: number,
  condoName: string,
  iban?: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Genera un documento per il recupero crediti di tipo: ${type}. 
      Condomino: ${ownerName}. 
      Importo dovuto: €${amount.toFixed(2)}. 
      Condominio: ${condoName}.
      ${iban ? `Coordinate Bancarie per il pagamento (IBAN): ${iban}` : ''}`,
      config: {
        systemInstruction: `Sei un assistente legale esperto in gestione condominiale.
        - Se il tipo è 'Sollecito Bonario', scrivi un messaggio gentile ma fermo ricordando le scadenze. Includi l'IBAN per facilitare il pagamento se fornito.
        - Se il tipo è 'Diffida', scrivi una messa in mora formale citando l'art. 63 Disp. Att. C.C. con termine di 15 giorni. Includi l'IBAN per il bonifico.
        - Se il tipo è 'Decreto Ingiuntivo', scrivi una bozza di istanza per decreto ingiuntivo (estremamente formale e tecnica). Includi comunque le coordinate per il saldo.
        Usa sempre un linguaggio giuridicamente corretto in italiano.`,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Debt Action Error:", error);
    return "Errore nella generazione del testo legale.";
  }
};
