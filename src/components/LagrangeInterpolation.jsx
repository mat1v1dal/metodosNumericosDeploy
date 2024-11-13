import { useState } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';

const LagrangeInterpolation = () => {
  const [points, setPoints] = useState('');
  const [polynomial, setPolynomial] = useState(null);
  const [xValues, setXValues] = useState([]);
  const [yValues, setYValues] = useState([]);
  const [xInput, setXInput] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);

  const handleCalculate = () => {
    try {
      // Parse input points
      const parsedPoints = points
        .split(';')
        .map((point) => point.split(',').map(Number));

      const newXValues = parsedPoints.map(([x]) => x);
      const newYValues = parsedPoints.map(([_, y]) => y);

      if (newXValues.length !== newYValues.length || newXValues.length < 2) {
        throw new Error('Formato incorrecto o insuficientes puntos');
      }

      setXValues(newXValues);
      setYValues(newYValues);

      // Interpolación de Lagrange
      const lagrangePolynomial = lagrangeInterpolation(newXValues, newYValues);

      setPolynomial(lagrangePolynomial);
    } catch (error) {
      console.error('Error al calcular la interpolación:', error);
    }
  };

  const lagrangeInterpolation = (xValues, yValues) => {
    const n = xValues.length;
    let result = '';
    let polyTerms = [];

    for (let i = 0; i < n; i++) {
      let term = `${yValues[i]}`;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          term += `*((x - ${xValues[j]}) / (${xValues[i]} - ${xValues[j]}))`;
        }
      }
      polyTerms.push(term);
    }

    result = polyTerms.join(' + ');

    return result;
  };

  // Evaluación del polinomio de Lagrange para graficar
  const evaluatePolynomial = (expression, x) => {
    try {
      const evaluated = math.evaluate(expression, { x });
      return evaluated;
    } catch (error) {
      console.error('Error al evaluar el polinomio:', error);
      return 0;
    }
  };

  const handleEvaluate = () => {
    try {
      if (xInput === '') {
        throw new Error('Por favor, ingrese un valor para x.');
      }

      const xValue = parseFloat(xInput);
      if (isNaN(xValue)) {
        throw new Error('Valor de x no válido.');
      }

      const result = evaluatePolynomial(polynomial, xValue);
      setEvaluationResult(result);
    } catch (error) {
      console.error('Error al evaluar el polinomio:', error);
      setEvaluationResult(null);
    }
  };

  return (
    <div>
      <h2>Interpolación de Lagrange</h2>
      <p>Ingrese los puntos en el formato "x1,y1; x2,y2; ..."</p>
      <input
        type="text"
        placeholder="Ejemplo: 40,900; 67,1800; 90,2700"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        style={{ width: '300px' }}
      />
      <button onClick={handleCalculate}>Calcular</button>

      {polynomial && (
        <div>
          <h3>Polinomio de Lagrange: {polynomial}</h3>
          <Plot
            data={[
              {
                x: xValues, // Ahora usamos xValues que es la lista de valores de x ingresados
                y: yValues, // Usamos yValues que es la lista de valores de y ingresados
                mode: 'markers',
                name: 'Datos',
                marker: { color: 'blue' },
              },
              {
                x: math.range(Math.min(...xValues) - 1, Math.max(...xValues) + 1, 0.1).toArray(),
                y: math
                  .range(Math.min(...xValues) - 1, Math.max(...xValues) + 1, 0.1)
                  .toArray()
                  .map((x) => evaluatePolynomial(polynomial, x)), // Evaluamos el polinomio
                mode: 'lines',
                name: 'Interpolación de Lagrange',
                line: { color: 'red' },
              },
            ]}
            layout={{
              title: 'Interpolación de Lagrange',
              xaxis: { title: 'x' },
              yaxis: { title: 'y' },
            }}
          />
        </div>
      )}

      <div>
        <h3>Evaluar polinomio en un valor específico</h3>
        <input
          type="text"
          value={xInput}
          onChange={(e) => setXInput(e.target.value)}
          placeholder="Ingrese el valor de x"
        />
        <button onClick={handleEvaluate}>Evaluar</button>

        {evaluationResult !== null && (
          <div>
            <h4>Resultado de la evaluación: {evaluationResult}</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default LagrangeInterpolation;
