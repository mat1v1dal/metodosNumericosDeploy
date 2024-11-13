import { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import * as math from 'mathjs';
import 'mathlive';

const DifferentialEquationsSolver = () => {
  const [expression, setExpression] = useState('');
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const [h, setH] = useState(0.1);
  const [xn, setXn] = useState(2);
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

  const eulerMethod = (f, x0, y0, h, xn) => {
    let x = x0, y = y0;
    const xValues = [x], yValues = [y];
    while (x < xn) {
      y += h * f.evaluate({ x, y });
      x += h;
      xValues.push(x);
      yValues.push(y);
    }
    return { xValues, yValues };
  };

  const heunMethod = (f, x0, y0, h, xn) => {
    let x = x0, y = y0;
    const xValues = [x], yValues = [y];
    while (x < xn) {
      const y_predict = y + h * f.evaluate({ x, y });
      const y_corrected = y + (h / 2) * (f.evaluate({ x, y }) + f.evaluate({ x: x + h, y: y_predict }));
      y = y_corrected;
      x += h;
      xValues.push(x);
      yValues.push(y);
    }
    return { xValues, yValues };
  };

  const rungeKutta4 = (f, x0, y0, h, xn) => {
    let x = x0, y = y0;
    const xValues = [x], yValues = [y];
    while (x < xn) {
      const k1 = h * f.evaluate({ x, y });
      const k2 = h * f.evaluate({ x: x + h / 2, y: y + k1 / 2 });
      const k3 = h * f.evaluate({ x: x + h / 2, y: y + k2 / 2 });
      const k4 = h * f.evaluate({ x: x + h, y: y + k3 });
      y += (k1 + 2 * k2 + 2 * k3 + k4) / 6;
      x += h;
      xValues.push(x);
      yValues.push(y);
    }
    return { xValues, yValues };
  };

  const handleCalculate = () => {
    try {
      const f = math.compile(expression);
      const eulerResult = eulerMethod(f, x0, y0, h, xn);
      const heunResult = heunMethod(f, x0, y0, h, xn);
      const rk4Result = rungeKutta4(f, x0, y0, h, xn);

      setResult({
        euler: eulerResult,
        heun: heunResult,
        rk4: rk4Result,
      });
    } catch (error) {
      console.error("Error al evaluar la función:", error);
    }
  };

  const plotData = () => {
    if (!result) return [];

    return [
      {
        x: result.euler.xValues,
        y: result.euler.yValues,
        mode: 'lines+markers',
        name: 'Euler',
      },
      {
        x: result.heun.xValues,
        y: result.heun.yValues,
        mode: 'lines+markers',
        name: 'Heun',
      },
      {
        x: result.rk4.xValues,
        y: result.rk4.yValues,
        mode: 'lines+markers',
        name: 'Runge-Kutta 4',
      },
    ];
  };

  return (
    <div>
      <h2>Solución de Ecuaciones Diferenciales</h2>

      <span>Ingrese la ecuación diferencial f(x, y):</span>
      <math-field
        ref={mathFieldRef}
        onInput={handleMathFieldChange}
        style={{ border: '1px solid black', padding: '10px', minWidth: '200px' }}
        placeholder="Ingrese la función"
      ></math-field>

      <br />
      <span>Valor inicial de x (x0):</span>
      <input
        type="number"
        placeholder="x0"
        value={x0}
        onChange={(e) => setX0(parseFloat(e.target.value))}
      />
      <span>Valor inicial de y (y0):</span>
      <input
        type="number"
        placeholder="y0"
        value={y0}
        onChange={(e) => setY0(parseFloat(e.target.value))}
      />
      <span>Tamaño del paso (h):</span>
      <input
        type="number"
        placeholder="h"
        value={h}
        onChange={(e) => setH(parseFloat(e.target.value))}
      />
      <span>Valor de x en el que quieres la solución (xn):</span>
      <input
        type="number"
        placeholder="xn"
        value={xn}
        onChange={(e) => setXn(parseFloat(e.target.value))}
      />
      <button onClick={handleCalculate}>Calcular</button>

      {result && (
        <div>
          <h3>Soluciones</h3>
          <Plot
            data={plotData()}
            layout={{
              title: 'Soluciones de la Ecuación Diferencial',
              xaxis: { title: 'x' },
              yaxis: { title: 'y' },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DifferentialEquationsSolver;
