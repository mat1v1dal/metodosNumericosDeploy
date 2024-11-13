import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import 'mathlive';

const IntegrationMethods = () => {
  const [expression, setExpression] = useState('');
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [n, setN] = useState(10); // Número de intervalos
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

  const trapezoidMethod = (f, a, b, n) => {
    const h = (b - a) / n;
    let sum = 0.5 * (f.evaluate({ x: a }) + f.evaluate({ x: b }));
    let xValues = [a];
    let yValues = [f.evaluate({ x: a })];
    let areas = [];

    for (let i = 1; i <= n; i++) {
      const x = a + i * h;
      const y = f.evaluate({ x });
      sum += y;
      xValues.push(x);
      yValues.push(y);
      areas.push({
        x0: x - h,
        x1: x,
        y0: f.evaluate({ x: x - h }),
        y1: y,
      });
    }

    return { result: h * sum, areas, xValues, yValues };
  };

  const simpsonMethod = (f, a, b, n) => {
    if (n % 2 !== 0) n++; // Aseguramos un número par de intervalos para Simpson
    const h = (b - a) / n;
    let sum = f.evaluate({ x: a }) + f.evaluate({ x: b });
    let xValues = [a];
    let yValues = [f.evaluate({ x: a })];
    let areas = [];

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const coeff = i % 2 === 0 ? 2 : 4;
      sum += coeff * f.evaluate({ x });
      xValues.push(x);
      yValues.push(f.evaluate({ x }));

      if (i % 2 === 0) {
        areas.push({
          x0: x - h,
          x1: x + h,
          y0: f.evaluate({ x: x - h }),
          y1: f.evaluate({ x: x + h }),
          yMid: f.evaluate({ x }),
        });
      }
    }
    xValues.push(b);
    yValues.push(f.evaluate({ x: b }));

    return { result: (h / 3) * sum, areas, xValues, yValues };
  };

  const handleCalculate = () => {
    try {
      const f = math.compile(expression);
      const trapezoidResult = trapezoidMethod(f, a, b, n);
      const simpsonResult = simpsonMethod(f, a, b, n);

      setResult({
        trapezoid: trapezoidResult,
        simpson: simpsonResult,
      });
    } catch (error) {
      console.error("Error al evaluar la función:", error);
    }
  };

  const plotData = (method) => {
    if (!result) return [];

    const { xValues, yValues, areas } = result[method];
    const areaShapes = areas.map(({ x0, x1, y0, y1, yMid }, index) => ({
      type: 'rect',
      x0,
      x1,
      y0: 0,
      y1: Math.max(y0, y1, yMid || 0),
      fillcolor: 'rgba(0, 100, 250, 0.3)',
      line: { width: 0 },
    }));

    return [
      {
        x: xValues,
        y: yValues,
        mode: 'lines',
        name: 'f(x)',
      },
      ...areaShapes,
    ];
  };

  return (
    <div>
      <h2>Métodos de Integración: Trapecios y Simpson</h2>

      <span>Ingrese la función f(x):</span>
      <math-field
        ref={mathFieldRef}
        onInput={handleMathFieldChange}
        style={{ border: '1px solid black', padding: '10px', minWidth: '200px' }}
        placeholder="Ingrese la función"
      ></math-field>

      <br />
      <span>Límite inferior (a):</span>
      <input
        type="number"
        placeholder="a"
        value={a}
        onChange={(e) => setA(parseFloat(e.target.value))}
      />
      <span>Límite superior (b):</span>
      <input
        type="number"
        placeholder="b"
        value={b}
        onChange={(e) => setB(parseFloat(e.target.value))}
      />
      <span>Número de intervalos (n):</span>
      <input
        type="number"
        placeholder="n"
        value={n}
        onChange={(e) => setN(parseInt(e.target.value))}
      />
      <button onClick={handleCalculate}>Calcular</button>

      {result && (
        <div>
          <h3>Resultados</h3>
          <p>Área aproximada con el método de Trapecios: {result.trapezoid.result}</p>
          <p>Área aproximada con el método de Simpson: {result.simpson.result}</p>
          <Plot
            data={plotData('trapezoid')}
            layout={{
              title: 'Área aproximada con el método de Trapecios',
              xaxis: { title: 'x' },
              yaxis: { title: 'f(x)' },
              shapes: plotData('trapezoid').filter((shape) => shape.type === 'rect'),
            }}
          />
          <Plot
            data={plotData('simpson')}
            layout={{
              title: 'Área aproximada con el método de Simpson',
              xaxis: { title: 'x' },
              yaxis: { title: 'f(x)' },
              shapes: plotData('simpson').filter((shape) => shape.type === 'rect'),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default IntegrationMethods;
