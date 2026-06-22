let concentrationObject = {volumeUnit: "mL"};
let startingPointObject = {};
let endingPointObject = {};
let weightObject = {weightUnit: 'kg'};

const massConversionDict = {
    'g': 1, 'mg': 1000, 'mcg': 1000000, 'ng': 1000000000, 'ml': 1, 'h': 1,
}

const timeConversionDict = {
    'h': 1, 'min': 60
}

const weightConversionDict = {
    'kg': 1, 'lbs': 2.20462, 'none': 1
}

const objectMap = {concentrationObject, startingPointObject, endingPointObject, weightObject};

class Calculator {
    constructor() {
    }

    partialObjectReset() { // not resetting weightObject on purpose
        for (let item of Object.values(objectMap)) {
            if (item !== weightObject) {
                Object.keys(item).forEach(key => delete item[key]);
            }
        }
        concentrationObject.volumeUnit = "mL";
    }

    calculatorFunc(inputElement, parsedValue, storingObject) {

        let objProperty = inputElement.dataset.property;
        storingObject.name = inputElement.dataset.jsobject
        storingObject[objProperty] = parsedValue;

        if (typeof parsedValue === "string") {
            Object.assign(storingObject, this.parseUnits(storingObject[objProperty]));
        }

        let concentrationLink;
        if (startingPointObject.qttUnit && startingPointObject.qttUnit !== 'ml') {
            concentrationLink = startingPointObject.qttUnit;
        } else if (endingPointObject.pointUnit && endingPointObject.pointUnit !== 'ml') {
            concentrationLink = endingPointObject.qttUnit;
        } else {
            concentrationLink = 'ml'; // this is wrong logic, must fix later
        }
        Object.assign(concentrationObject, this.calcConcentration(concentrationObject.mass, concentrationObject.volume, concentrationObject.massUnit, concentrationObject.volumeUnit, concentrationLink));

        Object.assign(startingPointObject, this.convertedMassFunc(startingPointObject.qttUnit, endingPointObject.qttUnit))


        Object.assign(startingPointObject, this.convertedTimeFunc(startingPointObject.timeUnit, endingPointObject.timeUnit));


        Object.assign(startingPointObject, this.convertToKg(startingPointObject.weightUnit, endingPointObject.weightUnit))

        Object.assign(endingPointObject, this.calcAnswer(startingPointObject.point, startingPointObject.convertedMass, startingPointObject.convertedTime, startingPointObject.convertedWeight))


        console.log('startingPointObject:')
        console.log(startingPointObject);
        console.log('\nconcentrationObject:')
        console.log(concentrationObject);
        console.log('\nendingPointObject:');
        console.log(endingPointObject);
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
            return {qttUnit: qttUnit, weightUnit: parts[2], timeUnit: parts[3]};
        } else if (parts.length === 2) {
            return {qttUnit: qttUnit, timeUnit: parts[1], weightUnit: 'none'};
        }
    }

    calcConcentration(mass, volume, massUnit, volumeUnit, XUnit) {
        let equationConcentration = "";
        if ((massConversionDict[XUnit] / massConversionDict[massUnit]) === 1 && volume === 1) {
            equationConcentration = "";
        } else {
            equationConcentration = ` x ${massConversionDict[XUnit] / massConversionDict[massUnit]} / ${volume}`;
        }
        return {
            concentration: mass * massConversionDict[XUnit] / massConversionDict[massUnit] / volume,
            concentrationUnit: XUnit + '/' + volumeUnit,
            concentrationCalc: `(${mass}${equationConcentration})`
        };
    }

    convertedMassFunc(startingXUnit, endingXUnit) {
        let convertedMass = NaN;
        let convertedMassCalc = "";
        if (startingXUnit === 'ml') {
            convertedMass = concentrationObject.concentration;
            convertedMassCalc = ` x `;
        } else if (endingXUnit === 'ml') {
            convertedMass = 1 / concentrationObject.concentration;
            convertedMassCalc = ` / `;
        } else {
            convertedMass = massConversionDict[endingXUnit] / massConversionDict[startingXUnit];
        }

        return {convertedMass: convertedMass, convertedMassUnit: endingXUnit, convertedMassCalc: convertedMassCalc}
    }

    convertedTimeFunc(startingXUnit, endingXUnit) {
        let convertedTime = timeConversionDict[startingXUnit] / timeConversionDict[endingXUnit];
        let convertedTimeCalc = "";
        if (timeConversionDict[endingXUnit] === 1 && timeConversionDict[startingXUnit] === 1) {
            convertedTimeCalc = '';
        } else if (timeConversionDict[endingXUnit] === 1) {
            convertedTimeCalc = ` x ${timeConversionDict[startingXUnit]}`;
        } else {
            convertedTimeCalc = ` x ${timeConversionDict[startingXUnit]} / ${timeConversionDict[endingXUnit]}`;
        }
        return {convertedTime: convertedTime, convertedTimeUnit: endingXUnit, convertedTimeCalc: convertedTimeCalc}
    }

    convertToKg(startingWeightUnit, endingWeightUnit) {
        let convertedWeight = NaN
        let convertedWeightCalc = "";

        if (startingWeightUnit === 'none' && endingWeightUnit === 'none') {
            convertedWeight = 1;
            convertedWeightCalc = ``;
        } else if (startingWeightUnit === 'none') {
            convertedWeight = 1 / weightObject.weight;
            convertedWeightCalc = ` / ${weightObject.weight}`;
        } else if (endingWeightUnit === 'none') {
            convertedWeight = weightObject.weight;
            convertedWeightCalc = ` x ${weightObject.weight}`;
        }

        return {
            convertedWeight: convertedWeight,
            convertedWeightUnit: endingWeightUnit,
            convertedWeightCalc: convertedWeightCalc
        };
    }

    calcAnswer(point, massConversion, timeConversion, weightConversion) {
        let answer = point * massConversion * timeConversion * weightConversion;
        if (endingPointObject.pointUnit === 'ml/h') {
            answer = Math.round(answer * 10) / 10;
        } else {
            answer = Math.round(answer * 1000) / 1000;
        }
        return {answer: answer};
    }
}


