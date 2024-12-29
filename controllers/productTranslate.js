const translate = require('@mgcodeur/super-translator')


const convertTranslate = async (textP) => {
    try {
        if (textP === "") return "";
        const result = await translate({
            from: 'tr',
            to: 'en',
            text: textP
        });
        return result;
    } catch (error) {
        console.error(error);
        return ""; // Hata durumunda boş string döndür
    }
};

const letTranslate = async (product) => {
    try {
        /*const translationPromises = [];

        for (let i = 0; i < product.length; i++) {
            translationPromises.push(convertTranslate(product[i].productName));
            translationPromises.push(convertTranslate(product[i].productDescription));

            if (product[i].productColor !== undefined) {
                translationPromises.push(convertTranslate(product[i].productColor));
            }

            for (let j = 0; j < product[i].productAllVariants.length; j++) {
                translationPromises.push(convertTranslate(product[i].productAllVariants[j].value));
            }
        }

        const translatedResults = await Promise.all(translationPromises);

        let currentIndex = 0;
        for (let i = 0; i < product.length; i++) {
            product[i].productName = translatedResults[currentIndex++];
            product[i].productDescription = translatedResults[currentIndex++];

            if (product[i].productColor !== undefined) {
                product[i].productColor = translatedResults[currentIndex++];
            }

            for (let j = 0; j < product[i].productAllVariants.length; j++) {
                product[i].productAllVariants[j].value = translatedResults[currentIndex++];
            }
        }*/
    } catch (error) {
        console.error(error);
    }
};

module.exports = letTranslate;