export const censorGameHint = (text, keywordsToHide) => {
    if (!text || !keywordsToHide || !Array.isArray(keywordsToHide)) {
        return text;
    }

    const sortedKeywords = [...keywordsToHide]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);

    let processedText = text;

    sortedKeywords.forEach((keyword) => {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
        processedText = processedText.replace(regex, '[CENSURADO]');
    });

    return processedText;
};