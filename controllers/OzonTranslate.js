const translate = require('@mgcodeur/super-translator')


const convertTranslate = async (textP) => {
    try {
        if (textP === "") return "";
        const result = await translate({
            from: 'tr',
            to: 'ru',
            text: textP
        });
        return result;
    } catch (error) {
        console.error(error);
        return ""; // Hata durumunda boş string döndür
    }
};

//module.exports = letTranslate;
module.exports = convertTranslate