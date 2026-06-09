let concentrationObject = {volumeUnit: "mL"};
let startingPointObject = {};
let endingPointObject = {};
let weightObject = {weightUnit: 'kg'};

const massConversionDict = {
    'g': 1,
    'mg': 1000,
    'mcg': 1000000,
    'ng': 1000000000,
    'ml': 1,
    'h': 1,
}

const timeConversionDict = {
    'h': 1,
    'min': 60
}

const weightConversionDict = {
    'kg': 1,
    'lbs': 2.20462,
    'none': 1
}

const objectMap = {concentrationObject, startingPointObject, endingPointObject, weightObject};

class Calculator {
    constructor() {
    }

    calculatorFunc(inputElement, parsedValue, storingObject) {

        let objProperty = inputElement.dataset.property;
        storingObject.name = inputElement.dataset.jsobject
        storingObject[objProperty] = parsedValue;

        if (typeof parsedValue === "string") {
            Object.assign(storingObject, this.parseUnits(storingObject[objProperty]));
        }

        let concentrationLink;
        if (startingPointObject.qttUnit !== 'ml') {
            concentrationLink = startingPointObject.qttUnit;
        } else if (endingPointObject.pointUnit !== 'ml') {
            concentrationLink = endingPointObject.qttUnit;
        } else {
            concentrationLink = mL; // this is wrong logic, must fix later
        }
        Object.assign(concentrationObject, this.calcConcentration(concentrationObject.mass, concentrationObject.volume, concentrationObject.massUnit, concentrationObject.volumeUnit, concentrationLink));

        Object.assign(startingPointObject, this.convertedMassFunc(startingPointObject.qttUnit, endingPointObject.qttUnit))


        Object.assign(startingPointObject, this.convertedTimeFunc(startingPointObject.timeUnit, endingPointObject.timeUnit));


        Object.assign(startingPointObject, this.convertToKg(startingPointObject.weightUnit, endingPointObject.weightUnit))

        Object.assign(endingPointObject, this.calcAnswer(startingPointObject.point, startingPointObject.convertedMass, startingPointObject.convertedTime, startingPointObject.convertedWeight))


        console.log(startingPointObject);
        console.log(concentrationObject);
    }

    parseUnits(pointUnits) {
        let qttUnit = NaN;

        if (typeof pointUnits !== 'string') {
            console.log('parseUnits used on a non-string value');
            return pointUnits;
        }
        const parts = pointUnits.split("/");

        if (parts.length === 1) {
            return;
        } else {
            qttUnit = parts[0];
        }

        if (parts.length === 3) {
            return {qttUnit: qttUnit, timeUnit: parts[2], weightUnit: parts[3]};
        } else if (parts.length === 2) {
            return {qttUnit: qttUnit, timeUnit: parts[1], weightUnit: 'none'};
        }
    }

    calcConcentration(mass, volume, massUnit, volumeUnit, XUnit) {
        let simplifiedMassConversion = `${massConversionDict[XUnit] / massConversionDict[massUnit]}`;
        return {
            concentration: mass * massConversionDict[XUnit] / massConversionDict[massUnit] / volume,
            concentrationUnit: XUnit + '/' + volumeUnit,
            concentrationCalc: ` / (${mass} x ${simplifiedMassConversion} / ${volume})`
        };
    }

    convertedMassFunc(startingXUnit, endingXUnit) {
        let convertedMass = NaN;
        let convertedMassCalc = "";
        if (startingXUnit === 'ml') {
            convertedMass = concentrationObject.concentration;
            convertedMassCalc = ` x ${concentrationObject.concentration}`;
        } else if (endingXUnit === 'ml') {
            convertedMass = 1 / concentrationObject.concentration;
            convertedMassCalc = ` / ${concentrationObject.concentration}`;
        } else {
            convertedMass = massConversionDict[endingXUnit] / massConversionDict[startingXUnit];
        }

        return {convertedMass: convertedMass, convertedMassUnit: endingXUnit, convertedMassCalc: convertedMassCalc}
    }