class ViewHandler {
    constructor() {
        this.calculator = new Calculator();
        this.dataInputList;
    }

    lockWeight() {
        if (weightObject.weight) {
            document.getElementById("weightMirror").textContent = `${weightObject.weight} ${weightObject.weightUnit}`;
            document.getElementById('weightMirror').hidden = false;
            document.getElementById('weight').disabled = true;
        }
    }

    partialReset() {
        document.querySelectorAll('input[data-property]:not([data-property="weight"]), select[data-property], .outputContainer span').forEach(element => {
            if (element.tagName === "SPAN") {
                element.textContent = '';
            } else if (element.tagName === "SELECT") {
                element.value = element.options[0].value;
            } else {
                element.value = '';
            }
        });
        this.calculator.partialObjectReset();
    }

    placeFinalAnswer() {
        let textContentAnswer;
        let solvingEquation = `${startingPointObject.point}${startingPointObject.convertedMassCalc}${concentrationObject.concentrationCalc}${startingPointObject.convertedTimeCalc}${startingPointObject.convertedWeightCalc} = `;
        const canShowCalculationSteps = [startingPointObject.point, startingPointObject.convertedMass, concentrationObject.concentration, startingPointObject.convertedTime, startingPointObject.convertedWeight,].every(Number.isFinite);

        textContentAnswer = endingPointObject.pointUnit.replace('ml', 'mL');
        textContentAnswer = textContentAnswer.replace('mcg', 'MCG');

        document.getElementById('endingPoint').textContent = endingPointObject.answer;
        document.getElementById('endPointUnitMirror').textContent = ` ${textContentAnswer}`;
        document.getElementById('calculationSteps').textContent = solvingEquation;
        if (canShowCalculationSteps) {
            document.getElementById('calculationSteps').hidden = false;
        } else {
            document.getElementById('calculationSteps').hidden = true;
        }

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

    registerCalculation() {
        let medicationName = document.getElementById('medicationName').value;
        if (!medicationName) {
            return;
        }
        let resultTable = document.getElementById('medicationTable');
        resultTable.hidden = false;


        let newRow = resultTable.insertRow();
        let massString = `${concentrationObject.mass} ${concentrationObject.massUnit}`;
        let volumeString = `${concentrationObject.volume} ${concentrationObject.volumeUnit}`;
        let startString = `${startingPointObject.point} ${startingPointObject.pointUnit}`;
        startString = startString.replace('ml', 'mL');

        let endString = `${document.getElementById('endingPoint').textContent} ${endingPointObject.pointUnit}`
        endString = endString.replace('ml', 'mL');
        let dataListForTable = [medicationName, massString, volumeString, startString, endString]
        for (let data of dataListForTable) {
            let newCell = newRow.insertCell();
            newCell.textContent = data;
        }
        document.getElementById('medicationName').value = '';

    }

}

const generalViewHandler = new ViewHandler();

document.querySelectorAll('input[data-property], select[data-property]').forEach(inputElement => generalViewHandler.placeListener(inputElement, objectMap[inputElement.dataset.jsobject]));

document.querySelectorAll('.registerButton').forEach(button => button.addEventListener('click', () => {
    generalViewHandler.registerCalculation();
    generalViewHandler.lockWeight();
    if (button.id === 'addMedicationAndResetButton') {
        generalViewHandler.partialReset();
    }
}))

document.querySelector('#weight').addEventListener('blur', event => {
    if (weightObject.weight) {
        document.getElementById('addMedicationButton').disabled = false;
        document.getElementById('addMedicationAndResetButton').disabled = false;
        document.getElementById('medicationName').disabled = false;
    }
})