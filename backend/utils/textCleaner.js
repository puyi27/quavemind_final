export const cleanTrackTitle = (title) => {
    return title
        .replace(/\s*\(.*?(remix|feat|ft|cover|live|acoustic|instrumental|version|edit|mix|remaster|official|video).*?\)/ig, '')
        .replace(/\s*\[.*?(remix|feat|ft|cover|live|acoustic|instrumental|version|edit|mix|remaster|official|video).*?\]/ig, '')
        .replace(/\s*(feat\.|ft\.|featuring).*$/ig, '')
        .replace(/\s*-\s*.*?(remix|version|edit|mix|remaster).*$/ig, '')
        .trim();
};

export const formatGeniusQuery = (title, artist) => {
    const cleanTitle = cleanTrackTitle(title);
    const cleanArtist = artist.split(',')[0].trim();
    return `${cleanTitle} ${cleanArtist}`;
};