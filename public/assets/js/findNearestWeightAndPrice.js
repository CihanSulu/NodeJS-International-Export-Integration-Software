function findNearestWeightAndPrice(targetWeight) {
    
    var weightsAndPrices = {
        0.1: 3.45,
        0.2: 3.9,
        0.3: 4.35,
        0.4: 4.8,
        0.5: 5.25,
        0.6: 5.7,
        0.7: 6.15,
        0.8: 6.6,
        0.9: 7.05,
        1: 7.5,
        1.1: 7.95,
        1.2: 8.4,
        1.3: 8.85,
        1.4: 9.3,
        1.5: 9.75,
        1.6: 10.2,
        1.7: 10.65,
        1.8: 11.1,
        1.9: 11.55,
        2: 12,
        2.1: 12.45,
        2.2: 12.9,
        2.3: 13.35,
        2.4: 13.8,
        2.5: 14.25,
        2.6: 14.7,
        2.7: 15.15,
        2.8: 15.6,
        2.9: 16.05,
        3: 16.5,
        3.1: 16.95,
        3.2: 17.4,
        3.3: 17.85,
        3.4: 18.3,
        3.5: 18.75,
        3.6: 19.2,
        3.7: 19.65,
        3.8: 20.1,
        3.9: 20.55,
        4: 21,
        4.1: 21.45,
        4.2: 21.9,
        4.3: 22.35,
        4.4: 22.8,
        4.5: 23.25,
        4.6: 23.7,
        4.7: 24.15,
        4.8: 24.6,
        4.9: 25.05,
        5: 25.5,
        6: 30,
        7: 34.5,
        8: 39,
        9: 43.5,
        10: 48,
        11: 52.5,
        12: 57,
        13: 61.5,
        14: 66,
        15: 70.5,
        16: 75,
        17: 79.5,
        18: 84,
        19: 88.5,
        20: 93,
        21: 97.5,
        22: 102,
        23: 106.5,
        24: 111,
        25: 115.5
      };
  
    var closestWeight = null;
    var closestPrice = null;
    var minDifference = Number.MAX_VALUE;
  
    // weightsAndPrices objesindeki her ağırlık-fiyat çiftini kontrol et
    for (var weight in weightsAndPrices) {
      if (weightsAndPrices.hasOwnProperty(weight)) {
        // Ağırlık ve hedef ağırlık arasındaki farkı hesapla
        var difference = Math.abs(targetWeight - parseFloat(weight));
  
        // Minimum farkı kontrol et
        if (difference < minDifference) {
          minDifference = difference;
          closestWeight = parseFloat(weight);
          closestPrice = weightsAndPrices[weight];
        }
      }
    }
  
    return {
      closestWeight: closestWeight,
      closestPrice: closestPrice
    };
  }