    convertedTimeFunc(startingXUnit, endingXUnit) {
        let convertedTime = timeConversionDict[startingXUnit] / timeConversionDict[endingXUnit];
        let convertedTimeCalc = "";
        if (timeConversionDict[endingXUnit] === 1) {
            convertedTimeCalc = ` x ${timeConversionDict[startingXUnit]}`;
        }
        else {
            convertedTimeCalc = ` x ${timeConversionDict[startingXUnit]} / ${timeConversionDict[endingXUnit]}`;
        }
        return {convertedTime: convertedTime, convertedTimeUnit: endingXUnit, convertedTimeCalc: convertedTimeCalc}
    }

    convertToKg(startingWeightUnit, endingWeightUnit) {
        let convertedWeight = NaN
        let convertedWeightCalc = "";

        if (startingWeightUnit === 'none' && endingWeightUnit === 'none') {
            convertedWeight = 1;
            convertedWeightCalc = ` x 1`;
        } else if (startingWeightUnit === 'none') {
            convertedWeight = 1 / weightObject.weight;
            convertedWeightCalc = ` / ${weightObject.weight}`;
        } else if (endingWeightUnit === 'none') {
            convertedWeight = weightObject.weight;
            convertedWeightCalc = ` x ${weightObject.weight}`;
        }

        return {convertedWeight: convertedWeight, convertedWeightUnit: endingWeightUnit, convertedWeightCalc: convertedWeightCalc};
    }

    calcAnswer(point, massConversion, timeConversion, weightConversion) {
        return {answer: Math.round(point * massConversion * timeConversion * weightConversion * 10) / 10};
    }
}


class ViewHandler {
    constructor() {
        this.calculator = new Calculator();
    }

    placeFinalAnswer() {
        let textContentAnswer;
        let solvingEquation = `${startingPointObject.point}${concentrationObject.concentrationCalc}${startingPointObject.convertedTimeCalc}${startingPointObject.convertedWeightCalc}`;

        if (endingPointObject.pointUnit === 'ml/h') {
            textContentAnswer = endingPointObject.pointUnit.replace('ml', 'mL');
        } else {
            textContentAnswer = endingPointObject.pointUnit;
        }
        document.getElementById('endingPoint').textContent = endingPointObject.answer;
        document.getElementById('endPointUnitMirror').textContent = textContentAnswer;
        document.getElementById('calculationSteps').textContent = solvingEquation;

        // document.getElementById('endingPoint').textContent = endingPointObject.answer;
        // document.getElementById('endPointUnitMirror').textContent = endingPointObject.pointUnit;
        // document.getElementById('calculationSteps').textContent = startingPointObject.point + ' x ' + startingPointObject.convertedMass + ' x ' + startingPointObject.convertedTime + ' x ' + startingPointObject.convertedWeight;
    }

    placeListener(inputElement, storingObject) {
        if (inputElement.type === "text" || inputElement.type === "number") {
            inputElement.addEventListener("input", (event) => {
                let parsedValue = this.parseValue(event.target.value);
                this.calculator.calculatorFunc(inputElement, parsedValue, storingObject);
                try {
                    this.placeFinalAnswer();
                } catch (e) {

                }
            })
        } else if (inputElement.tagName === "SELECT") {
            inputElement.addEventListener("change", (event) => {
                let parsedValue = this.parseValue(event.target.value);
                this.calculator.calculatorFunc(inputElement, parsedValue, storingObject);

                try {
                    this.placeFinalAnswer();

                } catch (e) {

                }
            })
        } else {
            console.log(`viewHandler class - placeListener: ${inputElement} (${inputElement.type}) = unknown type`)
        }
    }

    parseValue(value) {
        value = value.replace(',', '.');
        if (parseFloat(value)) {
            return parseFloat(value);
        } else {
            return value;
        }
    }


}

const generalViewHandler = new ViewHandler();

document.querySelectorAll('input[data-property], select[data-property]').forEach(inputElement => generalViewHandler.placeListener(inputElement, objectMap[inputElement.dataset.jsobject]));