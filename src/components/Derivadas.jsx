import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import 'mathlive';

const NumericalDifferentiation = () => {
  const [expression, setExpression] = useState('');
  const [xStart, setXStart] = useState(0);
  const [xEnd, setXEnd] = useState(1);
  const [h, setH] = useState(0.01); // Paso de derivación
  const [result, setResult] = useState(null);

  const mathFieldRef = useRef(null);

  const handleMathFieldChange = () => {
    const latexExpression = mathFieldRef.current.getValue();
    try {
      const parsedExpression = latexToMathJS(latexExpression);
      setExpression(parsedExpression);
    } catch (error) {
      console.error("Error al convertir LaTeX a expresión:", error);
    }
  };

  const latexToMathJS = (latex) => {
    return latex
      .replace(/\\cdot/g, '*')
      .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')
      .replace(/\\sqrt{([^}]*)}/g, 'sqrt($1)')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\right/g, '')
      .replace(/\\left/g, '')
      .replace(/\s+/g, '');
  };

  // Método de derivación hacia adelante
  const forwardDifference = (f, x, h) => (f.evaluate({ x: x + h }) - f.evaluate({ x })) / h;

  // Método de derivación hacia atrás
  const backwardDifference = (f, x, h) => (f.evaluate({ x }) - f.evaluate({ x: x - h })) / h;

  const handleCalculate = () => {
    try {
      const f = math.compile(expression);
      const xValues = [];
      const forwardValues = [];
      const backwardValues = [];

      for (let x = xStart; x <= xEnd; x += h) {
        xValues.push(x);
        forwardValues.push(forwardDifference(f, x, h));
        backwardValues.push(backwardDifference(f, x, h));
      }

      setResult({
        xValues,
        forwardValues,
        backwardValues,
      });
    } catch (error) {
      console.error("Error al evaluar la función:", error);
    }
  };

  return (
    <div>
      <h2>Derivación Numérica: Diferencias hacia Adelante y Atrás</h2>

      <span>Ingrese la función f(x):</span>
      <math-field
        ref={mathFieldRef}
        onInput={handleMathFieldChange}
        style={{ border: '1px solid black', padding: '10px', minWidth: '200px' }}
        placeholder="Ingrese la función"
      ></math-field>

      <br />
      <span>Inicio del intervalo (xStart):</span>
      <input
        type="number"
        placeholder="xStart"
        value={xStart}
        onChange={(e) => setXStart(parseFloat(e.target.value))}
      />
      <span>Fin del intervalo (xEnd):</span>
      <input
        type="number"
        placeholder="xEnd"
        value={xEnd}
        onChange={(e) => setXEnd(parseFloat(e.target.value))}
      />
      <span>Paso de derivación (h):</span>
      <input
        type="number"
        placeholder="h"
        value={h}
        onChange={(e) => setH(parseFloat(e.target.value))}
      />
      <button onClick={handleCalculate}>Calcular</button>

      {result && (
        <div>
          <h3>Resultados</h3>
          <Plot
            data={[
              {
                x: result.xValues,
                y: result.forwardValues,
                mode: 'lines',
                name: 'Diferencia hacia adelante',
                line: { color: 'blue' },
              },
              {
                x: result.xValues,
                y: result.backwardValues,
                mode: 'lines',
                name: 'Diferencia hacia atrás',
                line: { color: 'red' },
              },
            ]}
            layout={{
              title: 'Derivación Numérica: Diferencias hacia Adelante y Atrás',
              xaxis: { title: 'x' },
              yaxis: { title: "f'(x)" },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NumericalDifferentiation;
